import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { createNotification, checkAndAwardBadges } from '@/lib/business-rules';

export async function POST(request) {
  const client = await getClient();
  try {
    const body = await request.json();
    const { employee_name, correct_answers, total_questions } = body;

    if (!employee_name || correct_answers === undefined || !total_questions) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const xpEarned = correct_answers * 10;
    const pointsEarned = correct_answers * 10;

    await client.query('BEGIN');

    // Upsert employee scores
    await client.query(`
      INSERT INTO employee_scores (employee_name, xp, points, challenges_completed, csr_completed)
      VALUES ($1, $2, $3, 0, 0)
      ON CONFLICT (employee_name) DO UPDATE SET
        xp = employee_scores.xp + EXCLUDED.xp,
        points = employee_scores.points + EXCLUDED.points
    `, [employee_name, xpEarned, pointsEarned]);

    // Create notification for the quiz completion
    await createNotification(
      `${employee_name} completed the Eco-Quest Quiz! Score: ${correct_answers}/${total_questions} (${xpEarned} XP earned)`,
      'Badge',
      client
    );

    // Check for badge awards
    const newBadges = await checkAndAwardBadges(employee_name, client);

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      xpEarned,
      pointsEarned,
      correctAnswers: correct_answers,
      totalQuestions: total_questions,
      newBadges
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Quiz API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
