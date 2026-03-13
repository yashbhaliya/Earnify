const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPaymentsSchema() {
  console.log('🔧 Fixing payments table schema...');
  
  try {
    // First, let's check if payments table exists and its structure
    console.log('📋 Checking current payments table structure...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'payments');
    
    if (tablesError) {
      console.log('⚠️  Cannot check table structure. Creating payments table...');
    }
    
    // Create or recreate payments table with correct schema
    const createTableSQL = `
      -- Drop existing payments table if it exists (be careful with production data!)
      DROP TABLE IF EXISTS payments CASCADE;
      
      -- Create payments table with proper foreign key relationships
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
        payment_id TEXT NOT NULL UNIQUE,
        order_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_resource_id ON payments(resource_id);
      CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      
      -- Create updated_at trigger
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      CREATE TRIGGER update_payments_updated_at 
        BEFORE UPDATE ON payments 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    console.log('🗃️  Creating payments table with proper schema...');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    }).catch(() => {
      console.log('⚠️  exec_sql function not available. Please run SQL manually.');
      return { error: 'exec_sql not available' };
    });
    
    if (error) {
      console.log('\n❌ Could not execute SQL automatically.');
      console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
      console.log('\n' + createTableSQL);
      console.log('\n🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
      return;
    }
    
    console.log('✅ Payments table created successfully!');
    
    // Verify the table structure
    console.log('🔍 Verifying table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'payments')
      .order('ordinal_position');
    
    if (!columnsError && columns) {
      console.log('📊 Payments table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
    }
    
    console.log('\n🎉 Database schema fixed successfully!');
    console.log('💡 You can now test payments again.');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log(`
-- Drop existing payments table if it exists (be careful with production data!)
DROP TABLE IF EXISTS payments CASCADE;

-- Create payments table with proper foreign key relationships
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_resource_id ON payments(resource_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);
  }
}

fixPaymentsSchema();