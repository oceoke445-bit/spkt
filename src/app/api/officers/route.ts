import { NextResponse } from 'next/server';
import { listOfficers } from '@/lib/services/spkt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const officers = listOfficers();
    return NextResponse.json({ officers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
