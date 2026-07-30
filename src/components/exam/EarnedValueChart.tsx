import type { CaseCluster } from "@/types/exam";
import { useState } from "react";

/** Gráfico SVG interactivo de Valor Ganado (PV / EV / AC) */
export function EarnedValueChart({ chart }: { chart: CaseCluster["evChart"] }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 320;
  const H = 170;
  const padL = 34;
  const padB = 22;
  const padT = 10;
  const max = Math.max(...chart.pv, ...chart.ev, ...chart.ac) * 1.1;
  const x = (i: number) => padL + (i * (W - padL - 8)) / (chart.labels.length - 1);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");

  const series = [
    { key: "PV", vals: chart.pv, color: "var(--muted-foreground)", dash: "4 3" },
    { key: "EV", vals: chart.ev, color: "var(--success)", dash: "" },
    { key: "AC", vals: chart.ac, color: "var(--destructive)", dash: "" },
  ];

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold">Curva de valor ganado (k€ acumulado)</p>
        <div className="flex gap-3">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
              {s.key}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Gráfico de valor ganado del proyecto"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - 8}
              y1={padT + t * (H - padT - padB)}
              y2={padT + t * (H - padT - padB)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text x={4} y={padT + t * (H - padT - padB) + 3} fontSize="7" fill="var(--muted-foreground)">
              {Math.round((1 - t) * max)}
            </text>
          </g>
        ))}

        {series.map((s) => (
          <path
            key={s.key}
            d={path(s.vals)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeDasharray={s.dash}
            strokeLinecap="round"
          />
        ))}

        {chart.labels.map((l, i) => (
          <g key={l}>
            <text x={x(i)} y={H - 6} fontSize="7.5" textAnchor="middle" fill="var(--muted-foreground)">
              {l}
            </text>
            <rect
              x={x(i) - 12}
              y={0}
              width={24}
              height={H - padB}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            {hover === i && (
              <>
                <line x1={x(i)} x2={x(i)} y1={padT} y2={H - padB} stroke="var(--ring)" strokeWidth="1" />
                {series.map((s) => (
                  <circle key={s.key} cx={x(i)} cy={y(s.vals[i])} r="3" fill={s.color} />
                ))}
              </>
            )}
          </g>
        ))}
      </svg>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        {series.map((s) => (
          <div key={s.key} className="rounded-lg bg-card px-2 py-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.key}</p>
            <p className="num text-sm font-semibold" style={{ color: s.color }}>
              {(hover === null ? s.vals[s.vals.length - 1] : s.vals[hover]).toLocaleString("es-ES")} k€
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Pasa el cursor sobre el gráfico para inspeccionar cada mes.
      </p>
    </div>
  );
}
