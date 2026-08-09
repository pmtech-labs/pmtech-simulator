import { supabase } from "@/integrations/supabase/client";
import { patchConnectorFn, setDefaultConnectorFn } from "@/lib/adminConnectors.functions";
import { setQuestionsStatusFn } from "@/lib/adminQuestions.functions";
import { getAdminStatsFn } from "@/lib/adminStats.functions";
import { patchAdminUserFn } from "@/lib/adminUsers.functions";



/**
 * Capa de servicios exclusiva del panel de administración.
 * Aísla las llamadas a las Edge Functions `admin_*` del resto de la app pública
 * (`examService.ts`). El JWT del usuario admin lo adjunta automáticamente el
 * cliente de Supabase ya configurado.
 */

export type ConnectorProvider = "anthropic" | "openai" | "openai_compatible" | "google";

export interface LlmConnector {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_base_url: string | null;
  is_active: boolean;
  is_default?: boolean;
  created_at: string;
}

export interface GenerationJob {
  id: string;
  connector_id: string | null;
  connector_name?: string | null;
  task_ids: string[];
  task_titles?: string[] | null;
  approach: string | null;
  format: string;
  count_requested: number;
  count_generated: number | null;
  count_failed: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface AdminQuestion {
  id: string;
  /** Número fijo de la pregunta en el banco (no depende del filtro ni la página). */
  question_number: number;
  /** Motivo de rechazo más reciente, si la pregunta está retirada. */
  latest_rejection_reason?: string | null;
  stem: string;
  options: unknown;
  correct_answer: unknown;
  practicum_payload?: unknown;
  explanation: string;
  status: string;
  item_type: string;
  format: string;
  approach: string;
  difficulty: number | null;
  task_id: string;
  task_title?: string | null;
  domain_code?: string | null;
  domain_name?: string | null;
  cluster_id?: string | null;
  cluster_scenario?: string | null;
  times_answered?: number | null;
  times_correct?: number | null;
  times_used_in_exams?: number | null;
  success_rate_pct?: number | null;
  created_at?: string;
  generation_provider?: string | null;
  generation_model_id?: string | null;
  generation_connector_name?: string | null;
  process_group?: string | null;
  performance_domain?: string | null;
  focus_tags?: string[] | null;
  /** Fuente de verdad: todos los códigos de etiqueta (DO/CI/AE/DD/FO/NT). */
  tag_codes?: string[] | null;
}


export interface TaskCoverageRow {
  domain_code: string;
  domain_name: string;
  domain_weight_pct: number;
  task_id: string;
  task_number: number;
  task_title: string;
  published_count: number;
  draft_count: number;
  in_review_count: number;
}

export interface QuestionStatRow {
  question_id: string;
  question_number?: number | null;
  latest_rejection_reason?: string | null;
  stem?: string | null;
  domain_name: string | null;
  task_title: string | null;
  status: string;
  success_rate_pct: number | null;
  times_answered: number | null;
  times_used_in_exams: number | null;
  process_group?: string | null;
  performance_domain?: string | null;
  focus_tags?: string[] | null;
  tag_codes?: string[] | null;
}

export interface ExamStatRow {
  mode: string;
  status: string;
  total_exams: number;
  avg_score_pct: number | null;
}

export interface Paged<T> {
  rows: T[];
  total: number;
}

class AdminApiError extends Error {}

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  });
  const s = search.toString();
  return s ? `?${s}` : "";
}

async function callFunction<T>(
  name: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(`${name}${qs(options.query ?? {})}`, {
    method: options.method ?? "GET",
    ...(options.body !== undefined ? { body: options.body as Record<string, unknown> } : {}),
  });

  if (error) {
    let detail = error.message;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.text === "function") {
      try {
        const text = await ctx.text();
        if (text) detail = text;
      } catch {
        /* ignora: nos quedamos con el mensaje original */
      }
    }
    throw new AdminApiError(detail || "Error al llamar a la función de administración");
  }
  return data as T;
}

/** Normaliza respuestas que pueden venir como array o como { data: [...] , total } */
function toPaged<T>(payload: unknown, fallbackLimit: number): Paged<T> {
  if (Array.isArray(payload)) return { rows: payload as T[], total: payload.length };
  const obj = (payload ?? {}) as Record<string, unknown>;
  const rows = (obj.data ?? obj.rows ?? obj.items ?? []) as T[];
  const total = typeof obj.total === "number" ? obj.total : rows.length;
  return { rows: rows ?? [], total: total || (rows?.length ?? 0) || fallbackLimit };
}

/* ---------------------------------- Acceso --------------------------------- */

export async function checkIsAdmin(): Promise<{ authenticated: boolean; isAdmin: boolean }> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { authenticated: false, isAdmin: false };
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin", {
    p_user_id: data.user.id,
  });
  if (rpcError) return { authenticated: true, isAdmin: false };
  return { authenticated: true, isAdmin: Boolean(isAdmin) };
}

/* --------------------------------- Conectores ------------------------------ */

export async function listConnectors(page = 1, pageSize = 20): Promise<Paged<LlmConnector>> {
  const payload = await callFunction<unknown>("admin_connectors", {
    method: "GET",
    query: { page, page_size: pageSize, limit: pageSize, offset: (page - 1) * pageSize },
  });
  return toPaged<LlmConnector>(payload, pageSize);
}

export interface CreateConnectorInput {
  name: string;
  provider: ConnectorProvider;
  model_id: string;
  api_base_url?: string;
  /** Se envía una sola vez y nunca se vuelve a leer desde el frontend. */
  api_key: string;
}

export async function createConnector(input: CreateConnectorInput) {
  return callFunction<{ id?: string }>("admin_connectors", { method: "POST", body: input });
}

/**
 * Marca un conector como predeterminado. El trigger de BD desmarca el anterior.
 * Va por un server function porque la Edge Function no permite PATCH desde el navegador.
 */
export async function setDefaultConnector(id: string) {
  return setDefaultConnectorFn({ data: { id } });
}

export interface UpdateConnectorInput {
  id: string;
  name?: string;
  model_id?: string;
  api_base_url?: string;
  /** Solo si el admin quiere rotar la clave. Se omite para mantener la actual. */
  api_key?: string;
}

/** Actualiza un conector existente (mismo proxy servidor que el predeterminado). */
export async function updateConnector(input: UpdateConnectorInput) {
  return patchConnectorFn({ data: input });
}

export interface ProviderModel {
  id: string;
  label?: string;
}

/**
 * Consulta en vivo los modelos disponibles del proveedor.
 * Modo A: { provider, api_key } — con la clave recién tecleada (no se persiste).
 * Modo B: { connector_id } — usa la clave ya guardada en Vault, sin exponerla.
 */
export async function listProviderModels(
  input:
    | { provider: ConnectorProvider; api_key: string; api_base_url?: string }
    | { connector_id: string },
): Promise<ProviderModel[]> {
  const payload = await callFunction<{ models?: ProviderModel[] }>("admin_list_models", {
    method: "POST",
    body: input,
  });
  const models = (payload as { models?: ProviderModel[] })?.models ?? [];
  return models;
}

export async function deactivateConnector(id: string) {
  return callFunction<{ ok?: boolean }>("admin_connectors", {
    method: "DELETE",
    query: { id },
    body: { id },
  });
}


/* ----------------------------- Jobs de generación -------------------------- */

export async function listGenerationJobs(page = 1, pageSize = 10): Promise<Paged<GenerationJob>> {
  const payload = await callFunction<unknown>("admin_generation_jobs", {
    method: "GET",
    query: { page, page_size: pageSize, limit: pageSize, offset: (page - 1) * pageSize },
  });
  return toPaged<GenerationJob>(payload, pageSize);
}

export interface CreateJobInput {
  connector_id: string;
  task_ids: string[];
  approach: "mixed" | "predictive" | "agile" | "hybrid";
  format: string;
  count_requested: number;
  difficulty_min: number;
  difficulty_max: number;
  focus_tags: string[];
}

export interface JobResult {
  id?: string;
  status?: string;
  count_generated?: number;
  count_failed?: number;
  error_message?: string | null;
  question_ids?: string[];
}

export async function createGenerationJob(input: CreateJobInput) {
  return callFunction<JobResult>("admin_generation_jobs", { method: "POST", body: input });
}

/* --------------------------------- Preguntas ------------------------------- */

export interface QuestionFilters {
  status?: string[];
  domain_code?: string;
  task_id?: string;
  approach?: string;
  job_id?: string;
  process_group?: string;
  performance_domain?: string;
  /** Código(s) de etiqueta; varios separados por coma = Y lógico. */
  tag_code?: string;
  min_times_used?: number;

  max_success_rate?: number;
}

export async function listQuestions(
  filters: QuestionFilters,
  page = 1,
  pageSize = 20,
): Promise<Paged<AdminQuestion>> {
  const payload = await callFunction<unknown>("admin_questions", {
    method: "GET",
    query: {
      status: filters.status?.join(","),
      domain_code: filters.domain_code,
      task_id: filters.task_id,
      approach: filters.approach,
      job_id: filters.job_id,
      process_group: filters.process_group,
      performance_domain: filters.performance_domain,
      tag_code: filters.tag_code,

      min_times_used: filters.min_times_used,
      max_success_rate: filters.max_success_rate,
      page,
      page_size: pageSize,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    },
  });
  return toPaged<AdminQuestion>(payload, pageSize);
}

export async function updateQuestionsStatus(ids: string[], status: string, reason?: string) {
  return setQuestionsStatusFn({
    data: { ids, status, ...(reason?.trim() ? { reason: reason.trim() } : {}) },
  });
}

export interface DeleteQuestionResult {
  deleted?: boolean;
  retired?: boolean;
  reason?: string;
  message?: string;
}

export async function deleteQuestion(id: string) {
  return callFunction<DeleteQuestionResult>("admin_questions", {
    method: "DELETE",
    query: { id },
    body: { id },
  });
}

/* -------------------------------- Estadísticas ----------------------------- */

export type StatsView =
  | "coverage"
  | "hardest_questions"
  | "most_used_questions"
  | "exams"
  | "tags";

export interface QuestionTagRow {
  status: string;
  tag_codes: string[] | null;
}

export async function getStats<T>(view: StatsView, limit?: number): Promise<T[]> {
  const rows = await getAdminStatsFn({
    data: { view, ...(limit !== undefined ? { limit } : {}) },
  });
  return (rows ?? []) as T[];
}


/* ------------------------------- Catálogo ECO ------------------------------ */

export interface EcoDomain {
  id: string;
  code: string;
  name: string;
  weight_pct: number;
  sort_order: number;
}

export interface EcoTask {
  id: string;
  domain_id: string;
  task_number: number;
  title: string;
}

export async function listEcoDomains(): Promise<EcoDomain[]> {
  const { data, error } = await supabase
    .from("eco_domains")
    .select("id, code, name, weight_pct, sort_order")
    .order("sort_order");
  if (error) throw new AdminApiError(error.message);
  return (data ?? []) as EcoDomain[];
}

export async function listEcoTasks(): Promise<EcoTask[]> {
  const { data, error } = await supabase
    .from("eco_tasks")
    .select("id, domain_id, task_number, title")
    .order("sort_order");
  if (error) throw new AdminApiError(error.message);
  return (data ?? []) as EcoTask[];
}
