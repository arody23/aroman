require('dotenv').config();
const { initDb } = require('./db');

async function main() {
  await initDb();
  console.log('Base de données prête.');
}

main().catch(err => { console.error(err); process.exit(1); });
