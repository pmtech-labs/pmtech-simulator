CREATE OR REPLACE FUNCTION public.admin_exam_stats()
RETURNS TABLE(mode text, status text, total_exams bigint, avg_score_pct numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT e.mode::text, e.status::text, count(*)::bigint, round(avg(e.score_pct), 1)
  FROM public.exams e
  GROUP BY 1, 2;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_exam_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_exam_stats() TO authenticated, service_role;