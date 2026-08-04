import { MessageSquarePlus, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Punto de entrada sencillo para que el candidato envíe feedback del producto.
 * Guarda en `app_feedback` (RLS: el user_id se rellena desde la sesión).
 */
export function FeedbackDialog({
  pageContext,
  className,
}: {
  pageContext: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const close = () => {
    setOpen(false);
    setMessage("");
    setRating(null);
  };

  const send = async () => {
    const text = message.trim();
    if (!text) {
      toast.error("Escribe tu comentario antes de enviarlo.");
      return;
    }
    setSending(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("app_feedback").insert({
      user_id: auth.user?.id as string,
      message: text,
      rating,
      page_context: pageContext,
    });
    setSending(false);
    if (error) {
      toast.error("No hemos podido enviar tu feedback. Inténtalo de nuevo.");
      return;
    }
    toast.success("Gracias por tu feedback");
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary",
          className,
        )}
      >
        <MessageSquarePlus className="h-4 w-4" /> Enviar feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Enviar feedback</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cuéntanos qué te gusta o qué mejorarías del simulador.
                </p>
              </div>
              <button onClick={close} aria-label="Cerrar" className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="mt-4 flex items-center gap-1.5"
              role="radiogroup"
              aria-label="Valoración"
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={rating === v}
                  aria-label={`${v} de 5`}
                  onClick={() => setRating(rating === v ? null : v)}
                  className="rounded p-0.5"
                >
                  <Star
                    className={cn(
                      "h-5 w-5",
                      rating !== null && v <= rating
                        ? "fill-accent text-accent"
                        : "text-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Tu comentario…"
              className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={close}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => void send()}
                disabled={sending}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {sending ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
