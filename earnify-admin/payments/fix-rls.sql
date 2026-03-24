-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/emnrgsgerfjvndexomro/editor

-- Step 1: Disable RLS completely so anon key can read/write
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify data exists
SELECT id, user_email, amount, status, created_at FROM withdrawals ORDER BY created_at DESC;
