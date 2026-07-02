const serverless = require('serverless-http');
const app = require('../server/app');
const { initDb } = require('../server/db');

const handler = serverless(app);
let dbReady = false;

function shouldSkipDb(pathname) {
  return pathname === '/health'
    || pathname === '/favicon.ico'
    || /^\/(css|js|assets|uploads)\//.test(pathname)
    || /\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/i.test(pathname);
}

module.exports = async (req, res) => {
  const pathname = req.url?.split('?')[0] || '';
  try {
    if (!shouldSkipDb(pathname) && !dbReady) {
      await initDb();
      dbReady = true;
    }
    return handler(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    res.status(500).send(`Erreur serveur: ${err.message || String(err)}`);
  }
};
