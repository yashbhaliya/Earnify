const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Add fileUrl column to resources table
async function ensureFileUrlColumn() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE resources ADD COLUMN IF NOT EXISTS "fileUrl" TEXT;'
  }).catch(() => {
    console.log('Note: Add fileUrl column manually in Supabase if not exists');
  });
}

// Admin Signup
app.post("/api/admin/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          full_name: name || ''
        }
      }
    });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ token: data.session?.access_token, message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: 'Invalid email or password' });
    res.json({ token: data.session?.access_token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Signup with Supabase Auth
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) {
      return res.json({ success: false, message: error.message });
    }
    
    res.json({
      success: true,
      message: "Verification email sent. Please check your inbox."
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// User Login with Supabase Auth
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      return res.json({ success: false, message: error.message });
    }
    
    res.json({
      success: true,
      message: "Login successful"
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Users from Supabase Auth
app.get("/api/users", async (req, res) => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      status: user.email_confirmed_at ? 'Active' : 'Pending',
      created_at: user.created_at
    }));
    
    res.json(formattedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.json([]);
  }
});

// Update User Status - Disabled
app.put("/api/users/:id", async (req, res) => {
  res.status(404).json({ error: 'Users table not found' });
});

// Delete User
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) throw error;
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Resources
app.get("/api/resources", async (req, res) => {
  try {
    const { data, error } = await supabase.from("resources").select("*");
    if (error) {
      console.error('Supabase error fetching resources:', error);
      return res.status(200).json([]);
    }
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching resources:', err.message || err);
    console.error('Stack:', err.stack);
    res.status(200).json([]);
  }
});

// Upload File and Add Resource
app.post("/api/resources", upload.single('file'), async (req, res) => {
  try {
    const { type, title, description, price, user_email } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileName = `${Date.now()}-${file.originalname}`;
    
    // Upload to Supabase Storage with public access
    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'File upload failed: ' + uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from("resources")
      .insert([{ type, title, description, price, fileurl: publicUrl, user_email: user_email }])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database insert failed: ' + error.message });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Resource
app.put("/api/resources/:id", upload.single('file'), async (req, res) => {
  try {
    let { title, description, price } = req.body;
    const file = req.file;
    
    // Remove currency symbol from price
    price = String(price).replace(/[^0-9]/g, '');
    
    let updateData = { title, description, price };
    
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(fileName);
        updateData.fileurl = publicUrl;
      }
    }
    
    const { data, error } = await supabase
      .from("resources")
      .update(updateData)
      .eq("id", req.params.id)
      .select();
    
    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Update failed: ' + error.message });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Resource
app.delete("/api/resources/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("resources")
    .delete()
    .eq("id", req.params.id);
  if (error) return res.status(500).json(error);
  res.json({ message: "Resource deleted" });
});

// Get Razorpay Key
app.get("/api/payment/key", (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ error: "Razorpay key not configured" });
  }
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Razorpay Order
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay credentials not configured" });
    }
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    
    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order.id);
    
    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Verify Payment - Enhanced for Vercel
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
      status: "completed"
    };
    
    // Don't include amount column for now (will be added later)
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

// Get User Payments
app.get("/api/payments/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get payments - userId is now UUID from Supabase Auth
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId);
    
    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError);
      return res.json([]);
    }
    
    // Get resources separately
    const { data: resources, error: resourcesError } = await supabase
      .from("resources")
      .select("id, title, type, price, fileurl");
    
    if (resourcesError) {
      console.error('Resources fetch error:', resourcesError);
      return res.json(payments || []);
    }
    
    // Manually join data
    const paymentsWithResources = (payments || []).map(payment => {
      const resource = resources.find(r => r.id === payment.resource_id);
      return {
        ...payment,
        resources: resource || null
      };
    });
    
    res.json(paymentsWithResources);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.json([]);
  }
});

// Get Purchase Statistics - User Specific
app.get("/api/statistics/purchases/:userEmail", async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    console.log('Getting statistics for user:', userEmail);
    
    // Get all payments for resources owned by this user
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "completed");
    
    if (paymentsError) throw paymentsError;
    
    // Get all resources owned by this user
    const { data: userResources, error: resourcesError } = await supabase
      .from("resources")
      .select("id, title, price, user_email")
      .eq("user_email", userEmail);
    
    if (resourcesError) throw resourcesError;
    
    // Get all resources for reference
    const { data: allResources } = await supabase
      .from("resources")
      .select("id, title, price, user_email");
    
    // Get all users for reference
    const { data: { users } } = await supabase.auth.admin.listUsers();
    
    // Filter payments to only include purchases of this user's resources
    const userResourceIds = userResources.map(r => r.id);
    const relevantPayments = payments.filter(p => userResourceIds.includes(p.resource_id));
    
    console.log('User resources:', userResourceIds);
    console.log('Relevant payments:', relevantPayments.length);
    
    const userStats = {};
    
    relevantPayments.forEach(payment => {
      const resource = allResources?.find(r => r.id === payment.resource_id);
      const user = users?.find(u => u.id === payment.user_id);
      const buyerEmail = user?.email || 'Unknown';
      
      if (!userStats[buyerEmail]) {
        userStats[buyerEmail] = {
          email: buyerEmail,
          totalPurchases: 0,
          totalAmount: 0,
          resources: [],
          created_at: payment.created_at  // first purchase date
        };
      }
      
      userStats[buyerEmail].totalPurchases++;
      userStats[buyerEmail].totalAmount += parseFloat(resource?.price || 0);
      if (resource) {
        userStats[buyerEmail].resources.push(resource.title);
      }
      // keep the most recent created_at
      if (payment.created_at && (!userStats[buyerEmail].created_at || new Date(payment.created_at) > new Date(userStats[buyerEmail].created_at))) {
        userStats[buyerEmail].created_at = payment.created_at;
      }
    });
    
    // Platform fee rates by resource type
    const PLATFORM_FEES = { pdf: 0.05, excel: 0.04, exam: 0.05, service: 0.06 };

    const totalRevenue = relevantPayments.reduce((sum, p) => {
      const resource = allResources?.find(r => r.id === p.resource_id);
      const price = parseFloat(resource?.price || 0);
      const feeRate = PLATFORM_FEES[resource?.type?.toLowerCase()] || 0.05;
      return sum + price * (1 - feeRate);
    }, 0);

    const totalGross = relevantPayments.reduce((sum, p) => {
      const resource = allResources?.find(r => r.id === p.resource_id);
      return sum + parseFloat(resource?.price || 0);
    }, 0);

    const totalFees = totalGross - totalRevenue;
    
    res.json({
      totalPurchases: relevantPayments.length,
      totalRevenue: totalRevenue,
      totalGross: totalGross,
      totalFees: totalFees,
      totalCustomers: Object.keys(userStats).length,
      userStats: Object.values(userStats),
      userResourcesCount: userResources.length
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.json({ 
      totalPurchases: 0, 
      totalRevenue: 0, 
      totalCustomers: 0, 
      userStats: [],
      userResourcesCount: 0
    });
  }
});

// Test endpoint to add payment
app.post("/api/test-payment", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert([{
        user_id: 1,
        resource_id: 1,
        payment_id: 'test_payment_' + Date.now(),
        order_id: 'test_order_' + Date.now(),
        status: "completed"
      }])
      .select();
    
    if (error) {
      console.error('Test payment error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ success: true, payment: data[0] });
  } catch (error) {
    console.error('Test payment failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Withdrawals for a user
app.get("/api/withdrawals/:userEmail", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_email", req.params.userEmail)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
    res.json([]);
  }
});

// Submit Withdrawal Request
app.post("/api/withdrawals", async (req, res) => {
  try {
    const { user_email, amount, method, account, note } = req.body;
    if (!user_email || !amount) return res.status(400).json({ error: 'user_email and amount are required' });
    const { data, error } = await supabase
      .from("withdrawals")
      .insert([{ user_email, amount: parseFloat(amount), method, account, note, status: 'pending' }])
      .select()
      .single();
    if (error) {
      console.error('Withdrawal insert error:', error);
      if (error.message.includes('relation "withdrawals" does not exist')) {
        return res.status(500).json({ error: 'Withdrawals table not found. Please create it in Supabase.' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    console.error('Error saving withdrawal:', err);
    res.status(500).json({ error: err.message });
  }
});

// Contact Form Submission
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }
    
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, subject, message, created_at: new Date().toISOString() }])
      .select();
    
    if (error) {
      console.error('Contact message error:', error);
      if (error.message.includes('relation "contact_messages" does not exist')) {
        return res.status(500).json({ success: false, error: "Contact form is not configured. Please run: node create-contact-table.js" });
      }
      return res.status(500).json({ success: false, error: "Failed to send message. Please try again later." });
    }
    
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error('Contact submission failed:', error);
    res.status(500).json({ success: false, error: "Failed to send message. Please try again later." });
  }
});

// Default route - Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Admin routes
app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "dashboard.html"));
});

app.get("/admin/users", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "users.html"));
});

app.get("/admin/resources", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "resources.html"));
});

app.get("/admin/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "analytics.html"));
});

app.get("/admin/statistics", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "statistics.html"));
});

app.get("/admin/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "settings.html"));
});

// User routes
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/details.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "details.html"));
});

app.get("/payment.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment.html"));
});

// Serve public files
app.use(express.static('public'));

// Block direct access to public folder (after admin routes)
app.use('/public', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

app.listen(process.env.PORT, () => console.log("Server running on port 5000"));
