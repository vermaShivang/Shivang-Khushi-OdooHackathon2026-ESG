import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department'); // code or name
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const module = searchParams.get('module'); // 'Environmental', 'Social', 'Governance', 'ESG Summary'
    const employee = searchParams.get('employee');
    const challenge = searchParams.get('challenge');
    const category = searchParams.get('category'); // category name or id

    const reportData = {};

    // 1. ENVIRONMENTAL DATA (Carbon Ledger)
    if (!module || module === 'Environmental' || module === 'ESG Summary') {
      let sql = `
        SELECT ct.*, d.name as department_name, d.code as department_code, 
               ef.name as emission_factor_name, ef.factor as factor_value
        FROM carbon_transactions ct
        JOIN departments d ON ct.department_id = d.id
        LEFT JOIN emission_factors ef ON ct.emission_factor_id = ef.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (department) {
        sql += ` AND (d.code = $${paramCount} OR d.name = $${paramCount})`;
        params.push(department);
        paramCount++;
      }
      if (startDate) {
        sql += ` AND ct.transaction_date >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }
      if (endDate) {
        sql += ` AND ct.transaction_date <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }

      sql += ` ORDER BY ct.transaction_date DESC`;
      const res = await query(sql, params);
      reportData.environmental = res.rows;
    }

    // 2. SOCIAL DATA (CSR & Participations)
    if (!module || module === 'Social' || module === 'ESG Summary') {
      let sql = `
        SELECT ep.*, ca.title as activity_title, ca.points as activity_points,
               c.name as category_name
        FROM employee_participations ep
        JOIN csr_activities ca ON ep.activity_id = ca.id
        LEFT JOIN categories c ON ca.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (employee) {
        sql += ` AND ep.employee_name ILIKE $${paramCount}`;
        params.push(`%${employee}%`);
        paramCount++;
      }
      if (startDate) {
        sql += ` AND ep.completion_date >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }
      if (endDate) {
        sql += ` AND ep.completion_date <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }
      if (category) {
        sql += ` AND (c.name = $${paramCount} OR ca.title = $${paramCount})`;
        params.push(category);
        paramCount++;
      }

      // Department filter mapping for Social
      if (department) {
        sql += ` AND ep.employee_name IN (
          SELECT employee_name FROM (
            VALUES 
              ('John Doe', 'ENG'),
              ('Jane Smith', 'OPS'),
              ('Bob Johnson', 'MKT'),
              ('Alice Williams', 'HR')
          ) as employee_dept(employee_name, dept_code)
          WHERE dept_code = $${paramCount} OR employee_name = $${paramCount}
        )`;
        params.push(department);
        paramCount++;
      }

      sql += ` ORDER BY ep.completion_date DESC, ep.id DESC`;
      const res = await query(sql, params);
      reportData.social = res.rows;
    }

    // 3. GOVERNANCE DATA (Compliance Issues & Audits)
    if (!module || module === 'Governance' || module === 'ESG Summary') {
      // Compliance Issues
      let sql = `
        SELECT ci.*, a.title as audit_title, d.name as department_name, d.code as department_code
        FROM compliance_issues ci
        JOIN audits a ON ci.audit_id = a.id
        JOIN departments d ON a.department_id = d.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (department) {
        sql += ` AND (d.code = $${paramCount} OR d.name = $${paramCount})`;
        params.push(department);
        paramCount++;
      }
      if (startDate) {
        sql += ` AND ci.due_date >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }
      if (endDate) {
        sql += ` AND ci.due_date <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }
      if (employee) { // Owner
        sql += ` AND ci.owner ILIKE $${paramCount}`;
        params.push(`%${employee}%`);
        paramCount++;
      }

      sql += ` ORDER BY ci.due_date ASC`;
      const res = await query(sql, params);
      reportData.governance = res.rows;
    }

    // 4. MOCK CHALLENGE DATA (If filtering by challenge specifically)
    if (challenge || module === 'ESG Summary') {
      let sql = `
        SELECT cp.*, c.title as challenge_title, c.xp as challenge_xp, c.difficulty
        FROM challenge_participations cp
        JOIN challenges c ON cp.challenge_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (challenge) {
        sql += ` AND c.title ILIKE $${paramCount}`;
        params.push(`%${challenge}%`);
        paramCount++;
      }
      if (employee) {
        sql += ` AND cp.employee_name ILIKE $${paramCount}`;
        params.push(`%${employee}%`);
        paramCount++;
      }

      sql += ` ORDER BY cp.completion_date DESC, cp.id DESC`;
      const res = await query(sql, params);
      reportData.challenges = res.rows;
    }

    // 5. SUMMARY STATS (For ESG Summary Report)
    if (module === 'ESG Summary') {
      const totalEmissions = reportData.environmental?.reduce((sum, tx) => sum + Number(tx.calculated_emissions), 0) || 0;
      const totalIssues = reportData.governance?.length || 0;
      const openIssues = reportData.governance?.filter(i => i.status === 'Open').length || 0;
      const approvedCsr = reportData.social?.filter(p => p.approval_status === 'Approved').length || 0;
      const totalPoints = reportData.social?.filter(p => p.approval_status === 'Approved').reduce((sum, p) => sum + p.points_earned, 0) || 0;

      reportData.summaryStats = {
        totalCarbonFootprintKg: totalEmissions.toFixed(2),
        totalComplianceIssues: totalIssues,
        openComplianceIssues: openIssues,
        approvedCsrActivities: approvedCsr,
        totalCsrPointsDistributed: totalPoints
      };
    }

    return NextResponse.json({
      success: true,
      filters: { department, startDate, endDate, module, employee, challenge, category },
      reportData
    });
  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
