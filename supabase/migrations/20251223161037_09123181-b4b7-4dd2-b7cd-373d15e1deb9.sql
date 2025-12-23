-- Create function to create default accounts for new users
CREATE OR REPLACE FUNCTION public.create_default_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create default accounts with zero balance
  INSERT INTO public.accounts (user_id, name, type, balance, color, icon, currency) VALUES
    (NEW.id, 'Carteira', 'cash', 0, '#10B981', 'wallet', 'BRL'),
    (NEW.id, 'Banco', 'bank', 0, '#3B82F6', 'landmark', 'BRL'),
    (NEW.id, 'Poupança', 'savings', 0, '#8B5CF6', 'piggy-bank', 'BRL');
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user profile is created
CREATE TRIGGER on_profile_created_create_accounts
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_accounts();