import { Award, Building2, GraduationCap, Users } from "lucide-react";

const PILLARS = [
  {
    icon: Building2,
    title: "20+ años dirigiendo proyectos reales",
    description:
      "Dirección de proyectos en Telefónica, Deutsche Telekom, BBVA, el Ministerio de Medio Ambiente y el Ministerio de Economía, combinando enfoques predictivos y ágiles. Las preguntas del simulador salen de situaciones que hemos vivido, no de un generador genérico.",
  },
  {
    icon: GraduationCap,
    title: "10+ años formando a profesionales",
    description:
      "Formación en la Cámara de Comercio de Madrid, EOI, Cerem International Business School, EALDE Business School y UNIR. Sabemos dónde se atasca la gente porque lo hemos corregido cientos de veces en clase.",
  },
  {
    icon: Award,
    title: "Certificados por quienes escriben el estándar",
    description:
      "PMP® y PMO-CP® por el Project Management Institute, PMO Practitioner por IPMA & APM, PSM® por Scrum.org, CSM® por Scrum Alliance, SCPO® y KMP® por Kanban University. Máster en Project Management por la George Washington University.",
  },
  {
    icon: Users,
    title: "Consultoría en organizaciones, no solo aulas",
    description:
      "Acompañamos a empresas en la implantación de su PMO y en la adopción de agilidad. Esa práctica es la que mantiene el banco de preguntas pegado a la realidad de los proyectos, no solo al manual.",
  },
];

export function AboutUs() {
  return (
    <section id="sobre-nosotros" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Quiénes estamos detrás del simulador
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          No somos una plataforma de tests anónima. Somos un equipo de dirección de proyectos y
          formación con más de dos décadas de experiencia gestionando proyectos y una década
          preparando a profesionales para el examen PMP®.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-lift">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
              <p.icon className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
        Por eso el simulador no se limita a puntuar: diagnostica el razonamiento. Es la traducción
        en software del método con el que llevamos años certificando a nuestros alumnos.
      </p>
    </section>
  );
}
