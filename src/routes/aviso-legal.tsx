import { createFileRoute } from "@tanstack/react-router";
import { Scale } from "lucide-react";

import { MarketingShell } from "@/components/landing/MarketingShell";

const SITE_URL = "https://pmtech-simulator.lovable.app";
const PAGE_URL = `${SITE_URL}/aviso-legal`;

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      { title: "Aviso legal — PMTech Simulator" },
      {
        name: "description",
        content:
          "Información legal sobre el titular de PMTech Simulator, datos de contacto, propiedad intelectual y legislación aplicable.",
      },
      { property: "og:title", content: "Aviso legal — PMTech Simulator" },
      {
        property: "og:description",
        content: "Información legal y datos del titular de PMTech Simulator.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: AvisoLegalPage,
});

function AvisoLegalPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Scale className="h-3.5 w-3.5" /> Información legal
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Aviso legal
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Esta página recoge la información exigida por la legislación española y europea sobre el titular del sitio.
          </p>
        </div>

        <article className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Titular del sitio</h2>
            <p className="mt-3">
              El presente sitio web, PMTech Simulator, es titularidad de:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Razón social:</strong> [NOMBRE COMPLETO DE LA EMPRESA]
              </li>
              <li>
                <strong className="text-foreground">CIF / NIF:</strong> [NÚMERO DE IDENTIFICACIÓN FISCAL]
              </li>
              <li>
                <strong className="text-foreground">Domicilio social:</strong> [DIRECCIÓN COMPLETA, CÓDIGO POSTAL, CIUDAD, PROVINCIA, ESPAÑA]
              </li>
              <li>
                <strong className="text-foreground">Correo electrónico:</strong>{" "}
                <a href="mailto:contacto@glacimonto.com" className="text-primary hover:underline">
                  contacto@glacimonto.com
                </a>
              </li>
              <li>
                <strong className="text-foreground">Teléfono:</strong> [TELÉFONO DE CONTACTO]
              </li>
              <li>
                <strong className="text-foreground">Inscripción en el Registro Mercantil:</strong> [DATOS DE INSCRIPCIÓN]
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Objeto del sitio</h2>
            <p className="mt-3">
              PMTech Simulator es una plataforma de preparación para el examen de certificación PMP® basada en el
              ECO 2026 y PMBOK® 8. No está afiliada, avalada ni patrocinada por el Project Management Institute
              (PMI)®. PMP® y PMBOK® son marcas registradas de PMI.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Propiedad intelectual</h2>
            <p className="mt-3">
              Los contenidos, diseño, código, textos, imágenes, logotipos y demás elementos del sitio están protegidos
              por derechos de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución,
              comunicación pública o transformación sin autorización expresa del titular, salvo uso personal y privado
              conforme a la normativa aplicable.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Responsabilidad</h2>
            <p className="mt-3">
              El titular pone el máximo empeño en mantener la información actualizada y correcta, pero no garantiza
              la ausencia de errores técnicos o tipográficos. El uso del sitio y de sus contenidos se realiza bajo la
              responsabilidad del usuario. Los resultados, diplomas y métricas del simulador tienen carácter
              orientativo y formativo; no constituyen certificación oficial alguna ni garantía de aprobación en el
              examen PMP®.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Ley aplicable y jurisdicción</h2>
            <p className="mt-3">
              El presente aviso legal se rige por la legislación española y, en su caso, por la normativa europea
              aplicable. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales
              de la ciudad de [CIUDAD DE RESIDENCIA DEL TITULAR], salvo que la normativa aplicable establezca un
              foro imperativo distinto.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Modificaciones</h2>
            <p className="mt-3">
              El titular se reserva el derecho a modificar el presente aviso legal en cualquier momento para adaptarlo
              a novedades legislativas, cambios en la actividad o mejoras en la información prestada. La versión
              vigente será la publicada en esta página con la fecha de actualización correspondiente.
            </p>
          </section>

          <p className="text-xs text-muted-foreground">
            Última actualización: [FECHA DE ACTUALIZACIÓN]. Esta página es contenido editable mantenido por el titular
            de la aplicación y no constituye asesoramiento jurídico.
          </p>
        </article>
      </section>
    </MarketingShell>
  );
}
