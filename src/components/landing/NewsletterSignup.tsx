import { Mail } from "lucide-react";

export function NewsletterSignup() {
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

      <div className="mt-5 w-full overflow-hidden rounded-lg">
        <iframe
          src="https://glacimonto.substack.com/embed?transparent=1&light=1"
          width="100%"
          height="320"
          style={{ border: 0, background: "transparent" }}
          frameBorder="0"
          scrolling="no"
          title="Formulario de suscripción al boletín de dirección de proyectos"
          loading="lazy"
        />
      </div>

      <ul className="mt-4 grid gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <li>· Cambios del ECO 2026 y del PMBOK explicados en claro</li>
        <li>· Metodologías predictivas, ágiles e híbridas aplicadas</li>
        <li>· Casos reales de proyectos y errores que se repiten</li>
        <li>· Preguntas comentadas de examen y recursos de estudio</li>
      </ul>
    </div>
  );
}

