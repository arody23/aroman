import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'changez-ce-secret-en-production-32chars-min',
  cookieName: 'aroman_admin',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    sameSite: 'lax'
  }
};

export async function getSession() {
  return getIronSession(await cookies(), sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) return null;
  return session;
}
