import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getConfigs } from '@/lib/business-rules';

export async function GET() {
  try {
    const configs = await getConfigs();
    return NextResponse.json({ success: true, configs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      weight_environmental, 
      weight_social, 
      weight_governance, 
      auto_emission_calculation, 
      evidence_requirement, 
      badge_auto_award 
    } = body;

    // Run updates in a single connection
    const updates = [
      { key: 'weight_environmental', value: String(weight_environmental) },
      { key: 'weight_social', value: String(weight_social) },
      { key: 'weight_governance', value: String(weight_governance) },
      { key: 'auto_emission_calculation', value: String(auto_emission_calculation) },
      { key: 'evidence_requirement', value: String(evidence_requirement) },
      { key: 'badge_auto_award', value: String(badge_auto_award) }
    ];

    for (const update of updates) {
      if (update.value !== undefined && update.value !== 'undefined') {
        await query(
          `INSERT INTO esg_configurations (key, value) 
           VALUES ($1, $2) 
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [update.key, update.value]
        );
      }
    }

    const updatedConfigs = await getConfigs();
    return NextResponse.json({ success: true, configs: updatedConfigs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
