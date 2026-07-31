insert into public.licenses (user_id, plan_id, expires_at, status)
select '57b5983a-2263-4d1c-8b5b-b03ad78260aa'::uuid, p.id, now() + interval '6 months', 'active'
from public.plans p
where p.code = 'premium_6m'
  and not exists (
    select 1 from public.licenses l
    where l.user_id = '57b5983a-2263-4d1c-8b5b-b03ad78260aa'::uuid and l.status = 'active'
  );