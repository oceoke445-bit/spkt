import { getUserPreferences, updateUserPreferences, type UserPreferences } from '@/lib/services/users';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  return jsonOk({ preferences: getUserPreferences(sessionUser.id) });
});

export const PATCH = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = (await request.json()) as Partial<UserPreferences>;
  const preferences = updateUserPreferences(sessionUser.id, body);
  return jsonOk({ preferences });
});
