import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ExportCenter } from "@/components/export/ExportCenter";

import { MOCK_EXAM_HISTORY } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/historial")({
  head: () => ({
    meta: [
      { title: "Historial de exámenes · Simulador PMP ECO 2026" },
      {
        name: "description",
        content: "Consulta todas tus simulaciones PMP realizadas, puntuación, duración y modo de examen.",
      },
      { property: "og:title", content: "Historial de exámenes PMP" },
      { property: "og:description", content: "Todas tus simulaciones PMP con puntuación y duración." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AppShell title="Historial de exámenes" subtitle="Todas tus sesiones registradas">
      <div className="mx-auto max-w-5xl space-y-5">
        <ExportCenter />
        <div className="overflow-hidden rounded-2xl border border-border bg-card">

          <div className="hidden grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Fecha</span>
            <span>Modo</span>
            <span>Preguntas</span>
            <span>Duración</span>
            <span>Score</span>
            <span />
          </div>
          {MOCK_EXAM_HISTORY.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[1fr_1.2fr_auto_auto_auto_auto] sm:items-center sm:gap-4 sm:px-5"
            >
              <span className="truncate text-sm text-muted-foreground">{e.date}</span>
              <span className="order-first truncate text-sm font-medium sm:order-none">{e.mode}</span>
              <span className="num hidden text-sm text-muted-foreground sm:block">{e.questions}</span>
              <span className="num hidden text-sm text-muted-foreground sm:block">{e.duration}</span>
              <span
                className={cn(
                  "num rounded-md px-2 py-0.5 text-center text-sm font-semibold",
                  e.score >= 70 ? "bg-success-soft text-success" : e.score >= 62 ? "bg-warning-soft text-accent-foreground" : "bg-danger-soft text-destructive",
                )}
              >
                {e.score}%
              </span>
              <Link
                to="/examen"
                className="hidden items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Revisar <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
