-- Fix payments table user_id column from INTEGER to UUID
-- Run this in Supabase SQL Editor

-- IMPORTANT: Run each step separately if you get errors

-- Step 1: Drop all constraints first
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey CASCADE;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_resource_id_fkey CASCADE;

-- Step 2: Drop the table
DROP TABLE payments CASCADE;

-- Step 3: Create new payments table with correct schema
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id INTEGER NOT NULL,
  payment_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add foreign key to auth.users
ALTER TABLE payments 
ADD CONSTRAINT payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Add foreign key to resources
ALTER TABLE payments 
ADD CONSTRAINT payments_resource_id_fkey 
FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

-- Step 6: Create indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_resource_id ON payments(resource_id);
