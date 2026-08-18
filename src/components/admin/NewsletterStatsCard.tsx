import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";

import { getNewsletterStats } from "@/lib/newsletter.functions";

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Métricas del boletín: visitas al bloque, interacciones y suscripciones. */
export function NewsletterStatsCard() {
  const fetchStats = useServerFn(getNewsletterStats);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "newsletter-stats"],
    queryFn: () => fetchStats({ data: undefined }),
  });

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Boletín · Suscriptores y conversión</h2>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando métricas…
        </div>
      )}
      {isError && (
        <p className="mt-3 text-xs text-destructive">No se han podido cargar las métricas.</p>
      )}

      {data && (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Suscriptores" value={String(data.subscribers)} hint="Total activos" />
            <Kpi label="Últimos 7 días" value={String(data.subscribers7d)} />
            <Kpi label="Últimos 30 días" value={String(data.subscribers30d)} />
            <Kpi
              label="Conversión"
              value={`${data.conversionPct}%`}
              hint="Suscripciones / interacciones"
            />
            <Kpi label="Visitas al bloque" value={String(data.views)} />
            <Kpi
              label="Interacciones"
              value={String(data.interactions)}
              hint="Han pulsado el formulario"
            />
            <Kpi label="Suscripciones registradas" value={String(data.subscribeEvents)} />
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-semibold">Últimas altas</h3>
            {data.latest.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Todavía no hay suscriptores.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {data.latest.map((s) => (
                  <li
                    key={s.email}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                  >
                    <span className="truncate">
                      {s.fullName ? `${s.fullName} · ` : ""}
                      {s.email}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
