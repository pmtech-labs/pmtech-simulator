import { CheckCircle2, ExternalLink, Loader2, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { subscribeNewsletter } from "@/lib/leads.functions";
import { trackNewsletterEvent } from "@/lib/newsletter.functions";

const SUBSTACK_SUBSCRIBE_URL = "https://glacimonto.substack.com/subscribe";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const substackRef = useRef<Window | null>(null);
  const interacted = useRef(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    void trackNewsletterEvent({ data: { eventType: "view" } }).catch(() => {});
  }, []);

  const handleInteraction = () => {
    if (interacted.current) return;
    interacted.current = true;
    void trackNewsletterEvent({ data: { eventType: "interaction" } }).catch(() => {});
  };

  const openSubstack = (emailValue: string) => {
    const url = `${SUBSTACK_SUBSCRIBE_URL}?email=${encodeURIComponent(emailValue.trim())}`;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    return win;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const submittedEmail = email.trim();

    // Open Substack immediately while the user gesture is still active;
    // Safari/iOS and other strict popup blockers may block deferred window.open calls.
    substackRef.current = openSubstack(submittedEmail);

    try {
      await subscribeNewsletter({ data: { email, fullName } });
      void trackNewsletterEvent({ data: { eventType: "subscribe" } }).catch(() => {});
      setStatus("done");
    } catch {
      setStatus("idle");
      setError("No se ha podido completar la suscripción. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
          <Mail className="h-4.5 w-4.5 text-foreground" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">
            Suscríbete a nuestro boletín semanal sobre dirección de proyectos
          </h3>
          <p className="text-xs text-muted-foreground">
            Cada 7 días, sin relleno. Puedes darte de baja cuando quieras.
          </p>
        </div>
      </div>

      {status === "done" ? (
        <div className="mt-5 grid gap-3 rounded-lg border border-border bg-secondary/50 p-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              ¡Listo! Te hemos añadido a la lista. Si no se abrió Substack automáticamente, pulsa el
              botón de abajo para confirmar la suscripción y recibir el boletín sin problemas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              openSubstack(email);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Confirmar suscripción en Substack
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onFocus={handleInteraction}
            placeholder="Nombre (opcional)"
            maxLength={120}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={handleInteraction}
            placeholder="tu@email.com"
            maxLength={255}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:col-span-2"
          >
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            Suscribirme al boletín
          </button>
          {error && <p className="text-xs text-destructive sm:col-span-2">{error}</p>}
        </form>
      )}

      <ul className="mt-4 grid gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <li>· Cambios del ECO 2026 y del PMBOK® explicados en claro</li>
        <li>· Metodologías predictivas, ágiles e híbridas aplicadas</li>
        <li>· Casos reales de proyectos y errores que se repiten</li>
        <li>· Preguntas comentadas de examen y recursos de estudio</li>
      </ul>
    </div>
  );
}
