import { useQuery } from "@tanstack/react-query";
import { Award, Loader2, Trophy } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const DIPLOMA_DISCLAIMER =
  "PMI® no publica una nota de corte oficial para el examen PMP®. Este diploma reconoce tu desempeño según un criterio de referencia propio de Top PM Simulator, no una nota de aprobado oficial de PMI®.";

interface DiplomaRow {
  id: string;
  issued_at: string;
  score_pct: number;
  threshold_pct: number;
  score_by_domain: Record<string, number> | null;
  diploma_type: string | null;
}

const DOMAIN_LABEL: Record<string, string> = {
  people: "Personas",
  process: "Proceso",
  business_environment: "Entorno de negocio",
  business: "Entorno de negocio",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Lista los diplomas del usuario (la RLS ya limita a los propios). */
export function DiplomasSection({ userName }: { userName?: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["diplomas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diplomas")
        .select("*, exams(finished_at)")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DiplomaRow[];
    },
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-accent-foreground" />
        <h2 className="font-display text-lg font-semibold">Mis diplomas</h2>
      </div>

      {isLoading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando tus diplomas…
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-destructive">
          No hemos podido cargar tus diplomas. Inténtalo de nuevo en unos minutos.
        </p>
      )}

      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Todavía no tienes diplomas. Completa un simulacro completo con un buen desempeño y se
          emitirá automáticamente.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {(data ?? []).map((d) => {
          const isCapstone = d.diploma_type === "programa_completo";
          return (
            <article
              key={d.id}
              className={
                isCapstone
                  ? "rounded-xl border-2 border-accent bg-gradient-to-br from-accent/15 to-warning-soft p-4 sm:col-span-2"
                  : "rounded-xl border border-border bg-secondary/40 p-4"
              }
            >
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {isCapstone ? (
                  <Trophy className="h-3.5 w-3.5 text-accent-foreground" />
                ) : (
                  <Award className="h-3.5 w-3.5" />
                )}
                {isCapstone ? "Programa completo" : "Simulacro"}
              </p>
              {userName && <p className="mt-1 font-display text-sm font-semibold">{userName}</p>}
              {isCapstone ? (
                <p className="mt-2 text-sm leading-relaxed">
                  Todas las lecciones del temario aprobadas y un simulacro completo superado con
                  buen desempeño.
                </p>
              ) : (
                <p className="num mt-2 font-display text-3xl font-bold">
                  {Math.round(d.score_pct)}%
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Emitido el {formatDate(d.issued_at)}
                {!isCapstone && ` · umbral ${Math.round(d.threshold_pct)}%`}
              </p>
              {!isCapstone && d.score_by_domain && (
                <ul className="mt-3 space-y-1">
                  {Object.entries(d.score_by_domain).map(([code, value]) => (
                    <li key={code} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{DOMAIN_LABEL[code] ?? code}</span>
                      <span className="num font-medium">{Math.round(Number(value))}%</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                disabled
                title="Descarga en PDF disponible próximamente"
                className="mt-4 w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-60"
              >
                Descargar (próximamente)
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        {DIPLOMA_DISCLAIMER}
      </p>
    </section>
  );
}
