-- Create an updatable view for users
DROP VIEW IF EXISTS public.users CASCADE;

-- Create a trigger function to handle updates to the view
CREATE OR REPLACE FUNCTION public.users_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    UPDATE auth.users
    SET 
      stripe_customer_id = NEW.stripe_customer_id,
      stripe_subscription_id = NEW.stripe_subscription_id,
      is_pro = NEW.is_pro
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    -- Handle insert if needed
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Handle delete if needed
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the view
CREATE VIEW public.users AS
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
  users.is_pro
FROM
  auth.users;

-- Create the trigger on the view
CREATE TRIGGER users_update_trigger
INSTEAD OF UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.users_update_trigger();

-- Create simplified functions that use the view instead of direct table access
CREATE OR REPLACE FUNCTION public.update_user_pro_status(user_id UUID, is_pro_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET is_pro = is_pro_status
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_user_stripe_info(
  user_id UUID, 
  stripe_customer_id_val TEXT DEFAULT NULL, 
  stripe_subscription_id_val TEXT DEFAULT NULL, 
  is_pro_val BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_record public.users%ROWTYPE;
BEGIN
  -- Get current values
  SELECT * INTO current_record FROM public.users WHERE id = user_id;
  
  -- Update with new values or keep current ones
  UPDATE public.users
  SET 
    stripe_customer_id = COALESCE(stripe_customer_id_val, current_record.stripe_customer_id),
    stripe_subscription_id = COALESCE(stripe_subscription_id_val, current_record.stripe_subscription_id),
    is_pro = COALESCE(is_pro_val, current_record.is_pro)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT SELECT ON public.users TO service_role, anon, authenticated;
GRANT UPDATE (stripe_customer_id, stripe_subscription_id, is_pro) ON public.users TO service_role;
GRANT EXECUTE ON FUNCTION public.update_user_pro_status TO service_role;
GRANT EXECUTE ON FUNCTION public.update_user_stripe_info TO service_role;
GRANT EXECUTE ON FUNCTION public.users_update_trigger TO service_role;


create view public.users as
select
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
  users.is_pro
from
  auth.users;