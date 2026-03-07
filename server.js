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

// User Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password }])
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, user: data[0] });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Users from Supabase
app.get("/api/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json(data || []);
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
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
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
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching resources:', err.message || err);
    res.json([]);
  }
});

// Upload File and Add Resource
app.post("/api/resources", upload.single('file'), async (req, res) => {
  try {
    const { type, title, description, price } = req.body;
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
      .insert([{ type, title, description, price, fileurl: publicUrl }])
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

// Verify Payment
app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment parameters" });
    }
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
    
    if (razorpay_signature === expectedSign) {
      console.log('Payment verified successfully:', razorpay_payment_id);
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get User Payments - Disabled (payments table not configured)
app.get("/api/payments/:userId", async (req, res) => {
  res.json([]);
});

// Serve public files
app.use(express.static('public'));

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

app.get("/admin/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "settings.html"));
});

// User routes
app.get("/payment.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/test-payment.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test-payment.html"));
});

// Block direct access to public folder (after admin routes)
app.use('/public', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

app.listen(process.env.PORT, () =>
  console.log("Server running on port 5000")
);