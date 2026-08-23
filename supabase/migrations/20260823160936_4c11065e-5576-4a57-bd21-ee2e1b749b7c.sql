alter table public.question_tag_defs
  add column if not exists target_pct numeric;

update public.question_tag_defs set target_pct = v.pct
from (values
  ('DOPE', 33), ('DOPR', 41), ('DOEN', 26),
  ('CIPR', 40), ('CIAH', 60),
  ('AEIN', 10), ('AEPL', 30), ('AEEJ', 20), ('AEMC', 30), ('AECI', 10),
  ('DDGO', 15), ('DDAL', 14), ('DDCR', 14), ('DDFI', 14), ('DDRE', 14), ('DDRI', 14), ('DDIN', 15),
  ('FOTU', 60), ('FOTM', 10), ('FOCE', 20), ('FOIN', 10),
  ('NTEV', 50), ('NTSO', 10), ('NTIA', 10), ('NTRE', 30)
) as v(code, pct)
where question_tag_defs.code = v.code;