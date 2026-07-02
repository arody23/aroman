const INIT_TIMEOUT_MS = 8000;

let handler = null;
let appReady = null;
let dbReady = false;

function shouldInitDb(pathname) {
  return !(
    pathname === '/health'
    || pathname === '/health/env'
    || pathname === '/favicon.ico'
    || /^\/(css|js|assets|uploads)\//.test(pathname)
    || /\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|txt)$/i.test(pathname)
  );
}

async function ensureApp() {
  if (!appReady) {
    appReady = (async () => {
      const serverless = require('serverless-http');
      const app = require('../server/app');
      handler = serverless(app, { binary: ['image/*', 'font/*'] });
    })();
  }
  await appReady;
}

async function ensureDb() {
  if (dbReady) return;
  const { initDb } = require('../server/db');
  await Promise.race([
    initDb(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('DB init timeout')), INIT_TIMEOUT_MS))
  ]);
  dbReady = true;
}

module.exports = async (req, res) => {
  const pathname = req.url?.split('?')[0] || '';
  try {
    if (shouldInitDb(pathname) && !dbReady) {
      await ensureDb();
    }
    await ensureApp();
    return handler(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    if (!res.headersSent) {
      res.status(500).send(`Erreur serveur: ${err.message || String(err)}`);
    }
  }
};

module.exports.config = { maxDuration: 60 };
