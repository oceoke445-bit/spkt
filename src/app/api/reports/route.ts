import { listReports, createReport } from '@/lib/services/spkt';
import { requireAuth, requireRole } from '@/lib/auth-server';
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
    const reports = listReports({ nik: sessionUser.nik });
    return jsonOk({ reports });
  }

  const nik = searchParams.get('nik') ?? undefined;
  const assignedTo = searchParams.get('assignedTo') ?? undefined;
  const reports = listReports({ nik, assignedTo });
  return jsonOk({ reports });
});

export const POST = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = await request.json();

  const report = createReport({
    ...body,
    reporterUserId: sessionUser.id,
    reporterName: body.reporterName ?? sessionUser.name,
    reporterNIK: body.reporterNIK ?? sessionUser.nik ?? body.reporterNIK,
    reporterPhone: body.reporterPhone ?? sessionUser.phone ?? body.reporterPhone,
  });

  return jsonOk({ report }, 201);
});
