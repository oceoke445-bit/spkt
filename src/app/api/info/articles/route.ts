import { listInfoArticles, createInfoArticle } from '@/lib/services/info';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';
import { createAuditLog } from '@/lib/services/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  await requireAuth(request);
  return jsonOk({ articles: listInfoArticles() });
});

export const POST = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['admin']);

  const body = await request.json();
  const article = createInfoArticle({
    title: body.title,
    category: body.category,
    description: body.description,
    content: body.content,
  });

  createAuditLog({
    actorId: sessionUser.id,
    actorName: sessionUser.name,
    action: 'create_article',
    entityType: 'article',
    entityId: article.id,
    details: article.title,
  });

  return jsonOk({ article }, 201);
});
