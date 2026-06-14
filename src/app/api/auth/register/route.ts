import { registerUser } from '@/lib/services/users';
import { validateNik } from '@/lib/services/account';
import { createSession, getSessionCookieName, getSessionMaxAgeSec, toPublicUser } from '@/lib/auth-server';
import { jsonError, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, nik, phone } = body;

    if (!email || !password || !name || !nik || !phone) {
      return jsonError(new Error('Semua field wajib diisi'));
    }

    if (password.length < 6) {
      return jsonError(new Error('Password minimal 6 karakter'));
    }

    if (!validateNik(nik)) {
      return jsonError(new Error('NIK harus 16 digit angka'));
    }

    const user = registerUser({ email, password, name, nik, phone });
    const token = createSession(user.id);
    const response = jsonOk({ user: toPublicUser(user) }, 201);
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
