import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { buildCsv, downloadCsv } from "@/lib/export";
import { useTagDefs } from "@/hooks/useTagDefs";


interface ReviewSearch {
  job?: string;
}

export const Route = createFileRoute("/admin/review")({
  validateSearch: (search: Record<string, unknown>): ReviewSearch => ({
    job: typeof search.job === "string" ? search.job : undefined,
  }),
  component: ReviewPage,
});

const STATUSES = ["draft", "published", "retired"];
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
  const rows = useMemo(() => {
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
  const clientFiltered = Boolean(model || numFrom || numTo);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error("No hay preguntas que exportar con los filtros actuales");
      return;
    }
    const csv = buildCsv(
      ["Nº", "Estado", "Dominio", "Tarea", "Enfoque", "Dificultad", "Usos", "% acierto", "Enunciado", "Motivo de rechazo"],
      rows.map((r) => [
        r.question_number,
        r.status,
        r.domain_name ?? "",
        r.task_title ?? "",
        r.approach ?? "",
        r.difficulty ?? "",
        r.times_used_in_exams ?? r.times_answered ?? 0,
        r.success_rate_pct ?? "",
        r.stem,
        r.status === "retired" ? (r.latest_rejection_reason ?? "") : "",
      ]),
    );
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`preguntas-${stamp}.csv`, csv);
    toast.success(`${rows.length} pregunta(s) exportadas`);
  };



  const [rejectTarget, setRejectTarget] = useState<{ ids: string[]; label: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);

  const changeStatus = useMutation({
    mutationFn: ({ ids, status, reason }: { ids: string[]; status: string; reason?: string }) =>
      updateQuestionsStatus(ids, status, reason),
    onSuccess: (_d, v) => {
      toast.success(`${v.ids.length} pregunta(s) → ${v.status}`);
      setSelected([]);
      setRejectTarget(null);
      setRejectReason("");
      setConfirmStep(false);
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const askRetire = (ids: string[], label: string) => {
    setRejectReason("");
    setConfirmStep(false);
    setRejectTarget({ ids, label });
  };



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
              onChange={(e) => setNumFrom(e.target.value)}
              className={cn(inputCls, "w-20")}
            />
            <span>–</span>
            <input
              type="number"
              placeholder="hasta"
              value={numTo}
              onChange={(e) => setNumTo(e.target.value)}
              className={cn(inputCls, "w-20")}
            />
          </div>

          <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
            <option value="">Todos los modelos</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m === "__manual__" ? "Manual" : m}
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
              onClick={() =>
                askRetire(
                  selected,
                  selected
                    .map((id) => allRows.find((r) => r.id === id)?.question_number)
                    .filter(Boolean)
                    .map((n) => `#${n}`)
                    .join(", ") || `${selected.length} pregunta(s)`,
                )
              }
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
                  onStatus={(status) => changeStatus.mutate({ ids: [q.id], status })}
                  onRetire={() => askRetire([q.id], `#${q.question_number}`)}
                  onDelete={() => remove.mutate(q.id)}
                />
              ))}
            </DataTable>
            <Pager
              page={page}
              pageSize={PAGE_SIZE}
              total={clientFiltered ? rows.length : (questions.data?.total ?? rows.length)}
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
                {confirmStep ? "Confirmar retirada" : `Retirar pregunta ${rejectTarget?.label ?? ""}`}
              </DialogTitle>
              <DialogDescription>
                {confirmStep
                  ? "Revisa antes de confirmar. Esta acción retira las preguntas del banco."
                  : "Las preguntas no se borran, quedan retiradas del banco. Explica brevemente por qué no tienen calidad suficiente — este motivo se usará automáticamente para mejorar la generación de preguntas futuras de esta misma tarea."}
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
              <Textarea
                placeholder="Ej: El distractor C es demasiado obvio, cualquier candidato lo descarta sin razonar."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
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
                    changeStatus.mutate({
                      ids: rejectTarget.ids,
                      status: "retired",
                      reason: rejectReason.trim(),
                    });
                }}
              >
                {confirmStep ? "Sí, retirar definitivamente" : "Continuar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
  onRetire,
  onDelete,
  busy,
}: {
  q: AdminQuestion;
  checked: boolean;
  onCheck: (on: boolean) => void;
  onStatus: (status: string) => void;
  onRetire: () => void;
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
          {q.status === "retired" && q.latest_rejection_reason && (
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
              title={q.status === "draft" ? "Ya está en borrador" : "Rechazar y devolver a borrador"}
              onClick={() => onStatus("draft")}
            >
              Rechazar
            </BulkBtn>
            <BulkBtn
              disabled={busy || q.status === "retired"}
              title={q.status === "retired" ? "Ya está retirada" : "Retirar pregunta"}
              onClick={onRetire}
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
          <td colSpan={11} className="bg-muted/40 px-4 py-3 text-sm">
            <p className="num mb-2 text-xs font-semibold text-muted-foreground">
              Pregunta #{q.question_number}
            </p>
            {q.status === "retired" && q.latest_rejection_reason && (
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
