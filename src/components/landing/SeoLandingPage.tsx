import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { Reveal } from "@/components/landing/Reveal";

export interface SeoSection {
  h2: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
}

export interface SeoFaq {
  q: string;
  a: string;
}

export interface RelatedLink {
  to: string;
  label: string;
  description: string;
}

interface SeoLandingPageProps {
  eyebrow: string;
  h1: string;
  intro: string;
  highlights: string[];
  sections: SeoSection[];
  faqs: SeoFaq[];
  related: RelatedLink[];
  ctaTitle: string;
  ctaText: string;
}

export function SeoLandingPage({
  eyebrow,
  h1,
  intro,
  highlights,
  sections,
  faqs,
  related,
  ctaTitle,
  ctaText,
}: SeoLandingPageProps) {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-border bg-primary">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl md:text-5xl">
            {h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/80">
            {intro}
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-primary-foreground/90"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Probar el simulador <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {sections.map((section) => (
          <Reveal key={section.h2}>
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {section.h2}
              </h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-5 space-y-2.5">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        {section.table.headers.map((h) => (
                          <th key={h} className="px-4 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")} className="border-t border-border">
                          {row.map((cell) => (
                            <td key={cell} className="px-4 py-3 text-muted-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </Reveal>
        ))}

        <Reveal>
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Preguntas frecuentes
            </h2>
            <Accordion type="single" collapsible className="mt-4">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-left text-[15px]">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-2xl border border-border bg-secondary/40 p-8 text-center shadow-panel">
            <h2 className="font-display text-xl font-semibold">{ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              {ctaText}
            </p>
            <Link
              to="/registro"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Crear mi cuenta gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-14">
            <h2 className="font-display text-lg font-semibold">Sigue leyendo</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl border border-border p-4 transition-colors hover:border-accent"
                >
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      </article>
    </MarketingShell>
  );
}

export function buildSeoLandingJsonLd({
  url,
  title,
  description,
  faqs,
  breadcrumbName,
}: {
  url: string;
  title: string;
  description: string;
  faqs: SeoFaq[];
  breadcrumbName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        inLanguage: "es",
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: "PMTech Simulator" },
        publisher: { "@type": "Organization", name: "PMTech Simulator" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: "https://pmtech-simulator.lovable.app",
          },
          { "@type": "ListItem", position: 2, name: breadcrumbName, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
