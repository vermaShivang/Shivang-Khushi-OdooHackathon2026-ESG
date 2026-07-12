import { query } from './db';

// 1. Dispatch Notification
export async function createNotification(message, type, client = null) {
  const sql = `INSERT INTO notifications (message, type, status) VALUES ($1, $2, 'Unread')`;
  const params = [message, type];
  if (client) {
    await client.query(sql, params);
  } else {
    await query(sql, params);
  }
}

// 2. Check and Auto-Award Badges
export async function checkAndAwardBadges(employeeName, client = null) {
  const q = client ? client.query.bind(client) : query;
  
  // Get the configurations to see if auto badge award is enabled
  const configRes = await q(`SELECT value FROM esg_configurations WHERE key = 'badge_auto_award'`);
  const isEnabled = configRes.rows[0]?.value === 'true';
  if (!isEnabled) return [];

  // Get employee scores
  const scoreRes = await q(`SELECT * FROM employee_scores WHERE employee_name = $1`, [employeeName]);
  if (scoreRes.rowCount === 0) return [];
  const score = scoreRes.rows[0];

  // Get count of policy acknowledgements
  const policyRes = await q(`SELECT COUNT(*)::int as count FROM policy_acknowledgements WHERE employee_name = $1`, [employeeName]);
  const policiesAck = policyRes.rows[0]?.count || 0;

  // Fetch all badges
  const badgeRes = await q(`SELECT * FROM badges`);
  const badges = badgeRes.rows;

  // Get badges already earned by this employee
  const earnedRes = await q(`SELECT badge_id FROM employee_badges WHERE employee_name = $1`, [employeeName]);
  const earnedIds = new Set(earnedRes.rows.map(r => r.badge_id));

  const newlyAwarded = [];

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;

    // Evaluate the unlock rule
    // Simple rules supported: 'xp >= X', 'challenges >= X', 'policies_acknowledged >= X'
    let satisfies = false;
    const rule = badge.unlock_rule;

    if (rule.startsWith('xp >= ')) {
      const target = parseInt(rule.replace('xp >= ', ''), 10);
      if (score.xp >= target) satisfies = true;
    } else if (rule.startsWith('challenges >= ')) {
      const target = parseInt(rule.replace('challenges >= ', ''), 10);
      if (score.challenges_completed >= target) satisfies = true;
    } else if (rule.startsWith('policies_acknowledged >= ')) {
      const target = parseInt(rule.replace('policies_acknowledged >= ', ''), 10);
      if (policiesAck >= target) satisfies = true;
    }

    if (satisfies) {
      // Award badge
      await q(`
        INSERT INTO employee_badges (employee_name, badge_id)
        VALUES ($1, $2)
        ON CONFLICT (employee_name, badge_id) DO NOTHING
      `, [employeeName, badge.id]);
      
      await createNotification(
        `Employee ${employeeName} unlocked the "${badge.name}" badge!`,
        'Badge',
        client
      );
      newlyAwarded.push(badge.name);
    }
  }

  return newlyAwarded;
}

// 3. Helper to fetch Configuration Values
export async function getConfigs() {
  const res = await query(`SELECT key, value FROM esg_configurations`);
  const configs = {};
  res.rows.forEach(r => {
    if (r.value === 'true') configs[r.key] = true;
    else if (r.value === 'false') configs[r.key] = false;
    else if (!isNaN(r.value)) configs[r.key] = Number(r.value);
    else configs[r.key] = r.value;
  });
  return configs;
}

// 4. Calculate ESG Scores dynamically for all Departments
export async function calculateDepartmentScores() {
  // We'll read the departments and dynamically evaluate scores based on operational records
  const config = await getConfigs();
  const wEnv = config.weight_environmental || 40;
  const wSoc = config.weight_social || 30;
  const wGov = config.weight_governance || 30;

  const deptRes = await query(`SELECT * FROM departments`);
  const departments = deptRes.rows;

  const scores = [];

  for (const dept of departments) {
    // A. ENVIRONMENTAL SCORE calculation
    // Base is 100. Subtract points for carbon emissions.
    // e.g. score = 100 - (total_emissions / 500) capped between 0 and 100.
    const carbonRes = await query(`
      SELECT SUM(calculated_emissions) as total FROM carbon_transactions
      WHERE department_id = $1
    `, [dept.id]);
    const totalEmissions = Number(carbonRes.rows[0]?.total || 0);
    const envScore = Math.max(0, Math.min(100, Math.round(100 - (totalEmissions / 500))));

    // B. SOCIAL SCORE calculation
    // Base is 50. Add 10 points for each approved employee participation in this department, up to 100.
    // Wait, let's map employees to departments. We'll simulate department mapping by matching employee names or just seeding.
    // Since employee participation does not explicitly link to department, let's check employee scores or sum approved CSR.
    // We can assume employee department based on some mapping:
    // "John Doe" -> Engineering (id 1)
    // "Jane Smith" -> Operations (id 2)
    // "Bob Johnson" -> Sales & Marketing (id 4)
    // "Alice Williams" -> Human Resources (id 3)
    const socialScoreQuery = `
      SELECT COUNT(*)::int as count FROM employee_participations ep
      JOIN csr_activities ca ON ep.activity_id = ca.id
      WHERE ep.approval_status = 'Approved' AND ep.employee_name IN (
        SELECT employee_name FROM (
          VALUES 
            ('John Doe', 'ENG'),
            ('Jane Smith', 'OPS'),
            ('Bob Johnson', 'MKT'),
            ('Alice Williams', 'HR')
        ) as employee_dept(employee_name, dept_code)
        WHERE dept_code = $1
      )
    `;
    const socialRes = await query(socialScoreQuery, [dept.code]);
    const approvedCount = socialRes.rows[0]?.count || 0;
    const socScore = Math.min(100, 60 + (approvedCount * 10));

    // C. GOVERNANCE SCORE calculation
    // Base is 100. Subtract 15 points for each open compliance issue.
    // Subtract 30 points if the compliance issue is open AND overdue (flagged).
    // Find audits for department
    const auditRes = await query(`SELECT id FROM audits WHERE department_id = $1`, [dept.id]);
    const auditIds = auditRes.rows.map(r => r.id);

    let govScore = 100;
    if (auditIds.length > 0) {
      const issueRes = await query(`
        SELECT *, (due_date < CURRENT_DATE) as overdue 
        FROM compliance_issues 
        WHERE audit_id = ANY($1) AND status != 'Resolved'
      `, [auditIds]);
      
      issueRes.rows.forEach(issue => {
        if (issue.overdue) {
          govScore -= 30;
        } else {
          govScore -= 15;
        }
      });
    }
    govScore = Math.max(0, govScore);

    // D. TOTAL SCORE
    // Weighted average
    const totalScore = Math.round(
      (envScore * wEnv + socScore * wSoc + govScore * wGov) / 100
    );

    scores.push({
      departmentId: dept.id,
      departmentName: dept.name,
      departmentCode: dept.code,
      employeeCount: dept.employee_count,
      head: dept.head,
      environmentalScore: envScore,
      socialScore: socScore,
      governanceScore: govScore,
      totalScore: totalScore
    });
  }

  return scores;
}

// 5. Flag Overdue Compliance Issues and create notifications
export async function checkOverdueComplianceIssues() {
  const res = await query(`
    SELECT ci.*, a.title as audit_title 
    FROM compliance_issues ci
    JOIN audits a ON ci.audit_id = a.id
    WHERE ci.status = 'Open' AND ci.due_date < CURRENT_DATE
  `);
  
  for (const issue of res.rows) {
    // Add in-app notification if it wasn't flagged or just as warning
    // To prevent duplicate spam, we can check if a notification already exists
    const checkNotif = await query(`
      SELECT 1 FROM notifications 
      WHERE type = 'Compliance' AND message LIKE $1
    `, [`%Issue #${issue.id}%`]);

    if (checkNotif.rowCount === 0) {
      await createNotification(
        `CRITICAL: Compliance Issue #${issue.id} ("${issue.description}") under audit "${issue.audit_title}" is OVERDUE! Owner: ${issue.owner}. Due date was ${new Date(issue.due_date).toLocaleDateString()}.`,
        'Compliance'
      );
    }
  }
}
