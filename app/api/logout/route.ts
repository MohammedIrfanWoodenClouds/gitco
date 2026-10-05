import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const url = new URL('/login', req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set('gitco_session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
