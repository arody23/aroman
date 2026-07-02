module.exports = (_req, res) => {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)?.trim();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    ok: !!(url && key),
    vercel: !!process.env.VERCEL,
    SUPABASE_URL: !!url,
    SUPABASE_SERVICE_ROLE_KEY: !!key,
    DATABASE_URL: !!process.env.DATABASE_URL
  }));
};
