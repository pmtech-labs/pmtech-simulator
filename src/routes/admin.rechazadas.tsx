import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell, Pager } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  listReviewedOutQuestionsFn,
  updateQuestionTextFn,
} from "@/lib/adminQuestions.functions";
import { formatLabel, statusLabel } from "@/lib/questionStatus";
import { updateQuestionsStatus } from "@/services/adminService";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [5, 10, 20] as const;
type PageSize = (typeof PAGE_SIZES)[number];

type Filter = "rejected" | "retired" | "all";

export const Route = createFileRoute("/admin/rechazadas")({
  component: RejectedPage,
  head: () => ({
    meta: [
      { title: "Preguntas rechazadas y retiradas | Admin PMTech" },
      {
        name: "description",
        content:
          "Revisa los comentarios del supervisor y corrige erratas de texto en las preguntas rechazadas o retiradas del banco.",
      },
    ],
  }),
});

interface ReviewedRow {
  id: string;
  question_number: number;
  stem: string;
  options: unknown;
  correct_answer: unknown;
  explanation: string;
  status: string;
  format: string;
  item_type: string;
  difficulty: number | null;
  task_title: string | null;
  latest_rejection_reason: string | null;
  latest_rejection_at: string | null;
  correction_count: number | null;
  correction_status: "corrected" | "unfixable" | null;
  correction_notes: string | null;
}

function RejectedPage() {
  const email = useAdminEmail();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("rejected");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(5);

  const rows = useQuery({
    queryKey: ["admin-reviewed-out", filter],
    queryFn: () => listReviewedOutQuestionsFn({ data: { status: filter } }),
  });

  const list = (rows.data ?? []) as ReviewedRow[];

  // Reset to first page when filter or page size changes
  useEffect(() => {
    setPage(1);
  }, [filter, pageSize]);

  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, lastPage);
  const pagedList = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const restore = useMutation({
    mutationFn: (id: string) => updateQuestionsStatus([id], "draft"),
    onSuccess: () => {
      toast.success("Pregunta devuelta a borrador");
      qc.invalidateQueries({ queryKey: ["admin-reviewed-out"] });
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      title="Rechazadas y retiradas"
      description="Comentarios del revisor y corrección de erratas de texto"
      email={email}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          {(
            [
              { key: "rejected", label: "Rechazadas" },
              { key: "retired", label: "Retiradas" },
              { key: "all", label: "Todas" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {list.length} pregunta(s)
          </span>
        </div>

        {rows.error ? (
          <p className="text-sm text-destructive">{(rows.error as Error).message}</p>
        ) : rows.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : list.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            No hay preguntas en este estado.
          </p>
        ) : (
          <div className="space-y-3">
            {list.map((q) => (
              <ReviewedCard
                key={q.id}
                q={q}
                onRestore={() => restore.mutate(q.id)}
                restoring={restore.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function ReviewedCard({
  q,
  onRestore,
  restoring,
}: {
  q: ReviewedRow;
  onRestore: () => void;
  restoring: boolean;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const initialOptions = (
    Array.isArray(q.options) ? (q.options as Array<Record<string, unknown>>) : []
  ).map((opt, i) => ({
    id: String(opt.id ?? opt.key ?? String.fromCharCode(65 + i)),
    text: String(opt.text ?? opt.label ?? ""),
  }));
  const correct = JSON.stringify(q.correct_answer ?? "");

  const [stem, setStem] = useState(q.stem);
  const [explanation, setExplanation] = useState(q.explanation);
  const [options, setOptions] = useState(initialOptions);

  const save = useMutation({
    mutationFn: () =>
      updateQuestionTextFn({ data: { id: q.id, stem, explanation, options } }),
    onSuccess: () => {
      toast.success("Textos actualizados");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["admin-reviewed-out"] });
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      qc.invalidateQueries({ queryKey: ["admin-question-detail", q.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = () => {
    setStem(q.stem);
    setExplanation(q.explanation);
    setOptions(initialOptions);
    setEditing(false);
  };

  const textareaCls =
    "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm";

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <header className="flex flex-wrap items-center gap-2">
        <span className="num rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold">
          #{q.question_number}
        </span>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-semibold",
            q.status === "rejected"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground",
          )}
        >
          {statusLabel(q.status)}
        </span>
        {q.correction_status === "corrected" && (
          <span className="rounded-md bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
            Corrección {q.correction_count ?? 1}
          </span>
        )}
        {q.correction_status === "unfixable" && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            Sin corrección posible
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {q.task_title ?? "—"} · {formatLabel(q.format)}
        </span>
        <div className="ml-auto flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="outline" onClick={cancel}>
                <X className="mr-1 h-3.5 w-3.5" /> Cancelar
              </Button>
              <Button
                size="sm"
                disabled={save.isPending || !stem.trim() || !explanation.trim()}
                onClick={() => save.mutate()}
              >
                <Save className="mr-1 h-3.5 w-3.5" /> Guardar cambios
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Editar textos
              </Button>
              <Button size="sm" variant="secondary" disabled={restoring} onClick={onRestore}>
                Volver a borrador
              </Button>
            </>
          )}
        </div>
      </header>

      {q.latest_rejection_reason && (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="text-[11px] font-semibold uppercase text-destructive">
            Comentario del revisor
            {q.latest_rejection_at
              ? ` · ${new Date(q.latest_rejection_at).toLocaleDateString("es-ES")}`
              : ""}
          </p>
          <p className="mt-1 whitespace-pre-line">{q.latest_rejection_reason}</p>
        </div>
      )}

      {q.correction_notes && (
        <div className="mt-2 rounded-md border border-success/30 bg-success-soft p-3 text-sm">
          <p className="text-[11px] font-semibold uppercase text-success">
            Qué se corrigió
          </p>
          <p className="mt-1 whitespace-pre-line">{q.correction_notes}</p>
        </div>
      )}

      <div className="mt-3 space-y-3">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
            Enunciado
          </p>
          {editing ? (
            <textarea
              className={textareaCls}
              rows={4}
              value={stem}
              onChange={(e) => setStem(e.target.value)}
            />
          ) : (
            <p className="whitespace-pre-line text-sm font-medium">{q.stem}</p>
          )}
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
            Opciones
          </p>
          <ul className="space-y-1.5">
            {options.map((opt, i) => {
              const isCorrect = correct.includes(`"${opt.id}"`) || correct === `"${opt.id}"`;
              return (
                <li
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-sm",
                    isCorrect ? "border-success bg-success-soft" : "border-border bg-background",
                  )}
                >
                  <span className="num font-semibold">{opt.id}.</span>
                  {editing ? (
                    <textarea
                      className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                      rows={2}
                      value={opt.text}
                      onChange={(e) =>
                        setOptions((prev) =>
                          prev.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)),
                        )
                      }
                    />
                  ) : (
                    <span className="flex-1">{opt.text}</span>
                  )}
                  {isCorrect && (
                    <span className="text-xs font-semibold text-success">correcta</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
            Explicación
          </p>
          {editing ? (
            <textarea
              className={textareaCls}
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          ) : (
            <p className="whitespace-pre-line text-sm text-muted-foreground">{q.explanation}</p>
          )}
        </div>
      </div>
    </article>
  );
}
