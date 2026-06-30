require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL manquant dans .env');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  console.log('Connexion à Supabase PostgreSQL…');

  const schemaPath = path.join(__dirname, '..', '..', 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    if (stmt.includes('CREATE POLICY') || stmt.includes('ENABLE ROW LEVEL')) continue;
    try {
      await pool.query(stmt);
    } catch (err) {
      if (!/already exists/i.test(err.message)) {
        console.warn('  ⚠', err.message.split('\n')[0]);
      }
    }
  }
  console.log('  ✓ Schéma créé');

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('ADMIN_PASSWORD manquant dans .env');
    process.exit(1);
  }
  const hash = bcrypt.hashSync(password, 12);

  const { rows } = await pool.query('SELECT id FROM admins WHERE username = $1', [username]);
  if (rows.length === 0) {
    await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [username, hash]);
    console.log(`  ✓ Admin créé : ${username}`);
  } else {
    await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [hash, username]);
    console.log(`  ✓ Admin mis à jour : ${username}`);
  }

  const { rows: t } = await pool.query('SELECT COUNT(*)::int as c FROM testimonials');
  if (t[0].c === 0) {
    const testimonials = [
      ['Jean-Pierre K.', 'Directeur', 'BeautyCare Pro', 'Une expertise rare qui allie rigueur technique et vision marketing. Les résultats ont dépassé nos attentes.', 0],
      ['Amélie R.', 'Fondatrice', 'TechSolutions Africa', 'Le développement de notre plateforme SaaS et l\'accompagnement publicitaire ont transformé notre acquisition client.', 1],
      ['Sébastien L.', 'CEO', 'Angelina Shapper', 'Un partenaire fiable qui comprend autant le code que les campagnes Meta. Professionnalisme et résultats concrets.', 2]
    ];
    for (const [name, role, company, content, sort] of testimonials) {
      await pool.query(
        'INSERT INTO testimonials (name, role, company, content, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [name, role, company, content, sort]
      );
    }
    console.log('  ✓ Témoignages initiaux insérés');
  }

  await pool.end();
  console.log('\n  ✓ Supabase configuré avec succès\n');
}

main().catch(err => { console.error(err); process.exit(1); });
