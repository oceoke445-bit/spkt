import { listInfoArticles } from '@/lib/services/info';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  await requireAuth(request);
  return jsonOk({ articles: listInfoArticles() });
});
