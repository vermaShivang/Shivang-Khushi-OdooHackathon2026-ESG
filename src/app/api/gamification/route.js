import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getConfigs, createNotification, checkAndAwardBadges } from '@/lib/business-rules';

export async function GET() {
  try {
    const challenges = await query(`
      SELECT c.*, cat.name as category_name 
      FROM challenges c
      LEFT JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.deadline ASC
    `);

    const participations = await query(`
      SELECT cp.*, c.title as challenge_title, c.xp as challenge_xp, c.evidence_required
      FROM challenge_participations cp
      JOIN challenges c ON cp.challenge_id = c.id
      ORDER BY cp.created_at DESC
    `);

    const badges = await query(`SELECT * FROM badges ORDER BY name`);
    const rewards = await query(`SELECT * FROM rewards ORDER BY name`);
    
    const leaderboard = await query(`
      SELECT employee_name, xp, points, challenges_completed, csr_completed 
      FROM employee_scores 
      ORDER BY xp DESC, employee_name ASC
    `);

    const redemptions = await query(`
      SELECT rr.*, r.name as reward_name 
      FROM rewards_redemptions rr
      JOIN rewards r ON rr.reward_id = r.id
      ORDER BY rr.redeemed_at DESC
    `);

    return NextResponse.json({
      success: true,
      challenges: challenges.rows,
      participations: participations.rows,
      badges: badges.rows,
      rewards: rewards.rows,
      leaderboard: leaderboard.rows,
      redemptions: redemptions.rows
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const client = await getClient();
  try {
    const body = await request.json();
    const { action } = body;

    // 1. SIGNUP FOR CHALLENGE
    if (action === 'signup_challenge') {
      const { challenge_id, employee_name } = body;
      if (!challenge_id || !employee_name) {
        return NextResponse.json({ success: false, error: 'Missing challenge_id or employee_name' }, { status: 400 });
      }

      // Check if already signed up
      const checkRes = await query(`
        SELECT 1 FROM challenge_participations 
        WHERE challenge_id = $1 AND employee_name = $2
      `, [challenge_id, employee_name]);

      if (checkRes.rowCount > 0) {
        return NextResponse.json({ success: false, error: 'Already signed up for this challenge' }, { status: 400 });
      }

      // Ensure employee score record exists
      await query(`
        INSERT INTO employee_scores (employee_name, xp, points, challenges_completed, csr_completed)
        VALUES ($1, 0, 0, 0, 0)
        ON CONFLICT (employee_name) DO NOTHING
      `, [employee_name]);

      const res = await query(`
        INSERT INTO challenge_participations (challenge_id, employee_name, progress, approval_status, xp_awarded)
        VALUES ($1, $2, 0, 'Draft', 0)
        RETURNING *
      `, [challenge_id, employee_name]);

      return NextResponse.json({ success: true, participation: res.rows[0] });
    }

    // 2. UPDATE PROGRESS OR SUBMIT FOR REVIEW
    if (action === 'update_challenge_progress') {
      const { participation_id, progress, proof_file } = body;
      if (participation_id === undefined || progress === undefined) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      const pVal = Math.min(100, Math.max(0, parseInt(progress, 10)));
      const status = pVal === 100 ? 'Under Review' : 'Draft';

      const res = await query(`
        UPDATE challenge_participations 
        SET progress = $1, approval_status = $2, proof_file = $3
        WHERE id = $4
        RETURNING *
      `, [pVal, status, proof_file || null, participation_id]);

      if (res.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'Participation record not found' }, { status: 404 });
      }

      const part = res.rows[0];

      if (status === 'Under Review') {
        const chalRes = await query(`SELECT title FROM challenges WHERE id = $1`, [part.challenge_id]);
        const title = chalRes.rows[0]?.title || 'Challenge';
        await createNotification(
          `Challenge completed by ${part.employee_name} ("${title}"). Awaiting admin verification.`,
          'Approval'
        );
      }

      return NextResponse.json({ success: true, participation: part });
    }

    // 3. APPROVE CHALLENGE COMPLETION (ADMIN ACTION)
    if (action === 'approve_challenge') {
      const { participation_id, approval_status } = body; // 'Approved' or 'Rejected'
      if (!participation_id || !approval_status) {
        return NextResponse.json({ success: false, error: 'Missing participation_id or approval_status' }, { status: 400 });
      }

      await client.query('BEGIN');

      // Fetch details
      const partRes = await client.query(`
        SELECT cp.*, c.xp, c.title as challenge_title 
        FROM challenge_participations cp
        JOIN challenges c ON cp.challenge_id = c.id
        WHERE cp.id = $1
      `, [participation_id]);

      if (partRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, error: 'Participation record not found' }, { status: 404 });
      }

      const part = partRes.rows[0];

      if (part.approval_status !== 'Under Review' && part.approval_status !== 'Draft') {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, error: 'Participation is already processed' }, { status: 400 });
      }

      const xpAwarded = approval_status === 'Approved' ? part.xp : 0;

      // Update status
      await client.query(`
        UPDATE challenge_participations 
        SET approval_status = $1, xp_awarded = $2, completion_date = CURRENT_DATE 
        WHERE id = $3
      `, [approval_status, xpAwarded, participation_id]);

      if (approval_status === 'Approved') {
        // Increment employee scores
        await client.query(`
          INSERT INTO employee_scores (employee_name, xp, points, challenges_completed, csr_completed)
          VALUES ($1, $2, $2, 1, 0)
          ON CONFLICT (employee_name) DO UPDATE SET 
            xp = employee_scores.xp + EXCLUDED.xp,
            points = employee_scores.points + EXCLUDED.points,
            challenges_completed = employee_scores.challenges_completed + 1
        `, [part.employee_name, xpAwarded]);

        // Auto-award badges check
        await checkAndAwardBadges(part.employee_name, client);

        await createNotification(
          `Challenge Approved: ${part.employee_name} completed "${part.challenge_title}" and received ${xpAwarded} XP!`,
          'Approval',
          client
        );
      } else {
        await createNotification(
          `Challenge Rejected: ${part.employee_name} for "${part.challenge_title}"`,
          'Approval',
          client
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    }

    // 4. REDEEM REWARD
    if (action === 'redeem_reward') {
      const { reward_id, employee_name } = body;
      if (!reward_id || !employee_name) {
        return NextResponse.json({ success: false, error: 'Missing reward_id or employee_name' }, { status: 400 });
      }

      await client.query('BEGIN');

      // 1. Fetch Reward info
      const rewardRes = await client.query(`SELECT * FROM rewards WHERE id = $1`, [reward_id]);
      if (rewardRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, error: 'Reward not found' }, { status: 404 });
      }
      const reward = rewardRes.rows[0];

      if (reward.status !== 'Active' || reward.stock <= 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, error: 'Reward is out of stock or unavailable.' }, { status: 400 });
      }

      // 2. Fetch Employee Points
      const scoreRes = await client.query(`SELECT points FROM employee_scores WHERE employee_name = $1`, [employee_name]);
      const currentPoints = scoreRes.rowCount > 0 ? scoreRes.rows[0].points : 0;

      if (currentPoints < reward.points_required) {
        await client.query('ROLLBACK');
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient points. Requires ${reward.points_required} but you have ${currentPoints}.` 
        }, { status: 400 });
      }

      // 3. Deduct stock
      await client.query(`UPDATE rewards SET stock = stock - 1 WHERE id = $1`, [reward_id]);

      // 4. Deduct points
      await client.query(`
        UPDATE employee_scores 
        SET points = points - $1 
        WHERE employee_name = $2
      `, [reward.points_required, employee_name]);

      // 5. Create redemption record
      await client.query(`
        INSERT INTO rewards_redemptions (reward_id, employee_name, points_spent)
        VALUES ($1, $2, $3)
      `, [reward_id, employee_name, reward.points_required]);

      await createNotification(
        `Reward Redeemed: ${employee_name} redeemed points for a "${reward.name}" (${reward.points_required} points spent).`,
        'Badge',
        client
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    }

    // 5. CREATE NEW CHALLENGE (ADMIN)
    if (action === 'create_challenge') {
      const { title, category_id, description, xp, difficulty, evidence_required, deadline } = body;
      if (!title || !category_id || !xp || !difficulty || !deadline) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      const res = await query(`
        INSERT INTO challenges (title, category_id, description, xp, difficulty, evidence_required, deadline, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')
        RETURNING *
      `, [title, category_id, description, xp, difficulty, evidence_required, deadline]);

      await createNotification(
        `New challenge added: "${title}". Difficulty: ${difficulty}. XP reward: ${xp}.`,
        'Approval'
      );

      return NextResponse.json({ success: true, challenge: res.rows[0] });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Gamification POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
