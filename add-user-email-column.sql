-- Add user_email column to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resources_user_email ON resources(user_email);
