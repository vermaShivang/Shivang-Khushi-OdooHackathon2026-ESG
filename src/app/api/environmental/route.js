import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getConfigs, createNotification } from '@/lib/business-rules';

export async function GET() {
  try {
    const transactions = await query(`
      SELECT ct.*, d.name as department_name, ef.name as emission_factor_name, ef.factor as factor_value
      FROM carbon_transactions ct
      JOIN departments d ON ct.department_id = d.id
      LEFT JOIN emission_factors ef ON ct.emission_factor_id = ef.id
      ORDER BY ct.transaction_date DESC, ct.id DESC
    `);

    const factors = await query(`SELECT * FROM emission_factors ORDER BY category, name`);
    const products = await query(`SELECT * FROM products ORDER BY name`);
    const goals = await query(`SELECT * FROM environmental_goals ORDER BY deadline ASC`);

    return NextResponse.json({
      success: true,
      transactions: transactions.rows,
      factors: factors.rows,
      products: products.rows,
      goals: goals.rows
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      department_id, 
      source_type, 
      source_amount, 
      emission_factor_id, 
      transaction_date, 
      notes 
    } = body;

    let { calculated_emissions } = body;
    const configs = await getConfigs();

    let factorUsed = null;

    if (configs.auto_emission_calculation) {
      if (!emission_factor_id) {
        return NextResponse.json({ 
          success: false, 
          error: 'Emission factor is required when auto-emission calculation is enabled.' 
        }, { status: 400 });
      }

      // Fetch the factor
      const factorRes = await query(`SELECT factor, name FROM emission_factors WHERE id = $1`, [emission_factor_id]);
      if (factorRes.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'Emission factor not found' }, { status: 404 });
      }

      const factorVal = Number(factorRes.rows[0].factor);
      factorUsed = factorRes.rows[0].name;
      calculated_emissions = Number(source_amount) * factorVal;
    } else {
      if (calculated_emissions === undefined) {
        return NextResponse.json({ 
          success: false, 
          error: 'Calculated emissions must be manually provided when auto-calculation is disabled.' 
        }, { status: 400 });
      }
      calculated_emissions = Number(calculated_emissions);
    }

    // Insert carbon transaction
    const insertRes = await query(`
      INSERT INTO carbon_transactions (
        department_id, source_type, source_amount, emission_factor_id, 
        calculated_emissions, transaction_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      department_id, 
      source_type, 
      source_amount, 
      emission_factor_id || null, 
      calculated_emissions, 
      transaction_date, 
      notes
    ]);

    const newTx = insertRes.rows[0];

    // Update environmental goals with unit 'kg CO2e'
    await query(`
      UPDATE environmental_goals 
      SET current_value = current_value + $1 
      WHERE unit = 'kg CO2e' AND status = 'Active'
    `, [calculated_emissions]);

    // Dispatch system notification
    const deptRes = await query(`SELECT name FROM departments WHERE id = $1`, [department_id]);
    const deptName = deptRes.rows[0]?.name || 'Unknown Department';
    
    await createNotification(
      `New carbon transaction logged for ${deptName}: ${calculated_emissions.toFixed(2)} kg CO2e (${source_type} - ${notes})`,
      'Compliance'
    );

    return NextResponse.json({ success: true, transaction: newTx });
  } catch (error) {
    console.error('Post Carbon Transaction Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
