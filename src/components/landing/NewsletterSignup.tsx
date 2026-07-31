import { useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { subscribeNewsletter } from "@/lib/leads.functions";

export function NewsletterSignup() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await subscribe({ data: { email, fullName } });
      setDone(true);
      toast.success("¡Suscripción confirmada! Revisa tu bandeja de entrada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se ha podido suscribir.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
          <Mail className="h-4.5 w-4.5 text-foreground" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">
            Boletín de dirección de proyectos
          </h3>
          <p className="text-xs text-muted-foreground">
            Cada quince días, sin relleno. Puedes darte de baja cuando quieras.
          </p>
        </div>
      </div>

      {done ? (
        <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          Ya estás dentro. Te enviaremos novedades del ECO 2026, PMBOK, agilidad y casos
          reales de gestión de proyectos.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="news-name" className="sr-only">
                Nombre
              </label>
              <input
                id="news-name"
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Nombre (opcional)"
              />
            </div>
            <div>
              <label htmlFor="news-email" className="sr-only">
                Email
              </label>
              <input
                id="news-email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@email.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Suscribiendo…
              </>
            ) : (
              "Suscribirme al boletín"
            )}
          </button>
        </form>
      )}

      <ul className="mt-4 grid gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <li>· Cambios del ECO 2026 y del PMBOK explicados en claro</li>
        <li>· Metodologías predictivas, ágiles e híbridas aplicadas</li>
        <li>· Casos reales de proyectos y errores que se repiten</li>
        <li>· Preguntas comentadas de examen y recursos de estudio</li>
      </ul>
    </div>
  );
}
