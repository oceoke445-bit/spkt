import {
  generateTotpSecret,
  getTotpUri,
  getUserTotpStatus,
  setupTotpSecret,
  enableTotp,
  disableTotp,
} from '@/lib/services/totp';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const status = getUserTotpStatus(sessionUser.id);
  return jsonOk({ ...status });
});

export const POST = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = await request.json();

  if (body.action === 'setup') {
    const secret = generateTotpSecret();
    setupTotpSecret(sessionUser.id, secret);
    return jsonOk({
      secret,
      uri: getTotpUri(sessionUser.email, secret),
      message: 'Scan URI di aplikasi authenticator, lalu verifikasi dengan kode 6 digit',
    });
  }

  if (body.action === 'enable') {
    enableTotp(sessionUser.id, body.code);
    return jsonOk({ message: '2FA berhasil diaktifkan', enabled: true });
  }

  if (body.action === 'disable') {
    disableTotp(sessionUser.id, body.code);
    return jsonOk({ message: '2FA berhasil dinonaktifkan', enabled: false });
  }

  throw new Error('Aksi tidak valid');
});
