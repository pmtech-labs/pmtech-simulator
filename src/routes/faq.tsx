import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle } from "lucide-react";

import { MarketingShell } from "@/components/landing/MarketingShell";
import { FAQ_ALL, FAQ_BLOCKS } from "@/data/faq";

const SITE_URL = "https://pmtech-simulator.lovable.app";
const PAGE_URL = `${SITE_URL}/faq`;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes — PMTech Simulator" },
      {
        name: "description",
        content:
          "Resolvemos 15 dudas sobre el simulador PMP (ECO 2026, explicaciones y tipos de error), sobre planes y pagos (plan gratuito, upgrades y duración) y sobre la certificación PMP y el diploma de logro.",
      },
      { property: "og:title", content: "Preguntas frecuentes — PMTech Simulator" },
      {
        property: "og:description",
        content:
          "Todo sobre el simulador, los planes (incluido el plan gratuito) y la certificación PMP, respondido en español.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Preguntas frecuentes — PMTech Simulator" },
      {
        name: "twitter:description",
        content: "Simulador, planes y certificación PMP: 15 preguntas frecuentes respondidas.",
      },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ALL.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" /> Centro de ayuda
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Preguntas frecuentes
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Todo lo que suelen preguntarnos sobre el simulador, los planes (incluido el plan
            gratuito) y la certificación PMP.
          </p>
        </div>

        <nav className="mt-8 flex flex-wrap justify-center gap-2">
          {FAQ_BLOCKS.map((b) => (
            <a
              key={b.id}
              href={`#${b.id}`}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {b.title}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-12">
          {FAQ_BLOCKS.map((block) => (
            <section key={block.id} id={block.id} className="scroll-mt-24">
              <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                {block.title}
              </h2>
              <dl className="mt-5 space-y-4">
                {block.items.map((item) => (
                  <div
                    key={item.id}
                    id={item.id}
                    className="scroll-mt-24 rounded-2xl border border-border bg-card p-5"
                  >
                    <dt className="font-display text-sm font-semibold">{item.q}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-secondary/50 p-6 text-center">
          <p className="font-display text-base font-semibold">¿Te queda alguna duda?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Empieza con el plan gratuito y compruébalo tú mismo — sin cronómetro de prueba.
          </p>
          <TryFreeButton size="lg" className="mt-5" />
        </div>
      </section>
    </MarketingShell>
  );
}
