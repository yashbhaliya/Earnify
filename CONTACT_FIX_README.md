# Contact Page Fix

## Problem
The contact form was failing because the `contact_messages` table doesn't exist in your Supabase database.

## Solution

### Option 1: Run the Migration Script (Recommended)
```bash
node create-contact-table.js
```

### Option 2: Create Table Manually in Supabase
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run this SQL command:

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## What Was Fixed
1. Created `create-contact-table.js` script to add the missing database table
2. Improved error handling in the contact API endpoint
3. Added better error messages for users

## Testing
After creating the table:
1. Start your server: `node server.js`
2. Visit `http://localhost:5000/contact.html`
3. Fill out and submit the contact form
4. You should see a success message

## Verify Table Creation
Check in Supabase Dashboard → Table Editor → contact_messages table should appear
