ALTER VIEW public.v_question_stats SET (security_invoker = true);

CREATE POLICY "admins leen todos los items de examen"
ON public.exam_items FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "admins leen todos los reportes"
ON public.question_reports FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));