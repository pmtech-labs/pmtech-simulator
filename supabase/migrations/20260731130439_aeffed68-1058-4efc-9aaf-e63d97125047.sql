create or replace function public.upsert_task_mastery(p_user_id uuid, p_task_id uuid, p_is_correct boolean)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  -- La función solo es ejecutable por service_role (el motor de examen en el
  -- servidor), donde auth.uid() es null. Si hubiera un contexto de usuario,
  -- debe coincidir con el propietario del progreso.
  if auth.uid() is not null and auth.uid() <> p_user_id then
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

revoke all on function public.upsert_task_mastery(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.upsert_task_mastery(uuid, uuid, boolean) to service_role;