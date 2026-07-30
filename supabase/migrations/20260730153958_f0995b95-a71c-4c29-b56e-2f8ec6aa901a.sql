-- 1. Security invoker view
ALTER VIEW public.v_task_coverage SET (security_invoker = on);

-- 2. search_path on functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.validate_bank_readiness() SET search_path = public;

-- 3. Harden security definer function + own-user check
CREATE OR REPLACE FUNCTION public.upsert_task_mastery(p_user_id uuid, p_task_id uuid, p_is_correct boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  insert into user_task_mastery (user_id, task_id, attempts, correct, last_attempt_at)
  values (p_user_id, p_task_id, 1, case when p_is_correct then 1 else 0 end, now())
  on conflict (user_id, task_id) do update
    set attempts = user_task_mastery.attempts + 1,
        correct = user_task_mastery.correct + case when p_is_correct then 1 else 0 end,
        last_attempt_at = now();
end;
$$;

REVOKE ALL ON FUNCTION public.upsert_task_mastery(uuid, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_task_mastery(uuid, uuid, boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_bank_readiness() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_bank_readiness() TO service_role;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 4. Explicit owner delete policy for exams
CREATE POLICY "usuarios borran sus examenes"
ON public.exams FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Hide stripe_price_id from anonymous visitors
REVOKE SELECT ON public.plans FROM anon;
GRANT SELECT (id, code, name, duration_months, price_cents, currency, includes_analytics, includes_practicum_full, includes_adaptive_engine) ON public.plans TO anon;