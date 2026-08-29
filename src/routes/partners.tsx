import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Handshake,
  Loader2,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

import { MarketingShell } from "@/components/landing/MarketingShell";
import { sendPartnerContact } from "@/services/partnerContactService";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { property: "og:image", content: "https://toppmsimulator.glacimonto.com/og-image.jpg" },
      { name: "twitter:image", content: "https://toppmsimulator.glacimonto.com/og-image.jpg" },
      { title: "Partners · Simulador PMP para centros de formación y empresas" },
      {
        name: "description",
        content:
          "Licencias por volumen del único simulador PMP nativo ECO 2026 / PMBOK 8: contenido adaptativo, practicum interactivo y seguimiento del progreso de tus alumnos. Propuesta en 48 h.",
      },
      { property: "og:title", content: "Partners · Simulador PMP para centros y empresas" },
      {
        property: "og:description",
        content:
          "Mejora la tasa de aprobados de tus alumnos con el simulador PMP nativo ECO 2026. Licencias de 6 meses con descuento por volumen desde 10 unidades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PartnersPage,
});

const DIFERENCIADORES = [
  {
    icon: Sparkles,
    title: "Nativo ECO 2026 / PMBOK 8",
    body: "Construido desde cero sobre el examen vigente desde el 9 de julio de 2026 — no es un banco antiguo remapeado. Tus alumnos practican exactamente lo que se les va a preguntar.",
  },
  {
    icon: Target,
    title: "Motor adaptativo real",
    body: "Mide el dominio de cada alumno tarea a tarea del ECO y prioriza sus áreas débiles. Menos horas de aula perdidas repasando lo que ya dominan.",
  },
  {
    icon: TrendingUp,
    title: "Practicum interactivo, no solo test",
    body: "Casos narrativos, paneles de datos, hotspots y emparejamiento: el juicio situacional que hunde a los candidatos en el examen real.",
  },
];

const BENEFICIOS = [
  {
    icon: BarChart3,
    title: "Datos para tu tutor, no solo para el alumno",
    body: "Ves en qué dominios ECO falla el grupo y puedes ajustar la siguiente sesión con evidencia, no por intuición.",
  },
  {
    icon: ShieldCheck,
    title: "Mejor tasa de aprobados = mejor reputación",
    body: "El simulacro realista es el mayor predictor de aprobado. Súbelo y tus testimonios y renovaciones suben contigo.",
  },
  {
    icon: Rocket,
    title: "Diferencia tu programa en la propuesta comercial",
    body: "Incluir un simulador nativo ECO 2026 en español es un argumento que tu competencia hoy no puede poner en su folleto.",
  },
  {
    icon: Clock,
    title: "Cero carga operativa",
    body: "Nosotros mantenemos el banco, las actualizaciones del estándar y el soporte al alumno. Tú solo repartes las licencias.",
  },
  {
    icon: Users,
    title: "Alta de grupos en minutos",
    body: "Nos pasas el listado de alumnos y activamos las licencias el mismo día, con fechas de inicio y fin que tú decides.",
  },
  {
    icon: Handshake,
    title: "Acuerdo flexible",
    body: "Licencias de 6 meses por convocatoria, marca conjunta y facturación única para tu centro o departamento de RRHH.",
  },
];

const PASOS = [
  {
    n: "01",
    title: "Nos cuentas tu programa",
    body: "Número de alumnos, convocatorias al año y formato (presencial, online o mixto).",
  },
  {
    n: "02",
    title: "Recibes propuesta en 48 h",
    body: "Precio por licencia con descuento por volumen y una demo con acceso completo para tu equipo docente.",
  },
  {
    n: "03",
    title: "Activamos las licencias",
    body: "Alta de alumnos, arranque de la convocatoria y seguimiento del progreso desde el primer día.",
  },
];

const CASOS = [
  {
    icon: GraduationCap,
    title: "Centros de formación y escuelas de negocio",
    body: "Añade el simulador a tu curso de preparación PMP como valor incluido o como upsell con margen.",
  },
  {
    icon: Building2,
    title: "Empresas y departamentos de PMO",
    body: "Certifica a tu equipo interno con un plan de estudio medible y reporting agregado del avance.",
  },
  {
    icon: Users,
    title: "Formadores y consultores independientes",
    body: "Ofrece práctica ilimitada a tus alumnos sin construir ni mantener tu propio banco de preguntas.",
  },
];

const FAQ_PARTNERS = [
  {
    q: "¿Cuál es el mínimo de licencias?",
    a: "Trabajamos desde 10 licencias, el primer tramo de nuestro programa de volumen; a partir de ahí el precio por licencia baja cuanto mayor es el pedido.",
  },
  {
    q: "¿Podemos probarlo antes de contratar?",
    a: "Sí. Damos acceso completo gratuito a tu equipo docente durante la evaluación, sin compromiso.",
  },
  {
    q: "¿Se puede personalizar con nuestra marca?",
    a: "Ofrecemos marca conjunta y comunicaciones a alumnos con tu identidad en los planes de centro.",
  },
  {
    q: "¿Qué pasa si cambia el estándar del PMI?",
    a: "Las actualizaciones de contenido están incluidas en la licencia: mantenemos el banco alineado al ECO vigente.",
  },
];

// Tramos de descuento por volumen: a menor número de licencias, precio más alto
// (89€, techo del tramo de entrada); a mayor volumen, precio más bajo (59€, el
// "desde" real mostrado en la página) -- pero SIEMPRE por encima del precio
// individual (Premium 6 meses, 54,90€), en todos los tramos, sin excepción.
const PRICING_TIERS = [
  { range: "10-49 licencias", price: "89,90", highlight: false },
  { range: "50-199 licencias", price: "69,90", highlight: false },
  { range: "200+ licencias", price: "59,90", highlight: true },
];

function PartnersPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Para centros de formación y empresas
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl">
            Sube la tasa de aprobados de tus alumnos{" "}
            <span className="text-accent">con el simulador PMP que nadie más tiene</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Licencias por volumen del único simulador en español construido nativamente para el
            examen actual (ECO 2026 / PMBOK 8), con motor adaptativo y practicum interactivo real.
            Te preparamos la propuesta en menos de 48 horas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Pedir propuesta para mi centro
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-accent/40"
            >
              Ver precios
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo gratuita para tu equipo docente · Sin permanencia · Facturación única
          </p>
        </div>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: "180", v: "preguntas por simulacro" },
            { k: "48 h", v: "para tu propuesta" },
            { k: "59,90 €", v: "desde, por licencia" },
            { k: "100 %", v: "alineado al ECO 2026" },
          ].map((s) => (
            <div key={s.v} className="rounded-xl border border-border bg-card p-4 text-center">
              <dt className="font-display text-2xl font-bold text-accent">{s.k}</dt>
              <dd className="mt-1 text-[11px] leading-snug text-muted-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Por qué un centro elige esto en vez de un banco de test genérico
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {DIFERENCIADORES.map((d) => (
              <div key={d.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10">
                  <d.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
          Lo que gana tu centro (no solo tu alumno)
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
              <b.icon className="h-5 w-5 text-accent" />
              <h3 className="mt-3 text-sm font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Encaja con tu modelo
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {CASOS.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10">
                  <c.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
          Cómo empezamos
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PASOS.map((p) => (
            <div key={p.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-display text-3xl font-bold text-accent/40">{p.n}</span>
              <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Ya colaboramos con
          </h2>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-14 gap-y-8">
            <img
              src="/partners/unir-logo.svg"
              alt="UNIR — Universidad Internacional de La Rioja"
              className="h-8 w-auto opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-9"
            />
            <img
              src="/partners/camara-madrid-logo.png"
              alt="Cámara de Comercio de Madrid"
              className="h-14 w-auto opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-16"
            />
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Precios por volumen</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Licencias de 6 meses (misma duración que nuestra licencia Premium individual). Desde 59,90
            €/licencia a partir de 200 unidades — cuéntanos cuántas necesitas y te preparamos una
            propuesta cerrada.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.range}
                className={`rounded-2xl border bg-card p-6 text-left ${
                  tier.highlight ? "border-2 border-accent" : "border-border"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {tier.range}
                </p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">{tier.price} €</span>
                  <span className="text-xs text-muted-foreground">/ licencia</span>
                </p>
                {tier.highlight && (
                  <p className="mt-1 text-xs font-semibold text-accent">Mejor precio</p>
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border-2 border-accent bg-card p-8 text-left">
            <p className="text-sm font-medium text-muted-foreground">Todas las licencias incluyen</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                "Banco completo ECO 2026 / PMBOK 8",
                "Simulacros completos de 180 preguntas",
                "Practicum interactivo completo (hotspot, gráficos, casos)",
                "Motor adaptativo y analítica por tarea ECO",
                "6 meses de acceso por licencia",
                "Actualizaciones del estándar incluidas",
                "Soporte al alumno y alta de grupos gestionada",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#contacto"
              className="mt-6 block w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Solicitar propuesta
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Dudas habituales de un partner
          </h2>
          <div className="mt-8 space-y-4">
            {FAQ_PARTNERS.map((f) => (
              <div key={f.q} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-semibold">{f.q}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
          Cuéntanos sobre tu centro o empresa
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Te respondemos en menos de 48 horas laborables con una propuesta a medida.
        </p>
        <ContactForm />
      </section>
    </MarketingShell>
  );
}


function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || !empresa.trim() || !email.trim() || !mensaje.trim()) {
      setError("Rellena nombre, empresa, email y mensaje antes de enviar.");
      return;
    }
    setLoading(true);
    const result = await sendPartnerContact({ nombre, empresa, email, telefono, mensaje, website });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo enviar el mensaje.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
        <p className="mt-3 text-sm font-medium">Mensaje enviado — gracias por escribirnos.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Te contactaremos en menos de 48 horas laborables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-6">
      {/* Honeypot: campo oculto para navegadores humanos, visible solo para bots que rellenan todo. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden="true"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="text-xs font-medium text-muted-foreground">
            Nombre y apellidos
          </label>
          <input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="empresa" className="text-xs font-medium text-muted-foreground">
            Empresa / centro de formación
          </label>
          <input
            id="empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            autoComplete="organization"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="text-xs font-medium text-muted-foreground">
            Teléfono (opcional)
          </label>
          <input
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            autoComplete="tel"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label htmlFor="mensaje" className="text-xs font-medium text-muted-foreground">
          Cuéntanos cuántos alumnos/año y qué necesitas
        </label>
        <textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={4}
          className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        {loading ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
