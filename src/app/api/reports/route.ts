import { NextResponse } from 'next/server';
import { listReports, createReport } from '@/lib/services/spkt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get('nik') ?? undefined;
    const assignedTo = searchParams.get('assignedTo') ?? undefined;

    const reports = listReports({ nik, assignedTo });
    return NextResponse.json({ reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const report = createReport(body);
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
