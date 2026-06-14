import { listLetters, createLetter } from '@/lib/services/spkt';
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
    return jsonOk({ letters: listLetters(sessionUser.nik) });
  }

  const nik = searchParams.get('nik') ?? undefined;
  return jsonOk({ letters: listLetters(nik) });
});

export const POST = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = await request.json();

  const letter = createLetter({
    ...body,
    requesterUserId: sessionUser.id,
    requesterName: body.requesterName ?? sessionUser.name,
    requesterNIK: body.requesterNIK ?? sessionUser.nik ?? body.requesterNIK,
  });

  return jsonOk({ letter }, 201);
});
