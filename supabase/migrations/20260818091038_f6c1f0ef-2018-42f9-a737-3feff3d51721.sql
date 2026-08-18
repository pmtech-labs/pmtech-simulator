CREATE TABLE public.newsletter_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('view','interaction','subscribe')),
  source text NOT NULL DEFAULT 'landing_boletin',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.newsletter_events TO service_role;

ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view newsletter events"
  ON public.newsletter_events FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_newsletter_events_created_at ON public.newsletter_events (created_at DESC);
CREATE INDEX idx_newsletter_events_type ON public.newsletter_events (event_type);