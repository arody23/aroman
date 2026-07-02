module.exports.config = { maxDuration: 60 };

let handler = null;
let appReady = null;

function pathname(req) {
  return (req.url || '/').split('?')[0];
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function ensureApp() {
  if (!appReady) {
    appReady = (async () => {
      const serverless = require('serverless-http');
      const app = require('../server/app');
      handler = serverless(app);
    })();
  }
  await appReady;
}

module.exports = async (req, res) => {
  const path = pathname(req);

  if (path === '/health/env' || path === '/ping') {
    return sendJson(res, 200, {
      ok: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      ping: 'pong',
      path
    });
  }

  try {
    await ensureApp();
    return handler(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    if (!res.headersSent) {
      res.status(500).end(`Erreur serveur: ${err.message || String(err)}`);
    }
  }
};
