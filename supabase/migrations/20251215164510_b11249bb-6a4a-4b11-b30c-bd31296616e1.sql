-- Create table for ad analytics
CREATE TABLE public.ad_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id TEXT NOT NULL,
  ad_variant TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'dismiss')),
  user_id UUID,
  session_id TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics (including anonymous users)
CREATE POLICY "Anyone can insert ad analytics"
ON public.ad_analytics
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view ad analytics"
ON public.ad_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_ad_analytics_created_at ON public.ad_analytics(created_at DESC);
CREATE INDEX idx_ad_analytics_ad_id ON public.ad_analytics(ad_id);
CREATE INDEX idx_ad_analytics_event_type ON public.ad_analytics(event_type);