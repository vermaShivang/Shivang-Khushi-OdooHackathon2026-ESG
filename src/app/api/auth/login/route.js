import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, encryptSession } from '@/lib/auth-utils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    // Look up user
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    const user = result.rows[0];

    // Verify password against stored PBKDF2 hash
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    // Build session payload
    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      employeeName: user.employee_name,
      loginAt: new Date().toISOString()
    };

    // Encrypt the session with AES-256-CBC
    const sessionToken = encryptSession(sessionData);

    // Set encrypted, HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeName: user.employee_name
      }
    });

    response.cookies.set('ecosphere_session', sessionToken, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
