import { getAdminStats } from '@/lib/services/stats';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['admin']);
  return jsonOk({ stats: getAdminStats() });
});
