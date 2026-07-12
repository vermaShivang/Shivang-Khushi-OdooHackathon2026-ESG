import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { createNotification, checkAndAwardBadges } from '@/lib/business-rules';

export async function GET() {
  try {
    const policies = await query(`SELECT * FROM esg_policies ORDER BY id`);
    
    const acknowledgements = await query(`
      SELECT pa.*, p.title as policy_title 
      FROM policy_acknowledgements pa
      JOIN esg_policies p ON pa.policy_id = p.id
      ORDER BY pa.acknowledged_at DESC
    `);

    const audits = await query(`
      SELECT a.*, d.name as department_name 
      FROM audits a
      JOIN departments d ON a.department_id = d.id
      ORDER BY a.audit_date DESC
    `);

    const complianceIssues = await query(`
      SELECT ci.*, a.title as audit_title, d.name as department_name,
        (ci.due_date < CURRENT_DATE AND ci.status = 'Open') as overdue
      FROM compliance_issues ci
      JOIN audits a ON ci.audit_id = a.id
      JOIN departments d ON a.department_id = d.id
      ORDER BY ci.due_date ASC
    `);

    return NextResponse.json({
      success: true,
      policies: policies.rows,
      acknowledgements: acknowledgements.rows,
      audits: audits.rows,
      complianceIssues: complianceIssues.rows
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const client = await getClient();
  try {
    const body = await request.json();
    const { action } = body; // 'acknowledge_policy', 'create_compliance_issue', 'create_audit'

    if (action === 'acknowledge_policy') {
      const { policy_id, employee_name } = body;
      if (!policy_id || !employee_name) {
        return NextResponse.json({ success: false, error: 'Missing policy_id or employee_name' }, { status: 400 });
      }

      await client.query('BEGIN');

      // Check if already acknowledged
      const checkRes = await client.query(`
        SELECT 1 FROM policy_acknowledgements 
        WHERE policy_id = $1 AND employee_name = $2
      `, [policy_id, employee_name]);

      if (checkRes.rowCount > 0) {
        await client.query('COMMIT');
        return NextResponse.json({ success: true, message: 'Policy already acknowledged' });
      }

      // Ensure employee score record exists
      await client.query(`
        INSERT INTO employee_scores (employee_name, xp, points, challenges_completed, csr_completed)
        VALUES ($1, 0, 0, 0, 0)
        ON CONFLICT (employee_name) DO NOTHING
      `, [employee_name]);

      // Insert acknowledgement
      await client.query(`
        INSERT INTO policy_acknowledgements (policy_id, employee_name) 
        VALUES ($1, $2)
      `, [policy_id, employee_name]);

      // Auto-award badges check
      const newlyAwarded = await checkAndAwardBadges(employee_name, client);

      const policyRes = await client.query(`SELECT title FROM esg_policies WHERE id = $1`, [policy_id]);
      const policyTitle = policyRes.rows[0]?.title || 'Policy';

      await createNotification(
        `Employee ${employee_name} acknowledged policy "${policyTitle}".`,
        'Policy',
        client
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true, newlyAwarded });
    } 
    
    if (action === 'create_compliance_issue') {
      const { audit_id, severity, description, owner, due_date } = body;
      if (!audit_id || !severity || !description || !owner || !due_date) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      const res = await query(`
        INSERT INTO compliance_issues (audit_id, severity, description, owner, due_date, status)
        VALUES ($1, $2, $3, $4, $5, 'Open')
        RETURNING *
      `, [audit_id, severity, description, owner, due_date]);

      await createNotification(
        `New compliance issue raised (Severity: ${severity}). Assigned Owner: ${owner}. Description: ${description}`,
        'Compliance'
      );

      return NextResponse.json({ success: true, complianceIssue: res.rows[0] });
    }

    if (action === 'create_audit') {
      const { title, department_id, auditor, audit_date, findings } = body;
      if (!title || !department_id || !auditor || !audit_date) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      const res = await query(`
        INSERT INTO audits (title, department_id, auditor, audit_date, findings, status)
        VALUES ($1, $2, $3, $4, $5, 'Completed')
        RETURNING *
      `, [title, department_id, auditor, audit_date, findings]);

      return NextResponse.json({ success: true, audit: res.rows[0] });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Governance POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { issue_id, status } = body; // 'Open', 'Resolved', 'Flagged'

    if (!issue_id || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const res = await query(`
      UPDATE compliance_issues 
      SET status = $1 
      WHERE id = $2
      RETURNING *
    `, [status, issue_id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Compliance issue not found' }, { status: 404 });
    }

    await createNotification(
      `Compliance issue #${issue_id} status updated to ${status}.`,
      'Compliance'
    );

    return NextResponse.json({ success: true, complianceIssue: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
