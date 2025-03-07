-- Add Stripe-related fields to the auth.users table
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- Create an RLS policy to allow users to read their own subscription data
CREATE POLICY "Users can read their own subscription data"
ON auth.users
FOR SELECT
USING (auth.uid() = id);

-- Create an RLS policy to allow the service role to update subscription data
CREATE POLICY "Service role can update subscription data"
ON auth.users
FOR UPDATE
USING (auth.role() = 'service_role');
