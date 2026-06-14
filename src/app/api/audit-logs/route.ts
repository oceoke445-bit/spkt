import { listAuditLogs } from '@/lib/services/audit';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';
import { parsePagination, buildPaginatedResult } from '@/lib/pagination';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['admin']);

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);
  const { items, total } = listAuditLogs(limit, offset);

  return jsonOk({
    logs: items,
    pagination: buildPaginatedResult(items, total, page, limit),
  });
});
