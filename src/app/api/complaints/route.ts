import { listComplaints, createComplaint } from '@/lib/services/spkt';
import { requireAuth } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const { searchParams } = new URL(request.url);

  if (sessionUser.role === 'user') {
    if (!sessionUser.nik) {
      throw new ApiError(400, 'NIK user tidak tersedia');
    }
    return jsonOk({ complaints: listComplaints(sessionUser.nik) });
  }

  const nik = searchParams.get('nik') ?? undefined;
  return jsonOk({ complaints: listComplaints(nik) });
});

export const POST = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = await request.json();

  const complaint = createComplaint({
    ...body,
    submitterUserId: sessionUser.id,
    submitterName: body.submitterName ?? sessionUser.name,
    submitterNik: body.submitterNik ?? sessionUser.nik,
  });

  return jsonOk({ complaint }, 201);
});
