import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/services/users';
import {
  createSession,
  getSessionCookieName,
  getSessionMaxAgeSec,
  toPublicUser,
} from '@/lib/auth-server';
import { jsonError, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const user = authenticateUser(email, password);

    if (!user) {
      return NextResponse.json({ error: 'Email atau password tidak valid' }, { status: 401 });
    }

    const token = createSession(user.id);
    const response = jsonOk({ user: toPublicUser(user) });
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: getSessionMaxAgeSec(),
    });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
