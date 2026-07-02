let dbApi = null;
let initPromise = null;

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)?.trim();
  return { url, key };
}

function assertVercelSupabaseEnv() {
  const { url, key } = getSupabaseEnv();
  const missing = [];
  if (!url) missing.push('SUPABASE_URL');
  if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length) {
    throw new Error(
      `Variables manquantes sur Vercel : ${missing.join(', ')}. ` +
      'Ajoutez-les dans Settings → Environment Variables (Production + Preview), puis Redeploy.'
    );
  }
}

function pickDriver() {
  if (process.env.VERCEL) {
    assertVercelSupabaseEnv();
    return 'supabase';
  }
  if (process.env.DATABASE_DRIVER === 'supabase') return 'supabase';
  if (process.env.DATABASE_DRIVER === 'postgres') return 'postgres';
  const { url, key } = getSupabaseEnv();
  if (url && key && !process.env.DATABASE_URL) return 'supabase';
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

function isDbReady() {
  return !!dbApi;
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

module.exports = { initDb: bootstrap, getDb, isDbReady, runSchema, ensureAdmin, getSupabaseEnv };
