import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminQuestionFn } from "@/lib/adminQuestions.functions";
import { useTagDefs } from "@/hooks/useTagDefs";
import { cn } from "@/lib/utils";


interface Props {
  questionId: string | null;
  onOpenChange: (open: boolean) => void;
}

/** Diálogo con el enunciado completo, opciones, respuesta correcta y explicación. */
export function QuestionDetailDialog({ questionId, onOpenChange }: Props) {
  const { labelOf, typeLabelOf } = useTagDefs();
  const detail = useQuery({
    queryKey: ["admin-question-detail", questionId],
    queryFn: () => getAdminQuestionFn({ data: { id: questionId as string } }),
    enabled: Boolean(questionId),
  });

  const q = detail.data;
  const options = Array.isArray(q?.options) ? (q.options as Array<Record<string, unknown>>) : [];
  const correct = JSON.stringify(q?.correct_answer ?? "");

  return (
    <Dialog open={Boolean(questionId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {q ? `Detalle de la pregunta #${q.question_number}` : "Detalle de la pregunta"}
          </DialogTitle>
          <DialogDescription>
            {q ? `${q.domain_name ?? "—"} · ${q.task_title ?? "—"}` : "Cargando información…"}
          </DialogDescription>
        </DialogHeader>

        {detail.isPending && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando pregunta…
          </div>
        )}

        {detail.error && (
          <p className="py-4 text-sm text-destructive">
            No se ha podido cargar la pregunta. Inténtalo de nuevo.
          </p>
        )}

        {q && (
          <div className="space-y-4 text-sm">
            {q.cluster_scenario && (
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Escenario del caso{q.cluster_title ? ` · ${q.cluster_title}` : ""}
                </p>
                <p className="mt-1 whitespace-pre-line">{q.cluster_scenario}</p>
              </div>
            )}

            <p className="whitespace-pre-line font-medium">{q.stem}</p>

            <ul className="space-y-1.5">
              {options.map((opt, i) => {
                const id = String(opt.id ?? opt.key ?? String.fromCharCode(65 + i));
                const text = String(opt.text ?? opt.label ?? "");
                const isCorrect = correct.includes(`"${id}"`) || correct === `"${id}"`;
                return (
                  <li
                    key={id}
                    className={cn(
                      "rounded-md border px-3 py-2",
                      isCorrect ? "border-success bg-success-soft" : "border-border bg-card",
                    )}
                  >
                    <span className="num font-semibold">{id}.</span> {text}
                    {isCorrect && (
                      <span className="ml-2 text-xs font-semibold text-success">Respuesta correcta</span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Explicación</p>
              <p className="mt-1 whitespace-pre-line">{q.explanation}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {(q.tag_codes ?? []).map((code) => (
                <span
                  key={code}
                  title={typeLabelOf(code)}
                  className="rounded-md border border-primary/40 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                >
                  {typeLabelOf(code)}: {labelOf(code)}
                </span>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Estado: {q.status} · Dificultad: {q.difficulty ?? "—"}
              {" "}· Respondida {q.times_answered ?? 0} veces ({q.times_correct ?? 0} aciertos)
            </p>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
