import { getReportById, updateReport } from '@/lib/services/spkt';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { handleApi, jsonOk, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  const { id } = await context.params;
  const report = getReportById(id);

  if (!report) {
    throw new ApiError(404, 'Laporan tidak ditemukan');
  }

  if (sessionUser.role === 'user' && report.reporterNIK !== sessionUser.nik) {
    throw new ApiError(403, 'Anda tidak dapat melihat laporan ini');
  }

  return jsonOk({ report });
});

export const PATCH = handleApi(async (request, context: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireAuth(request);
  requireRole(sessionUser, ['petugas', 'admin']);

  const { id } = await context.params;
  const body = await request.json();

  const report = updateReport(id, {
    ...body,
    timelineOfficer: body.timelineOfficer ?? sessionUser.name,
    assignedBy: body.assignedBy ?? sessionUser.name,
  });

  return jsonOk({ report });
});
