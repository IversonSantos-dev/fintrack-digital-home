-- Create subscriptions table to manage user plans
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users can insert own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to check subscription status and downgrade if expired
CREATE OR REPLACE FUNCTION public.check_and_update_subscription_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    status = 'expired',
    plan_type = 'free'
  WHERE 
    end_date < NOW() 
    AND status = 'active'
    AND plan_type != 'free';
END;
$$;

-- Function to get user's current active plan
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan TEXT;
BEGIN
  -- First check and update expired subscriptions
  PERFORM public.check_and_update_subscription_status();
  
  -- Get the user's current plan
  SELECT plan_type INTO _plan
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status = 'active';
  
  -- Return 'free' if no subscription found
  RETURN COALESCE(_plan, 'free');
END;
$$;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default free subscription for new users
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status, start_date, end_date)
  VALUES (
    NEW.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '100 years' -- Free plan never expires
  );
  RETURN NEW;
END;
$$;

-- Trigger to create default subscription when user signs up
CREATE TRIGGER on_auth_user_created_subscription
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_default_subscription();