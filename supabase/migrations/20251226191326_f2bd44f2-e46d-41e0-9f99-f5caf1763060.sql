-- Fix the create_default_accounts trigger to use allowed account types
CREATE OR REPLACE FUNCTION public.create_default_accounts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create default accounts with zero balance using valid types
  INSERT INTO public.accounts (user_id, name, type, balance, color, icon, currency) VALUES
    (NEW.id, 'Carteira', 'cash', 0, '#10B981', 'wallet', 'BRL'),
    (NEW.id, 'Conta Corrente', 'checking', 0, '#3B82F6', 'landmark', 'BRL'),
    (NEW.id, 'Poupança', 'savings', 0, '#8B5CF6', 'piggy-bank', 'BRL');
  
  RETURN NEW;
END;
$function$;