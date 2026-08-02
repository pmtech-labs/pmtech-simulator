import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Info, Loader2, Network, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  type EcoTask,
  type JobResult,
} from "@/services/adminService";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/admin/generate")({
  component: GeneratePage,
});

const FORMATS = [
  { value: "mc_single", label: "Opción única (mc_single)", stable: true },
  { value: "mc_multi", label: "Opción múltiple (mc_multi)", stable: true },
  { value: "matching", label: "Emparejamiento (matching)", stable: false },
  { value: "enhanced_matching", label: "Emparejamiento avanzado", stable: false },
  { value: "graphic_based", label: "Basada en gráfico", stable: false },
  { value: "hotspot", label: "Hotspot", stable: false },
  { value: "pulldown", label: "Desplegables (pulldown)", stable: false },
];

const APPROACHES = [
  { value: "mixed", label: "Mezcla automática (predictive/agile/hybrid)" },
  { value: "predictive", label: "Predictivo" },
  { value: "agile", label: "Ágil" },
  { value: "hybrid", label: "Híbrido" },
];

const FOCUS_TAGS = ["ai", "sustainability", "value_delivery"];
const PAGE_SIZE = 10;
const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function GeneratePage() {
  const email = useAdminEmail();
  const qc = useQueryClient();

  const connectors = useQuery({ queryKey: ["admin-connectors", 1], queryFn: () => listConnectors(1, 100) });
  const domains = useQuery({ queryKey: ["eco-domains"], queryFn: listEcoDomains });
  const tasks = useQuery({ queryKey: ["eco-tasks"], queryFn: listEcoTasks });

  const [connectorId, setConnectorId] = useState("");
  const [domainId, setDomainId] = useState("");
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [approach, setApproach] = useState("mixed");
  const [format, setFormat] = useState("mc_single");
  const [difMin, setDifMin] = useState(2);
  const [difMax, setDifMax] = useState(4);
  const [count, setCount] = useState(10);
  const [tags, setTags] = useState<string[]>([]);
  const [result, setResult] = useState<JobResult | null>(null);
  const [page, setPage] = useState(1);

  const activeConnectors = (connectors.data?.rows ?? []).filter((c) => c.is_active);

  // Preselecciona el conector marcado como predeterminado al cargar la lista.
  useEffect(() => {
    if (connectorId) return;
    const preferred = activeConnectors.find((c) => c.is_default);
    if (preferred) setConnectorId(preferred.id);
  }, [activeConnectors, connectorId]);
  const domainTasks = useMemo(
    () => (tasks.data ?? []).filter((t) => !domainId || t.domain_id === domainId),
    [tasks.data, domainId],
  );

  const jobs = useQuery({
    queryKey: ["admin-jobs", page],
    queryFn: () => listGenerationJobs(page, PAGE_SIZE),
  });

  const generate = useMutation({
    mutationFn: createGenerationJob,
    onSuccess: (data) => {
      setResult(data);
      toast.success("Job completado");
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!connectorId) return toast.error("Selecciona un conector LLM activo.");
    if (taskIds.length === 0) return toast.error("Selecciona al menos una tarea ECO.");
    if (difMin > difMax) return toast.error("La dificultad mínima no puede superar a la máxima.");
    if (count < 1 || count > 200) return toast.error("El número de preguntas debe estar entre 1 y 200.");
    setResult(null);
    generate.mutate({
      connector_id: connectorId,
      task_ids: taskIds,
      approach: approach as "mixed",
      format,
      count_requested: count,
      difficulty_min: difMin,
      difficulty_max: difMax,
      focus_tags: tags,
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
        <form onSubmit={submit} className="grid gap-4 rounded-lg border border-border bg-card p-4 lg:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Conector LLM (solo activos)</span>
            <select value={connectorId} onChange={(e) => setConnectorId(e.target.value)} className={inputCls}>
              <option value="">Selecciona…</option>
              {activeConnectors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.model_id}
                  {c.is_default ? " · predeterminado" : ""}
                </option>
              ))}
            </select>
          </label>

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
            <span className="text-xs font-medium text-muted-foreground">
              Tareas ECO objetivo ({taskIds.length} seleccionadas) — el backend reparte el conteo entre ellas
            </span>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {tasks.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                domainTasks.map((t) => (
                  <label key={t.id} className="flex items-start gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted">
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
                      <span className="num text-muted-foreground">{t.task_number}.</span> {t.title}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Enfoque</span>
            <select value={approach} onChange={(e) => setApproach(e.target.value)} className={inputCls}>
              {APPROACHES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
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
                El pipeline solo genera de forma fiable mc_single y mc_multi. Este formato se acepta, pero
                requerirá revisión manual exhaustiva.
              </span>
            )}
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
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Temas transversales (opcional)</span>
            <div className="flex flex-wrap gap-2">
              {FOCUS_TAGS.map((tag) => {
                const on = tags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setTags((p) => (on ? p.filter((t) => t !== tag) : [...p, tag]))}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
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
          </div>
        </form>

        <NetworkDiagramGenerator domains={domains.data ?? []} tasks={tasks.data ?? []} />

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
