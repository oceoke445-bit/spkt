import { NextResponse } from 'next/server';
import { submitSurvey } from '@/lib/csi';
import { requireAuth } from '@/lib/auth-server';
import { jsonError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const sessionUser = await requireAuth(request);
    const body = await request.json();
    const { serviceType, serviceLabel, referenceId, comment, responses } = body;

    if (!serviceType || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Data penilaian tidak lengkap' }, { status: 400 });
    }

    const result = submitSurvey({
      userId: sessionUser.id,
      userName: sessionUser.name,
      userEmail: sessionUser.email,
      serviceType,
      serviceLabel,
      referenceId,
      comment,
      responses,
    });

    return NextResponse.json(
      {
        message: 'Penilaian kepuasan berhasil disimpan',
        surveyId: result.id,
        csiScore: result.csiScore,
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error);
  }
}
