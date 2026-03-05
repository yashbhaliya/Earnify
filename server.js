const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
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

// Block direct access to public folder (after admin routes)
app.use('/public', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

app.listen(process.env.PORT, () =>
  console.log("Server running on port 5000")
);