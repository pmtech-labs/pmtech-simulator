import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Flag, Info, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/instrucciones")({
  head: () => ({
    meta: [
      { title: "Instrucciones de uso · Top PM Simulator PMP®" },
      {
        name: "description",
        content:
          "Cómo aprovechar el simulador PMP® de Top PM Simulator: plan de estudio recomendado, uso del contenido de tu licencia y cómo reportar problemas en una pregunta.",
      },
      { property: "og:title", content: "Instrucciones de uso · Top PM Simulator" },
      {
        property: "og:description",
        content: "Plan de estudio recomendado y normas de uso del simulador PMP® calibrado al ECO 2026.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: () => (
    <RequireAuth>
      <InstructionsPage />
    </RequireAuth>
  ),
});

function InstructionsPage() {
  return (
    <AppShell
      title="Instrucciones"
      subtitle="Cómo sacar el máximo partido al simulador"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-xl font-bold">Bienvenido a Top PM Simulator</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Aquí vas a practicar con preguntas situacionales en español para preparar tu examen
            PMP®, calibradas al ECO 2026 vigente desde julio de 2026.
          </p>

          <h3 className="mt-6 text-sm font-semibold">Plan de estudio recomendado:</h3>
          <ol className="mt-3 space-y-3 text-sm leading-relaxed">
            {[
              "Lee la Guía del PMBOK® (8ª edición) y la guía práctica ágil de PMI®.",
              "Recorre tu Ruta de Aprendizaje Top PM Simulator, lección a lección, practicando cada una.",
              "Resuelve exámenes por dominio (Personas / Proceso / Entorno de Negocio) para reforzar tus puntos débiles según tu diagnóstico de errores.",
              "Haz un simulacro completo en condiciones reales (180 preguntas, 240 minutos, 3 secciones) para acostumbrarte al formato real del examen.",
              "Repite práctica dirigida a los tipos de error que más se repiten en tu historial.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-sm leading-relaxed">
            No memorices las respuestas — el objetivo es entrenar tu razonamiento, no reconocer
            preguntas repetidas.
          </p>

          <p className="mt-3 text-sm leading-relaxed">
            ¿Dudas con la terminología?{" "}
            <Link to="/glosario" className="font-medium text-primary hover:underline">
              Consulta el Glosario PMP®
            </Link>{" "}
            con definiciones breves de los términos predictivos, ágiles y generales.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Uso del contenido</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Las preguntas son para tu uso personal como parte de tu licencia. No está permitido
            compartir, distribuir ni revender el contenido a terceros.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">¿Encontraste un problema en una pregunta?</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Usa el botón 🚩 junto a la pregunta para reportarlo directamente a nuestro equipo de
            revisión.
          </p>
        </section>

        <p className="flex items-start gap-2 rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            ¿Es tu primer simulacro? Revisa antes el{" "}
            <Link
              to="/tutorial-examen"
              className="font-semibold text-primary underline underline-offset-2"
            >
              tutorial de examen
            </Link>{" "}
            para conocer el funcionamiento del cronómetro, las secciones y la entrega.
          </span>
        </p>
      </div>
    </AppShell>
  );
}
