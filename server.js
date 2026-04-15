const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const allowedOrigins = new Set([
  'https://earnify-gamma.vercel.app'
]);

function isLocalDevOrigin(origin) {
  if (!origin) return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.has(origin) || isLocalDevOrigin(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
// admin pages (public/admin)
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'), { index: 'index.html' }));
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'file', 'logo1.jpeg'));
});

// earnify-admin pages — serve from public so Vercel function bundle always contains files
['Dashboard','statistic','payments','Blog'].forEach(folder => {
  const file = path.join(__dirname, 'public', 'earnify-admin', folder, 'index.html');
  app.get(`/earnify-admin/${folder}`,            (req, res) => res.sendFile(file));
  app.get(`/earnify-admin/${folder}/`,           (req, res) => res.sendFile(file));
  app.get(`/earnify-admin/${folder}/index.html`, (req, res) => res.sendFile(file));
});

// earnify-admin static assets (js, css, images)
app.use('/earnify-admin', express.static(path.join(__dirname, 'public', 'earnify-admin')));

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

// Debug endpoint - check what confirmation URL is generated
app.get("/api/auth/debug-link", async (req, res) => {
  try {
    const siteUrl = 'https://earnify-gamma.vercel.app';
    const email = req.query.email || 'test@test.com';
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: siteUrl + '/?verified=1' }
    });
    res.json({
      error: error?.message,
      action_link: data?.properties?.action_link,
      hashed_token: data?.properties?.hashed_token,
      redirect_to: data?.properties?.redirect_to,
      built_url: data?.properties?.hashed_token
        ? `${process.env.SUPABASE_URL}/auth/v1/verify?token=${data.properties.hashed_token}&type=signup&redirect_to=${encodeURIComponent(siteUrl + '/?verified=1')}`
        : null
    });
  } catch(e) { res.json({ error: e.message }); }
});

// User Signup with Supabase Auth + Custom Gmail Confirmation Email
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check Gmail env vars are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('GMAIL_USER or GMAIL_PASS not set in environment');
      return res.status(500).json({ success: false, message: 'Email service not configured on server' });
    }

    // 1. Create user in Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { name: name || email.split('@')[0] }
    });

    if (error) {
      // User might already exist
      if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('exists')) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    // 2. Generate confirmation link
    // Always use Vercel production URL - never localhost
    const siteUrl = 'https://earnify-gamma.vercel.app';
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: siteUrl + '/?verified=1' }
    });

    if (linkError) {
      console.error('generateLink error:', linkError.message);
      return res.status(500).json({ success: false, message: 'Failed to generate confirmation link: ' + linkError.message });
    }

    // ALWAYS replace redirect_to with correct Vercel URL
    // Supabase dashboard Site URL overrides redirectTo option, so we fix it manually
    let confirmUrl;
    const actionLink = linkData?.properties?.action_link;
    const hashedToken = linkData?.properties?.hashed_token;

    if (hashedToken) {
      // Build URL directly from token - most reliable approach
      confirmUrl = `${process.env.SUPABASE_URL}/auth/v1/verify?token=${hashedToken}&type=signup&redirect_to=${encodeURIComponent(siteUrl + '/?verified=1')}`;
    } else if (actionLink) {
      // Replace redirect_to in existing action_link
      const urlObj = new URL(actionLink);
      urlObj.searchParams.set('redirect_to', siteUrl + '/?verified=1');
      confirmUrl = urlObj.toString();
    } else {
      return res.status(500).json({ success: false, message: 'Confirmation token not generated' });
    }
    console.log('Confirmation URL:', confirmUrl);

    // 3. Send confirmation email via Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"Earnify" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Confirm your Earnify account',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
          <h2 style="color:#667eea;margin:0 0 8px;">💰 Welcome to Earnify!</h2>
          <p style="color:#475569;margin:0 0 24px;">Hi ${name || email.split('@')[0]}, please confirm your email to activate your account.</p>
          <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">✅ Confirm Email</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If you didn't create this account, ignore this email.</p>
        </div>`
    });

    console.log('Confirmation email sent to:', email);
    res.json({ success: true, message: 'Account created! Check your email to confirm.' });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: 'Signup failed: ' + err.message });
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

// Admin - Get ALL Withdrawals
app.get("/api/admin/withdrawals", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching all withdrawals:', err);
    res.json([]);
  }
});

// Admin - Dashboard Stats (single endpoint for all 4 cards)
app.get("/api/admin/dashboard-stats", async (req, res) => {
  try {
    const WITHDRAWAL_FEE_RATE = 0.05; // 5% platform fee on each withdrawal
    const FEE_RATES = { pdf: 0.05, excel: 0.04, exam: 0.05, service: 0.06 };

    const [paymentsResult, resourcesResult, withdrawalsResult] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("resources").select("id, title, type, price, user_email"),
      supabase.from("withdrawals").select("amount, status")
    ]);

    const payments    = paymentsResult.data    || [];
    const resources   = resourcesResult.data   || [];
    const withdrawals = withdrawalsResult.data  || [];

    // Get all users
    const { data: { users } } = await supabase.auth.admin.listUsers();

    // Enrich payments
    const enriched = payments.map(p => {
      const resource = resources.find(r => r.id === p.resource_id);
      const user     = (users || []).find(u => u.id === p.user_id);
      return {
        ...p,
        buyer_email:    user?.email    || p.user_id,
        resource_title: resource?.title || '—',
        resource_type:  resource?.type  || '—',
        resource_price: parseFloat(resource?.price || 0),
        seller_email:   resource?.user_email || '—',
        amount:         parseFloat(resource?.price || 0)
      };
    });

    const completed = enriched.filter(p => p.status === 'completed');

    // 1. Total Revenue = sum of all completed payment amounts (gross)
    const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);

    // All withdrawals (approved + completed + pending)
    const allWithdrawals = withdrawals.filter(w =>
      w.status === 'approved' || w.status === 'completed' || w.status === 'pending'
    );
    const approvedWithdrawals = withdrawals.filter(w =>
      w.status === 'approved' || w.status === 'completed'
    );

    // 3. Platform Fees = sum of (amount × 5%) for ALL withdrawals (approved + completed + pending)
    //    i.e. fee = withdrawal_amount - net_amount, where net = amount * (1 - 0.05)
    const totalFees = allWithdrawals.reduce((s, w) => {
      return s + parseFloat(w.amount || 0) * WITHDRAWAL_FEE_RATE;
    }, 0);

    // 2. Withdrawn Amount = sum of net amounts for approved/completed withdrawals
    //    net = withdrawal_amount * (1 - 0.05)
    const totalWithdrawn = approvedWithdrawals.reduce((s, w) => {
      return s + parseFloat(w.amount || 0) * (1 - WITHDRAWAL_FEE_RATE);
    }, 0);

    // 4. Pending Amount = net earnings from sales - total net withdrawn
    //    net earnings from sales = totalRevenue - sales-based fees
    const salesFees = completed.reduce((s, p) => {
      const rate = FEE_RATES[(p.resource_type || '').toLowerCase()] || 0.05;
      return s + p.amount * rate;
    }, 0);
    const netEarnings = totalRevenue - salesFees;
    const pendingAmount = Math.max(0, netEarnings - totalWithdrawn);

    const withdrawalCount = approvedWithdrawals.length;

    res.json({
      totalRevenue,
      totalWithdrawn,
      totalFees,
      pendingAmount,
      completedCount: completed.length,
      withdrawalCount,
      feePercent: (WITHDRAWAL_FEE_RATE * 100).toFixed(1),
      recentPurchases: enriched.slice(0, 20)
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.json({
      totalRevenue: 0, totalWithdrawn: 0, totalFees: 0, pendingAmount: 0,
      completedCount: 0, withdrawalCount: 0, feePercent: '5.0', recentPurchases: []
    });
  }
});

// Admin - Get ALL Purchase Records (all users)
app.get("/api/admin/purchases", async (req, res) => {
  try {
    // Fetch all completed payments
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (paymentsError) throw paymentsError;

    // Fetch all resources for joining
    const { data: resources } = await supabase
      .from("resources")
      .select("id, title, type, price, user_email");

    // Fetch all users for joining
    const { data: { users } } = await supabase.auth.admin.listUsers();

    const enriched = (payments || []).map(p => {
      const resource = (resources || []).find(r => r.id === p.resource_id);
      const user     = (users     || []).find(u => u.id === p.user_id);
      return {
        ...p,
        buyer_email:    user?.email || p.user_id,
        resource_title: resource?.title || '—',
        resource_type:  resource?.type  || '—',
        resource_price: resource?.price || 0,
        seller_email:   resource?.user_email || '—',
        amount:         resource?.price || 0
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching all purchases:', err);
    res.json([]);
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

    // Save to Supabase
    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert([{ name, email, subject, message, created_at: new Date().toISOString() }]);

    if (dbError) console.error('Contact DB error:', dbError.message);

    // Send email via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Earnify Contact" <${process.env.GMAIL_USER}>`,
      to: 'hardikkotadiya90@gmail.com',
      replyTo: email,
      subject: `[Earnify Contact] ${subject}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
          <h2 style="color:#667eea;margin:0 0 20px;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;font-weight:700;color:#475569;width:100px;">Name</td><td style="padding:10px 0;color:#1e293b;">${name}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700;color:#475569;">Email</td><td style="padding:10px 0;color:#1e293b;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:10px 0;font-weight:700;color:#475569;">Subject</td><td style="padding:10px 0;color:#1e293b;">${subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:white;border-radius:8px;border:1px solid #e2e8f0;">
            <p style="font-weight:700;color:#475569;margin:0 0 8px;">Message</p>
            <p style="color:#1e293b;line-height:1.6;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#94a3b8;">Sent from Earnify Contact Form</p>
        </div>`
    });

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

app.get("/admin/purchases", (req, res) => {
  res.sendFile(path.join(__dirname, "Earnify Admin", "Purchases", "index.html"));
});

app.get("/admin/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "settings.html"));
});

// Admin sub-page routes (capital folder names)
app.get("/admin/Resources", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Resources", "index.html"));
});
app.get("/admin/Resources/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Resources", "index.html"));
});

app.get("/admin/Statistics", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Statistics", "index.html"));
});
app.get("/admin/Statistics/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Statistics", "index.html"));
});

app.get("/admin/Profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Profile", "index.html"));
});
app.get("/admin/Profile/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Profile", "index.html"));
});

app.get("/admin/Withdrawal", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Withdrawal", "index.html"));
});
app.get("/admin/Withdrawal/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "Withdrawal", "index.html"));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
