import { getUserById, updateUserProfile } from '@/lib/services/users';
import { requireAuth, toPublicUser } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const user = getUserById(sessionUser.id);
  if (!user) {
    throw new ApiError(404, 'User tidak ditemukan');
  }
  return jsonOk({ user: { ...toPublicUser(user), address: user.address } });
});

export const PATCH = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = await request.json();
  const updated = updateUserProfile(sessionUser.id, {
    name: body.name,
    phone: body.phone,
    address: body.address,
  });
  return jsonOk({ user: { ...toPublicUser(updated), address: updated.address } });
});
