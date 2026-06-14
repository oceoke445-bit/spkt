import { exportUserData, deleteUserAccount } from '@/lib/services/account';
import { requireAuth, deleteSession, getSessionCookieName } from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const data = exportUserData(sessionUser.id, sessionUser.nik);
  const json = JSON.stringify(data, null, 2);
  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="spkt-data-${sessionUser.id}.json"`,
    },
  });
});

export const DELETE = handleApi(async (request) => {
  const sessionUser = await requireAuth(request);
  const body = await request.json();
  deleteUserAccount(sessionUser.id, body.password);

  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  if (match?.[1]) {
    deleteSession(decodeURIComponent(match[1]));
  }

  const response = jsonOk({ message: 'Akun berhasil dihapus' });
  response.cookies.set(getSessionCookieName(), '', { path: '/', maxAge: 0 });
  return response;
});
