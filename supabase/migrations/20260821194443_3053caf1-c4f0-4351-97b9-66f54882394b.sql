-- 1. Answer key hardening: never expose correct_answer/explanation to clients
REVOKE SELECT (correct_answer, explanation) ON public.questions FROM anon;
REVOKE SELECT (correct_answer, explanation) ON public.questions FROM authenticated;
REVOKE INSERT, UPDATE ON public.questions FROM anon;

-- Public read policy limited to signed-in-safe usage; column grants already exclude answers
DROP POLICY IF EXISTS "lectura publica columnas seguras" ON public.questions;
CREATE POLICY "lectura publica columnas seguras"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (status = 'published'::item_status);

-- 2. Exams may only be created by the trusted server flow
REVOKE INSERT ON public.exams FROM anon;
REVOKE INSERT ON public.exams FROM authenticated;
DROP POLICY IF EXISTS "usuarios crean sus examenes via rpc" ON public.exams;
CREATE POLICY "solo service_role crea examenes"
ON public.exams
FOR INSERT
WITH CHECK (auth.role() = 'service_role');
