import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { MarketingShell } from "@/components/landing/MarketingShell";

const SITE_URL = "https://toppmsimulator.glacimonto.com";
const PAGE_URL = `${SITE_URL}/terminos-y-condiciones`;

export const Route = createFileRoute("/terminos-y-condiciones")({
  head: () => ({
    meta: [
      { title: "Términos y condiciones — Top PM Simulator" },
      {
        name: "description",
        content:
          "Condiciones de uso, registro, planes, pagos y responsabilidades de Top PM Simulator. Lee estas condiciones antes de usar el servicio.",
      },
      { property: "og:title", content: "Términos y condiciones — Top PM Simulator" },
      {
        property: "og:description",
        content: "Condiciones generales de uso de Top PM Simulator.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: TerminosPage,
});

function TerminosPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> Uso del servicio
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Términos y condiciones de uso
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Al registrarte y usar Top PM Simulator aceptas estas condiciones. Léelas con atención.
          </p>
        </div>

        <article className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Aceptación de las condiciones</h2>
            <p className="mt-3">
              El acceso y uso de Top PM Simulator implica la aceptación expresa de los presentes términos y
              condiciones, así como de nuestra Política de privacidad y Política de cookies. Si no estás de acuerdo, te
              rogamos que no uses el servicio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Registro y cuenta</h2>
            <p className="mt-3">
              Para usar determinadas funciones es necesario crear una cuenta proporcionando información veraz,
              completa y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales y de todas
              las actividades que ocurran bajo tu cuenta. Nos reservamos el derecho a suspender cuentas que utilicen
              datos falsos o que infrinjan estas condiciones.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Descripción del servicio</h2>
            <p className="mt-3">
              Top PM Simulator ofrece un simulador de preguntas, rutas de aprendizaje, analítica de progreso y,
              opcionalmente, formación orientada a la preparación del examen PMP®. El contenido, resultados y
              recomendaciones tienen carácter formativo y orientativo; no sustituyen la preparación oficial ni
              garantizan la aprobación del examen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Planes y pagos</h2>
            <p className="mt-3">
              Ofrecemos un plan gratuito con funciones limitadas y planes de pago con acceso completo. Los precios,
              duraciones y condiciones de cada plan se muestran en la página correspondiente. Los pagos se procesan a
              través de proveedores externos seguros. Las suscripciones se renuevan automáticamente salvo que canceles
              antes de la fecha de renovación. Consulta nuestra política de cancelaciones y reembolsos en{" "}
              <a href="mailto:contacto@glacimonto.com" className="text-primary hover:underline">
                contacto@glacimonto.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Uso prohibido</h2>
            <p className="mt-3">Queda prohibido:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Usar el servicio para fines ilegales o no autorizados.</li>
              <li>Compartir cuentas, credenciales o contenido de pago con terceros.</li>
              <li>Realizar ingeniería inversa, extraer datos masivos o interferir en el funcionamiento de la plataforma.</li>
              <li>Publicar o distribuir contenido ofensivo, discriminatorio o que infrinja derechos de terceros.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Propiedad intelectual y marcas</h2>
            <p className="mt-3">
              Todos los derechos de propiedad intelectual sobre el sitio, el software, las preguntas, las explicaciones
              y los materiales pertenecen al titular o a sus licenciantes. El usuario no adquiere derecho alguno sobre
              ellos más allá del uso personal dentro del servicio contratado.
            </p>
            <p className="mt-3">
              <strong className="text-foreground">Glacimonto</strong> y{" "}
              <strong className="text-foreground">Top PM Simulator</strong> son marcas registradas de
              [NOMBRE COMPLETO DE LA EMPRESA]. PMP® y PMBOK® son marcas registradas del Project Management
              Institute (PMI®)®, sin relación de afiliación ni patrocinio con esta plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Limitación de responsabilidad</h2>
            <p className="mt-3">
              En la medida permitida por la ley, el titular no será responsable de daños indirectos, pérdida de
              beneficios o interrupciones del servicio derivadas de causas ajenas a su control. El uso del simulador
              como preparación para el examen PMP® es decisión del usuario; los resultados del examen oficial
              dependen de múltiples factores ajenos a esta plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">8. Modificaciones y baja</h2>
            <p className="mt-3">
              Podemos actualizar estas condiciones, el servicio o los planes en cualquier momento. Te notificaremos los
              cambios sustanciales por los medios adecuados. Puedes dar de baja tu cuenta en cualquier momento desde tu
              perfil o solicitándolo a{" "}
              <a href="mailto:contacto@glacimonto.com" className="text-primary hover:underline">
                contacto@glacimonto.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">9. Ley aplicable</h2>
            <p className="mt-3">
              Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten
              a los juzgados y tribunales de [CIUDAD DE RESIDENCIA DEL TITULAR], salvo normativa imperativa que
              establezca un foro distinto.
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
