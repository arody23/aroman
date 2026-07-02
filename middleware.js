import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import { siteConfig } from '@/lib/config';

const adminBase = `/${siteConfig.adminPath}`;

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith(adminBase)) return NextResponse.next();
  if (pathname === `${adminBase}/login`) return NextResponse.next();

  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);
  if (!session.adminId) {
    return NextResponse.redirect(new URL(`${adminBase}/login`, request.url));
  }
  return response;
}

export const config = {
  matcher: ['/gestion-interne-aroman/:path*']
};
