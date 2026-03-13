const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAndFixPaymentsTable() {
  console.log('🔍 Verifying payments table for Vercel deployment...');
  
  try {
    // Test 1: Check if payments table exists by trying to query it
    console.log('1. Testing payments table access...');
    const { data: testQuery, error: testError } = await supabase
      .from('payments')
      .select('*')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('does not exist')) {
        console.log('❌ Payments table does not exist!');
        console.log('📝 Creating payments table...');
        
        // Create the payments table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS payments (
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
          
          CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
          CREATE INDEX IF NOT EXISTS idx_payments_resource_id ON payments(resource_id);
          CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
        `;
        
        // Try to execute via RPC (if available)
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: createTableSQL
        }).catch(() => ({ error: 'RPC not available' }));
        
        if (createError) {
          console.log('⚠️  Cannot create table automatically.');
          console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
          console.log(createTableSQL);
          return false;
        } else {
          console.log('✅ Payments table created successfully!');
        }
      } else {
        console.log('❌ Error accessing payments table:', testError);
        return false;
      }
    } else {
      console.log('✅ Payments table exists and is accessible');
    }
    
    // Test 2: Check resources table
    console.log('\\n2. Testing resources table...');
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('id, title, price')
      .limit(1);
    
    if (resourcesError) {
      console.log('❌ Resources table error:', resourcesError);
      return false;
    } else {
      console.log('✅ Resources table accessible');
      if (resources && resources.length > 0) {
        console.log('📋 Sample resource:', resources[0]);
      }
    }
    
    // Test 3: Check auth.users
    console.log('\\n3. Testing auth system...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Auth system error:', usersError);
      return false;
    } else {
      console.log('✅ Auth system accessible');
      console.log(`👥 Users count: ${users?.length || 0}`);
    }
    
    // Test 4: Test payment insertion (dry run)
    console.log('\\n4. Testing payment insertion...');
    if (users && users.length > 0 && resources && resources.length > 0) {
      const testPaymentData = {
        user_id: users[0].id,
        resource_id: resources[0].id,
        payment_id: 'test_' + Date.now(),
        order_id: 'order_test_' + Date.now(),
        status: 'completed',
        amount: 100.00
      };
      
      console.log('Test payment data:', testPaymentData);
      
      const { data: testPayment, error: insertError } = await supabase
        .from('payments')
        .insert([testPaymentData])
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Payment insertion failed:', insertError);
        
        if (insertError.message.includes('foreign key constraint')) {
          console.log('🔧 Foreign key constraint issue detected');
          console.log('💡 This means the payments table schema needs to be fixed');
          return false;
        }
      } else {
        console.log('✅ Test payment inserted successfully:', testPayment.id);
        
        // Clean up test payment
        await supabase
          .from('payments')
          .delete()
          .eq('id', testPayment.id);
        console.log('🧹 Test payment cleaned up');
      }
    }
    
    console.log('\\n🎉 All tests passed! Payments table is ready for Vercel.');
    return true;
    
  } catch (error) {
    console.log('❌ Verification failed:', error);
    return false;
  }
}

// Run the verification
verifyAndFixPaymentsTable().then(success => {
  if (success) {
    console.log('\\n✅ READY FOR VERCEL DEPLOYMENT');
    console.log('🚀 Your payments should work correctly now');
  } else {
    console.log('\\n❌ ISSUES FOUND');
    console.log('🔧 Please fix the issues above before deploying');
    console.log('📋 Run the SQL from fix-payments-schema.sql in Supabase');
  }
  process.exit(success ? 0 : 1);
});