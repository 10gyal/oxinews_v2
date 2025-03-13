-- Create user_metadata table for storing user preferences and onboarding status
CREATE TABLE IF NOT EXISTS user_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own metadata
CREATE POLICY "Users can read their own metadata"
  ON user_metadata
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own metadata
CREATE POLICY "Users can insert their own metadata"
  ON user_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own metadata
CREATE POLICY "Users can update their own metadata"
  ON user_metadata
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_metadata_updated_at
BEFORE UPDATE ON user_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
