# 🔧 Quick Fix: Add user_email Column

## The Problem
The `resources` table is missing the `user_email` column.

## Solution (Choose ONE method)

### Method 1: Run SQL in Supabase Dashboard (FASTEST)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Paste this SQL:

```sql
ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_email TEXT;
CREATE INDEX IF NOT EXISTS idx_resources_user_email ON resources(user_email);
```

4. Click **Run**
5. Done! ✅

### Method 2: Run Node Script

```bash
node add-column.js
```

If it shows a message, follow the instructions to add manually.

---

## After Adding Column

Restart your server and test:

```bash
npm start
```

Then try adding a resource again. It should work! ✅
