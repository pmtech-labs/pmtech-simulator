import { Linkedin } from "lucide-react";

const STATS = [
  { value: "24+", label: "años dirigiendo proyectos y PMOs" },
  { value: "12+", label: "años formando a profesionales" },
  { value: "6.600+", label: "profesionales nos siguen en LinkedIn" },
  { value: "26", label: "tareas del ECO cubiertas en el simulador" },
];


export function AboutUs() {
  return (
    <section id="sobre-nosotros" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Experiencia real y tecnología puntera detrás del simulador
        </h2>

      </div>

      <div className="mt-12 grid items-start gap-10 sm:grid-cols-[220px_1fr]">
        <div className="mx-auto sm:mx-0">
          <img
            src="/equipo/isaac-lopez-pena.jpeg"
            alt="Isaac López Pena"
            className="h-44 w-44 rounded-2xl object-cover shadow-lift sm:h-52 sm:w-52"
          />
          <div className="mt-4 text-center sm:text-left">
            <p className="font-display text-base font-bold">Isaac López Pena</p>
            <p className="mt-1 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              PMP® · PMO-CP® · PSM® · CSM®
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Liderazgo académico y técnico del equipo</p>
            <a
              href="https://www.linkedin.com/in/isaaclopezpena/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Perfil de LinkedIn de Isaac López Pena"
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0A66C2]/10 px-3 py-1.5 text-xs font-semibold text-[#0A66C2] transition-colors hover:bg-[#0A66C2]/20 sm:justify-start"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
        </div>

        <div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Mi equipo y yo acumulamos más de 24 años dirigiendo proyectos, productos y PMOs, casi
            siempre en tecnología: <strong className="text-foreground">Telefónica, Deutsche Telekom,
            BBVA, Inetum, AYESA</strong> y la Administración General del Estado, combinando enfoques
            predictivos y ágiles según lo que cada organización realmente necesitaba, no según la
            moda del momento.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            En paralelo llevamos más de una década formando a profesionales: damos clase en el
            Executive MBA de <strong className="text-foreground">UNIR</strong> e impartimos Dirección
            de Proyectos en la <strong className="text-foreground">Cámara de Comercio de Madrid</strong>{" "}
            desde 2016, además de EOI, EALDE y Cerem. Entre nosotros sumamos un Máster en Project
            Management por la <strong className="text-foreground">George Washington University</strong>{" "}
            y certificaciones PMP® y PMO-CP® del propio PMI, junto a PSM®, CSM®, SCPO®, KMP®, ITIL®,
            ISO 20000 y BIM®.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Este simulador no nace de un banco de preguntas comprado a terceros. Las preguntas salen
            de situaciones que hemos vivido dirigiendo proyectos reales y de años corrigiendo los
            mismos errores en el aula — y ahora coordinamos proyectos de innovación con IA en el
            Grupo PROEDUCA (UNIR), que es la misma tecnología que sostiene el motor de diagnóstico
            de este simulador. No es un experimento: es la forma en que ya enseñamos, convertida en
            software.
          </p>
        </div>

      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-lift sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <dt className="font-display text-2xl font-bold text-accent sm:text-3xl">{s.value}</dt>
            <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
