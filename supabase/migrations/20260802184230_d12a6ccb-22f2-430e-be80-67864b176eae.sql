GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_units TO authenticated;
GRANT ALL ON public.course_units TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_unit_tasks TO authenticated;
GRANT ALL ON public.course_unit_tasks TO service_role;

DROP POLICY IF EXISTS "administradores gestionan unidades" ON public.course_units;
CREATE POLICY "administradores gestionan unidades"
ON public.course_units
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "administradores gestionan mapeo unidad-tarea" ON public.course_unit_tasks;
CREATE POLICY "administradores gestionan mapeo unidad-tarea"
ON public.course_unit_tasks
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));