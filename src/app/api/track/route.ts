import { trackService, type TrackServiceType } from '@/lib/services/track';
import { jsonError, jsonOk } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TYPES: TrackServiceType[] = ['report', 'letter', 'complaint'];

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
    if (!checkRateLimit(`track:${ip}`, 30, 60_000)) {
      return jsonError(new Error('Terlalu banyak permintaan. Coba lagi nanti.'));
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as TrackServiceType | null;
    const number = searchParams.get('number')?.trim();
    const nik = searchParams.get('nik')?.trim();

    if (!type || !VALID_TYPES.includes(type)) {
      return jsonError(new Error('Jenis layanan tidak valid'));
    }
    if (!number || !nik) {
      return jsonError(new Error('Nomor referensi dan NIK wajib diisi'));
    }

    const result = trackService(type, number, nik);
    return jsonOk({ track: result });
  } catch (error) {
    return jsonError(error);
  }
}
