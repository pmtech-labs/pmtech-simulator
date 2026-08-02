GRANT SELECT ON public.questions TO anon, authenticated;
GRANT SELECT ON public.case_clusters TO anon, authenticated;
GRANT SELECT ON public.eco_tasks TO anon, authenticated;
GRANT SELECT ON public.eco_domains TO anon, authenticated;
GRANT ALL ON public.questions TO service_role;
GRANT ALL ON public.case_clusters TO service_role;
GRANT ALL ON public.eco_tasks TO service_role;
GRANT ALL ON public.eco_domains TO service_role;