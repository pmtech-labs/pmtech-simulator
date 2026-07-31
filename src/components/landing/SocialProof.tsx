import { Quote, Star } from "lucide-react";

type Testimonial = {
  quote: string;
  author: string;
  result: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "He aprobado con AT/AT/AT. Quería darte las gracias otra vez, tus consejos me ayudaron mucho a entrar en la mentalidad PMP.",
    author: "C. S.",
    result: "Above Target en los 3 dominios",
  },
  {
    quote:
      "He aprobado el examen del PMP. Ha sido clave sobre todo lo de saber interpretar las preguntas, porque lo que es teoría pura y dura no ha entrado prácticamente nada.",
    author: "R. A.",
    result: "Certificado PMP®",
  },
  {
    quote:
      "Acabo de recibir mi resultado del PMP y lo he aprobado con Above Target en las tres áreas. Las clases fueron fundamentales para la preparación, así como el apoyo en la revisión de mi aplicación.",
    author: "G. B.",
    result: "Above Target en los 3 dominios",
  },
  {
    quote:
      "He aprobado el examen de certificación PMP y tú tienes gran parte de culpa, gracias a las clases y todos esos consejos. Empecé tarde y las vi en diferido, pero aun así fueron súper útiles.",
    author: "M. B.",
    result: "Certificado PMP®",
  },
  {
    quote:
      "Al fin he obtenido la certificación PMP. No tengo ninguna duda de que lo recomendaré como un curso riguroso y de alta calidad.",
    author: "R. P.",
    result: "Certificado PMP®",
  },
  {
    quote:
      "Me presenté al examen y me ha llegado el correo diciéndome que había aprobado. Sin los consejos que nos disteis en las clases no sé si podría haber afrontado el examen con las mismas garantías.",
    author: "G. G.",
    result: "Certificado PMP®",
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.author + t.quote.slice(0, 12)}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-lift"
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
        </div>

        <div className="mt-14">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Organizaciones que ya han formado a sus equipos con nosotros
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            {COMPANIES.map((name) => (
              <li
                key={name}
                className="rounded-lg border border-border bg-card px-4 py-2 font-display text-sm font-semibold tracking-tight text-muted-foreground"
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
