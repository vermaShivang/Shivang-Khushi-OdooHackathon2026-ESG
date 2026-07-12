import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptSession } from '@/lib/auth-utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ecosphere_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    // Decrypt the AES-encrypted session token
    const session = decryptSession(sessionCookie.value);

    if (!session || !session.userId) {
      return NextResponse.json({ success: false, authenticated: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
        email: session.email,
        role: session.role,
        employeeName: session.employeeName
      }
    });
  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json({ success: false, authenticated: false, error: error.message }, { status: 500 });
  }
}
