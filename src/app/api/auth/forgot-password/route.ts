import { resetPasswordByNik } from '@/lib/services/account';
import { jsonError, jsonOk } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
    if (!checkRateLimit(`forgot-password:${ip}`, 5, 60_000)) {
      return jsonError(new Error('Terlalu banyak percobaan. Coba lagi dalam 1 menit.'));
    }

    const { email, nik, newPassword } = await request.json();

    if (!email || !nik || !newPassword) {
      return jsonError(new Error('Email, NIK, dan password baru wajib diisi'));
    }

    resetPasswordByNik(email, nik, newPassword);
    return jsonOk({ message: 'Password berhasil direset. Silakan login dengan password baru.' });
  } catch (error) {
    return jsonError(error);
  }
}
