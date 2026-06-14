import { consumePending2fa, verifyTotpCode, getTotpSecretForUser } from '@/lib/services/totp';
import { getUserById } from '@/lib/services/users';
import { createSession, getSessionCookieName, getSessionMaxAgeSec, toPublicUser } from '@/lib/auth-server';
import { jsonError, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { tempToken, code } = await request.json();

    if (!tempToken || !code) {
      return jsonError(new Error('Token dan kode verifikasi wajib diisi'));
    }

    const userId = consumePending2fa(tempToken);
    if (!userId) {
      return jsonError(new Error('Sesi verifikasi kedaluwarsa. Silakan login ulang.'));
    }

    const secret = getTotpSecretForUser(userId);
    if (!secret || !verifyTotpCode(secret, code)) {
      return jsonError(new Error('Kode verifikasi tidak valid'));
    }

    const user = getUserById(userId);
    if (!user) {
      return jsonError(new Error('User tidak ditemukan'));
    }

    const token = createSession(userId);
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
