# Edge Functions snapshot (informativo, NO se despliega desde aquí)

Copia del código desplegado en Supabase (proyecto crggovgriqnlgyfxkigy) a fecha 2026-10-07.
Las funciones se despliegan directamente en Supabase, no desde este repo; cada una embebe su propia
copia de `_shared/` (p. ej. `terminologyDictionary.ts` difiere entre funciones). Está fuera de
`supabase/functions/` a propósito para que ningún despliegue automático la pise.

Incluye las 29 funciones desplegadas. `faq_chatbot`, `reclassify_question_tags` y `admin_backfill_tags`
se alinearon el 2026-10-07 con `thinkingConfig: { thinkingLevel: "low" }` (migración de Gemini).

| Función | Versión desplegada |
|---|---|
| admin_backfill_tags | v4 |
| admin_connectors | v12 |
| admin_generate_case_cluster | v36 |
| admin_generate_enhanced_matching_question | v1 |
| admin_generate_hotspot_question | v25 |
| admin_generate_matching_question | v26 |
| admin_generation_jobs | v76 |
| admin_list_models | v7 |
| admin_metrics | v5 |
| admin_questions | v19 |
| admin_stats | v6 |
| admin_users | v7 |
| exam_section_control | v3 |
| expire_licenses | v6 |
| export_newsletter_subscribers | v5 |
| faq_chatbot | v4 |
| finish_exam | v14 |
| generate_dashboard_tension_question | v10 |
| generate_earned_value_question | v9 |
| generate_network_diagram_question | v11 |
| partner_contact | v2 |
| provision_free_license | v7 |
| readiness_prediction | v3 |
| reclassify_question_tags | v13 |
| report_question_issue | v3 |
| start_exam | v45 |
| stripe_webhook | v8 |
| submit_answer | v12 |
| subscribe_newsletter | v5 |
