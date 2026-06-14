import { NextResponse } from 'next/server';
import { getCsiSummary } from '@/lib/csi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  try {
    return NextResponse.json(getCsiSummary());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
