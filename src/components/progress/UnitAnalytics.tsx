import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Download, FileSpreadsheet, FileText, Filter, Layers, LineChart, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MOCK_UNIT_PROGRESS, PROGRESS_TREND_LABELS, type UnitModeStats, type UnitProgress } from "@/data/mockData";
import { ERROR_TYPE_LABELS, ERROR_TYPE_SHORT } from "@/lib/errorTypes";
import { DOMAIN_LABELS, buildCsv, downloadCsv, escapeHtml, openPrintablePdf } from "@/lib/export";
import { cn } from "@/lib/utils";
import { listPublishedUnits } from "@/services/curriculumService";
import type { DomainCode } from "@/types/exam";

const ALL_DOMAINS: DomainCode[] = ["people", "process", "business"];
const DOMAIN_SHORT: Record<DomainCode, string> = {
  people: "Personas",
  process: "Procesos",
  business: "Entorno Business",
};

type Activity = "both" | "unitQuiz" | "cumulative";

const ACTIVITY_LABELS: Record<Exclude<Activity, "both">, string> = {
  unitQuiz: "Practicar esta lección",
  cumulative: "Simulacro acumulativo",
};

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
  stats: UnitModeStats;
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

const LINE_COLORS = ["var(--accent)", "var(--people)", "var(--process)", "var(--business)", "var(--primary)"];

function TrendChart({ rows, activity }: { rows: UnitProgress[]; activity: Activity }) {
  const W = 320;
  const H = 120;
  const padX = 14;
  const padY = 12;
  const steps = PROGRESS_TREND_LABELS.length;
  const x = (i: number) => padX + (i * (W - padX * 2)) / (steps - 1);
  const y = (v: number) => H - padY - (v / 100) * (H - padY * 2);

  const series = rows.flatMap((u, idx) => {
    const keys: ("unitQuiz" | "cumulative")[] =
      activity === "both" ? ["unitQuiz", "cumulative"] : [activity];
    return keys.map((k) => ({
      key: `${u.sequence}-${k}`,
      unit: u,
      mode: k,
      color: LINE_COLORS[idx % LINE_COLORS.length],
      dashed: k === "cumulative",
      points: u.trend[k]
        .map((v, i) => (v === null ? null : { x: x(i), y: y(v), v }))
        .filter((p): p is { x: number; y: number; v: number } => p !== null),
    }));
  }).filter((s) => s.points.length > 1);

  if (!series.length) {
    return <p className="mt-4 text-xs text-muted-foreground">No hay histórico suficiente con estos filtros.</p>;
  }

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Tendencia de score por lección">
        {[0, 25, 50, 75, 100].map((g) => (
          <line key={g} x1={padX} x2={W - padX} y1={y(g)} y2={y(g)} stroke="var(--border)" strokeWidth="0.5" />
        ))}
        {series.map((s) => (
          <g key={s.key}>
            <polyline
              points={s.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? "4 3" : undefined}
            />
            {s.points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" fill={s.color} />
            ))}
          </g>
        ))}
      </svg>
      <div className="num flex justify-between px-1 text-[10px] text-muted-foreground">
        {PROGRESS_TREND_LABELS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {rows.map((u, idx) => (
          <li key={u.sequence} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="inline-block h-0.5 w-4 rounded"
              style={{ background: LINE_COLORS[idx % LINE_COLORS.length] }}
            />
            Lección {u.sequence} · {u.title}
          </li>
        ))}
      </ul>
      {activity === "both" && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Línea continua: práctica de la lección · Línea discontinua: simulacro acumulativo.
        </p>
      )}
    </>
  );
}

export function UnitAnalytics() {
  const [domains, setDomains] = useState<DomainCode[]>(ALL_DOMAINS);
  const [activity, setActivity] = useState<Activity>("both");

  const unitsQuery = useQuery({
    queryKey: ["published-units"],
    queryFn: listPublishedUnits,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const published = unitsQuery.data ?? [];
  const allRows: UnitProgress[] = useMemo(
    () =>
      MOCK_UNIT_PROGRESS.map((p) => {
        const match = published.find((u) => u.sequence === p.sequence);
        return match ? { ...p, title: match.title } : p;
      }).sort((a, b) => a.sequence - b.sequence),
    [published],
  );

  const rows = useMemo(() => allRows.filter((u) => domains.includes(u.domain)), [allRows, domains]);

  const toggleDomain = (d: DomainCode) =>
    setDomains((prev) => (prev.includes(d) ? prev.filter((v) => v !== d) : [...prev, d]));

  const activeStats = (u: UnitProgress): UnitModeStats[] =>
    activity === "both" ? [u.unitQuiz, u.cumulative] : [u[activity]];

  const scored = rows
    .map((u) => {
      const list = activeStats(u).filter((s) => s.answered > 0);
      if (!list.length) return null;
      const answered = list.reduce((a, s) => a + s.answered, 0);
      const accuracy = Math.round(list.reduce((a, s) => a + s.accuracy * s.answered, 0) / answered);
      return { unit: u, accuracy, answered };
    })
    .filter((v): v is { unit: UnitProgress; accuracy: number; answered: number } => v !== null);

  const best = [...scored].sort((a, b) => b.accuracy - a.accuracy)[0];
  const worst = [...scored].sort((a, b) => a.accuracy - b.accuracy)[0];

  const errorSummary = useMemo(() => {
    const totals = new Map<string, number>();
    rows.forEach((u) => u.errorTypes.forEach((e) => totals.set(e.errorType, (totals.get(e.errorType) ?? 0) + e.occurrences)));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const maxError = Math.max(...errorSummary.map(([, v]) => v), 1);

  const filterLabel = `${domains.map((d) => DOMAIN_SHORT[d]).join(" · ") || "Sin dominios"} · ${
    activity === "both" ? "Ambas actividades" : ACTIVITY_LABELS[activity]
  }`;

  const guard = () => {
    if (!rows.length) {
      toast.error("No hay lecciones en la selección actual.");
      return false;
    }
    return true;
  };

  const exportCsv = () => {
    if (!guard()) return;
    const csv = buildCsv(
      [
        "Lección",
        "Título",
        "Dominio",
        "Actividad",
        "Intentos",
        "Preguntas",
        "Aciertos (%)",
        "Seg/pregunta",
        "Tendencia por semana (%)",
        "Tipos de error",
      ],
      rows.flatMap((u) => {
        const keys: ("unitQuiz" | "cumulative")[] =
          activity === "both" ? ["unitQuiz", "cumulative"] : [activity];
        return keys.map((k) => [
          u.sequence,
          u.title,
          DOMAIN_LABELS[u.domain],
          ACTIVITY_LABELS[k],
          u[k].attempts,
          u[k].answered,
          u[k].accuracy,
          u[k].avgSeconds,
          u.trend[k].map((v, i) => `${PROGRESS_TREND_LABELS[i]}: ${v === null ? "-" : `${v}%`}`).join(" | "),
          u.errorTypes.map((e) => `${ERROR_TYPE_SHORT[e.errorType]}: ${e.occurrences}`).join(" | "),
        ]);
      }),
    );
    downloadCsv("progreso-por-leccion-pmp.csv", csv);
    toast.success(`Progreso exportado (${rows.length} lecciones).`);
  };

  const exportPdf = () => {
    if (!guard()) return;
    const tableRows = rows
      .flatMap((u) => {
        const keys: ("unitQuiz" | "cumulative")[] =
          activity === "both" ? ["unitQuiz", "cumulative"] : [activity];
        return keys.map(
          (k) =>
            `<tr><td>${u.sequence}</td><td>${escapeHtml(u.title)}</td><td>${escapeHtml(
              DOMAIN_SHORT[u.domain],
            )}</td><td>${escapeHtml(ACTIVITY_LABELS[k])}</td><td>${u[k].attempts}</td><td>${
              u[k].answered
            }</td><td>${u[k].accuracy}%</td><td>${u[k].avgSeconds}s</td></tr>`,
        );
      })
      .join("");

    const trendRows = rows
      .map(
        (u) =>
          `<tr><td>${u.sequence}. ${escapeHtml(u.title)}</td>${PROGRESS_TREND_LABELS.map((_, i) => {
            const v = activity === "cumulative" ? u.trend.cumulative[i] : u.trend.unitQuiz[i];
            return `<td>${v === null ? "—" : `${v}%`}</td>`;
          }).join("")}</tr>`,
      )
      .join("");

    const errorBlocks = rows
      .map(
        (u) => `<div class="item">
  <span class="tag">${escapeHtml(DOMAIN_SHORT[u.domain])}</span>
  <h3>Lección ${u.sequence} · ${escapeHtml(u.title)}</h3>
  ${u.errorTypes
    .map(
      (e) =>
        `<p><strong>${escapeHtml(ERROR_TYPE_SHORT[e.errorType])}</strong> (${e.occurrences}) — <span class="muted">${escapeHtml(
          ERROR_TYPE_LABELS[e.errorType],
        )}</span></p>`,
    )
    .join("")}
</div>`,
      )
      .join("");

    const ok = openPrintablePdf(
      "Progreso por lección · Simulador PMP",
      `Filtros: ${filterLabel}`,
      `<h2>Resumen por lección</h2>
<table><thead><tr><th>#</th><th>Lección</th><th>Dominio</th><th>Actividad</th><th>Intentos</th><th>Preguntas</th><th>Aciertos</th><th>Tiempo medio</th></tr></thead><tbody>${tableRows}</tbody></table>
<h2>Tendencia semanal${activity === "cumulative" ? " (simulacro acumulativo)" : " (práctica de la lección)"}</h2>
<table><thead><tr><th>Lección</th>${PROGRESS_TREND_LABELS.map((l) => `<th>${l}</th>`).join("")}</tr></thead><tbody>${trendRows}</tbody></table>
<h2>Diagnóstico de tipos de error por lección</h2>${errorBlocks}`,
    );
    if (ok) toast.success("Informe listo: guárdalo como PDF desde el diálogo de impresión.");
    else toast.error("El navegador ha bloqueado la ventana emergente. Permítela e inténtalo de nuevo.");
  };

  if (unitsQuery.isPending) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Filtros de progreso</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Desglosa tu progreso por dominio del ECO y por tipo de actividad.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Dominio
          </span>
          {ALL_DOMAINS.map((d) => {
            const active = domains.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {DOMAIN_SHORT[d]}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Actividad
          </span>
          {([
            ["both", "Ambas"],
            ["unitQuiz", ACTIVITY_LABELS.unitQuiz],
            ["cumulative", ACTIVITY_LABELS.cumulative],
          ] as [Activity, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActivity(value)}
              aria-pressed={activity === value}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activity === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Download className="h-3.5 w-3.5" /> Exportar progreso
          </span>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <FileText className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Tendencia de score por lección</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Evolución semanal de tu porcentaje de aciertos en cada unidad publicada.
        </p>
        <TrendChart rows={rows} activity={activity} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Progreso por lección</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Resultados de los modos «Practicar esta lección» y «Simulacro acumulativo» con los filtros
          aplicados.
        </p>

        {best && worst && best.unit.sequence !== worst.unit.sequence && (
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Mejor lección: <strong className="text-foreground">{best.unit.title}</strong> ({best.accuracy}%).
            Punto débil: <strong className="text-foreground">{worst.unit.title}</strong> ({worst.accuracy}%).
          </p>
        )}

        {!rows.length ? (
          <p className="mt-4 text-xs text-muted-foreground">Selecciona al menos un dominio.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((u) => (
              <li key={u.sequence} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">
                  <span className="num mr-2 text-muted-foreground">Lección {u.sequence}</span>
                  {u.title}
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {DOMAIN_SHORT[u.domain]}
                  </span>
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(activity === "both" || activity === "unitQuiz") && (
                    <ModeStats icon={BookOpen} label={ACTIVITY_LABELS.unitQuiz} stats={u.unitQuiz} />
                  )}
                  {(activity === "both" || activity === "cumulative") && (
                    <ModeStats icon={Layers} label={ACTIVITY_LABELS.cumulative} stats={u.cumulative} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Diagnóstico de errores por unidad</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Qué causa tus fallos en cada lección: conocimiento, secuencia de acciones, rol, lectura…
        </p>

        {errorSummary.length > 0 && (
          <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Total con los filtros aplicados
            </p>
            {errorSummary.map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium">{ERROR_TYPE_SHORT[type as keyof typeof ERROR_TYPE_SHORT]}</span>
                  <span className="num font-semibold">{count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((count / maxError) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <ul className="mt-4 space-y-3">
          {rows.map((u) => {
            const top = [...u.errorTypes].sort((a, b) => b.occurrences - a.occurrences);
            const total = top.reduce((a, e) => a + e.occurrences, 0);
            return (
              <li key={u.sequence} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">
                  <span className="num mr-2 text-muted-foreground">Lección {u.sequence}</span>
                  {u.title}
                </p>
                {total === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">Sin errores registrados.</p>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Causa principal:{" "}
                      <strong className="text-foreground">{ERROR_TYPE_SHORT[top[0].errorType]}</strong> —{" "}
                      {ERROR_TYPE_LABELS[top[0].errorType]}
                    </p>
                    <div className="mt-3 space-y-2">
                      {top.map((e) => (
                        <div key={e.errorType} className="space-y-1">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span>{ERROR_TYPE_SHORT[e.errorType]}</span>
                            <span className="num text-muted-foreground">
                              {e.occurrences} · {Math.round((e.occurrences / total) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-destructive/70"
                              style={{ width: `${Math.round((e.occurrences / total) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
