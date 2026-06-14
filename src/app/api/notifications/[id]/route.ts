import { markNotificationRead } from '@/lib/services/notifications';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  const { id } = await context.params;

  const ok = markNotificationRead(id, sessionUser.id);
  if (!ok) {
    throw new ApiError(404, 'Notifikasi tidak ditemukan');
  }

  return jsonOk({ message: 'Notifikasi ditandai dibaca' });
});
