const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPaymentsTable() {
  console.log('🧪 Testing payments table...');
  
  try {
    // Test 1: Check if payments table exists and has correct structure
    console.log('1️⃣ Checking payments table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'payments')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
      return;
    }
    
    if (!columns || columns.length === 0) {
      console.error('❌ Payments table does not exist!');
      console.log('📝 Please run the SQL from fix-payments-schema.sql in Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Payments table exists with columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Test 2: Check foreign key constraints
    console.log('\\n2️⃣ Checking foreign key constraints...');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'payments')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (!constraintsError && constraints) {
      console.log('✅ Foreign key constraints:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}`);
      });
    }
    
    // Test 3: Check if resources table has some data
    console.log('\\n3️⃣ Checking resources table...');
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('id, title, price')
      .limit(3);
    
    if (resourcesError) {
      console.error('❌ Error checking resources:', resourcesError);
    } else if (resources && resources.length > 0) {
      console.log('✅ Resources table has data:');
      resources.forEach(resource => {
        console.log(`   - ID: ${resource.id}, Title: ${resource.title}, Price: ₹${resource.price}`);
      });
    } else {
      console.log('⚠️  Resources table is empty. Add some resources first.');
    }
    
    // Test 4: Check auth.users (we can't directly query this, but we can check if it exists)
    console.log('\\n4️⃣ Checking auth system...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error checking users:', usersError);
    } else {
      console.log(`✅ Auth system working. Found ${users?.length || 0} users.`);
    }
    
    console.log('\\n🎉 All tests completed!');
    console.log('💡 The payments table should now work correctly.');
    console.log('🚀 Try making a test payment on your live app.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymentsTable();