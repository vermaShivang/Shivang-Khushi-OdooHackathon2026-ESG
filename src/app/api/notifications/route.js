import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 30`);
    return NextResponse.json({ success: true, notifications: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'mark_all_read') {
      await query(`UPDATE notifications SET status = 'Read' WHERE status = 'Unread'`);
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_all') {
      await query(`DELETE FROM notifications`);
      return NextResponse.json({ success: true });
    }

    if (action === 'create') {
      const { message, type } = body;
      await query(`
        INSERT INTO notifications (message, type, status)
        VALUES ($1, $2, 'Unread')
      `, [message, type || 'Compliance']);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
