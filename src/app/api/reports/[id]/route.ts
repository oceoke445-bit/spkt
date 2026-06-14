import { getReportById, updateReport, updateUserReport } from '@/lib/services/spkt';
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
  const { id } = await context.params;
  const body = await request.json();

  if (sessionUser.role === 'user') {
    if (!sessionUser.nik) {
      throw new ApiError(400, 'NIK user tidak tersedia');
    }
    const report = updateUserReport(id, sessionUser.nik, {
      caseType: body.caseType,
      incidentDate: body.incidentDate,
      location: body.location,
      description: body.description,
      reporterPhone: body.reporterPhone,
      evidenceFiles: body.evidenceFiles,
      submit: body.submit,
    });
    return jsonOk({ report });
  }

  requireRole(sessionUser, ['petugas', 'admin']);

  const report = updateReport(id, {
    ...body,
    adminOverride: sessionUser.role === 'admin' && body.adminOverride,
    timelineOfficer: body.timelineOfficer ?? sessionUser.name,
    assignedBy: body.assignedBy ?? sessionUser.name,
  });

  return jsonOk({ report });
});
