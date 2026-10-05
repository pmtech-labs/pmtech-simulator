# Edge Functions snapshot (informativo, NO se despliega desde aquí)

Copia del código desplegado en Supabase (proyecto crggovgriqnlgyfxkigy) a fecha 2026-10-05.
Las funciones se despliegan directamente en Supabase, no desde este repo; cada una embebe su propia
copia de `_shared/` (p. ej. `terminologyDictionary.ts` difiere entre ambas). Está fuera de
`supabase/functions/` a propósito para que ningún despliegue automático la pise.
Funciones incluidas: admin_generation_jobs (v76), admin_generate_case_cluster (v36).
