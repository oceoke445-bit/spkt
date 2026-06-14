import { getInfoArticle, updateInfoArticle, deleteInfoArticle } from '@/lib/services/info';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/services/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  await requireAuth(request);
  const { id } = await context.params;
  const article = getInfoArticle(id);
  if (!article) {
    throw new ApiError(404, 'Artikel tidak ditemukan');
  }
  return jsonOk({ article });
});

export const PATCH = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['admin']);

  const { id } = await context.params;
  const body = await request.json();
  const article = updateInfoArticle(id, body);
  if (!article) {
    throw new ApiError(404, 'Artikel tidak ditemukan');
  }

  createAuditLog({
    actorId: sessionUser.id,
    actorName: sessionUser.name,
    action: 'update_article',
    entityType: 'article',
    entityId: id,
    details: article.title,
  });

  return jsonOk({ article });
});

export const DELETE = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['admin']);

  const { id } = await context.params;
  const existing = getInfoArticle(id);
  const deleted = deleteInfoArticle(id);
  if (!deleted) {
    throw new ApiError(404, 'Artikel tidak ditemukan');
  }

  createAuditLog({
    actorId: sessionUser.id,
    actorName: sessionUser.name,
    action: 'delete_article',
    entityType: 'article',
    entityId: id,
    details: existing?.title ?? id,
  });

  return jsonOk({ message: 'Artikel dihapus' });
});
