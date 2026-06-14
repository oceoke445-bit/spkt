import { NextResponse } from 'next/server';
import {
  deleteSession,
  getSessionCookieName,
} from '@/lib/auth-server';
import { handleApi, jsonOk } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handleApi(async (request) => {
  const cookieStore = request.headers.get('cookie');
  const match = cookieStore?.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  const token = match?.[1];

  if (token) {
    deleteSession(token);
  }

  const response = jsonOk({ message: 'Logout berhasil' });
  response.cookies.set(getSessionCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
});
