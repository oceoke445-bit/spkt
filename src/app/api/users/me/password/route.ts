import { changeUserPassword } from '@/lib/services/users';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = await request.json();

  changeUserPassword(sessionUser.id, body.currentPassword, body.newPassword);
  return jsonOk({ message: 'Password berhasil diubah' });
});
