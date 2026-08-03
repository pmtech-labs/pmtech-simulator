import { cn } from "@/lib/utils";
import type { CaseCluster, Question } from "@/types/exam";

export function QuestionNavigator({
  questions,
  clusters,
  current,
  answers,
  flagged,
  onSelect,
  activeSection,
}: {
  questions: Question[];
  /** Casos/escenarios de la sesión, para mostrar su título al pasar el ratón. */
  clusters?: Record<string, CaseCluster>;
  current: number;
  answers: Record<string, unknown>;
  flagged: Record<string, boolean>;
  onSelect: (i: number) => void;
  /** Si se indica, las preguntas de secciones ya cerradas quedan bloqueadas. */
  activeSection?: number;
}) {
  const grouped = new Map<number, { q: Question; i: number }[]>();
  questions.forEach((q, i) => {
    const section = q.sectionNumber ?? 1;
    const list = grouped.get(section) ?? [];
    list.push({ q, i });
    grouped.set(section, list);
  });

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Navegación de preguntas
      </p>

      {[...grouped.entries()].map(([section, items]) => {
        const closed = activeSection !== undefined && section < activeSection;
        const locked = activeSection !== undefined && section !== activeSection;
        return (
          <div key={section} className="space-y-1.5">
            {activeSection !== undefined && (
              <p className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>Sección {section}</span>
                {closed ? (
                  <span className="text-[10px] font-normal">Cerrada</span>
                ) : section === activeSection ? (
                  <span className="text-[10px] font-normal text-accent-foreground">En curso</span>
                ) : (
                  <span className="text-[10px] font-normal">Bloqueada</span>
                )}
              </p>
            )}
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
              {items.map(({ q, i }) => {
                const answered = Boolean(answers[q.id]);
                const isFlagged = flagged[q.id];
                const clusterTitle = q.clusterId ? clusters?.[q.clusterId]?.title : undefined;
                return (
                  <button
                    key={q.id}
                    onClick={() => !locked && onSelect(i)}
                    disabled={locked}
                    title={
                      locked
                        ? `Sección ${section} no disponible`
                        : clusterTitle
                          ? `Caso: ${clusterTitle}`
                          : undefined
                    }
                    className={cn(
                      "num relative grid aspect-square place-items-center rounded-lg border text-xs font-semibold transition-colors",
                      i === current && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                      i !== current && clusterTitle && "ring-1 ring-accent/40",
                      locked && "cursor-not-allowed opacity-40",
                      answered
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <ul className="space-y-1.5 text-[11px] text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Respondida
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-card" /> Sin responder
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Marcada para revisión
        </li>
      </ul>
    </div>
  );
}
