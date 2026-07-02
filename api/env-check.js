module.exports = (_req, res) => {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)?.trim();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).end(JSON.stringify({
    ok: !!(url && key),
    message: url && key ? 'Variables Supabase détectées' : 'Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sur Vercel',
    SUPABASE_URL: !!url,
    SUPABASE_SERVICE_ROLE_KEY: !!key
  }));
};
