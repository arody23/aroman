import { NextResponse } from 'next/server';
import { hasSupabase } from '@/lib/supabase';

export async function GET() {
  return NextResponse.json({
    ok: hasSupabase(),
    message: hasSupabase() ? 'Next.js OK — Supabase configuré' : 'Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sur Vercel',
    stack: 'nextjs'
  });
}
