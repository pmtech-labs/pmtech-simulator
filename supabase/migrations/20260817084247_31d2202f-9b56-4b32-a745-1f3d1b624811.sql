ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS full_sim_limit integer;

UPDATE public.plans
SET name = '1 mes',
    price_cents = 2990,
    includes_analytics = true,
    includes_practicum_full = true,
    includes_adaptive_engine = true,
    full_sim_limit = 5
WHERE code = 'premium_1m';

UPDATE public.plans
SET name = '3 meses',
    price_cents = 3990,
    includes_analytics = true,
    includes_practicum_full = true,
    includes_adaptive_engine = true,
    full_sim_limit = 15
WHERE code = 'basica_3m';

UPDATE public.plans
SET name = '6 meses',
    price_cents = 5990,
    includes_analytics = true,
    includes_practicum_full = true,
    includes_adaptive_engine = true,
    full_sim_limit = NULL
WHERE code = 'premium_6m';

UPDATE public.plans
SET full_sim_limit = 0
WHERE code = 'free';