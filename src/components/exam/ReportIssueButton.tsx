import { Flag, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { reportQuestionIssue } from "@/services/supportService";

/** Icono discreto para reportar un problema en una pregunta concreta. */
export function ReportIssueButton({
  questionId,
  examId,
  className,
}: {
  questionId: string;
  examId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!comment.trim() || sending) return;
    setSending(true);
    const ok = await reportQuestionIssue(questionId, comment.trim(), examId);
    setSending(false);
    setOpen(false);
    setComment("");
    toast[ok ? "success" : "error"](
      ok ? "Gracias, lo revisaremos" : "No hemos podido enviar el reporte. Inténtalo más tarde.",
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Reportar un problema en esta pregunta"
        aria-label="Reportar un problema en esta pregunta"
        className={
          className ??
          "inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        <Flag className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Reportar</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar un problema</DialogTitle>
            <DialogDescription>
              Cuéntanos qué está mal en esta pregunta y nuestro equipo de revisión la revisará.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Cuéntanos qué está mal"
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void submit()} disabled={!comment.trim() || sending}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
