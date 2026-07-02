let dbApi = null;
let initPromise = null;

function pickDriver() {
  if (process.env.VERCEL) {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return 'supabase';
    throw new Error('Sur Vercel : configurez SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (sans DATABASE_URL)');
  }
  if (process.env.DATABASE_DRIVER === 'supabase') return 'supabase';
  if (process.env.DATABASE_DRIVER === 'postgres') return 'postgres';
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.DATABASE_URL) return 'supabase';
  if (process.env.DATABASE_URL) return 'postgres';
  return 'sqlite';
}

async function bootstrap() {
  if (dbApi) return dbApi;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const driver = pickDriver();
    console.log(`  → Driver DB : ${driver}`);

    if (driver === 'supabase') {
      const supabase = require('./supabase');
      const db = await supabase.initDb();
      if (!process.env.VERCEL) await ensureAdmin(db);
      dbApi = db;
      return dbApi;
    }

    if (driver === 'postgres') {
      const pg = require('./postgres');
      const db = await pg.initDb();
      await ensureAdmin(db);
      dbApi = db;
      return dbApi;
    }

    const sqlite = require('./sqlite');
    dbApi = await sqlite.initDb();
    console.log('  → Base de données : SQLite (local)');
    return dbApi;
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

function getDb() {
  if (!dbApi) throw new Error('Database not initialized. Call initDb() first.');
  return dbApi;
}

async function ensureAdmin(db) {
  const bcrypt = require('bcryptjs');
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;

  const existing = await db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
  if (!existing) {
    const hash = bcrypt.hashSync(password, 12);
    await db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
    console.log(`  → Admin créé : ${username}`);
  }
}

async function runSchema(pool) {
  const fs = require('fs');
  const path = require('path');
  const schemaPath = path.join(__dirname, '..', '..', 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => s.length > 0 && !s.match(/^ALTER TABLE.*ENABLE ROW LEVEL/i));

  for (const stmt of statements) {
    if (stmt.includes('CREATE POLICY')) continue;
    try {
      await pool.query(stmt);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.warn('Schema warning:', err.message.substring(0, 80));
      }
    }
  }
}

module.exports = { initDb: bootstrap, getDb, runSchema, ensureAdmin };
