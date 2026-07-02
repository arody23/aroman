const { createClient } = require('@supabase/supabase-js');

let client = null;
let dbApi = null;

const JSON_FIELDS = ['technologies', 'screenshots', 'statistics', 'services'];

function normalizeRow(row) {
  if (!row) return row;
  const copy = { ...row };
  JSON_FIELDS.forEach(f => {
    if (copy[f] != null && typeof copy[f] === 'object') {
      copy[f] = JSON.stringify(copy[f]);
    }
  });
  if ('published' in copy && typeof copy.published === 'boolean') {
    copy.published = copy.published ? 1 : 0;
  }
  if ('c' in copy) copy.c = Number(copy.c);
  if ('count' in copy) copy.count = Number(copy.count);
  return copy;
}

function bindSql(sql, params) {
  let i = 0;
  return sql.replace(/\?/g, () => {
    const v = params[i++];
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    return `'${String(v).replace(/'/g, "''")}'`;
  });
}

function groupByDay(rows, field) {
  const map = {};
  rows.forEach((row) => {
    const day = String(row[field]).slice(0, 10);
    map[day] = (map[day] || 0) + 1;
  });
  return Object.keys(map).sort().map(day => ({ day, count: map[day] }));
}

function groupByField(rows, field) {
  const map = {};
  rows.forEach((row) => {
    const key = row[field] || 'unknown';
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .map(([label, count]) => ({ [field]: label, count }))
    .sort((a, b) => b.count - a.count);
}

async function runSelect(sql, params) {
  const s = sql.replace(/\s+/g, ' ').trim();

  let m = s.match(/^SELECT COUNT\(\*\) as c FROM (\w+)$/i);
  if (m) {
    const { count, error } = await client.from(m[1]).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return [{ c: count || 0 }];
  }

  m = s.match(/^SELECT COUNT\(\*\) as c FROM (\w+) WHERE status = 'new'$/i);
  if (m) {
    const { count, error } = await client.from(m[1]).select('*', { count: 'exact', head: true }).eq('status', 'new');
    if (error) throw error;
    return [{ c: count || 0 }];
  }

  m = s.match(/^SELECT \* FROM admins WHERE username = \?$/i);
  if (m) {
    const { data, error } = await client.from('admins').select('*').eq('username', params[0]).maybeSingle();
    if (error) throw error;
    return data ? [data] : [];
  }

  m = s.match(/^SELECT id FROM admins WHERE username = \?$/i);
  if (m) {
    const { data, error } = await client.from('admins').select('id').eq('username', params[0]).maybeSingle();
    if (error) throw error;
    return data ? [data] : [];
  }

  m = s.match(/^SELECT \* FROM (\w+) WHERE id = \?$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').eq('id', params[0]).maybeSingle();
    if (error) throw error;
    return data ? [data] : [];
  }

  m = s.match(/^SELECT \* FROM (\w+) WHERE slug = \? AND published = 1$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').eq('slug', params[0]).eq('published', true).maybeSingle();
    if (error) throw error;
    return data ? [data] : [];
  }

  m = s.match(/^SELECT id FROM (\w+) WHERE session_id = \?$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('id').eq('session_id', params[0]).maybeSingle();
    if (error) throw error;
    return data ? [data] : [];
  }

  m = s.match(/^SELECT slug, updated_at FROM (\w+) WHERE published = 1$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('slug, updated_at').eq('published', true);
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) WHERE published = 1 ORDER BY sort_order, created_at DESC LIMIT (\d+)$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').eq('published', true)
      .order('sort_order').order('created_at', { ascending: false }).limit(Number(m[2]));
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) WHERE published = 1 ORDER BY sort_order, created_at DESC$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').eq('published', true)
      .order('sort_order').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) WHERE published = 1 ORDER BY created_at DESC LIMIT (\d+)$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').eq('published', true)
      .order('created_at', { ascending: false }).limit(Number(m[2]));
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) WHERE published = 1 ORDER BY created_at DESC$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').eq('published', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) WHERE published = 1 ORDER BY sort_order$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').eq('published', true).order('sort_order');
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) ORDER BY sort_order, created_at DESC$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').order('sort_order').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) ORDER BY created_at DESC LIMIT (\d+)$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').order('created_at', { ascending: false }).limit(Number(m[2]));
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) ORDER BY created_at DESC$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) ORDER BY sort_order$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').order('sort_order');
    if (error) throw error;
    return data || [];
  }

  m = s.match(/^SELECT \* FROM (\w+) ORDER BY last_visit DESC LIMIT (\d+)$/i);
  if (m) {
    const { data, error } = await client.from(m[1]).select('*').order('last_visit', { ascending: false }).limit(Number(m[2]));
    if (error) throw error;
    return data || [];
  }

  if (/FROM page_views WHERE viewed_at/i.test(s)) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data, error } = await client.from('page_views').select('viewed_at').gte('viewed_at', since.toISOString());
    if (error) throw error;
    return groupByDay(data || [], 'viewed_at');
  }

  if (/FROM visitors WHERE first_visit/i.test(s)) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data, error } = await client.from('visitors').select('first_visit').gte('first_visit', since.toISOString());
    if (error) throw error;
    return groupByDay(data || [], 'first_visit');
  }

  if (/SELECT source, COUNT\(\*\) as count FROM visitors GROUP BY source/i.test(s)) {
    const { data, error } = await client.from('visitors').select('source');
    if (error) throw error;
    return groupByField(data || [], 'source');
  }

  if (/SELECT device, COUNT\(\*\) as count FROM visitors GROUP BY device/i.test(s)) {
    const { data, error } = await client.from('visitors').select('device');
    if (error) throw error;
    return groupByField(data || [], 'device');
  }

  if (/SELECT browser, COUNT\(\*\) as count FROM visitors GROUP BY browser/i.test(s)) {
    const { data, error } = await client.from('visitors').select('browser');
    if (error) throw error;
    return groupByField(data || [], 'browser');
  }

  if (/SELECT page_path, COUNT\(\*\) as count FROM page_views GROUP BY page_path/i.test(s)) {
    const { data, error } = await client.from('page_views').select('page_path');
    if (error) throw error;
    return groupByField(data || [], 'page_path');
  }

  throw new Error(`Requête Supabase non supportée: ${s.slice(0, 120)}`);
}

async function runMutation(sql, params) {
  const s = sql.replace(/\s+/g, ' ').trim();

  let m = s.match(/^INSERT INTO admins \(username, password_hash\) VALUES \(\?, \?\)$/i);
  if (m) {
    const { data, error } = await client.from('admins').insert({ username: params[0], password_hash: params[1] }).select('id').single();
    if (error) throw error;
    return { changes: 1, lastInsertRowid: data.id };
  }

  m = s.match(/^INSERT INTO visitors \(([^)]+)\) VALUES \(([^)]+)\)$/i);
  if (m) {
    const cols = m[1].split(',').map(c => c.trim());
    const row = {};
    cols.forEach((col, idx) => { row[col] = params[idx]; });
    const { data, error } = await client.from('visitors').insert(row).select('id').single();
    if (error) throw error;
    return { changes: 1, lastInsertRowid: data.id };
  }

  m = s.match(/^INSERT INTO page_views \(visitor_id, page_path, duration_seconds\) VALUES \(\?, \?, \?\)$/i);
  if (m) {
    const { error } = await client.from('page_views').insert({
      visitor_id: params[0], page_path: params[1], duration_seconds: params[2]
    });
    if (error) throw error;
    return { changes: 1 };
  }

  m = s.match(/^UPDATE visitors SET last_visit = datetime\('now'\), ip_address = \?, referrer = \?, source = \? WHERE session_id = \?$/i);
  if (m) {
    const { error } = await client.from('visitors').update({
      last_visit: new Date().toISOString(),
      ip_address: params[0],
      referrer: params[1],
      source: params[2]
    }).eq('session_id', params[3]);
    if (error) throw error;
    return { changes: 1 };
  }

  m = s.match(/^INSERT INTO contact_requests \(([^)]+)\) VALUES \(([^)]+)\)$/i);
  if (m) {
    const cols = m[1].split(',').map(c => c.trim());
    const row = {};
    cols.forEach((col, idx) => {
      row[col] = col === 'services' ? JSON.parse(params[idx]) : params[idx];
    });
    const { error } = await client.from('contact_requests').insert(row);
    if (error) throw error;
    return { changes: 1 };
  }

  m = s.match(/^DELETE FROM (\w+) WHERE id = \?$/i);
  if (m) {
    const { error } = await client.from(m[1]).delete().eq('id', params[0]);
    if (error) throw error;
    return { changes: 1 };
  }

  m = s.match(/^UPDATE contact_requests SET status = \? WHERE id = \?$/i);
  if (m) {
    const { error } = await client.from('contact_requests').update({ status: params[0] }).eq('id', params[1]);
    if (error) throw error;
    return { changes: 1 };
  }

  // Generic INSERT: INSERT INTO table (a,b,c) VALUES (?,?,?)
  m = s.match(/^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)$/i);
  if (m) {
    const table = m[1];
    const cols = m[2].split(',').map(c => c.trim());
    const row = {};
    cols.forEach((col, idx) => {
      let val = params[idx];
      if (['technologies', 'screenshots', 'statistics', 'services'].includes(col) && typeof val === 'string') {
        try { val = JSON.parse(val); } catch { /* keep string */ }
      }
      if (col === 'published') val = !!val;
      row[col] = val;
    });
    const { data, error } = await client.from(table).insert(row).select('id').single();
    if (error) throw error;
    return { changes: 1, lastInsertRowid: data.id };
  }

  m = s.match(/^UPDATE (\w+) SET (.+) WHERE id = \?$/i);
  if (m) {
    const table = m[1];
    const setParts = m[2].split(',').map(p => p.trim());
    const row = {};
    let paramIdx = 0;
    setParts.forEach((part) => {
      if (/updated_at\s*=\s*datetime\('now'\)/i.test(part)) {
        row.updated_at = new Date().toISOString();
        return;
      }
      const col = part.split('=')[0].trim();
      let val = params[paramIdx++];
      if (['technologies', 'screenshots', 'statistics', 'services'].includes(col) && typeof val === 'string') {
        try { val = JSON.parse(val); } catch { /* keep */ }
      }
      if (col === 'published') val = !!val;
      row[col] = val;
    });
    const id = params[paramIdx];
    const { error } = await client.from(table).update(row).eq('id', id);
    if (error) throw error;
    return { changes: 1 };
  }

  throw new Error(`Mutation Supabase non supportée: ${s.slice(0, 120)}`);
}

function prepare(sql) {
  return {
    async get(...params) {
      const rows = await runSelect(sql, params);
      return normalizeRow(rows[0]);
    },
    async all(...params) {
      const rows = await runSelect(sql, params);
      return rows.map(normalizeRow);
    },
    async run(...params) {
      return runMutation(sql, params);
    }
  };
}

async function initDb() {
  if (dbApi) return dbApi;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
  }

  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  dbApi = { prepare, client, driver: 'supabase' };
  console.log('  → Base de données : Supabase API');
  return dbApi;
}

function getDb() {
  if (!dbApi) throw new Error('Database not initialized. Call initDb() first.');
  return dbApi;
}

module.exports = { initDb, getDb };
