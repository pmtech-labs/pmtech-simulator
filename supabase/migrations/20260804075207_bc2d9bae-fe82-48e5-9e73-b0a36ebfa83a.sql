GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;

DROP POLICY IF EXISTS "un admin puede ver la lista de admins" ON public.admin_users;
CREATE POLICY "admins pueden ver la lista de admins"
  ON public.admin_users FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));