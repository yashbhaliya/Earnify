const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addUserEmailColumn() {
  console.log('Adding user_email column to resources table...');
  
  try {
    // Execute raw SQL to add column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_email TEXT;'
    });
    
    if (error) {
      console.log('Note: exec_sql function not available. Please run SQL manually in Supabase.');
      console.log('\nRun this SQL in Supabase SQL Editor:');
      console.log('ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_email TEXT;');
      console.log('CREATE INDEX IF NOT EXISTS idx_resources_user_email ON resources(user_email);');
      return;
    }
    
    console.log('✅ user_email column added successfully!');
  } catch (err) {
    console.log('\n⚠️  Please add the column manually in Supabase:');
    console.log('\n1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run this SQL:\n');
    console.log('ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_email TEXT;');
    console.log('CREATE INDEX IF NOT EXISTS idx_resources_user_email ON resources(user_email);');
  }
}

addUserEmailColumn();
