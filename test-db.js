const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simplePaymentsTest() {
  console.log('Testing payments table functionality...');
  
  try {
    // Test 1: Try to query payments table
    console.log('1. Testing payments table access...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(1);
    
    if (paymentsError) {
      if (paymentsError.message.includes('does not exist')) {
        console.log('❌ Payments table does not exist!');
        console.log('📝 Please run the SQL from fix-payments-schema.sql in Supabase SQL Editor');
        console.log('🔗 Go to: https://supabase.com/dashboard/project/emnrgsgerfjvndexomro/sql');
        return;
      } else {
        console.error('❌ Error accessing payments table:', paymentsError);
        return;
      }
    }
    
    console.log('✅ Payments table exists and is accessible');
    console.log(`📊 Current payments count: ${payments?.length || 0}`);
    
    // Test 2: Check resources table
    console.log('\\n2. Testing resources table...');
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('id, title, price')
      .limit(3);
    
    if (resourcesError) {
      console.error('❌ Error accessing resources:', resourcesError);
    } else {
      console.log('✅ Resources table accessible');
      console.log(`📊 Resources count: ${resources?.length || 0}`);
      if (resources && resources.length > 0) {
        console.log('📋 Sample resources:');
        resources.forEach(r => console.log(`   - ID: ${r.id}, Title: ${r.title}, Price: ₹${r.price}`));
      }
    }
    
    // Test 3: Check auth users
    console.log('\\n3. Testing auth system...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error accessing users:', usersError);
    } else {
      console.log('✅ Auth system accessible');
      console.log(`👥 Users count: ${users?.length || 0}`);
    }
    
    console.log('\\n🎉 Basic tests completed!');
    
    if (resources && resources.length > 0 && users && users.length > 0) {
      console.log('✅ Ready for payment testing!');
      console.log('🚀 Deploy to Vercel and test payments on live app.');
    } else {
      console.log('⚠️  Make sure you have:');
      console.log('   - At least one resource in the resources table');
      console.log('   - At least one user account created');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

simplePaymentsTest();