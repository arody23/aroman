import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';
import { siteConfig } from '@/lib/config';

export async function POST(request) {
  const response = NextResponse.redirect(new URL(`/${siteConfig.adminPath}/login`, request.url));
  const session = await getIronSession(request, response, sessionOptions);
  session.destroy();
  return response;
}
