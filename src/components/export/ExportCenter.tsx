import { Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MOCK_QUESTIONS } from "@/data/mockData";
import type { ExamHistoryRow } from "@/services/userService";
import { DOMAIN_LABELS, buildCsv, downloadCsv, escapeHtml, openPrintablePdf } from "@/lib/export";
import { cn } from "@/lib/utils";
import type { DomainCode } from "@/types/exam";

const ALL_DOMAINS: DomainCode[] = ["people", "process", "business"];
const today = "30 jul 2026";

export function ExportCenter({ exams: source = [] }: { exams?: ExamHistoryRow[] }) {
  const [selected, setSelected] = useState<DomainCode[]>(ALL_DOMAINS);

  const toggle = (d: DomainCode) =>
    setSelected((prev) => (prev.includes(d) ? prev.filter((v) => v !== d) : [...prev, d]));

  const exams = useMemo(
    () => source.filter((e) => e.domains.some((d) => selected.includes(d))),
    [selected, source],
  );
  const questions = useMemo(
    () => MOCK_QUESTIONS.filter((q) => selected.includes(q.domain)),
    [selected],
  );

  const filterLabel = selected.length
    ? selected.map((d) => DOMAIN_LABELS[d]).join(" · ")
    : "Ningún dominio seleccionado";

  const guard = () => {
    if (!selected.length) {
      toast.error("Selecciona al menos un dominio para exportar.");
      return false;
    }
    return true;
  };

  const exportHistoryCsv = () => {
    if (!guard()) return;
    const csv = buildCsv(
      ["ID", "Fecha", "Modo", "Preguntas", "Duración", "Score global (%)", "Estado", "Dominios", "Score por dominio"],
      exams.map((e) => [
        e.id,
        e.date,
        e.mode,
        e.questions,
        e.duration,
        e.score,
        e.status,
        e.domains.map((d) => DOMAIN_LABELS[d]).join(" | "),
        Object.entries(e.scoreByDomain)
          .filter(([d]) => selected.includes(d as DomainCode))
          .map(([d, v]) => `${DOMAIN_LABELS[d as DomainCode]}: ${v}%`)
          .join(" | "),
      ]),
    );
    downloadCsv("historial-examenes-pmp.csv", csv);
    toast.success(`Historial exportado (${exams.length} exámenes).`);
  };

  const exportExplanationsCsv = () => {
    if (!guard()) return;
    const csv = buildCsv(
      ["ID", "Dominio", "Tarea ECO", "Título de tarea", "Enfoque", "Dificultad", "Pregunta", "Respuesta correcta", "Por qué es correcta", "Distractores", "Referencia"],
      questions.map((q) => [
        q.id,
        DOMAIN_LABELS[q.domain],
        q.taskCode,
        q.taskTitle,
        q.approach,
        q.difficulty,
        q.stem,
        q.correctAnswer.join(", "),
        q.explanation.correct,
        q.explanation.distractors.map((d) => `${d.optionId}: ${d.text}`).join(" || "),
        q.explanation.reference,
      ]),
    );
    downloadCsv("explicaciones-detalladas-pmp.csv", csv);
    toast.success(`Explicaciones exportadas (${questions.length} preguntas).`);
  };

  const exportPdf = () => {
    if (!guard()) return;
    const rows = exams
      .map(
        (e) => `<tr><td>${escapeHtml(e.date)}</td><td>${escapeHtml(e.mode)}</td><td>${e.questions}</td><td>${escapeHtml(e.duration)}</td><td>${e.score}%</td><td>${escapeHtml(e.status)}</td><td>${escapeHtml(
          e.domains.map((d) => DOMAIN_LABELS[d]).join(", "),
        )}</td></tr>`,
      )
      .join("");

    const items = questions
      .map(
        (q, i) => `<div class="item">
  <span class="tag">${escapeHtml(DOMAIN_LABELS[q.domain])}</span>
  <span class="tag">${escapeHtml(q.taskCode)}</span>
  <h3>${i + 1}. ${escapeHtml(q.stem)}</h3>
  <p><strong>Respuesta correcta:</strong> <span class="ok">${escapeHtml(q.correctAnswer.join(", "))}</span></p>
  <p><strong>Por qué es correcta:</strong> ${escapeHtml(q.explanation.correct)}</p>
  ${q.explanation.distractors
    .map((d) => `<p class="ko"><strong>${escapeHtml(d.optionId)}:</strong> ${escapeHtml(d.text)}</p>`)
    .join("")}
  <p class="muted">${escapeHtml(q.explanation.reference)}</p>
</div>`,
      )
      .join("");

    const ok = openPrintablePdf(
      "Informe de rendimiento PMP® · ECO 2026",
      `Generado el ${today} · Filtro de dominios: ${filterLabel}`,
      `<h2>Historial de exámenes (${exams.length})</h2>
<table><thead><tr><th>Fecha</th><th>Modo</th><th>Preguntas</th><th>Duración</th><th>Score</th><th>Estado</th><th>Dominios</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Explicaciones detalladas (${questions.length})</h2>${items}`,
    );
    if (ok) toast.success("Informe listo: guarda como PDF desde el diálogo de impresión.");
    else toast.error("El navegador ha bloqueado la ventana emergente. Permítela e inténtalo de nuevo.");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
          <Download className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Exportar historial y explicaciones</h2>
          <p className="text-xs text-muted-foreground">
            Descarga tus resultados y el razonamiento de cada pregunta filtrando por dominio del ECO.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Dominios
        </span>
        {ALL_DOMAINS.map((d) => {
          const active = selected.includes(d);
          return (
            <button
              key={d}
              onClick={() => toggle(d)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {DOMAIN_LABELS[d]}
            </button>
          );
        })}
      </div>

      <p className="num mt-3 text-xs text-muted-foreground">
        {exams.length} exámenes · {questions.length} explicaciones en la selección actual
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={exportHistoryCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
        >
          <FileSpreadsheet className="h-4 w-4" /> Historial (CSV)
        </button>
        <button
          onClick={exportExplanationsCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
        >
          <FileSpreadsheet className="h-4 w-4" /> Explicaciones (CSV)
        </button>
        <button
          onClick={exportPdf}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <FileText className="h-4 w-4" /> Informe completo (PDF)
        </button>
      </div>
    </section>
  );
}
