import { getLetterById, updateLetter } from '@/lib/services/spkt';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  const { id } = await context.params;
  const letter = getLetterById(id);

  if (!letter) {
    throw new ApiError(404, 'Pengajuan surat tidak ditemukan');
  }

  if (sessionUser.role === 'user' && letter.requesterNIK !== sessionUser.nik) {
    throw new ApiError(403, 'Anda tidak dapat melihat pengajuan ini');
  }

  return jsonOk({ letter });
});

export const PATCH = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['petugas', 'admin']);

  const { id } = await context.params;
  const body = await request.json();

  const letter = updateLetter(id, {
    status: body.status,
    pickupDate: body.pickupDate,
    rejectionReason: body.rejectionReason,
  });

  if (!letter) {
    throw new ApiError(404, 'Pengajuan surat tidak ditemukan');
  }

  return jsonOk({ letter });
});
