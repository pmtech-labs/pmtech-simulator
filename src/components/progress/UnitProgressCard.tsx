import { useQuery } from "@tanstack/react-query";
import { BookOpen, Layers, Loader2 } from "lucide-react";

import { MOCK_UNIT_PROGRESS, type UnitProgress } from "@/data/mockData";
import { listPublishedUnits } from "@/services/curriculumService";
import { cn } from "@/lib/utils";

function accuracyTone(pct: number) {
  if (pct >= 75) return "text-success";
  if (pct >= 60) return "text-accent-foreground";
  return "text-destructive";
}

function ModeStats({
  icon: Icon,
  label,
  stats,
}: {
  icon: typeof BookOpen;
  label: string;
  stats: UnitProgress["unitQuiz"];
}) {
  const done = stats.answered > 0;
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      {done ? (
        <>
          <p className={cn("num mt-1 font-display text-2xl font-bold", accuracyTone(stats.accuracy))}>
            {stats.accuracy}%
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: `${stats.accuracy}%` }} />
          </div>
          <p className="num mt-2 text-[11px] text-muted-foreground">
            {stats.attempts} intentos · {stats.answered} preguntas · {stats.avgSeconds}s/pregunta
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Sin intentos todavía</p>
      )}
    </div>
  );
}

export function UnitProgressCard() {
  const unitsQuery = useQuery({
    queryKey: ["published-units"],
    queryFn: listPublishedUnits,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const published = unitsQuery.data ?? [];
  const rows: UnitProgress[] = MOCK_UNIT_PROGRESS.map((p) => {
    const match = published.find((u) => u.sequence === p.sequence);
    return match ? { ...p, title: match.title } : p;
  }).sort((a, b) => a.sequence - b.sequence);

  const best = [...rows].filter((r) => r.unitQuiz.answered > 0).sort((a, b) => b.unitQuiz.accuracy - a.unitQuiz.accuracy)[0];
  const worst = [...rows].filter((r) => r.unitQuiz.answered > 0).sort((a, b) => a.unitQuiz.accuracy - b.unitQuiz.accuracy)[0];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Progreso por lección</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Resultados de los modos «Practicar esta lección» y «Simulacro acumulativo», para que sepas qué
        unidades dominas y cuáles conviene repasar.
      </p>

      {unitsQuery.isPending ? (
        <Loader2 className="mt-4 h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          {best && worst && best.sequence !== worst.sequence && (
            <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Mejor lección: <strong className="text-foreground">{best.title}</strong> ({best.unitQuiz.accuracy}%).
              Punto débil: <strong className="text-foreground">{worst.title}</strong> ({worst.unitQuiz.accuracy}%).
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {rows.map((u) => (
              <li key={u.sequence} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">
                  <span className="num mr-2 text-muted-foreground">Lección {u.sequence}</span>
                  {u.title}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <ModeStats icon={BookOpen} label="Práctica de la lección" stats={u.unitQuiz} />
                  <ModeStats icon={Layers} label="Simulacro acumulativo" stats={u.cumulative} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
