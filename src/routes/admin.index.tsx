import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

import { AdminShell, DataTable } from "@/components/admin/AdminShell";
import { NewsletterExportCard } from "@/components/admin/NewsletterExportCard";
import { QuestionDetailDialog } from "@/components/admin/QuestionDetailDialog";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  getStats,
  type ExamStatRow,
  type QuestionStatRow,
  type QuestionTagRow,
  type TaskCoverageRow,
} from "@/services/adminService";
import { useTagDefs } from "@/hooks/useTagDefs";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const TARGET_WEIGHT: Record<string, number> = {
  people: 33,
  process: 41,
  business_environment: 26,
};
const DOMAIN_LABEL: Record<string, string> = {
  people: "Personas",
  process: "Proceso",
  business_environment: "Entorno de negocio",
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
      return acc;
    },
    { published: 0, draft: 0 },
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
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Borradores" value={totals.draft} />

          <Kpi label="Publicadas" value={totals.published} />
          <Kpi label="Exámenes realizados" value={totalExams} />
          <Kpi
            label="Cobertura tareas ECO"
            value={`${tasksCovered}/${rows.length || 26}`}
            tone={tasksEmpty > 0 ? "danger" : "ok"}
          />
        </section>

        <TagDistribution />


        <NewsletterExportCard />


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

function TagBar({
  label,
  code,
  count,
  total,
}: {
  label: string;
  code: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const target = TAG_TARGET_PCT[code];
  const diff = target === undefined ? null : pct - target;
  const tone = diff === null ? null : deviationTone(diff);

  const toneText =
    tone === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "bad"
          ? "text-destructive"
          : "text-muted-foreground";
  const toneBar =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : tone === "bad"
          ? "bg-destructive"
          : "bg-primary";

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className="num flex items-center gap-1.5">
          <span className="text-muted-foreground">{count}</span>
          <span className={cn("font-semibold", toneText)}>
            {pct}%
            {diff !== null && (
              <span className="ml-0.5">
                ({diff > 0 ? "+" : diff < 0 ? "−" : "±"}
                {Math.abs(diff)})
              </span>
            )}
          </span>
          {target !== undefined && (
            <span className="text-[10px] text-muted-foreground">obj. {target}%</span>
          )}
        </span>
      </div>
      <div className="relative mt-1 h-2 rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full", toneBar)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        {target !== undefined && (
          <span
            className="absolute top-[-2px] h-3 w-px bg-foreground/50"
            style={{ left: `${Math.min(100, target)}%` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}


function TagGroup({
  title,
  note,
  entries,
  total,
}: {
  title: string;
  note: string;
  entries: { code: string; label: string; count: number }[];
  total: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{note}</p>
      <div className="mt-3 space-y-2.5">
        {entries.map((e) => (
          <TagBar key={e.code} label={e.label} count={e.count} total={total} />
        ))}
      </div>
    </div>
  );
}

function TagDistribution() {
  const { defs } = useTagDefs();
  const tags = useQuery({
    queryKey: ["admin-stats", "tags"],
    queryFn: () => getStats<QuestionTagRow>("tags"),
  });

  const rows = tags.data ?? [];
  const total = rows.length;

  const counts: Record<string, number> = {};
  for (const r of rows) {
    for (const code of r.tag_codes ?? []) counts[code] = (counts[code] ?? 0) + 1;
  }

  const groups: { type: string; label: string; exclusive: boolean; entries: { code: string; label: string; count: number }[] }[] = [];
  for (const d of defs) {
    let group = groups.find((g) => g.type === d.tag_type);
    if (!group) {
      group = { type: d.tag_type, label: d.tag_type_label, exclusive: d.exclusive, entries: [] };
      groups.push(group);
    }
    group.entries.push({ code: d.code, label: d.label, count: counts[d.code] ?? 0 });
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">Representación por etiqueta</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {total} preguntas en borrador y publicadas
        </p>
      </div>
      {tags.error ? (
        <p className="text-xs text-destructive">No se han podido cargar las etiquetas.</p>
      ) : tags.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {groups.map((g) => (
            <TagGroup
              key={g.type}
              title={g.label}
              note={g.exclusive ? "Una etiqueta por pregunta" : "Varias etiquetas posibles por pregunta"}
              entries={g.entries}
              total={total}
            />
          ))}
        </div>
      )}
    </section>
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
  const { labelOf, typeLabelOf } = useTagDefs();
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
              <th className="px-3 py-2">Etiquetas</th>
              <th className="px-3 py-2">{metricLabel}</th>
              <th className="px-3 py-2">Respondida</th>
              {showUsage && <th className="px-3 py-2">Usos en exámenes</th>}
              <th className="px-3 py-2" />
            </tr>
          }
        >
          {visibleRows.map((r) => (
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
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {(r.tag_codes ?? []).map((code) => (
                    <span
                      key={code}
                      title={typeLabelOf(code)}
                      className="rounded-md border border-primary/40 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                    >
                      {labelOf(code)}
                    </span>
                  ))}
                </div>
              </td>
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
      {pageSize && !query.isPending && !query.error && rows.length > pageSize && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">
            Mostrando {currentPage * pageSize + 1}–
            {Math.min((currentPage + 1) * pageSize, rows.length)} de {rows.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-xs text-muted-foreground">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage(currentPage + 1)}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      <QuestionDetailDialog questionId={openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </section>
  );
}

