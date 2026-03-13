// Enhanced payment verification for Vercel deployment
// This replaces the existing payment verification endpoint

app.post("/api/payment/verify", async (req, res) => {
  try {
    console.log('=== PAYMENT VERIFICATION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Environment check:', {
      hasRazorpaySecret: !!process.env.RAZORPAY_KEY_SECRET,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, resourceId, userId } = req.body;
    
    // Validate required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log('❌ Missing payment parameters');
      return res.status(400).json({ 
        success: false, 
        error: "Missing payment parameters",
        received: { razorpay_order_id: !!razorpay_order_id, razorpay_payment_id: !!razorpay_payment_id, razorpay_signature: !!razorpay_signature }
      });
    }

    if (!resourceId || !userId) {
      console.log('❌ Missing resourceId or userId');
      return res.status(400).json({ 
        success: false, 
        error: "Missing resourceId or userId",
        received: { resourceId: !!resourceId, userId: !!userId }
      });
    }

    // Check environment variables
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.log('❌ Razorpay secret not configured');
      return res.status(500).json({ success: false, error: "Payment configuration error" });
    }

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
    
    console.log('Signature verification:', {
      received: razorpay_signature,
      expected: expectedSign,
      match: razorpay_signature === expectedSign
    });

    if (razorpay_signature !== expectedSign) {
      console.log('❌ Invalid payment signature');
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    console.log('✅ Payment signature verified');

    // Check Supabase connection
    if (!supabase) {
      console.log('❌ Supabase not initialized');
      return res.status(500).json({ success: false, error: "Database connection error" });
    }

    // Get resource details
    console.log('Fetching resource:', resourceId);
    const { data: resource, error: resourceError } = await supabase
      .from("resources")
      .select("id, price, title")
      .eq("id", parseInt(resourceId))
      .single();
    
    if (resourceError) {
      console.log('❌ Resource fetch error:', resourceError);
      return res.status(400).json({ 
        success: false, 
        error: 'Resource not found: ' + resourceError.message,
        details: resourceError
      });
    }

    if (!resource) {
      console.log('❌ Resource not found');
      return res.status(400).json({ success: false, error: 'Resource not found' });
    }

    console.log('✅ Resource found:', resource);

    // Check for existing payment
    console.log('Checking for existing payment:', razorpay_payment_id);
    const { data: existingPayment, error: existingError } = await supabase
      .from("payments")
      .select("id, status")
      .eq("payment_id", razorpay_payment_id)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('❌ Error checking existing payment:', existingError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error: ' + existingError.message,
        details: existingError
      });
    }

    if (existingPayment) {
      console.log('✅ Payment already exists:', existingPayment);
      return res.json({ 
        success: true, 
        message: "Payment already recorded", 
        payment: existingPayment 
      });
    }

    // Insert new payment record
    console.log('Inserting new payment record');
    const paymentData = {
      user_id: userId,
      resource_id: parseInt(resourceId),
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status: "completed",
      amount: parseFloat(resource.price)
    };

    console.log('Payment data to insert:', paymentData);

    const { data: newPayment, error: insertError } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Payment insert error:', insertError);
      
      // Check if it's a foreign key constraint error
      if (insertError.message.includes('foreign key constraint')) {
        return res.status(500).json({ 
          success: false, 
          error: 'Database constraint error. Please ensure the payments table is properly configured.',
          details: insertError.message,
          suggestion: 'Run the SQL from fix-payments-schema.sql in Supabase'
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save payment: ' + insertError.message,
        details: insertError
      });
    }

    console.log('✅ Payment saved successfully:', newPayment);
    console.log('=== PAYMENT VERIFICATION SUCCESS ===');

    return res.json({ 
      success: true, 
      message: "Payment verified and saved successfully", 
      payment: newPayment 
    });

  } catch (error) {
    console.log('❌ Payment verification error:', error);
    console.log('Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Payment verification failed: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});