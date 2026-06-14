import { getComplaintById, updateComplaint } from '@/lib/services/spkt';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  const { id } = await context.params;
  const complaint = getComplaintById(id);

  if (!complaint) {
    throw new ApiError(404, 'Pengaduan tidak ditemukan');
  }

  if (sessionUser.role === 'user' && complaint.submitterNik !== sessionUser.nik) {
    throw new ApiError(403, 'Anda tidak dapat melihat pengaduan ini');
  }

  return jsonOk({ complaint });
});

export const PATCH = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['admin']);

  const { id } = await context.params;
  const body = await request.json();

  const complaint = updateComplaint(id, {
    status: body.status,
    response: body.response,
  });

  if (!complaint) {
    throw new ApiError(404, 'Pengaduan tidak ditemukan');
  }

  return jsonOk({ complaint });
});
