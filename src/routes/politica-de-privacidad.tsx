import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";

import { MarketingShell } from "@/components/landing/MarketingShell";

const SITE_URL = "https://pmtech-simulator.lovable.app";
const PAGE_URL = `${SITE_URL}/politica-de-privacidad`;

export const Route = createFileRoute("/politica-de-privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad — PMTech Simulator" },
      {
        name: "description",
        content:
          "Cómo tratamos tus datos personales en PMTech Simulator: finalidad, legitimación, plazos de conservación, derechos y contacto del responsable.",
      },
      { property: "og:title", content: "Política de privacidad — PMTech Simulator" },
      {
        property: "og:description",
        content: "Tratamiento de datos personales, derechos y protección de la privacidad en PMTech Simulator.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Protección de datos
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Política de privacidad
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Información sobre cómo recogemos, usamos y protegemos tus datos personales conforme al RGPD y la normativa
            española.
          </p>
        </div>

        <article className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Responsable del tratamiento</h2>
            <p className="mt-3">
              El responsable del tratamiento de los datos personales recogidos a través de PMTech Simulator es:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Razón social:</strong> [NOMBRE COMPLETO DE LA EMPRESA]
              </li>
              <li>
                <strong className="text-foreground">CIF / NIF:</strong> [NÚMERO DE IDENTIFICACIÓN FISCAL]
              </li>
              <li>
                <strong className="text-foreground">Dirección:</strong> [DIRECCIÓN COMPLETA, CÓDIGO POSTAL, CIUDAD, PROVINCIA, ESPAÑA]
              </li>
              <li>
                <strong className="text-foreground">Correo electrónico:</strong>{" "}
                <a href="mailto:[EMAIL DE PRIVACIDAD]" className="text-primary hover:underline">
                  [EMAIL DE PRIVACIDAD]
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Datos que recogemos</h2>
            <p className="mt-3">
              Recogemos los datos necesarios para prestar el servicio: dirección de correo electrónico, nombre de
              usuario o nombre completo, historial de práctica y exámenes, resultados, progreso por dominio y, en su
              caso, datos de facturación si contratas un plan de pago. También recogemos datos técnicos como dirección
              IP, tipo de navegador y cookies, con la finalidad de mantener la seguridad y mejorar la experiencia.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Finalidad y legitimación</h2>
            <p className="mt-3">
              Tratamos tus datos para: (a) gestionar tu cuenta y prestar el servicio contratado (ejecución del
              contrato); (b) enviarte comunicaciones sobre el servicio, actualizaciones o boletines informativos, solo
              cuando hayas dado tu consentimiento expreso; (c) cumplir con obligaciones legales; y (d) mejorar la
              plataforma mediante análisis estadísticos y de uso, siempre que sea posible de forma anonimizada.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Conservación de los datos</h2>
            <p className="mt-3">
              Conservamos tus datos personales durante el tiempo necesario para cumplir con la finalidad para la que se
              recogieron y para atender posibles responsabilidades legales. Si decides eliminar tu cuenta, tus datos
              personales se bloquearán y/o suprimirán conforme a los plazos legales aplicables, salvo que exista una
              obligación de conservación por imperativo legal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Tus derechos</h2>
            <p className="mt-3">
              Como usuario, tienes derecho a acceder, rectificar, suprimir, limitar el tratamiento, oponerte y solicitar
              la portabilidad de tus datos. También puedes retirar el consentimiento prestado en cualquier momento.
              Para ejercer estos derechos, escríbenos a{" "}
              <a href="mailto:[EMAIL DE PRIVACIDAD]" className="text-primary hover:underline">
                [EMAIL DE PRIVACIDAD]
              </a>{" "}
              adjuntando copia de un documento identificativo. Si consideras que el tratamiento no se ajusta a la
              normativa, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos
              (AEPD).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Seguridad</h2>
            <p className="mt-3">
              Aplicamos medidas técnicas y organizativas orientadas a proteger tus datos contra accesos no autorizados,
              pérdida o alteración. Esto incluye el uso de conexiones cifradas (HTTPS), autenticación segura y control
              de accesos. No obstante, ningún sistema es completamente inexpugnable; te recomendamos usar contraseñas
              robustas y no compartir tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Subcontratistas y transferencias</h2>
            <p className="mt-3">
              Para el alojamiento, autenticación, procesamiento de pagos y comunicaciones podemos recurrir a
              proveedores de confianza. Algunos pueden tener sede fuera del Espacio Económico Europeo; en esos casos,
              adoptamos las garantías previstas en el RGPD, como cláusulas contractuales tipo u otros mecanismos
              reconocidos. Puedes solicitar la lista actualizada de encargados del tratamiento escribiendo a{" "}
              <a href="mailto:[EMAIL DE PRIVACIDAD]" className="text-primary hover:underline">
                [EMAIL DE PRIVACIDAD]
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">8. Menores de edad</h2>
            <p className="mt-3">
              El servicio no está dirigido a menores de 16 años. Si detectamos que se han recogido datos de un menor
              sin el consentimiento correspondiente, procederemos a su eliminación tan pronto como sea posible.
            </p>
          </section>

          <p className="text-xs text-muted-foreground">
            Última actualización: [FECHA DE ACTUALIZACIÓN]. Esta política es contenido editable mantenido por el titular
            de la aplicación y se actualizará conforme a cambios normativos o en el servicio.
          </p>
        </article>
      </section>
    </MarketingShell>
  );
}
