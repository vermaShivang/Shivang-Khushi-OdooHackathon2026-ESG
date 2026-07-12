import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, employee_name } = body;

    if (!username || !email || !password || !employee_name) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if username already exists
    const checkUser = await query('SELECT 1 FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (checkUser.rowCount > 0) {
      return NextResponse.json({ success: false, error: 'Username or email already registered' }, { status: 400 });
    }

    // Hash the password securely
    const hashed = hashPassword(password);

    // Insert user into the DB
    await query(`
      INSERT INTO users (username, email, password_hash, role, employee_name)
      VALUES ($1, $2, $3, 'employee', $4)
    `, [username, email, hashed, employee_name]);

    // Create a scoring profile
    await query(`
      INSERT INTO employee_scores (employee_name, xp, points, challenges_completed, csr_completed)
      VALUES ($1, 0, 0, 0, 0)
      ON CONFLICT (employee_name) DO NOTHING
    `, [employee_name]);

    return NextResponse.json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
