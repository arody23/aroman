const TIMEOUT_MS = 8000;

module.exports = async (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { initDb } = require('../server/db');
    await Promise.race([
      initDb(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB init timeout')), TIMEOUT_MS))
    ]);
    res.status(200).end(JSON.stringify({ ok: true, db: 'connected' }));
  } catch (err) {
    res.status(503).end(JSON.stringify({ ok: false, db: 'error', message: err.message }));
  }
};
