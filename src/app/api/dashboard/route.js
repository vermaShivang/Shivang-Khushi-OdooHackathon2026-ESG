import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { calculateDepartmentScores, getConfigs, checkOverdueComplianceIssues } from '@/lib/business-rules';

export async function GET() {
  try {
    // 1. Run compliance checks first (to flag overdue issues in background)
    await checkOverdueComplianceIssues();

    // 2. Fetch configurations
    const configs = await getConfigs();
    const wEnv = configs.weight_environmental || 40;
    const wSoc = configs.weight_social || 30;
    const wGov = configs.weight_governance || 30;

    // 3. Calculate department scores
    const departmentScores = await calculateDepartmentScores();

    // 4. Calculate Overall ESG score
    // Weighted average of all department scores
    let overallScore = 0;
    let totalEnv = 0;
    let totalSoc = 0;
    let totalGov = 0;

    if (departmentScores.length > 0) {
      departmentScores.forEach(ds => {
        totalEnv += ds.environmentalScore;
        totalSoc += ds.socialScore;
        totalGov += ds.governanceScore;
      });
      totalEnv = Math.round(totalEnv / departmentScores.length);
      totalSoc = Math.round(totalSoc / departmentScores.length);
      totalGov = Math.round(totalGov / departmentScores.length);
      overallScore = Math.round((totalEnv * wEnv + totalSoc * wSoc + totalGov * wGov) / 100);
    }

    // 5. Total Carbon Footprint (sum of calculated emissions)
    const carbonRes = await query(`SELECT SUM(calculated_emissions) as total FROM carbon_transactions`);
    const totalCarbonEmissions = Number(carbonRes.rows[0]?.total || 0).toFixed(1);

    // 6. Environmental goals
    const goalsRes = await query(`SELECT * FROM environmental_goals ORDER BY deadline ASC`);
    const goals = goalsRes.rows;

    // 7. Active challenges
    const activeChallengesRes = await query(`
      SELECT c.*, cat.name as category_name 
      FROM challenges c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.status = 'Active'
      ORDER BY c.deadline ASC
    `);
    const activeChallenges = activeChallengesRes.rows;

    // 8. Open compliance issues
    const complianceRes = await query(`
      SELECT ci.*, a.title as audit_title 
      FROM compliance_issues ci
      JOIN audits a ON ci.audit_id = a.id
      WHERE ci.status = 'Open'
      ORDER BY ci.due_date ASC
    `);
    const openComplianceIssues = complianceRes.rows;

    // 9. Unread notifications
    const notifRes = await query(`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 15`);
    const notifications = notifRes.rows;

    return NextResponse.json({
      success: true,
      overallScore,
      environmentalScore: totalEnv,
      socialScore: totalSoc,
      governanceScore: totalGov,
      departmentScores,
      totalCarbonEmissions,
      goals,
      activeChallenges,
      openComplianceIssues,
      notifications,
      configs
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
