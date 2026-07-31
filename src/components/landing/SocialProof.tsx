import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

type ResultFilter = "todos" | "people" | "process" | "business";

type Testimonial = {
  quote: string;
  author: string;
  result: string;
  tags: Exclude<ResultFilter, "todos">[];
};

const FILTERS: { value: ResultFilter; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "people", label: "Personas" },
  { value: "process", label: "Proceso" },
  { value: "business", label: "Entorno de negocio" },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "He aprobado con la máxima calificación en los tres dominios del examen. Quería darte las gracias otra vez, tus consejos me ayudaron mucho a entrar en la mentalidad PMP.",
    author: "C. S.",
    result: "Certificado PMP® · máxima calificación en los 3 dominios",
    tags: ["people", "process", "business"],
  },
  {
    quote:
      "He aprobado el examen del PMP. Ha sido clave sobre todo lo de saber interpretar las preguntas, porque lo que es teoría pura y dura no ha entrado prácticamente nada.",
    author: "R. A.",
    result: "Certificado PMP® · mejora en interpretación de escenarios",
    tags: ["process"],
  },
  {
    quote:
      "Acabo de recibir mi resultado del PMP y lo he aprobado con la calificación más alta en las tres áreas. Las clases fueron fundamentales para la preparación, así como el apoyo en la revisión de mi aplicación.",
    author: "G. B.",
    result: "Certificado PMP® · máxima calificación en los 3 dominios",
    tags: ["people", "process", "business"],
  },
  {
    quote:
      "He aprobado el examen de certificación PMP y tú tienes gran parte de culpa, gracias a las clases y todos esos consejos. Empecé tarde y las vi en diferido, pero aun así fueron súper útiles.",
    author: "M. B.",
    result: "Certificado PMP® · avance rápido en Personas",
    tags: ["people"],
  },
  {
    quote:
      "Al fin he obtenido la certificación PMP. No tengo ninguna duda de que lo recomendaré como un curso riguroso y de alta calidad.",
    author: "R. P.",
    result: "Certificado PMP® · visión de entorno de negocio",
    tags: ["business"],
  },
  {
    quote:
      "Me presenté al examen y me ha llegado el correo diciéndome que había aprobado. Sin los consejos que nos disteis en las clases no sé si podría haber afrontado el examen con las mismas garantías.",
    author: "G. G.",
    result: "Certificado PMP® · gestión del tiempo por secciones",
    tags: ["process", "people"],
  },
];

const COMPANIES = [
  "BBVA",
  "Siemens Gamesa",
  "JCDecaux",
  "ZimVie",
  "Ineco",
  "Canal de Isabel II",
  "Comunidad de Madrid",
  "Siport21",
  "Viamed",
  "Gamelearn",
  "Hedima",
];

export function SocialProof() {
  const [filter, setFilter] = useState<ResultFilter>("todos");
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      filter === "todos"
        ? TESTIMONIALS
        : TESTIMONIALS.filter((t) => t.tags.includes(filter)),
    [filter],
  );

  useEffect(() => {
    setIndex(0);
    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [filter]);

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(next, items.length - 1));
    setIndex(clamped);
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    const closest = children.reduce(
      (best, el, i) =>
        Math.abs(el.offsetLeft - track.offsetLeft - track.scrollLeft) < best.dist
          ? { i, dist: Math.abs(el.offsetLeft - track.offsetLeft - track.scrollLeft) }
          : best,
      { i: 0, dist: Number.POSITIVE_INFINITY },
    );
    setIndex(closest.i);
  }

  return (
    <section id="opiniones" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            Cientos de profesionales certificados
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            No es un producto nuevo sin recorrido
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            El simulador nace del método con el que llevamos más de 10 años preparando el examen
            PMP®. Estas son palabras textuales de alumnos que ya se han certificado con nosotros.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                  active
                    ? "border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_-14px_var(--accent)]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-8">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((t) => (
              <figure
                key={t.author + t.quote.slice(0, 12)}
                className="flex min-w-[85%] snap-start flex-col rounded-2xl border border-border bg-card p-6 shadow-lift transition-all duration-300 hover:-translate-y-1 sm:min-w-[48%] lg:min-w-[31.5%]"
              >
                <Quote className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  «{t.quote}»
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="mt-0.5 text-xs text-success">{t.result}</p>
                </figcaption>
              </figure>
            ))}
            {items.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No hay opiniones para este filtro todavía.
              </p>
            )}
          </div>

          {items.length > 1 && (
            <div className="mt-2 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Opinión anterior"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {items.map((t, i) => (
                  <button
                    key={t.author + i}
                    type="button"
                    aria-label={`Ir a la opinión ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? "w-6 bg-accent" : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Siguiente opinión"
                onClick={() => goTo(index + 1)}
                disabled={index === items.length - 1}
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-14">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Organizaciones que ya han formado a sus equipos con nosotros
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            {COMPANIES.map((name) => (
              <li
                key={name}
                className="rounded-lg border border-border bg-card px-4 py-2 font-display text-sm font-semibold tracking-tight text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
