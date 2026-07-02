import { getSupabase, hasSupabase } from './supabase';
import { parseJson } from './config';

async function safeQuery(fn, fallback) {
  if (!hasSupabase()) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error('DB query error:', err.message);
    return fallback;
  }
}

export async function getHomeData() {
  return safeQuery(async () => {
    const db = getSupabase();
    const [projects, campaigns, posts, testimonials] = await Promise.all([
      db.from('projects').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false }).limit(6),
      db.from('campaigns').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false }).limit(4),
      db.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3),
      db.from('testimonials').select('*').eq('published', true).order('sort_order')
    ]);
    return {
      projects: (projects.data || []).map(p => ({ ...p, technologies: parseJson(p.technologies) })),
      campaigns: (campaigns.data || []).map(c => ({ ...c, screenshots: parseJson(c.screenshots), statistics: parseJson(c.statistics, {}) })),
      posts: posts.data || [],
      testimonials: testimonials.data || []
    };
  }, { projects: [], campaigns: [], posts: [], testimonials: [] });
}

export async function getProjects() {
  return safeQuery(async () => {
    const { data } = await getSupabase().from('projects').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false });
    return (data || []).map(p => ({ ...p, technologies: parseJson(p.technologies) }));
  }, []);
}

export async function getApplications() {
  return safeQuery(async () => {
    const { data } = await getSupabase().from('applications').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false });
    return (data || []).map(a => ({ ...a, technologies: parseJson(a.technologies) }));
  }, []);
}

export async function getCampaigns() {
  return safeQuery(async () => {
    const { data } = await getSupabase().from('campaigns').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false });
    return (data || []).map(c => ({ ...c, screenshots: parseJson(c.screenshots), statistics: parseJson(c.statistics, {}) }));
  }, []);
}

export async function getBlogPosts() {
  return safeQuery(async () => {
    const { data } = await getSupabase().from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false });
    return data || [];
  }, []);
}

export async function getBlogPost(slug) {
  return safeQuery(async () => {
    const { data } = await getSupabase().from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle();
    return data;
  }, null);
}

export async function getDashboardStats() {
  const db = getSupabase();
  const tables = ['projects', 'applications', 'campaigns', 'blog_posts', 'contact_requests', 'visitors'];
  const stats = {};
  for (const table of tables) {
    const { count } = await db.from(table).select('*', { count: 'exact', head: true });
    stats[table] = count || 0;
  }
  const { count: newContacts } = await db.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'new');
  stats.newContacts = newContacts || 0;
  const { data: recentContacts } = await db.from('contact_requests').select('*').order('created_at', { ascending: false }).limit(5);
  const { data: recentVisitors } = await db.from('visitors').select('*').order('last_visit', { ascending: false }).limit(5);
  return { stats, recentContacts: recentContacts || [], recentVisitors: recentVisitors || [] };
}

export async function adminList(table) {
  const { data, error } = await getSupabase().from(table).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function adminGet(table, id) {
  const { data, error } = await getSupabase().from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminInsert(table, row) {
  const { data, error } = await getSupabase().from(table).insert(row).select('id').single();
  if (error) throw error;
  return data;
}

export async function adminUpdate(table, id, row) {
  const { error } = await getSupabase().from(table).update({ ...row, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function adminDelete(table, id) {
  const { error } = await getSupabase().from(table).delete().eq('id', id);
  if (error) throw error;
}
