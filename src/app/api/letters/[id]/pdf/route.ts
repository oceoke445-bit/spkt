import { getLetterById } from '@/lib/services/spkt';
import { generateLetterPdf } from '@/lib/letter-pdf';
import { requireAuth } from '@/lib/auth-server';
import { jsonError, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await requireAuth(request);
    const { id } = await context.params;
    const letter = getLetterById(id);

    if (!letter) {
      throw new ApiError(404, 'Pengajuan surat tidak ditemukan');
    }

    if (sessionUser.role === 'user' && letter.requesterNIK !== sessionUser.nik) {
      throw new ApiError(403, 'Akses ditolak');
    }

    if (!['ready', 'completed', 'verified'].includes(letter.status)) {
      throw new ApiError(400, 'PDF hanya tersedia setelah verifikasi');
    }

    const pdfBytes = await generateLetterPdf(letter);
    const filename = `${letter.requestNumber.replace(/\//g, '-')}.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
