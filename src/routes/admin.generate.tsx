import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Gauge,
  Info,
  Link2,
  Loader2,
  MousePointerClick,
  Network,
  Settings2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell, DataTable, Pager } from "@/components/admin/AdminShell";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import { supabase } from "@/integrations/supabase/client";
import {
  createGenerationJob,
  listConnectors,
  listEcoDomains,
  listEcoTasks,
  listGenerationJobs,
  type CreateJobInput,
  type EcoTask,
  type JobResult,
  type LlmConnector,
} from "@/services/adminService";
import { useTagDefs } from "@/hooks/useTagDefs";
import {
  approachWeightsFromTargets,
  describeApproachSplit,
  splitApproachCounts,
} from "@/lib/approachMix";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/generate")({
  component: GeneratePage,
});

// El generador genérico (admin_generation_jobs) SOLO produce contenido correcto para
// mc_single/mc_multi. Los formatos interactivos tienen su propia tarjeta más abajo.
const FORMATS = [
  { value: "mixed", label: "Mezcla automática", stable: true },
  { value: "mc_single", label: "Opción única (mc_single)", stable: true },
  { value: "mc_multi", label: "Opción múltiple (mc_multi)", stable: true },
];

const APPROACHES = [
  { value: "mixed", label: "Mezcla automática (según % objetivo)" },
  { value: "predictive", label: "Predictivo" },
  { value: "agile", label: "Ágil" },
  { value: "hybrid", label: "Híbrido" },
];

const FOCUS_TAGS = ["ia", "sostenibilidad", "entrega_valor"];
const FOCUS_TAG_UI_LABELS: Record<string, string> = {
  ia: "IA",
  sostenibilidad: "Sostenibilidad",
  entrega_valor: "Entrega de valor",
};
const PAGE_SIZE = 10;
const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

/** Filtros comunes a todos los motores de generación. */
interface SharedFilters {
  /** Conector predeterminado configurado en /admin/connectors. */
  connector: LlmConnector | null;
  taskIds: string[];
  count: number;
  difMin: number;
  difMax: number;
  focusTags: string[];
}

/**
 * Los task_number del ECO se numeran dentro de cada dominio, por lo que se repiten
 * entre dominios. Mostramos "dominio.tarea" (p. ej. 1.3) para que sean únicos.
 */
function taskCode(task: EcoTask, domainOrder: Map<string, number>) {
  const d = domainOrder.get(task.domain_id);
  return d ? `${d}.${task.task_number}` : `${task.task_number}`;
}

/** Ordena por número de dominio y, dentro de él, por número de tarea (1.1, 1.2, 2.1…). */
function sortTasks(list: EcoTask[], domainOrder: Map<string, number>) {
  return [...list].sort((a, b) => {
    const da = domainOrder.get(a.domain_id) ?? 99;
    const db = domainOrder.get(b.domain_id) ?? 99;
    if (da !== db) return da - db;
    return (a.task_number ?? 0) - (b.task_number ?? 0);
  });
}

/** Reparte `total` preguntas entre `keys` de la forma más equilibrada posible. */
function distributeCount<T>(keys: T[], total: number): { key: T; count: number }[] {
  if (keys.length === 0 || total <= 0) return [];
  const base = Math.floor(total / keys.length);
  let extra = total % keys.length;
  return keys
    .map((key) => {
      const count = base + (extra > 0 ? 1 : 0);
      if (extra > 0) extra -= 1;
      return { key, count };
    })
    .filter((k) => k.count > 0);
}

/** Validación compartida antes de lanzar cualquier motor. */
function validateShared(shared: SharedFilters, opts: { requiresLlm: boolean; max: number }) {
  if (opts.requiresLlm && !shared.connector) {
    toast.error("No hay conector LLM predeterminado activo. Configúralo en Conectores.");
    return false;
  }
  if (shared.taskIds.length === 0) {
    toast.error("Selecciona al menos una tarea ECO en los filtros comunes.");
    return false;
  }
  if (shared.difMin > shared.difMax) {
    toast.error("La dificultad mínima no puede superar a la máxima.");
    return false;
  }
  if (shared.count < 1 || shared.count > opts.max) {
    toast.error(`El número de preguntas debe estar entre 1 y ${opts.max}.`);
    return false;
  }
  return true;
}

function GeneratePage() {
  const email = useAdminEmail();
  const qc = useQueryClient();
  const { targets: tagTargets } = useTagDefs();

  const connectors = useQuery({
    queryKey: ["admin-connectors", 1],
    queryFn: () => listConnectors(1, 100),
  });
  const domains = useQuery({ queryKey: ["eco-domains"], queryFn: listEcoDomains });
  const tasks = useQuery({ queryKey: ["eco-tasks"], queryFn: listEcoTasks });

  // Filtros comunes
  const [domainId, setDomainId] = useState("");
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [difMin, setDifMin] = useState(3);
  const [difMax, setDifMax] = useState(5);
  const [focusTags, setFocusTags] = useState<string[]>([]);

  // Filtros propios del motor genérico
  const [approach, setApproach] = useState("mixed");
  const [format, setFormat] = useState("mixed");
  const [result, setResult] = useState<JobResult | null>(null);
  const [page, setPage] = useState(1);

  const domainOrder = useMemo(
    () => new Map((domains.data ?? []).map((d) => [d.id, d.sort_order])),
    [domains.data],
  );

  const activeConnectors = useMemo(
    () => (connectors.data?.rows ?? []).filter((c) => c.is_active),
    [connectors.data],
  );
  // El conector nunca se elige aquí: se toma el predeterminado de /admin/connectors.
  const defaultConnector = useMemo(
    () => activeConnectors.find((c) => c.is_default) ?? activeConnectors[0] ?? null,
    [activeConnectors],
  );

  const domainTasks = useMemo(
    () =>
      sortTasks(
        (tasks.data ?? []).filter((t) => !domainId || t.domain_id === domainId),
        domainOrder,
      ),
    [tasks.data, domainId, domainOrder],
  );

  const shared: SharedFilters = {
    connector: defaultConnector,
    taskIds,
    count,
    difMin,
    difMax,
    focusTags,
  };

  const jobs = useQuery({
    queryKey: ["admin-jobs", page],
    queryFn: () => listGenerationJobs(page, PAGE_SIZE),
  });

  // Reparto objetivo del enfoque leído de BD (CIPR / CIAH, con CIAH al 50/50).
  const approachWeights = useMemo(() => approachWeightsFromTargets(tagTargets), [tagTargets]);
  const mixedSplit = useMemo(
    () => (approach === "mixed" ? splitApproachCounts(count, approachWeights) : []),
    [approach, count, approachWeights],
  );

  const generate = useMutation({
    mutationFn: async (input: CreateJobInput) => {
      // En mezcla automática no delegamos en el azar del backend: lanzamos un lote
      // por enfoque con el número de preguntas que marcan los % objetivo.
      if (input.approach !== "mixed") return createGenerationJob(input);

      const split = splitApproachCounts(input.count_requested, approachWeights);
      if (split.length === 0) return createGenerationJob(input);

      const results: JobResult[] = [];
      for (const part of split) {
        results.push(
          await createGenerationJob({
            ...input,
            approach: part.approach,
            count_requested: part.count,
          }),
        );
      }
      const merged: JobResult = {
        ...(results[results.length - 1] ?? {}),
        count_generated: results.reduce((acc, r) => acc + (r.count_generated ?? 0), 0),
        count_failed: results.reduce((acc, r) => acc + (r.count_failed ?? 0), 0),
        status: results.every((r) => r.status === "completed" || !r.status) ? "completed" : "partial",
        error_message: results.map((r) => r.error_message).filter(Boolean).join(" · ") || null,
      };
      return merged;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(
        approach === "mixed" && mixedSplit.length > 0
          ? `Lotes completados (${describeApproachSplit(mixedSplit)})`
          : "Job completado",
      );
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateShared(shared, { requiresLlm: true, max: 200 })) return;
    setResult(null);
    generate.mutate({
      connector_id: defaultConnector!.id,
      task_ids: taskIds,
      approach: approach as "mixed",
      format,
      count_requested: count,
      difficulty_min: difMin,
      difficulty_max: difMax,
      focus_tags: focusTags,
    });
  }

  const jobRows = jobs.data?.rows ?? [];

  return (
    <AdminShell
      title="Generar preguntas"
      description="Ejecución síncrona: los lotes grandes pueden tardar varios minutos"
      email={email}
    >
      <div className="space-y-6">
        {/* ------------------------- Filtros comunes ------------------------- */}
        <section className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-4 w-4" /> Filtros comunes
            </h2>
            <p className="text-xs text-muted-foreground">
              Se aplican a todos los motores de generación de esta página. Cada tarjeta añade solo sus
              parámetros específicos.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Conector LLM</span>
              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
                <span>
                  {connectors.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : defaultConnector ? (
                    <>
                      {defaultConnector.name} · {defaultConnector.model_id}
                    </>
                  ) : (
                    <span className="text-destructive">Sin conector activo</span>
                  )}
                </span>
                <Link to="/admin/connectors" className="text-xs font-semibold text-primary underline">
                  Cambiar
                </Link>
              </div>
              <span className="block text-[11px] text-muted-foreground">
                Siempre se usa el conector predeterminado configurado en Conectores.
              </span>
            </div>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Dominio ECO</span>
              <select
                value={domainId}
                onChange={(e) => {
                  setDomainId(e.target.value);
                  setTaskIds([]);
                }}
                className={inputCls}
              >
                <option value="">Todos los dominios</option>
                {(domains.data ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1.5 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Tareas ECO objetivo ({taskIds.length} seleccionadas) — el conteo se reparte entre ellas
                </span>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTaskIds(domainTasks.map((t) => t.id))}
                    className="rounded border border-border px-2 py-0.5 font-medium hover:bg-secondary"
                  >
                    Seleccionar todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskIds([])}
                    className="rounded border border-border px-2 py-0.5 font-medium hover:bg-secondary"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {tasks.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  domainTasks.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-start gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={taskIds.includes(t.id)}
                        onChange={(e) =>
                          setTaskIds((prev) =>
                            e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id),
                          )
                        }
                      />
                      <span>
                        <span className="num text-muted-foreground">{taskCode(t, domainOrder)}</span>{" "}
                        {t.title}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Nº de preguntas (1–200)</span>
              <input
                type="number"
                min={1}
                max={200}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className={inputCls}
              />
              <span className="block text-[11px] text-muted-foreground">
                Los motores especializados admiten como máximo 50 por lote.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Dificultad mín. ({difMin})</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={difMin}
                  onChange={(e) => setDifMin(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Dificultad máx. ({difMax})</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={difMax}
                  onChange={(e) => setDifMax(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">
                Temas transversales (opcional)
              </span>
              <div className="flex flex-wrap gap-2">
                {FOCUS_TAGS.map((tag) => {
                  const on = focusTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() =>
                        setFocusTags((p) => (on ? p.filter((t) => t !== tag) : [...p, tag]))
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {FOCUS_TAG_UI_LABELS[tag] ?? tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------- Motor genérico -------------------------- */}
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" /> Opción única / múltiple (motor general)
            </h2>
            <p className="text-xs text-muted-foreground">
              Genera preguntas mc_single y mc_multi con los filtros comunes. Es el único motor con
              enfoque y formato configurables.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Enfoque</span>
              <select value={approach} onChange={(e) => setApproach(e.target.value)} className={inputCls}>
                {APPROACHES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              {approach === "mixed" && mixedSplit.length > 0 && (
                <span className="block text-[11px] text-muted-foreground">
                  Reparto según % objetivo en BD: {describeApproachSplit(mixedSplit)} (ágil e híbrido al
                  50/50 dentro del {approachWeights.agile + approachWeights.hybrid}%).
                </span>
              )}
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Formato</span>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputCls}>
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              {!FORMATS.find((f) => f.value === format)?.stable && (
                <span className="flex items-start gap-1.5 text-[11px] text-warning">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  El pipeline solo genera de forma fiable mc_single y mc_multi. Este formato se acepta,
                  pero requerirá revisión manual exhaustiva.
                </span>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={generate.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generando… no cierres esta pestaña
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generar
              </>
            )}
          </button>
        </form>

        <DeterministicGeneratorSection
          icon={<Network className="h-4 w-4" />}
          title="Diagramas de red (CPM/PDM)"
          description="Generación determinista por código, sin modelos de IA: topología, ruta crítica y distractores se calculan con aritmética exacta. La dificultad y el enfoque no aplican. Aparecerán como «Manual» en la cola de revisión."
          functionName="generate_network_diagram_question"
          buttonLabel="Generar preguntas de diagrama de red (CPM/PDM)"
          shared={shared}
        />

        <LlmGeneratorSection
          icon={<Link2 className="h-4 w-4" />}
          title="Emparejamiento"
          description="Genera preguntas de emparejamiento término-definición. La IA solo aporta el texto de los pares; el código construye el emparejamiento y baraja las opciones."
          functionName="admin_generate_matching_question"
          buttonLabel="Generar preguntas de emparejamiento"
          shared={shared}
          optional={{
            label: "Pares por pregunta",
            paramKey: "pairs_per_question",
            numeric: true,
            options: [
              { value: "", label: "Automático (4–6)" },
              { value: "4", label: "4 pares" },
              { value: "5", label: "5 pares" },
              { value: "6", label: "6 pares" },
            ],
          }}
        />

        <LlmGeneratorSection
          icon={<Network className="h-4 w-4" />}
          title="Emparejamiento con diagrama"
          description="Genera preguntas de emparejamiento con un pequeño diagrama junto a cada término (estructuras organizativas: funcional, matricial débil/equilibrada/fuerte, proyectizada, compuesta). El código elige qué estructuras entran y dibuja los diagramas; la IA solo escribe las definiciones distintivas."
          functionName="admin_generate_enhanced_matching_question"
          buttonLabel="Generar preguntas de emparejamiento con diagrama"
          shared={shared}
          optional={{
            label: "Pares por pregunta",
            paramKey: "pairs_per_question",
            numeric: true,
            options: [
              { value: "", label: "Automático (4–6)" },
              { value: "4", label: "4 pares" },
              { value: "5", label: "5 pares" },
              { value: "6", label: "6 pares (todas las estructuras)" },
            ],
          }}
        />

        <LlmGeneratorSection
          icon={<MousePointerClick className="h-4 w-4" />}
          title="Hotspot"
          description="Genera preguntas de tipo «señala y haz clic» sobre una plantilla de diagrama ya verificada. La IA solo aporta el escenario y las etiquetas de las zonas."
          functionName="admin_generate_hotspot_question"
          buttonLabel="Generar preguntas de hotspot"
          shared={shared}
          optional={{
            label: "Plantilla de diagrama",
            paramKey: "template",
            options: [
              { value: "", label: "Automático (alterna)" },
              { value: "grid_2x2", label: "Rejilla 2x2" },
              { value: "timeline_5", label: "Línea temporal (5 etapas)" },
            ],
          }}
        />

        <DeterministicGeneratorSection
          icon={<TrendingUp className="h-4 w-4" />}
          title="Valor ganado (EVM)"
          description="Generación determinista por código, sin modelos de IA: la serie PV/EV/AC y la clasificación del resultado se calculan con aritmética exacta. La dificultad y el enfoque no aplican. Aparecerán como «Manual» en la cola de revisión."
          functionName="generate_earned_value_question"
          buttonLabel="Generar preguntas de valor ganado"
          shared={shared}
        />

        <LlmGeneratorSection
          icon={<Gauge className="h-4 w-4" />}
          title="Dashboard con tensión"
          description="Genera preguntas tipo panel con dos métricas en tensión (una mejora, otra empeora). La IA aporta el escenario y los rangos numéricos; el código construye la serie real y dibuja el gráfico."
          functionName="generate_dashboard_tension_question"
          buttonLabel="Generar preguntas de dashboard con tensión"
          shared={shared}
        />

        {result && (
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-semibold">Resumen del job</p>
            <p className="mt-1 text-muted-foreground">
              Generadas: <span className="num font-semibold text-foreground">{result.count_generated ?? 0}</span> ·
              Fallidas en validación:{" "}
              <span className="num font-semibold text-foreground">{result.count_failed ?? 0}</span> · Estado:{" "}
              {result.status ?? "—"}
            </p>
            {result.error_message && <p className="mt-1 text-xs text-destructive">{result.error_message}</p>}
            <Link
              to="/admin/review"
              search={result.id ? { job: result.id } : undefined}
              className="mt-3 inline-block rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              Ir a la cola de revisión
            </Link>
          </div>
        )}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Jobs recientes</h2>
          {jobs.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <DataTable
                empty={jobRows.length === 0}
                head={
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Conector</th>
                    <th className="px-3 py-2">Tareas</th>
                    <th className="px-3 py-2">Sol./Gen./Fall.</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                }
              >
                {jobRows.map((j) => (
                  <JobRow key={j.id} job={j} />
                ))}
              </DataTable>
              <Pager page={page} pageSize={PAGE_SIZE} total={jobs.data?.total ?? jobRows.length} onPage={setPage} />
            </>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

/** Resumen textual de los filtros comunes que se van a aplicar. */
function SharedSummary({ shared, withDifficulty }: { shared: SharedFilters; withDifficulty: boolean }) {
  return (
    <p className="text-[11px] text-muted-foreground">
      Usará los filtros comunes: <span className="num">{shared.taskIds.length}</span> tarea(s) ·{" "}
      <span className="num">{shared.count}</span> pregunta(s)
      {withDifficulty ? (
        <>
          {" "}
          · dificultad <span className="num">{shared.difMin}</span>–
          <span className="num">{shared.difMax}</span>
        </>
      ) : null}
      {withDifficulty && shared.focusTags.length > 0
        ? ` · temas: ${shared.focusTags.map((t) => FOCUS_TAG_UI_LABELS[t] ?? t).join(", ")}`
        : ""}
    </p>
  );
}

/**
 * Generadores deterministas (sin IA). Aceptan una sola tarea por llamada, así que
 * iteramos por todas las tareas seleccionadas repartiendo el número de preguntas.
 */
function DeterministicGeneratorSection({
  icon,
  title,
  description,
  functionName,
  buttonLabel,
  shared,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  functionName: string;
  buttonLabel: string;
  shared: SharedFilters;
}) {
  const qc = useQueryClient();
  const [result, setResult] = useState<{ generated: number; requested: number } | null>(null);

  const run = useMutation({
    mutationFn: async () => {
      const parts = distributeCount(shared.taskIds, shared.count);
      let generated = 0;
      let requested = 0;
      for (const part of parts) {
        const { data, error } = await supabase.functions.invoke(functionName, {
          method: "POST",
          body: { task_id: part.key, count: part.count },
        });
        if (error) throw new Error("No hemos podido generar las preguntas. Inténtalo de nuevo.");
        const res = data as { generated?: number; requested?: number };
        generated += res?.generated ?? 0;
        requested += res?.requested ?? part.count;
      }
      return { generated, requested };
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(`${data.generated} de ${data.requested} generadas`);
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {icon} {title}
        </h2>
        <p className="text-xs text-muted-foreground">{description}</p>
        <SharedSummary shared={shared} withDifficulty={false} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={run.isPending}
          onClick={() => {
            if (!validateShared(shared, { requiresLlm: false, max: 50 })) return;
            setResult(null);
            run.mutate();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
        >
          {run.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generando…
            </>
          ) : (
            <>
              {icon} {buttonLabel}
            </>
          )}
        </button>
        {result && (
          <p className="text-sm">
            <span className="num font-semibold">
              {result.generated} de {result.requested}
            </span>{" "}
            generadas ·{" "}
            <Link to="/admin/review" className="underline">
              Ir a la cola de revisión
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

type OptionalField = {
  label: string;
  paramKey: string;
  numeric?: boolean;
  options: { value: string; label: string }[];
};

/**
 * Sección genérica para los generadores asistidos por IA que comparten contrato:
 * body { connector_id, task_ids, count_requested, difficulty_*, focus_tags, [param opcional] }
 * y respuesta { generated, failed, errors }.
 */
function LlmGeneratorSection({
  icon,
  title,
  description,
  functionName,
  buttonLabel,
  shared,
  optional,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  functionName: string;
  buttonLabel: string;
  shared: SharedFilters;
  optional?: OptionalField;
}) {
  const qc = useQueryClient();
  const [optValue, setOptValue] = useState("");
  const [result, setResult] = useState<{ generated: number; failed: number; errors?: string[] } | null>(null);

  const run = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        connector_id: shared.connector?.id,
        task_ids: shared.taskIds,
        count_requested: shared.count,
        difficulty_min: shared.difMin,
        difficulty_max: shared.difMax,
        focus_tags: shared.focusTags,
      };
      if (optional && optValue) {
        body[optional.paramKey] = optional.numeric ? Number(optValue) : optValue;
      }
      const { data, error } = await supabase.functions.invoke(functionName, { method: "POST", body });
      if (error) throw new Error("No hemos podido generar las preguntas. Inténtalo de nuevo.");
      return data as { generated: number; failed: number; errors?: string[] };
    },
    onSuccess: (data) => {
      setResult({ generated: data.generated ?? 0, failed: data.failed ?? 0, errors: data.errors });
      toast.success(`${data.generated ?? 0} generadas · ${data.failed ?? 0} fallidas`);
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {icon} {title}
        </h2>
        <p className="text-xs text-muted-foreground">{description}</p>
        <SharedSummary shared={shared} withDifficulty />
      </div>

      {optional && (
        <label className="block max-w-xs space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">{optional.label} (opcional)</span>
          <select value={optValue} onChange={(e) => setOptValue(e.target.value)} className={inputCls}>
            {optional.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={run.isPending}
          onClick={() => {
            if (!validateShared(shared, { requiresLlm: true, max: 50 })) return;
            setResult(null);
            run.mutate();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
        >
          {run.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generando…
            </>
          ) : (
            <>
              {icon} {buttonLabel}
            </>
          )}
        </button>
        {result && (
          <p className="text-sm">
            <span className="num font-semibold">{result.generated}</span> generadas ·{" "}
            <span className="num font-semibold">{result.failed}</span> fallidas ·{" "}
            <Link to="/admin/review" className="underline">
              Ir a la cola de revisión
            </Link>
          </p>
        )}
      </div>
      {result?.errors?.length ? (
        <ul className="list-disc space-y-0.5 pl-5 text-xs text-destructive">
          {result.errors.slice(0, 5).map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function JobRow({ job }: { job: import("@/services/adminService").GenerationJob }) {
  const [open, setOpen] = useState(false);
  const failed = job.status === "failed";
  return (
    <>
      <tr>
        <td className="num px-3 py-2 text-muted-foreground">
          {new Date(job.created_at).toLocaleString("es-ES")}
        </td>
        <td className="px-3 py-2">{job.connector_name ?? job.connector_id ?? "—"}</td>
        <td className="num px-3 py-2 text-muted-foreground">
          {job.task_titles?.join(", ") ?? `${job.task_ids?.length ?? 0} tarea(s)`}
        </td>
        <td className="num px-3 py-2">
          {job.count_requested} / {job.count_generated ?? 0} / {job.count_failed ?? 0}
        </td>
        <td className="px-3 py-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              failed
                ? "bg-destructive/10 text-destructive"
                : job.status === "completed"
                  ? "bg-success-soft text-success"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {job.status}
          </span>
          {failed && job.error_message && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground underline"
            >
              detalle <ChevronDown className={cn("h-3 w-3", open && "rotate-180")} />
            </button>
          )}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} className="bg-muted/40 px-3 py-2 text-xs text-destructive">
            {job.error_message}
          </td>
        </tr>
      )}
    </>
  );
}
