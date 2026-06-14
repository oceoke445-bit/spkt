import { updateUserByAdmin } from '@/lib/services/users';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/services/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['admin']);

  const { id } = await context.params;
  const body = await request.json();

  if (id === sessionUser.id && body.active === false) {
    throw new ApiError(400, 'Tidak dapat menonaktifkan akun Anda sendiri');
  }

  updateUserByAdmin(id, {
    name: body.name,
    email: body.email,
    role: body.role,
    active: body.active,
  });

  createAuditLog({
    actorId: sessionUser.id,
    actorName: sessionUser.name,
    action: 'update_user',
    entityType: 'user',
    entityId: id,
    details: JSON.stringify({
      name: body.name,
      email: body.email,
      role: body.role,
      active: body.active,
    }),
  });

  return jsonOk({ message: 'User diperbarui' });
});
