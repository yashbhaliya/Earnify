const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simplePaymentsTest() {
  console.log('🧪 Testing payments table functionality...');
  
  try {
    // Test 1: Try to query payments table
    console.log('1️⃣ Testing payments table access...');
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
    console.log('\n2️⃣ Testing resources table...');\n    const { data: resources, error: resourcesError } = await supabase\n      .from('resources')\n      .select('id, title, price')\n      .limit(3);\n    \n    if (resourcesError) {\n      console.error('❌ Error accessing resources:', resourcesError);\n    } else {\n      console.log('✅ Resources table accessible');\n      console.log(`📊 Resources count: ${resources?.length || 0}`);\n      if (resources && resources.length > 0) {\n        console.log('📋 Sample resources:');\n        resources.forEach(r => console.log(`   - ID: ${r.id}, Title: ${r.title}, Price: ₹${r.price}`));\n      }\n    }\n    \n    // Test 3: Check auth users
    console.log('\n3️⃣ Testing auth system...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error accessing users:', usersError);
    } else {
      console.log('✅ Auth system accessible');
      console.log(`👥 Users count: ${users?.length || 0}`);
    }
    
    console.log('\n🎉 Basic tests completed!');
    
    if (resources && resources.length > 0 && users && users.length > 0) {
      console.log('✅ Ready for payment testing!');
      console.log('🚀 Deploy to Vercel and test payments on live app.');
    } else {
      console.log('⚠️  Make sure you have:');
      console.log('   - At least one resource in the resources table');
      console.log('   - At least one user account created');
    }\n    \n  } catch (error) {\n    console.error('❌ Test failed:', error);\n  }\n}\n\nsimplePaymentsTest();