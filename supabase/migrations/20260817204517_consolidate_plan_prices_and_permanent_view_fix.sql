-- Migración consolidada (agosto 2026) -- resuelve dos problemas de historial
-- de migraciones desincronizado del estado real de la base de datos viva:
--
-- 1) Los precios/límites de simulacros de planes de pago se corrigieron
--    aplicando SQL directamente contra el proyecto de Supabase en producción
--    (sesión de estrategia de pricing con el usuario), pero nunca se dejó un
--    fichero de migración correspondiente en el repo -- la migración
--    20260817084247_...sql seguía con los valores viejos (2990/5, 3990/15,
--    5990/null). Si la base de datos se reconstruyera alguna vez desde el
--    historial de migraciones, revertiría silenciosamente a esos valores
--    antiguos, reintroduciendo el mismo desajuste que detectó esta revisión
--    de código entre precios/límites mostrados en precios/checkout (correctos,
--    leídos de checkoutService.ts) y los realmente aplicados por el backend
--    (leídos en su momento de la BD desincronizada).
--
-- 2) v_question_stats se cambió a security_invoker=true dos veces por
--    intentos externos (Lovable) de resolver el aviso "Security Definer
--    View" del linter de seguridad -- ambas veces rompió el panel de admin
--    real, porque los admins son simplemente usuarios `authenticated` en
--    Postgres (sin sub-rol "admin" a nivel de GRANT) y la tabla `questions`
--    tiene columnas sensibles (correct_answer, explanation, stem, options)
--    restringidas a nivel de columna para ese rol (hallazgo de seguridad
--    "Exam answer key readable by anyone", corregido en una migración
--    anterior). Solución PERMANENTE: la lógica sensible vive ahora en la
--    función get_question_stats() (SECURITY DEFINER, con is_admin() como
--    única puerta), y v_question_stats es solo un envoltorio fino
--    (security_invoker=true) que la llama -- el linter de Supabase (regla
--    0010) solo analiza vistas, nunca funciones, así que este aviso no
--    debería volver a aparecer, y aunque alguien vuelva a tocar
--    security_invoker de la vista, ya no hay ninguna referencia directa a
--    `questions` en ella que dependa de los privilegios de columna del
--    rol `authenticated`.

-- --- Parte 1: precios y límites de simulacros reales ---
update plans set price_cents = 2990, full_sim_limit = 2 where code = 'premium_1m';
update plans set price_cents = 5990, full_sim_limit = 4 where code = 'basica_3m';
update plans set price_cents = 8990, full_sim_limit = null where code = 'premium_6m';
update plans set full_sim_limit = 0 where code = 'free';

-- --- Parte 2: v_question_stats vía función SECURITY DEFINER ---
create or replace function get_question_stats()
returns table (
  question_id uuid,
  question_number integer,
  stem text,
  options jsonb,
  correct_answer jsonb,
  explanation text,
  item_type text,
  format text,
  approach text,
  difficulty integer,
  status text,
  cluster_id uuid,
  cluster_scenario text,
  generation_job_id uuid,
  generation_connector_id uuid,
  generation_connector_name text,
  generation_provider text,
  generation_model_id text,
  task_id uuid,
  task_title text,
  domain_code text,
  domain_name text,
  times_answered integer,
  times_correct integer,
  success_rate_pct numeric,
  times_used_in_exams bigint,
  created_at timestamptz,
  open_reports_count bigint,
  process_group text,
  performance_domain text,
  focus_tags text[],
  tag_codes text[],
  latest_rejection_reason text
)
language sql
stable security definer
set search_path to 'public'
as $$
  select
    q.id as question_id,
    q.question_number,
    q.stem,
    q.options,
    q.correct_answer,
    q.explanation,
    q.item_type,
    q.format,
    q.approach,
    q.difficulty,
    q.status,
    q.cluster_id,
    cc.scenario_text as cluster_scenario,
    q.generation_job_id,
    lc.id as generation_connector_id,
    lc.name as generation_connector_name,
    lc.provider as generation_provider,
    lc.model_id as generation_model_id,
    q.task_id,
    t.title as task_title,
    d.code as domain_code,
    d.name as domain_name,
    q.times_answered,
    q.times_correct,
    case when q.times_answered = 0 then null::numeric
         else round((100.0 * q.times_correct::numeric) / q.times_answered::numeric, 2)
    end as success_rate_pct,
    (select count(*) from exam_items ei where ei.question_id = q.id) as times_used_in_exams,
    q.created_at,
    (select count(*) from question_reports qr where qr.question_id = q.id and qr.status = 'open') as open_reports_count,
    q.process_group,
    q.performance_domain,
    q.focus_tags,
    (select array_agg(qt.tag_code order by qt.tag_code) from question_tags qt where qt.question_id = q.id) as tag_codes,
    (select qr2.reason from question_rejections qr2 where qr2.question_id = q.id order by qr2.rejected_at desc limit 1) as latest_rejection_reason
  from questions q
    join eco_tasks t on t.id = q.task_id
    join eco_domains d on d.id = t.domain_id
    left join case_clusters cc on cc.id = q.cluster_id
    left join generation_jobs gj on gj.id = q.generation_job_id
    left join llm_connectors lc on lc.id = gj.connector_id
  where is_admin(auth.uid()) or auth.role() = 'service_role';
$$;

revoke all on function get_question_stats() from public, anon;
grant execute on function get_question_stats() to authenticated, service_role;

drop view if exists v_question_stats;
create view v_question_stats
with (security_invoker = true)
as select * from get_question_stats();

grant select on v_question_stats to authenticated, service_role;
