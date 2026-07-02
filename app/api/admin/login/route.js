import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sessionOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/config';

export async function POST(request) {
  const { username, password } = await request.json();
  const db = getSupabase();
  const { data: admin } = await db.from('admins').select('*').eq('username', username).maybeSingle();
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  const session = await getIronSession(request, response, sessionOptions);
  session.adminId = admin.id;
  session.adminUsername = admin.username;
  await session.save();
  return response;
}

export async function GET() {
  return NextResponse.redirect(new URL(`/${siteConfig.adminPath}/login`, process.env.SITE_URL || 'http://localhost:3000'));
}
