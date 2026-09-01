import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, Download, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AdminShell, DataTable, Pager } from "@/components/admin/AdminShell";
import { QuestionMediaPreview } from "@/components/admin/QuestionMediaPreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DictationTextarea } from "@/components/admin/DictationTextarea";
import {
  ClusterActionDialog,
  statusActionLabel,
  type ClusterActionTarget,
} from "@/components/admin/ClusterActionDialog";
import { getAdminQuestionFn } from "@/lib/adminQuestions.functions";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  deleteQuestion,
  listConnectors,
  listEcoDomains,
  listEcoTasks,
  listQuestions,
  updateQuestionsStatus,
  type AdminQuestion,
  type LlmConnector,
} from "@/services/adminService";
import { cn } from "@/lib/utils";
import { buildCsv, downloadCsv } from "@/lib/export";
import { useTagDefs } from "@/hooks/useTagDefs";
import { QUESTION_STATUSES, approachLabel, statusLabel } from "@/lib/questionStatus";


interface ReviewSearch {
  job?: string;
}

export const Route = createFileRoute("/admin/review")({
  validateSearch: (search: Record<string, unknown>): ReviewSearch => ({
    job: typeof search.job === "string" ? search.job : undefined,
  }),
  component: ReviewPage,
});

const STATUSES = QUESTION_STATUSES;
const APPROACHES = ["predictive", "agile", "hybrid"];
const PAGE_SIZE = 20;
const inputCls = "rounded-md border border-border bg-background px-2.5 py-1.5 text-xs";

type SortKey = "question_number" | "status";


function ReviewPage() {
  const email = useAdminEmail();
  const qc = useQueryClient();
  const { job } = Route.useSearch();

  const [statuses, setStatuses] = useState<string[]>(["draft"]);
  const [domainId, setDomainId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [approach, setApproach] = useState("");
  const [tagCode, setTagCode] = useState("");

  const [minUsed, setMinUsed] = useState("");
  const [maxSuccess, setMaxSuccess] = useState("");
  const [numFrom, setNumFrom] = useState("");
  const [numTo, setNumTo] = useState("");
  const [model, setModel] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("question_number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);



  const { defs: tagDefs } = useTagDefs();
  const domains = useQuery({ queryKey: ["eco-domains"], queryFn: listEcoDomains });
  const tasks = useQuery({ queryKey: ["eco-tasks"], queryFn: listEcoTasks });
  const domainTasks = useMemo(
    () => (tasks.data ?? []).filter((t) => !domainId || t.domain_id === domainId),
    [tasks.data, domainId],
  );
  const domainCode = (domains.data ?? []).find((d) => d.id === domainId)?.code;

  const filters = {
    status: statuses,
    domain_code: domainCode,
    task_id: taskId || undefined,
    approach: approach || undefined,
    job_id: job,
    tag_code: tagCode || undefined,

    min_times_used: minUsed ? Number(minUsed) : undefined,
    max_success_rate: maxSuccess ? Number(maxSuccess) : undefined,
  };

  // Se descarga el conjunto COMPLETO que cumple los filtros de servidor, para
  // que la búsqueda por rango, el modelo, la ordenación y la selección operen
  // sobre todos los registros y no solo sobre la página visible.
  const questions = useQuery({
    queryKey: ["admin-questions", filters],
    queryFn: async () => {
      const CHUNK = 200;
      // La paginación del servidor no garantiza un orden estable entre lotes, así
      // que se deduplica por id: de lo contrario la misma pregunta (p. ej. #499)
      // reaparecía en varias páginas y las claves duplicadas de React rompían el
      // desplegable del enunciado.
      const byId = new Map<string, AdminQuestion>();
      const first = await listQuestions(filters, 1, CHUNK);
      for (const r of first.rows) byId.set(r.id, r);
      let p = 2;
      let lastCount = first.rows.length;
      while (lastCount === CHUNK && p <= 50) {
        const next = await listQuestions(filters, p, CHUNK);
        lastCount = next.rows.length;
        if (lastCount === 0) break;
        for (const r of next.rows) byId.set(r.id, r);
        p += 1;
      }
      const rows = Array.from(byId.values());
      return { rows, total: rows.length };
    },
  });


  const allRows = questions.data?.rows ?? [];

  // El desplegable de modelo debe reflejar los conectores REALES configurados en
  // /admin/connectors (ago 2026, corrección de un hallazgo real del PO: antes solo
  // mostraba los model_id que YA aparecían en las preguntas cargadas, así que un
  // conector recién creado -- o simplemente uno que aún no se hubiera usado para
  // generar nada -- nunca aparecía en el filtro, aunque existiera en Conectores).
  const connectorsQuery = useQuery({
    queryKey: ["admin-connectors-for-filter"],
    queryFn: () => listConnectors(1, 50),
  });
  const connectorList: LlmConnector[] = connectorsQuery.data?.rows ?? [];

  const modelOptions = useMemo(() => {
    // Base: un option por cada model_id distinto entre los conectores configurados
    // (agrupando por si dos conectores compartieran el mismo model_id), con una
    // etiqueta legible "Nombre · model_id".
    const byModelId = new Map<string, string>();
    for (const c of connectorList) {
      if (!byModelId.has(c.model_id)) byModelId.set(c.model_id, `${c.name} · ${c.model_id}`);
    }

    // Además, se conservan como opción cualquier model_id que aparezca en preguntas
    // ya generadas pero que YA NO tenga un conector activo que lo respalde (ej. el
    // conector se borró o se renombró el modelo después de generar) -- así nunca se
    // pierde la capacidad de filtrar contenido histórico.
    const historicalIds = new Set<string>();
    for (const r of allRows) {
      const id = r.generation_model_id;
      if (id) historicalIds.add(id);
    }
    for (const id of historicalIds) {
      if (!byModelId.has(id)) byModelId.set(id, `${id} (histórico, sin conector activo)`);
    }

    return [
      { value: "__manual__", label: "Manual" },
      ...Array.from(byModelId.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [connectorList, allRows]);

  /** Todas las preguntas que cumplen filtros de cliente + ordenación (sin paginar). */
  const filteredRows = useMemo(() => {
    const from = numFrom ? Number(numFrom) : null;
    const to = numTo ? Number(numTo) : null;
    const filtered = allRows.filter((r) => {
      if (model && (r.generation_model_id ?? "__manual__") !== model) return false;
      if (from !== null && r.question_number < from) return false;
      if (to !== null && r.question_number > to) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "status") {
        const cmp = String(a.status).localeCompare(String(b.status));
        if (cmp !== 0) return cmp * dir;
        return (a.question_number - b.question_number) * dir;
      }
      return (a.question_number - b.question_number) * dir;
    });
  }, [allRows, model, numFrom, numTo, sortKey, sortDir]);

  const totalFiltered = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  /** Solo la página visible. */
  const rows = useMemo(
    () => filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredRows, safePage],
  );

  const toggleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };


  const exportCsv = () => {
    if (filteredRows.length === 0) {
      toast.error("No hay preguntas que exportar con los filtros actuales");
      return;
    }
    const csv = buildCsv(
      ["Nº", "Estado", "Dominio", "Tarea", "Enfoque", "Dificultad", "Usos", "% acierto", "Enunciado", "Motivo de rechazo"],
      filteredRows.map((r) => [
        r.question_number,
        statusLabel(r.status),
        r.domain_name ?? "",
        r.task_title ?? "",
        approachLabel(r.approach),
        r.difficulty ?? "",
        r.times_used_in_exams ?? r.times_answered ?? 0,
        r.success_rate_pct ?? "",
        r.stem,
        r.status === "retired" || r.status === "rejected" ? (r.latest_rejection_reason ?? "") : "",
      ]),
    );
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`preguntas-${stamp}.csv`, csv);
    toast.success(`${filteredRows.length} pregunta(s) exportadas`);
  };




  const [rejectTarget, setRejectTarget] = useState<{ ids: string[]; label: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);
  const [clusterTarget, setClusterTarget] = useState<ClusterActionTarget | null>(null);

  const changeStatus = useMutation({
    mutationFn: ({ ids, status, reason }: { ids: string[]; status: string; reason?: string }) =>
      updateQuestionsStatus(ids, status, reason),
    onSuccess: (res, v) => {
      const cascaded = (res as { cascaded?: boolean; cascaded_clusters?: Array<{ question_ids: string[] }> } | undefined);
      if (cascaded?.cascaded) {
        const clusters = cascaded.cascaded_clusters ?? [];
        const count = clusters.reduce((acc, c) => acc + c.question_ids.length, 0);
        toast.success(
          clusters.length > 1
            ? `Se han ${statusActionLabel(v.status)} las ${count} preguntas de ${clusters.length} casos.`
            : `Se han ${statusActionLabel(v.status)} las ${count || 5} preguntas del caso.`,
        );
      } else {
        toast.success(`${v.ids.length} pregunta(s) → ${statusLabel(v.status)}`);
      }
      setSelected([]);
      setRejectTarget(null);
      setRejectReason("");
      setConfirmStep(false);
      setClusterTarget(null);
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Casos (cluster_id) implicados por un conjunto de preguntas. */
  const clustersOf = (ids: string[]) =>
    Array.from(
      new Set(
        ids
          .map((id) => allRows.find((r) => r.id === id)?.cluster_id)
          .filter((c): c is string => Boolean(c)),
      ),
    );

  /**
   * Ejecuta la acción; si alguna pregunta pertenece a un caso, primero pide
   * confirmación mostrando las 5 preguntas afectadas.
   */
  const applyStatus = (ids: string[], status: string, reason?: string) => {
    const clusterIds = clustersOf(ids);
    if (clusterIds.length > 0) {
      setClusterTarget({ ids, clusterIds, status, reason });
      return;
    }
    changeStatus.mutate({ ids, status, reason });
  };

  const askReject = (ids: string[], label: string) => {
    setRejectReason("");
    setConfirmStep(false);
    setRejectTarget({ ids, label });
  };




  const remove = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (res) => {
      if (res?.retired) {
        toast.warning(
          res.reason ?? res.message ?? "La pregunta ya se usó en exámenes reales: se ha excluido del banco en lugar de borrarse.",
        );
      } else {
        toast.success("Pregunta eliminada");
      }
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy = changeStatus.isPending || remove.isPending;

  return (
    <AdminShell
      title="Cola de revisión"
      description={job ? `Filtrando por el job ${job}` : "Gestión del banco de preguntas"}
      email={email}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => {
              const on = statuses.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => {
                    setPage(1);
                    setStatuses((p) => (on ? p.filter((x) => x !== s) : [...p, s]));
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {statusLabel(s)}
                </button>
              );
            })}
          </div>
          <select
            value={domainId}
            onChange={(e) => {
              setDomainId(e.target.value);
              setTaskId("");
              setPage(1);
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
          <select value={taskId} onChange={(e) => { setTaskId(e.target.value); setPage(1); }} className={inputCls}>
            <option value="">Todas las tareas</option>
            {domainTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.task_number}. {t.title}
              </option>
            ))}
          </select>
          <select value={approach} onChange={(e) => { setApproach(e.target.value); setPage(1); }} className={inputCls}>
            <option value="">Todos los enfoques</option>
            {APPROACHES.map((a) => (
              <option key={a} value={a}>
                {approachLabel(a)}
              </option>
            ))}
          </select>
          <select
            value={tagCode}
            onChange={(e) => { setTagCode(e.target.value); setPage(1); }}
            className={cn(inputCls, "max-w-[16rem]")}
          >
            <option value="">Todas las etiquetas</option>
            {tagDefs.map((d) => (
              <option key={d.code} value={d.code}>
                {d.tag_type_label} — {d.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Usos mín."
            value={minUsed}
            onChange={(e) => { setMinUsed(e.target.value); setPage(1); }}
            className={cn(inputCls, "w-28")}
          />
          <input
            type="number"
            placeholder="% acierto máx."
            value={maxSuccess}
            onChange={(e) => { setMaxSuccess(e.target.value); setPage(1); }}
            className={cn(inputCls, "w-32")}
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Nº</span>
            <input
              type="number"
              placeholder="desde"
              value={numFrom}
              onChange={(e) => { setNumFrom(e.target.value); setPage(1); }}
              className={cn(inputCls, "w-20")}
            />
            <span>–</span>
            <input
              type="number"
              placeholder="hasta"
              value={numTo}
              onChange={(e) => { setNumTo(e.target.value); setPage(1); }}
              className={cn(inputCls, "w-20")}
            />
          </div>

          <select value={model} onChange={(e) => { setModel(e.target.value); setPage(1); }} className={inputCls}>
            <option value="">Todos los modelos</option>
            {modelOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={exportCsv}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        </div>



        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs">
            <span className="font-semibold">{selected.length} seleccionadas</span>
            <BulkBtn
              disabled={busy || selected.every((id) => allRows.find((r) => r.id === id)?.status === "published")}
              onClick={() => applyStatus(selected, "published")}
              title={
                selected.every((id) => allRows.find((r) => r.id === id)?.status === "published")
                  ? "Todas las seleccionadas ya están publicadas"
                  : "Aprobar y publicar las seleccionadas"
              }
            >
              Aprobar y publicar
            </BulkBtn>
            <BulkBtn
              disabled={busy || selected.every((id) => allRows.find((r) => r.id === id)?.status === "draft")}
              onClick={() => applyStatus(selected, "draft")}
              title={
                selected.every((id) => allRows.find((r) => r.id === id)?.status === "draft")
                  ? "Todas las seleccionadas ya están en borrador"
                  : "Devolver a borrador las seleccionadas"
              }
            >
              Volver a borrador
            </BulkBtn>
            <BulkBtn
              disabled={busy || selected.every((id) => allRows.find((r) => r.id === id)?.status === "retired")}
              onClick={() => applyStatus(selected, "retired")}
              title={
                selected.every((id) => allRows.find((r) => r.id === id)?.status === "retired")
                  ? "Todas las seleccionadas ya están retiradas"
                  : "Retirar del banco disponible para examen"
              }
            >
              Retirar
            </BulkBtn>
            <BulkBtn
              disabled={busy || selected.every((id) => allRows.find((r) => r.id === id)?.status === "rejected")}
              onClick={() =>
                askReject(
                  selected,
                  selected
                    .map((id) => allRows.find((r) => r.id === id)?.question_number)
                    .filter(Boolean)
                    .map((n) => `#${n}`)
                    .join(", ") || `${selected.length} pregunta(s)`,
                )
              }
              title={
                selected.every((id) => allRows.find((r) => r.id === id)?.status === "rejected")
                  ? "Todas las seleccionadas ya están rechazadas"
                  : "Rechazar las seleccionadas"
              }
            >
              Rechazar
            </BulkBtn>
          </div>
        )}

        {questions.error ? (
          <p className="text-sm text-destructive">{(questions.error as Error).message}</p>
        ) : questions.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <DataTable
              empty={rows.length === 0}
              head={
                <tr>
                  <th className="w-8 px-3 py-2 align-bottom">
                    <SelectAllCheckbox
                      totalFiltered={totalFiltered}
                      selectedCount={selected.length}
                      onChange={(checked) =>
                        setSelected(checked ? filteredRows.map((r) => r.id) : [])
                      }
                    />
                  </th>

                  <th className="px-3 py-2">
                    <SortBtn label="Nº" active={sortKey === "question_number"} dir={sortDir} onClick={() => toggleSort("question_number")} />
                  </th>
                  <th className="px-3 py-2">Enunciado</th>
                  <th className="px-3 py-2">
                    <SortBtn label="Estado" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
                  </th>
                  <th className="px-3 py-2">Dominio / Tarea</th>
                  <th className="px-3 py-2">Generado con</th>
                  <th className="px-3 py-2">Etiquetas</th>
                  <th className="px-3 py-2">Dif.</th>
                  <th className="px-3 py-2">Usos</th>
                  <th className="px-3 py-2">% acierto</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              }
            >
              {rows.map((q) => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  checked={selected.includes(q.id)}
                  onCheck={(on) =>
                    setSelected((p) => (on ? [...p, q.id] : p.filter((id) => id !== q.id)))
                  }
                  busy={busy}
                  onStatus={(status) => applyStatus([q.id], status)}
                  onReject={() => askReject([q.id], `#${q.question_number}`)}
                  onDelete={() => remove.mutate(q.id)}
                />
              ))}
            </DataTable>
            <Pager
              page={safePage}
              pageSize={PAGE_SIZE}
              total={totalFiltered}
              onPage={setPage}
            />

          </>
        )}

        <Dialog
          open={Boolean(rejectTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setRejectTarget(null);
              setConfirmStep(false);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmStep ? "Confirmar rechazo" : `Rechazar pregunta ${rejectTarget?.label ?? ""}`}
              </DialogTitle>
              <DialogDescription>
                {confirmStep
                  ? "Revisa antes de confirmar. Las preguntas quedarán marcadas como rechazadas y no pasarán a publicadas."
                  : "Las preguntas no se borran: quedan rechazadas con tu comentario, visible en «Rechazadas y retiradas». Explica brevemente por qué no tienen calidad suficiente — este motivo se usará automáticamente para mejorar la generación de preguntas futuras de esta misma tarea."}
              </DialogDescription>
            </DialogHeader>
            {confirmStep ? (
              <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3 text-sm">
                <p>
                  <span className="font-semibold">Preguntas: </span>
                  <span className="num">{rejectTarget?.label}</span>{" "}
                  <span className="text-muted-foreground">
                    ({rejectTarget?.ids.length} en total)
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Motivo: </span>
                  {rejectReason.trim().length > 160
                    ? `${rejectReason.trim().slice(0, 160)}…`
                    : rejectReason.trim()}
                </p>
              </div>
            ) : (
              <DictationTextarea
                placeholder="Ej: El distractor C es demasiado obvio, cualquier candidato lo descarta sin razonar."
                value={rejectReason}
                onChange={setRejectReason}
                rows={3}
              />
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => (confirmStep ? setConfirmStep(false) : setRejectTarget(null))}
              >
                {confirmStep ? "Volver" : "Cancelar"}
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || busy}
                onClick={() => {
                  if (!confirmStep) {
                    setConfirmStep(true);
                    return;
                  }
                  if (rejectTarget)
                    applyStatus(rejectTarget.ids, "rejected", rejectReason.trim());
                }}
              >
                {confirmStep ? "Sí, rechazar definitivamente" : "Continuar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ClusterActionDialog
          target={clusterTarget}
          busy={changeStatus.isPending}
          onCancel={() => setClusterTarget(null)}
          onConfirm={() => {
            if (!clusterTarget) return;
            changeStatus.mutate({
              ids: clusterTarget.ids,
              status: clusterTarget.status,
              reason: clusterTarget.reason,
            });
          }}
        />

      </div>
    </AdminShell>
  );
}

function SortBtn({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-primary")}
      title={`Ordenar por ${label}`}
    >
      {label}
      {active && <Icon className="h-3 w-3" />}
    </button>
  );
}

function SelectAllCheckbox({
  totalFiltered,
  selectedCount,
  onChange,
}: {
  totalFiltered: number;
  selectedCount: number;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected = totalFiltered > 0 && selectedCount === totalFiltered;
  const someSelected = selectedCount > 0 && selectedCount < totalFiltered;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={ref}
        type="checkbox"
        title="Seleccionar todas las preguntas filtradas (no solo esta página)"
        checked={allSelected}
        onChange={(e) => onChange(e.target.checked)}
      />
      {selectedCount > 0 && (
        <span
          className={cn(
            "max-w-[10rem] text-[10px] leading-tight",
            allSelected ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          {allSelected
            ? `Todas las ${totalFiltered} filtradas`
            : `${selectedCount} de ${totalFiltered} filtradas`}
        </span>
      )}
    </div>
  );
}

function BulkBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-md border border-border bg-card px-2.5 py-1 font-medium hover:bg-secondary disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function QuestionRow({
  q,
  checked,
  onCheck,
  onStatus,
  onReject,
  onDelete,
  busy,
}: {
  q: AdminQuestion;
  checked: boolean;
  onCheck: (on: boolean) => void;
  onStatus: (status: string) => void;
  onReject: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const { labelOf, typeLabelOf } = useTagDefs();
  const [open, setOpen] = useState(false);

  const options = Array.isArray(q.options) ? (q.options as Array<Record<string, unknown>>) : [];
  const correct = JSON.stringify(q.correct_answer ?? "");
  const needsMedia = ["graphic_based", "hotspot", "matching", "enhanced_matching"].includes(q.format);
  const detail = useQuery({
    queryKey: ["admin-question-detail", q.id],
    queryFn: () => getAdminQuestionFn({ data: { id: q.id } }),
    enabled: open && needsMedia && !q.practicum_payload,
  });
  const payload = q.practicum_payload ?? detail.data?.practicum_payload;


  return (
    <>
      <tr className="align-top">
        <td className="px-3 py-2">
          <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
        </td>
        <td className="px-3 py-2">
          <span className="num rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
            #{q.question_number}
          </span>
        </td>
        <td className="max-w-md px-3 py-2">
          <button onClick={() => setOpen((o) => !o)} className="flex items-start gap-1.5 text-left">
            <ChevronDown className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", open && "rotate-180")} />
            <span className="line-clamp-2">{q.stem}</span>
          </button>
          {q.latest_rejection_reason && (
            <p
              title={q.latest_rejection_reason}
              className="mt-1 line-clamp-2 rounded-md bg-destructive/10 px-2 py-1 text-[11px] text-destructive"
            >
              <span className="font-semibold">Motivo: </span>
              {q.latest_rejection_reason}
            </p>
          )}
        </td>
        <td className="px-3 py-2">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {statusLabel(q.status)}
          </span>
        </td>
        <td className="px-3 py-2 text-xs text-muted-foreground">
          {q.domain_name ?? "—"}
          <br />
          {q.task_title ?? "—"}
        </td>
        <td className="px-3 py-2 text-xs">
          <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground">
            {q.generation_model_id ?? "Manual"}
          </span>
        </td>
        <td className="px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {(q.tag_codes ?? []).map((code) => (
              <span
                key={code}
                title={typeLabelOf(code)}
                className="rounded-md border border-primary/40 px-1.5 py-0.5 text-[10px] font-medium text-primary"
              >
                {labelOf(code)}
              </span>
            ))}
          </div>
        </td>
        <td className="num px-3 py-2">{q.difficulty ?? "—"}</td>
        <td className="num px-3 py-2">{q.times_used_in_exams ?? 0}</td>
        <td className="num px-3 py-2">{q.success_rate_pct ?? "—"}</td>
        <td className="px-3 py-2">
          <div className="flex flex-wrap justify-end gap-1.5">
            <BulkBtn
              disabled={busy || q.status === "published"}
              title={q.status === "published" ? "Ya está publicada" : "Publicar pregunta"}
              onClick={() => onStatus("published")}
            >
              Publicar
            </BulkBtn>
            <BulkBtn
              disabled={busy || q.status === "draft"}
              title={q.status === "draft" ? "Ya está en borrador" : "Devolver a borrador"}
              onClick={() => onStatus("draft")}
            >
              Volver a borrador
            </BulkBtn>
            <BulkBtn
              disabled={busy || q.status === "retired"}
              title={
                q.status === "retired"
                  ? "Ya está retirada"
                  : "Retirar del banco disponible para examen"
              }
              onClick={() => onStatus("retired")}
            >
              Retirar
            </BulkBtn>
            <BulkBtn
              disabled={busy || q.status === "rejected"}
              title={q.status === "rejected" ? "Ya está rechazada" : "Rechazar pregunta"}
              onClick={onReject}
            >
              Rechazar
            </BulkBtn>
            <button
              disabled={busy}
              onClick={() => {
                if (confirm("¿Eliminar definitivamente esta pregunta?")) onDelete();
              }}
              className="rounded-md border border-destructive/50 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={11} className="bg-muted/40 px-4 py-3 text-sm">
            <p className="num mb-2 text-xs font-semibold text-muted-foreground">
              Pregunta #{q.question_number}
            </p>
            {q.latest_rejection_reason && (
              <div className="mb-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <span className="font-medium">Motivo del rechazo: </span>
                {q.latest_rejection_reason}
              </div>
            )}
            {q.cluster_scenario && (
              <div className="mb-3 rounded-md border border-border bg-card p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Escenario del caso</p>
                <p className="mt-1 whitespace-pre-line text-sm">{q.cluster_scenario}</p>
              </div>
            )}
            <p className="whitespace-pre-line font-medium">{q.stem}</p>
            {needsMedia && detail.isFetching && !payload ? (
              <Loader2 className="my-3 h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="mt-3">
                <QuestionMediaPreview
                  format={q.format}
                  payload={payload}
                  correctAnswer={q.correct_answer}
                />
              </div>
            )}
            <ul className="mt-2 space-y-1">
              {options.map((opt, i) => {
                const id = String(opt.id ?? opt.key ?? String.fromCharCode(65 + i));
                const text = String(opt.text ?? opt.label ?? "");
                const isCorrect = correct.includes(`"${id}"`) || correct === `"${id}"`;
                return (
                  <li
                    key={id}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-sm",
                      isCorrect ? "border-success bg-success-soft" : "border-border bg-card",
                    )}
                  >
                    <span className="num font-semibold">{id}.</span> {text}
                    {isCorrect && <span className="ml-2 text-xs font-semibold text-success">correcta</span>}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm">
              <span className="font-semibold">Explicación: </span>
              {q.explanation}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tarea: {q.task_title ?? q.task_id} · Tipo: {q.item_type} · Dificultad:{" "}
              {q.difficulty ?? "—"}
              {(q.tag_codes ?? []).length > 0 &&
                ` · ${(q.tag_codes ?? [])
                  .map((code) => `${typeLabelOf(code)}: ${labelOf(code)}`)
                  .join(" · ")}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {q.generation_model_id
                ? `Generado con ${q.generation_connector_name ?? "conector desconocido"} (${q.generation_provider ?? "—"} · ${q.generation_model_id})`
                : "Creado manualmente"}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}
