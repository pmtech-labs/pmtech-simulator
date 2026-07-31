CREATE TABLE public.training_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  training_interest text NOT NULL DEFAULT 'no_especificado',
  message text,
  source text NOT NULL DEFAULT 'landing',
  status text NOT NULL DEFAULT 'nuevo',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  source text NOT NULL DEFAULT 'landing',
  status text NOT NULL DEFAULT 'subscribed',
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.training_leads TO service_role;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.training_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_training_leads_created_at ON public.training_leads (created_at DESC);
CREATE INDEX idx_newsletter_subscribers_created_at ON public.newsletter_subscribers (created_at DESC);