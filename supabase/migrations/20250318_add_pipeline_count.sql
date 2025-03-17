-- Migration to add pipeline_count column and trigger for automatic updates

-- Add pipeline_count to auth.users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'auth'
        AND table_name = 'users'
        AND column_name = 'pipeline_count'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN pipeline_count integer DEFAULT 0;
    END IF;
END $$;

-- Create or replace function to update pipeline_count
CREATE OR REPLACE FUNCTION public.update_pipeline_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the pipeline_count for the user
    UPDATE auth.users
    SET pipeline_count = (
        SELECT COUNT(*)
        FROM public.pipeline_configs
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    )
    WHERE id::text = COALESCE(NEW.user_id, OLD.user_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_pipeline_count_trigger ON public.pipeline_configs;

-- Create trigger to maintain pipeline_count
CREATE TRIGGER update_pipeline_count_trigger
AFTER INSERT OR DELETE OR UPDATE OF user_id ON public.pipeline_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_pipeline_count();

-- Initialize pipeline_count for all users
UPDATE auth.users
SET pipeline_count = (
    SELECT COUNT(*)
    FROM public.pipeline_configs
    WHERE user_id = auth.users.id::text
);

-- Recreate the public.users view to include pipeline_count
CREATE OR REPLACE VIEW public.users AS
SELECT
  users.instance_id,
  users.id,
  users.aud,
  users.role,
  users.email,
  users.encrypted_password,
  users.email_confirmed_at,
  users.invited_at,
  users.confirmation_token,
  users.confirmation_sent_at,
  users.recovery_token,
  users.recovery_sent_at,
  users.email_change_token_new,
  users.email_change,
  users.email_change_sent_at,
  users.last_sign_in_at,
  users.raw_app_meta_data,
  users.raw_user_meta_data,
  users.is_super_admin,
  users.created_at,
  users.updated_at,
  users.phone,
  users.phone_confirmed_at,
  users.phone_change,
  users.phone_change_token,
  users.phone_change_sent_at,
  users.confirmed_at,
  users.email_change_token_current,
  users.email_change_confirm_status,
  users.banned_until,
  users.reauthentication_token,
  users.reauthentication_sent_at,
  users.is_sso_user,
  users.deleted_at,
  users.is_anonymous,
  users.stripe_customer_id,
  users.stripe_subscription_id,
  users.is_pro,
  users.pipeline_count
FROM
  auth.users;

-- Create or update policy for free tier pipeline limit
DROP POLICY IF EXISTS "Enforce free tier pipeline limit" ON public.pipeline_configs;

CREATE POLICY "Enforce free tier pipeline limit"
ON public.pipeline_configs
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT is_pro FROM auth.users WHERE id = auth.uid())
  OR
  (SELECT pipeline_count FROM auth.users WHERE id = auth.uid()) < 1
);

-- Create or update policy for free tier source limit
DROP POLICY IF EXISTS "Enforce free tier source limit" ON public.pipeline_configs;

CREATE POLICY "Enforce free tier source limit"
ON public.pipeline_configs
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT is_pro FROM auth.users WHERE id = auth.uid())
  OR
  (
    (array_length(subreddits, 1) IS NULL OR array_length(subreddits, 1) <= 10) 
    AND 
    (array_length(source, 1) IS NULL OR array_length(source, 1) <= 10)
  )
);
