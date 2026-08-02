import { createFileRoute } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

import { MarketingShell } from "@/components/landing/MarketingShell";

const SITE_URL = "https://pmtech-simulator.lovable.app";
const PAGE_URL = `${SITE_URL}/politica-de-cookies`;

export const Route = createFileRoute("/politica-de-cookies")({
  head: () => ({
    meta: [
      { title: "Política de cookies — PMTech Simulator" },
      {
        name: "description",
        content:
          "Información sobre las cookies y tecnologías similares que usamos en PMTech Simulator: tipos, finalidad y cómo gestionarlas.",
      },
      { property: "og:title", content: "Política de cookies — PMTech Simulator" },
      {
        property: "og:description",
        content: "Qué cookies usamos en PMTech Simulator y cómo gestionar tus preferencias.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Cookie className="h-3.5 w-3.5" /> Cookies
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Política de cookies
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Te explicamos qué cookies utilizamos, para qué sirven y cómo puedes gestionarlas.
          </p>
        </div>

        <article className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. ¿Qué son las cookies?</h2>
            <p className="mt-3">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio
              web. Sirven para recordar preferencias, mantener la sesión iniciada, analizar el uso del sitio y ofrecer
              funcionalidades personalizadas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Tipos de cookies que usamos</h2>
            <div className="mt-3 space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">Cookies técnicas o necesarias</h3>
                <p className="mt-1">
                  Son imprescindibles para el funcionamiento del sitio: mantienen tu sesión activa, permiten la
                  autenticación y recuerdan preferencias básicas como el idioma. Sin ellas, algunas funciones no estarían
                  disponibles.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">Cookies de preferencias o funcionalidad</h3>
                <p className="mt-1">
                  Recuerdan elecciones que haces (por ejemplo, recordar que ya has visto un aviso) para ofrecerte una
                  experiencia más fluida.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">Cookies analíticas</h3>
                <p className="mt-1">
                  Nos ayudan a entender cómo se usa la plataforma: páginas visitadas, tiempo de navegación, errores,
                  etc. La información se utiliza de forma agregada y, en la medida de lo posible, anonimizada para
                  mejorar el servicio.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">Cookies de terceros</h3>
                <p className="mt-1">
                  Algunas funciones del sitio pueden utilizar servicios externos (por ejemplo, autenticación, pagos o
                  comunicaciones). Estos terceros pueden instalar cookies propias sujetas a sus propias políticas. Te
                  recomendamos consultarlas directamente.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Cómo gestionar las cookies</h2>
            <p className="mt-3">
              Puedes configurar tu navegador para rechazar, eliminar o avisarte antes de instalar cookies. Ten en cuenta
              que bloquear las cookies técnicas puede afectar al funcionamiento de la plataforma, incluyendo el inicio
              de sesión. A continuación encontrarás enlaces a las instrucciones de los principales navegadores:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Microsoft Edge / Internet Explorer
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Cambios en esta política</h2>
            <p className="mt-3">
              Podemos actualizar esta política para reflejar cambios en las cookies que utilizamos o en la normativa
              aplicable. Te recomendamos revisarla periódicamente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Contacto</h2>
            <p className="mt-3">
              Si tienes dudas sobre el uso de cookies, puedes escribirnos a{" "}
              <a href="mailto:[EMAIL DE PRIVACIDAD]" className="text-primary hover:underline">
                [EMAIL DE PRIVACIDAD]
              </a>.
            </p>
          </section>

          <p className="text-xs text-muted-foreground">
            Última actualización: [FECHA DE ACTUALIZACIÓN]. Esta página es contenido editable mantenido por el titular
            de la aplicación y se actualizará conforme a cambios normativos o en el servicio.
          </p>
        </article>
      </section>
    </MarketingShell>
  );
}
