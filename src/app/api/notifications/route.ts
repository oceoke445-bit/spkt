import {
  listNotifications,
  markAllNotificationsRead,
} from '@/lib/services/notifications';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const notifications = listNotifications(sessionUser.id);
  return jsonOk({ notifications });
});

export const PATCH = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  markAllNotificationsRead(sessionUser.id);
  return jsonOk({ message: 'Semua notifikasi ditandai dibaca' });
});
