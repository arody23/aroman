import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, description, services = [] } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
    }
    const db = getSupabase();
    const { error } = await db.from('contact_requests').insert({
      name,
      email,
      company: company || null,
      phone: phone || null,
      description: description || null,
      services
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
