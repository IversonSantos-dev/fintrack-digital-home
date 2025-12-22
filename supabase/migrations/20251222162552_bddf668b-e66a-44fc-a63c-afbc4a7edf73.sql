-- Create ad_settings table
CREATE TABLE public.ad_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for ad display)
CREATE POLICY "Anyone can read ad settings"
ON public.ad_settings
FOR SELECT
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can insert ad settings"
ON public.ad_settings
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update ad settings"
ON public.ad_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete ad settings"
ON public.ad_settings
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.ad_settings (setting_key, setting_value) VALUES
  ('internal_ad_ratio', '{"value": 50}'::jsonb),
  ('adsense_enabled', '{"value": true}'::jsonb),
  ('adsense_slot_horizontal', '{"value": ""}'::jsonb),
  ('adsense_slot_sidebar', '{"value": ""}'::jsonb),
  ('popup_delay_seconds', '{"value": 30}'::jsonb),
  ('popup_enabled', '{"value": true}'::jsonb);

-- Trigger for updated_at
CREATE TRIGGER update_ad_settings_updated_at
BEFORE UPDATE ON public.ad_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();