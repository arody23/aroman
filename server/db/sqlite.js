const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'portfolio.db');

let _db = null;
let _SQL = null;
let dbApi = null;

function loadSqlJs() {
  return require('sql.js');
}

function save() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function prepare(sql) {
  return {
    get(...params) {
      return Promise.resolve().then(() => {
        const stmt = _db.prepare(sql);
        try {
          stmt.bind(params);
          if (stmt.step()) return stmt.getAsObject();
          return undefined;
        } finally {
          stmt.free();
        }
      });
    },
    all(...params) {
      return Promise.resolve().then(() => {
        const results = [];
        const stmt = _db.prepare(sql);
        try {
          stmt.bind(params);
          while (stmt.step()) results.push(stmt.getAsObject());
        } finally {
          stmt.free();
        }
        return results;
      });
    },
    run(...params) {
      return Promise.resolve().then(() => {
        _db.run(sql, params);
        const changes = _db.getRowsModified();
        const lastId = _db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0];
        save();
        return { changes, lastInsertRowid: lastId };
      });
    }
  };
}

function exec(sql) {
  _db.run(sql);
  save();
}

function initSchema() {
  exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      technologies TEXT DEFAULT '[]',
      project_url TEXT,
      category TEXT,
      project_date TEXT,
      published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT,
      technologies TEXT DEFAULT '[]',
      app_url TEXT,
      platform TEXT,
      published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      objective TEXT,
      platform TEXT,
      strategy TEXT,
      results TEXT,
      description TEXT,
      screenshots TEXT DEFAULT '[]',
      statistics TEXT DEFAULT '{}',
      comments TEXT,
      published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      image TEXT,
      category TEXT,
      author TEXT DEFAULT 'Aroman EMETSHU',
      meta_title TEXT,
      meta_description TEXT,
      published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contact_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      services TEXT DEFAULT '[]',
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      ip_address TEXT,
      country TEXT,
      city TEXT,
      device TEXT,
      browser TEXT,
      os TEXT,
      referrer TEXT,
      source TEXT,
      first_visit TEXT DEFAULT (datetime('now')),
      last_visit TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id INTEGER,
      page_path TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      viewed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      company TEXT,
      content TEXT NOT NULL,
      published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

async function initDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  _SQL = await loadSqlJs();
  if (fs.existsSync(dbPath)) {
    _db = new _SQL.Database(fs.readFileSync(dbPath));
  } else {
    _db = new _SQL.Database();
  }
  initSchema();
  dbApi = { prepare, exec, save, driver: 'sqlite' };
  return dbApi;
}

function getDb() {
  if (!dbApi) throw new Error('Database not initialized. Call initDb() first.');
  return dbApi;
}

module.exports = { initDb, getDb };
