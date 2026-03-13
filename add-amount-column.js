const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAmountColumn() {
  console.log('🔧 Adding amount column to payments table...');
  
  try {
    // Try to add the amount column
    const addColumnSQL = `
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
      UPDATE payments SET amount = 0 WHERE amount IS NULL;
    `;
    
    console.log('SQL to execute:', addColumnSQL);
    
    // Try using RPC if available
    const { error } = await supabase.rpc('exec_sql', {
      sql: addColumnSQL
    }).catch(() => ({ error: 'RPC not available' }));
    
    if (error) {
      console.log('⚠️  Cannot execute SQL automatically.');
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log(addColumnSQL);
      console.log('🔗 Go to: https://supabase.com/dashboard/project/emnrgsgerfjvndexomro/sql');
    } else {
      console.log('✅ Amount column added successfully!');
    }
    
    // Test the column exists now
    console.log('🧪 Testing payment insertion with amount...');
    
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const { data: resources } = await supabase.from('resources').select('id').limit(1);
    
    if (users && users.length > 0 && resources && resources.length > 0) {
      const testData = {
        user_id: users[0].id,
        resource_id: resources[0].id,
        payment_id: 'test_amount_' + Date.now(),
        order_id: 'order_amount_' + Date.now(),
        status: 'completed',
        amount: 155.00
      };
      
      const { data: testPayment, error: testError } = await supabase
        .from('payments')
        .insert([testData])
        .select()
        .single();
      
      if (testError) {
        console.log('❌ Test failed:', testError);
      } else {
        console.log('✅ Test payment with amount successful:', testPayment.id);
        
        // Clean up
        await supabase.from('payments').delete().eq('id', testPayment.id);
        console.log('🧹 Test payment cleaned up');
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error);
  }
}

addAmountColumn();