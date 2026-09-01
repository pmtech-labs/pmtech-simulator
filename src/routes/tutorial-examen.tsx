import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, ListChecks, Timer } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { FULL_SIM_SECTIONS_NOTE } from "@/lib/examCopy";

const STEPS = [
  'El cronómetro empieza al hacer clic en "Comenzar".',
  "Puedes revisar y cambiar tus respuestas cuantas veces quieras mientras el examen esté activo.",
  "Al agotarse el tiempo, el examen se entrega automáticamente.",
  'Puedes marcar cualquier pregunta "para revisión" sin que eso reste puntos.',
  "Antes de entregar, verás una pantalla con el resumen de preguntas respondidas, en blanco y marcadas para revisión.",
  "En preguntas con varias respuestas correctas, debes marcar TODAS las correctas — marcar solo algunas cuenta como fallo, igual que en el examen real de PMI®.",
  "Al entregar, verás tu resultado, qué respondiste bien y mal, y la explicación de cada pregunta.",
];

export const Route = createFileRoute("/tutorial-examen")({
  head: () => ({
    meta: [
      { title: "Tutorial de examen · Cómo funciona el simulacro PMP®" },
      {
        name: "description",
        content:
          "Cronómetro, secciones con descansos, preguntas marcadas para revisión y entrega: así funciona el simulacro PMP® de Top PM Simulator antes de empezar.",
      },
      { property: "og:title", content: "Tutorial de examen · Top PM Simulator" },
      {
        property: "og:description",
        content: "Cómo funciona el simulacro: cronómetro, secciones, marcado y entrega.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: () => (
    <RequireAuth>
      <ExamTutorialPage />
    </RequireAuth>
  ),
});

function ExamTutorialPage() {
  return (
    <AppShell title="Tutorial de examen" subtitle="Cómo funciona el simulacro">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-xl font-bold">Cómo funciona el simulacro</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed">
            {STEPS.map((s) => (
              <li key={s} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Secciones y descansos</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {FULL_SIM_SECTIONS_NOTE}
          </p>
        </section>

        <p className="flex items-start gap-2 rounded-2xl border border-accent bg-warning-soft p-4 text-xs leading-relaxed text-accent-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Ten en cuenta: PMI® no publica una nota de corte oficial para el examen real — usa bandas
          de desempeño por dominio, no un porcentaje público. Tu resultado aquí es una estimación
          razonada de tu preparación, no una garantía.
        </p>

        <p className="text-xs text-muted-foreground">
          ¿Aún no has leído las{" "}
          <Link
            to="/instrucciones"
            className="font-semibold text-primary underline underline-offset-2"
          >
            instrucciones de uso
          </Link>
          ?
        </p>
      </div>
    </AppShell>
  );
}
