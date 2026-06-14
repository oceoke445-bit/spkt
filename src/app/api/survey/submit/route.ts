import { NextResponse } from 'next/server';
import { submitSurvey } from '@/lib/csi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, serviceType, serviceLabel, referenceId, comment, responses } = body;

    if (!userName || !serviceType || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Data penilaian tidak lengkap' }, { status: 400 });
    }

    const result = submitSurvey({
      userId,
      userName,
      userEmail,
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
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
