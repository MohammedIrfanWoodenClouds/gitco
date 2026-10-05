import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-local-secret-gitco-2026');

export type Role = 'admin' | 'management';

export async function signSession(username: string, role: Role) {
  return new SignJWT({ username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
}

export async function getSession() {
  const c = await cookies();
  const token = c.get('gitco_session')?.value;
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret)).payload as { username: string; role: Role };
  } catch {
    return null;
  }
}

export function credentials() {
  return [
    {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin',
      role: 'admin' as Role
    },
    {
      username: process.env.MANAGEMENT1_USERNAME || 'management1',
      password: process.env.MANAGEMENT1_PASSWORD || 'admin',
      role: 'management' as Role
    },
    {
      username: process.env.MANAGEMENT2_USERNAME || 'management2',
      password: process.env.MANAGEMENT2_PASSWORD || 'admin',
      role: 'management' as Role
    }
  ];
}
