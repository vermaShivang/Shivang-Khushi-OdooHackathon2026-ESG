import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { decryptSession } from '@/lib/auth-utils';

// Helper to check if caller is an admin
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ecosphere_session');

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const session = decryptSession(sessionCookie.value);
  if (!session || session.role !== 'admin') {
    return null;
  }

  return session;
}

export async function GET() {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const usersResult = await query(`
      SELECT id, username, email, role, employee_name, created_at 
      FROM users 
      ORDER BY id ASC
    `);

    // Fetch some global stats for admin panel
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM carbon_transactions) as total_transactions,
        (SELECT COUNT(*) FROM compliance_issues WHERE status = 'Open') as open_compliance,
        (SELECT COUNT(*) FROM employee_scores) as total_graded_employees
    `);

    return NextResponse.json({
      success: true,
      users: usersResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Admin API GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, userId, targetRole } = body;

    if (action === 'update_role') {
      if (!userId || !targetRole) {
        return NextResponse.json({ success: false, error: 'Missing userId or targetRole' }, { status: 400 });
      }

      // Do not allow self demotion
      if (Number(userId) === Number(admin.userId)) {
        return NextResponse.json({ success: false, error: 'Cannot modify your own admin role.' }, { status: 400 });
      }

      await query('UPDATE users SET role = $1 WHERE id = $2', [targetRole, userId]);
      return NextResponse.json({ success: true, message: `User role updated to ${targetRole}` });
    }

    if (action === 'delete_user') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
      }

      if (Number(userId) === Number(admin.userId)) {
        return NextResponse.json({ success: false, error: 'Cannot delete your own account.' }, { status: 400 });
      }

      await query('DELETE FROM users WHERE id = $1', [userId]);
      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin API POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
