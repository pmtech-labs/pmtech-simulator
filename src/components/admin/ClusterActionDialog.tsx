import { useQueries } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listClusterQuestionsFn } from "@/lib/adminQuestions.functions";
import { statusLabel } from "@/lib/questionStatus";

export interface ClusterActionTarget {
  /** Ids de preguntas seleccionadas originalmente. */
  ids: string[];
  /** Casos implicados (cluster_id) que se verán afectados al completo. */
  clusterIds: string[];
  status: string;
  reason?: string;
}

/** Verbo en participio para los mensajes de confirmación. */
export function statusActionLabel(status: string): string {
  switch (status) {
    case "published":
      return "publicado";
    case "rejected":
      return "rechazado";
    case "retired":
      return "retirado";
    case "draft":
      return "devuelto a borrador";
    default:
      return "actualizado";
  }
}

interface Props {
  target: ClusterActionTarget | null;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Aviso previo cuando la acción afecta a preguntas de un caso: muestra el
 * escenario y las 5 preguntas de cada caso implicado antes de confirmar.
 */
export function ClusterActionDialog({ target, busy, onCancel, onConfirm }: Props) {
  const clusterIds = target?.clusterIds ?? [];

  const clusters = useQueries({
    queries: clusterIds.map((cluster_id) => ({
      queryKey: ["admin-cluster-questions", cluster_id],
      queryFn: () => listClusterQuestionsFn({ data: { cluster_id } }),
      enabled: Boolean(target),
    })),
  });

  const loading = clusters.some((c) => c.isPending);
  const totalQuestions = clusters.reduce((acc, c) => acc + (c.data?.questions.length ?? 0), 0);
  const multi = clusterIds.length > 1;

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {multi ? "Esta acción afecta a varios casos completos" : "Esta pregunta pertenece a un caso"}
          </DialogTitle>
          <DialogDescription>
            Repasa el escenario y las preguntas del caso antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning-soft p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            {multi
              ? `Las preguntas seleccionadas pertenecen a ${clusterIds.length} casos de 5 preguntas. Al confirmar, la acción se aplicará a las ${totalQuestions || clusterIds.length * 5} preguntas de esos casos, no solo a las seleccionadas.`
              : "Esta pregunta pertenece a un caso de 5 preguntas. Al confirmar, esta acción se aplicará a las 5 preguntas del caso, no solo a esta."}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando preguntas del caso…
          </div>
        ) : (
          <div className="space-y-4">
            {clusters.map((c, i) => {
              const data = c.data;
              if (!data) {
                return (
                  <p key={clusterIds[i]} className="text-sm text-destructive">
                    No se han podido cargar las preguntas de uno de los casos.
                  </p>
                );
              }
              return (
                <div key={data.cluster_id} className="rounded-md border border-border bg-card p-3">
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Escenario del caso{data.cluster_title ? ` · ${data.cluster_title}` : ""}
                  </p>
                  {data.cluster_scenario && (
                    <p className="mt-1 whitespace-pre-line text-sm">{data.cluster_scenario}</p>
                  )}
                  <ul className="mt-3 space-y-1.5">
                    {data.questions.map((q) => (
                      <li key={q.id} className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm">
                        <span className="num font-semibold">#{q.question_number}</span>{" "}
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                          {statusLabel(q.status)}
                        </span>
                        <p className="mt-1 text-sm">{q.stem}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {target?.reason && (
          <p className="text-sm">
            <span className="font-semibold">Motivo: </span>
            {target.reason}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={busy || loading}>
            {multi
              ? `Confirmar para las ${totalQuestions || clusterIds.length * 5} preguntas`
              : "Confirmar para las 5 preguntas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
