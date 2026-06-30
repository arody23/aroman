require('dotenv').config();

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log('\n  ✗ Variables manquantes dans .env :');
    console.log('    SUPABASE_URL');
    console.log('    SUPABASE_SERVICE_ROLE_KEY');
    console.log('\n  Voir docs/SUPABASE.md pour la configuration.\n');
    process.exit(1);
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const { error } = await supabase.from('projects').select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log('\n  ⚠ Connexion OK, mais les tables n\'existent pas encore.');
      console.log('    Exécutez supabase/schema.sql dans le SQL Editor Supabase.\n');
      process.exit(1);
    }
    if (error) throw error;
    console.log('\n  ✓ Connexion Supabase OK\n');
  } catch (err) {
    console.error('\n  ✗ Erreur Supabase:', err.message);
    console.log('  Vérifiez vos clés dans .env (voir docs/SUPABASE.md)\n');
    process.exit(1);
  }
}

main();
