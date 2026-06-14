import { requireAuth } from '@/lib/auth-server';
import { storeUploadedFile, UPLOAD_LIMITS } from '@/lib/uploads';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handleApi(async (request) => {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const entries = formData.getAll('files');

  if (entries.length === 0) {
    throw new ApiError(400, 'Tidak ada file yang diupload');
  }

  if (entries.length > UPLOAD_LIMITS.maxFiles) {
    throw new ApiError(400, `Maksimal ${UPLOAD_LIMITS.maxFiles} file`);
  }

  const stored = [];
  for (const entry of entries) {
    if (!(entry instanceof File)) continue;
    stored.push(await storeUploadedFile(entry, user.id));
  }

  return jsonOk({ files: stored }, 201);
});
