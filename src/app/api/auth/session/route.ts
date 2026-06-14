import { getSessionUserFromRequest, toPublicUser } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return jsonOk({ user: null });
  }
  return jsonOk({ user: toPublicUser(user) });
});
