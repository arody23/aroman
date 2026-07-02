let handler = null;
let appReady = null;

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

module.exports = async (req, res) => {
  try {
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
