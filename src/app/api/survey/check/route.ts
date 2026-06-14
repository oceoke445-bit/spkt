import { hasSurvey } from '@/lib/csi';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const { searchParams } = new URL(request.url);
  const serviceType = searchParams.get('serviceType');
  const referenceId = searchParams.get('referenceId');

  if (!serviceType || !referenceId) {
    throw new ApiError(400, 'serviceType dan referenceId wajib diisi');
  }

  const submitted = hasSurvey(sessionUser.id, serviceType, referenceId);
  return jsonOk({ submitted });
});
