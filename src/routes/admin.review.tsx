import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell, DataTable, Pager } from "@/components/admin/AdminShell";
import { QuestionMediaPreview } from "@/components/admin/QuestionMediaPreview";
import { getAdminQuestionFn } from "@/lib/adminQuestions.functions";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  deleteQuestion,
  listEcoDomains,
  listEcoTasks,
  listQuestions,
  updateQuestionsStatus,
  type AdminQuestion,
} from "@/services/adminService";
import { cn } from "@/lib/utils";
import {
  FOCUS_TAG_LABELS,
  PERFORMANCE_DOMAIN_LABELS,
  PROCESS_GROUP_LABELS,
} from "@/lib/questionTags";


export const Route = createFileRoute("/admin/review")({
  validateSearch: (search: Record<string, unknown>) => ({
    job: typeof search.job === "string" ? search.job : undefined,
  }),
  component: ReviewPage,
});

const STATUSES = ["draft", "published", "retired"];
const APPROACHES = ["predictive", "agile", "hybrid"];
const PAGE_SIZE = 20;
const inputCls = "rounded-md border border-border bg-background px-2.5 py-1.5 text-xs";

function ReviewPage() {
  const email = useAdminEmail();
  const qc = useQueryClient();
  const { job } = Route.useSearch();

  const [statuses, setStatuses] = useState<string[]>(["draft"]);
  const [domainId, setDomainId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [approach, setApproach] = useState("");
  const [processGroup, setProcessGroup] = useState("");
  const [performanceDomain, setPerformanceDomain] = useState("");

  const [minUsed, setMinUsed] = useState("");
  const [maxSuccess, setMaxSuccess] = useState("");
  const [model, setModel] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

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
    process_group: processGroup || undefined,
    performance_domain: performanceDomain || undefined,

    min_times_used: minUsed ? Number(minUsed) : undefined,
    max_success_rate: maxSuccess ? Number(maxSuccess) : undefined,
  };

  const questions = useQuery({
    queryKey: ["admin-questions", filters, page],
    queryFn: () => listQuestions(filters, page, PAGE_SIZE),
  });

  const allRows = questions.data?.rows ?? [];
  const modelOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRows) set.add(r.generation_model_id ?? "__manual__");
    return Array.from(set).sort();
  }, [allRows]);
  const rows = useMemo(
    () =>
      model
        ? allRows.filter((r) => (r.generation_model_id ?? "__manual__") === model)
        : allRows,
    [allRows, model],
  );


  const changeStatus = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) => updateQuestionsStatus(ids, status),
    onSuccess: (_d, v) => {
      toast.success(`${v.ids.length} pregunta(s) → ${v.status}`);
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (res) => {
      if (res?.retired) {
        toast.warning(
          res.reason ?? res.message ?? "La pregunta ya se usó en exámenes reales: se ha retirado en lugar de borrarse.",
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
                  {s}
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
                {a}
              </option>
            ))}
          </select>
          <select
            value={processGroup}
            onChange={(e) => { setProcessGroup(e.target.value); setPage(1); }}
            className={inputCls}
          >
            <option value="">Todas las áreas de enfoque</option>
            {Object.entries(PROCESS_GROUP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={performanceDomain}
            onChange={(e) => { setPerformanceDomain(e.target.value); setPage(1); }}
            className={inputCls}
          >
            <option value="">Todos los dominios de desempeño</option>
            {Object.entries(PERFORMANCE_DOMAIN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
          <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
            <option value="">Todos los modelos</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m === "__manual__" ? "Manual" : m}
              </option>
            ))}
          </select>
        </div>


        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs">
            <span className="font-semibold">{selected.length} seleccionadas</span>
            <BulkBtn
              disabled={busy || selected.every((id) => allRows.find((r) => r.id === id)?.status === "published")}
              onClick={() => changeStatus.mutate({ ids: selected, status: "published" })}
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
              onClick={() => changeStatus.mutate({ ids: selected, status: "draft" })}
              title={
                selected.every((id) => allRows.find((r) => r.id === id)?.status === "draft")
                  ? "Todas las seleccionadas ya están en borrador"
                  : "Rechazar y devolver a borrador las seleccionadas"
              }
            >
              Rechazar (a borrador)
            </BulkBtn>
            <BulkBtn
              disabled={busy || selected.every((id) => allRows.find((r) => r.id === id)?.status === "retired")}
              onClick={() => changeStatus.mutate({ ids: selected, status: "retired" })}
              title={
                selected.every((id) => allRows.find((r) => r.id === id)?.status === "retired")
                  ? "Todas las seleccionadas ya están retiradas"
                  : "Retirar las seleccionadas"
              }
            >
              Retirar
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
                  <th className="w-8 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                    />
                  </th>
                  <th className="px-3 py-2">Enunciado</th>
                  <th className="px-3 py-2">Estado</th>
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
                  onStatus={(status) => changeStatus.mutate({ ids: [q.id], status })}
                  onDelete={() => remove.mutate(q.id)}
                />
              ))}
            </DataTable>
            <Pager
              page={page}
              pageSize={PAGE_SIZE}
              total={model ? rows.length : (questions.data?.total ?? rows.length)}
              onPage={setPage}
            />
          </>
        )}
      </div>
    </AdminShell>
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
  onDelete,
  busy,
}: {
  q: AdminQuestion;
  checked: boolean;
  onCheck: (on: boolean) => void;
  onStatus: (status: string) => void;
  onDelete: () => void;
  busy: boolean;
}) {
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
        <td className="max-w-md px-3 py-2">
          <button onClick={() => setOpen((o) => !o)} className="flex items-start gap-1.5 text-left">
            <ChevronDown className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", open && "rotate-180")} />
            <span className="line-clamp-2">{q.stem}</span>
          </button>
        </td>
        <td className="px-3 py-2">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {q.status}
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
            {q.process_group && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {PROCESS_GROUP_LABELS[q.process_group] ?? q.process_group}
              </span>
            )}
            {q.performance_domain && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {PERFORMANCE_DOMAIN_LABELS[q.performance_domain] ?? q.performance_domain}
              </span>
            )}
            {(q.focus_tags ?? []).map((t) => (
              <span
                key={t}
                className="rounded-md border border-primary/40 px-1.5 py-0.5 text-[10px] font-medium text-primary"
              >
                {FOCUS_TAG_LABELS[t] ?? t}
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
              title={q.status === "draft" ? "Ya está en borrador" : "Rechazar y devolver a borrador"}
              onClick={() => onStatus("draft")}
            >
              Rechazar
            </BulkBtn>
            <BulkBtn
              disabled={busy || q.status === "retired"}
              title={q.status === "retired" ? "Ya está retirada" : "Retirar pregunta"}
              onClick={() => onStatus("retired")}
            >
              Retirar
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
          <td colSpan={9} className="bg-muted/40 px-4 py-3 text-sm">
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
              Tarea: {q.task_title ?? q.task_id} · Enfoque: {q.approach} · Formato: {q.format} · Tipo:{" "}
              {q.item_type} · Dificultad: {q.difficulty ?? "—"}
              {q.process_group &&
                ` · Área de enfoque: ${PROCESS_GROUP_LABELS[q.process_group] ?? q.process_group}`}
              {q.performance_domain &&
                ` · Dominio de desempeño: ${PERFORMANCE_DOMAIN_LABELS[q.performance_domain] ?? q.performance_domain}`}
              {q.focus_tags &&
                q.focus_tags.length > 0 &&
                ` · Temáticas: ${q.focus_tags.map((t) => FOCUS_TAG_LABELS[t] ?? t).join(", ")}`}

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
