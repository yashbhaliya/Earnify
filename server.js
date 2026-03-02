const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
// Serve only admin static files
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'User-Agent': 'Earnify-Admin/1.0.0'
      }
    }
  }
);

// Test database connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('resources').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Database connection failed:', error.message);
    } else {
      console.log('Database connection successful');
    }
  } catch (err) {
    console.error('Connection test failed:', err.message);
  }
}

testConnection();

// Get All Users - Return empty array since table doesn't exist
app.get("/api/users", async (req, res) => {
  res.json([]);
});

// Update User Status - Disabled
app.put("/api/users/:id", async (req, res) => {
  res.status(404).json({ error: 'Users table not found' });
});

// Delete User - Disabled
app.delete("/api/users/:id", async (req, res) => {
  res.status(404).json({ error: 'Users table not found' });
});

// Get All Resources
app.get("/api/resources", async (req, res) => {
  try {
    const { data, error } = await supabase.from("resources").select("id, type, title, description, price");
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
    
    console.log('Upload request:', { type, title, description, price, hasFile: !!file });
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Upload file to Supabase storage
    const fileName = `${Date.now()}-${file.originalname}`;
    console.log('Attempting to upload file:', fileName, 'Type:', file.mimetype, 'Size:', file.size);
    
    let uploadData = null;
    let uploadError = null;
    
    try {
      const result = await supabase.storage
        .from('resources')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });
      
      uploadData = result.data;
      uploadError = result.error;

      if (uploadError) {
        console.error('File upload failed:', uploadError);
        console.error('Error code:', uploadError.statusCode);
        console.error('Error message:', uploadError.message);
        
        // Check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        console.log('Available buckets:', buckets);
        if (bucketError) console.error('Bucket list error:', bucketError);
      } else {
        console.log('File uploaded successfully:', uploadData);
        console.log('File path:', uploadData.path);
      }
    } catch (storageError) {
      console.error('Storage operation failed:', storageError);
      uploadError = storageError;
    }

    // Get public URL if upload succeeded
    let fileUrl = null;
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    }
    
    // Insert resource data without file columns
    const { data, error } = await supabase
      .from("resources")
      .insert([{ type, title, description, price }])
      .select("id, type, title, description, price");

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
    const { title, description, price } = req.body;
    const file = req.file;
    
    let updateData = { title, description, price };
    
    // If file is uploaded, handle file upload to storage
    if (file) {
      console.log('Updating resource with new file:', file.originalname);
      
      const fileName = `${Date.now()}-${file.originalname}`;
      let uploadData = null;
      let uploadError = null;
      
      try {
        const result = await supabase.storage
          .from('resources')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });
        
        uploadData = result.data;
        uploadError = result.error;

        if (uploadError) {
          console.error('File upload failed during update:', uploadError);
        } else {
          console.log('File uploaded successfully during update:', uploadData);
        }
      } catch (storageError) {
        console.error('Storage operation failed during update:', storageError);
      }
    }
    
    const { data, error } = await supabase
      .from("resources")
      .update(updateData)
      .eq("id", req.params.id)
      .select("id, type, title, description, price");
    
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

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "dashboard.html"));
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