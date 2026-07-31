import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

import { AdminShell, DataTable } from "@/components/admin/AdminShell";
import { QuestionDetailDialog } from "@/components/admin/QuestionDetailDialog";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import { getStats, type ExamStatRow, type QuestionStatRow, type TaskCoverageRow } from "@/services/adminService";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const TARGET_WEIGHT: Record<string, number> = { people: 33, process: 41, business: 26 };
const DOMAIN_LABEL: Record<string, string> = {
  people: "Personas",
  process: "Proceso",
  business: "Entorno de negocio",
};

function Kpi({ label, value, tone }: { label: string; value: string | number; tone?: "danger" | "ok" }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3",
        tone === "danger" ? "border-destructive/60" : "border-border",
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "num mt-1 text-2xl font-bold",
          tone === "danger" && "text-destructive",
          tone === "ok" && "text-success",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const email = useAdminEmail();

  const coverage = useQuery({
    queryKey: ["admin-stats", "coverage"],
    queryFn: () => getStats<TaskCoverageRow>("coverage"),
  });
  const exams = useQuery({
    queryKey: ["admin-stats", "exams"],
    queryFn: () => getStats<ExamStatRow>("exams"),
  });
  const hardest = useQuery({
    queryKey: ["admin-stats", "hardest"],
    queryFn: () => getStats<QuestionStatRow>("hardest_questions", 10),
  });
  const mostUsed = useQuery({
    queryKey: ["admin-stats", "most_used"],
    queryFn: () => getStats<QuestionStatRow>("most_used_questions", 10),
  });

  const rows = coverage.data ?? [];
  const totals = rows.reduce(
    (acc, r) => {
      acc.published += Number(r.published_count ?? 0);
      acc.draft += Number(r.draft_count ?? 0);
      acc.in_review += Number(r.in_review_count ?? 0);
      return acc;
    },
    { published: 0, draft: 0, in_review: 0 },
  );
  const tasksCovered = rows.filter((r) => Number(r.published_count ?? 0) > 0).length;
  const tasksEmpty = rows.length - tasksCovered;
  const totalExams = (exams.data ?? []).reduce((s, r) => s + Number(r.total_exams ?? 0), 0);

  const byDomain = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.domain_code] = (acc[r.domain_code] ?? 0) + Number(r.published_count ?? 0);
      return acc;
    }, {}),
  );
  const totalPublished = byDomain.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <AdminShell title="Dashboard" description="Estado del banco de preguntas y del uso de la plataforma" email={email}>
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi label="Borradores" value={totals.draft} />
          <Kpi label="En revisión" value={totals.in_review} />
          <Kpi label="Publicadas" value={totals.published} />
          <Kpi label="Exámenes realizados" value={totalExams} />
          <Kpi
            label="Cobertura tareas ECO"
            value={`${tasksCovered}/${rows.length || 26}`}
            tone={tasksEmpty > 0 ? "danger" : "ok"}
          />
        </section>

        {tasksEmpty > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/60 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">{tasksEmpty} tarea(s) sin ninguna pregunta publicada</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {rows
                  .filter((r) => Number(r.published_count ?? 0) === 0)
                  .map((r) => `${r.task_number}. ${r.task_title}`)
                  .join(" · ")}
              </p>
            </div>
          </div>
        )}
        {rows.length > 0 && tasksEmpty === 0 && (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Todas las tareas ECO tienen al menos una pregunta publicada.
          </p>
        )}

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Publicadas por dominio vs. peso objetivo del examen</h2>
          {coverage.isPending ? (
            <Loader2 className="mt-3 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="mt-4 space-y-4">
              {byDomain.map(([code, count]) => {
                const actual = Math.round((count / totalPublished) * 100);
                const target = TARGET_WEIGHT[code] ?? 0;
                const off = Math.abs(actual - target) > 8;
                return (
                  <div key={code}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{DOMAIN_LABEL[code] ?? code}</span>
                      <span className={cn("num", off ? "text-destructive" : "text-muted-foreground")}>
                        {count} preguntas · {actual}% real vs {target}% objetivo
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-3 rounded-full bg-muted">
                      <div
                        className={cn("h-3 rounded-full", off ? "bg-destructive" : "bg-primary")}
                        style={{ width: `${Math.min(100, actual)}%` }}
                      />
                      <div
                        className="absolute top-[-3px] h-[18px] w-0.5 bg-foreground"
                        style={{ left: `${Math.min(100, target)}%` }}
                        title={`Objetivo ${target}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <StatsTable title="Preguntas más falladas" query={hardest} metricLabel="% acierto" />
        <StatsTable title="Preguntas más usadas" query={mostUsed} metricLabel="% acierto" showUsage pageSize={10} />
      </div>
    </AdminShell>
  );
}

function StatsTable({
  title,
  query,
  metricLabel,
  showUsage,
  pageSize,
}: {
  title: string;
  query: { data?: QuestionStatRow[]; isPending: boolean; error: unknown };
  metricLabel: string;
  showUsage?: boolean;
  pageSize?: number;
}) {
  const rows = query.data ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages - 1);
  const visibleRows = pageSize
    ? rows.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
    : rows;



  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {query.error ? (
        <p className="text-xs text-destructive">No se han podido cargar los datos.</p>
      ) : query.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <DataTable
          empty={rows.length === 0}
          head={
            <tr>
              <th className="px-3 py-2">Enunciado</th>
              <th className="px-3 py-2">Dominio</th>
              <th className="px-3 py-2">Tarea</th>
              <th className="px-3 py-2">{metricLabel}</th>
              <th className="px-3 py-2">Respondida</th>
              {showUsage && <th className="px-3 py-2">Usos en exámenes</th>}
              <th className="px-3 py-2" />
            </tr>
          }
        >
          {rows.map((r) => (
            <tr key={r.question_id} className="align-top">
              <td className="max-w-md px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpenId(r.question_id)}
                  className="text-left hover:underline"
                >
                  <span className="line-clamp-2">{r.stem ?? r.question_id}</span>
                </button>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{r.domain_name ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{r.task_title ?? "—"}</td>
              <td className="num px-3 py-2">{r.success_rate_pct ?? "—"}</td>
              <td className="num px-3 py-2">{r.times_answered ?? 0}</td>
              {showUsage && <td className="num px-3 py-2">{r.times_used_in_exams ?? 0}</td>}
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => setOpenId(r.question_id)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-secondary"
                >
                  <Eye className="h-3.5 w-3.5" /> Ver pregunta
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
      <QuestionDetailDialog questionId={openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </section>
  );
}

