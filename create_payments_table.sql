-- Create payments table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL,
    payment_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_resource_id ON payments(resource_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Create policy to allow inserting payments (for the service role)
CREATE POLICY "Allow payment insertion" ON payments
    FOR INSERT WITH CHECK (true);