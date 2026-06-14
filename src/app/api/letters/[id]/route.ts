import { getLetterById, updateLetter, updateUserLetter } from '@/lib/services/spkt';
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
  const { id } = await context.params;
  const body = await request.json();

  if (sessionUser.role === 'user') {
    if (!sessionUser.nik) {
      throw new ApiError(400, 'NIK tidak tersedia');
    }
    const letter = updateUserLetter(id, sessionUser.nik, {
      purpose: body.purpose,
      pickupDate: body.pickupDate,
      requesterPhone: body.requesterPhone,
      attachmentFiles: body.attachmentFiles,
      submit: body.submit,
      letterTypeId: body.letterTypeId,
      letterTypeName: body.letterTypeName,
    });
    return jsonOk({ letter });
  }

  requireRole(sessionUser, ['petugas', 'admin']);

  const letter = updateLetter(id, {
    status: body.status,
    pickupDate: body.pickupDate,
    rejectionReason: body.rejectionReason,
    timelineNote: body.timelineNote,
    timelineOfficer: sessionUser.name,
  });

  if (!letter) {
    throw new ApiError(404, 'Pengajuan surat tidak ditemukan');
  }

  return jsonOk({ letter });
});
