const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPaymentWithoutAmount() {
  console.log('🧪 Testing payment insertion without amount column...');
  
  try {
    // Get test data
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const { data: resources } = await supabase.from('resources').select('id, title, price').limit(1);
    
    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    if (!resources || resources.length === 0) {
      console.log('❌ No resources found');
      return;
    }
    
    console.log('📋 Test data:');
    console.log('User:', users[0].id);
    console.log('Resource:', resources[0]);
    
    // Test payment data (without amount column)
    const testPaymentData = {
      user_id: users[0].id,
      resource_id: resources[0].id,
      payment_id: 'test_fix_' + Date.now(),
      order_id: 'order_fix_' + Date.now(),
      status: 'completed'
      // Note: NO amount column
    };
    
    console.log('💳 Inserting test payment:', testPaymentData);
    
    const { data: newPayment, error: insertError } = await supabase
      .from('payments')
      .insert([testPaymentData])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Payment insertion failed:', insertError);
      
      if (insertError.message.includes('amount')) {
        console.log('🚨 Amount column issue still exists!');
        console.log('💡 The server code may not be updated yet');
      }
      
      return false;
    } else {
      console.log('✅ Payment inserted successfully!');
      console.log('📊 Payment record:', newPayment);
      
      // Clean up test payment
      await supabase.from('payments').delete().eq('id', newPayment.id);
      console.log('🧹 Test payment cleaned up');
      
      return true;
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error);
    return false;
  }
}

async function testVercelAPI() {
  console.log('\\n🌐 Testing Vercel API endpoints...');
  
  try {
    // Test payment key endpoint
    const keyResponse = await fetch('https://earnify-gamma.vercel.app/api/payment/key');
    if (keyResponse.ok) {
      const keyData = await keyResponse.json();
      console.log('✅ Payment key endpoint working:', !!keyData.key);
    } else {
      console.log('❌ Payment key endpoint failed:', keyResponse.status);
    }
    
    // Test resources endpoint
    const resourcesResponse = await fetch('https://earnify-gamma.vercel.app/api/resources');
    if (resourcesResponse.ok) {
      const resourcesData = await resourcesResponse.json();
      console.log('✅ Resources endpoint working:', resourcesData.length, 'resources');
    } else {
      console.log('❌ Resources endpoint failed:', resourcesResponse.status);
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

// Run tests
(async () => {
  console.log('🔧 TESTING PAYMENT FIX\\n');
  
  const dbTest = await testPaymentWithoutAmount();
  await testVercelAPI();
  
  console.log('\\n📋 RESULTS:');
  if (dbTest) {
    console.log('✅ Database: Payment insertion works without amount column');
    console.log('✅ Vercel: Should work for live payments now');
    console.log('🎉 PAYMENT VERIFICATION SHOULD BE FIXED!');
  } else {
    console.log('❌ Database: Still having issues');
    console.log('⚠️  May need to wait for Vercel deployment to propagate');
  }
  
  console.log('\\n🧪 Test your live site: https://earnify-gamma.vercel.app');
})();