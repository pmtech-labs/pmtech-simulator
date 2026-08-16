import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";

import { LandingHeader } from "@/components/landing/LandingHeader";

/**
 * Cabecera y pie compactos para las landings de SEO.
 * Reutiliza la navegación agrupada de la home (HeaderNav) para que todas las
 * páginas públicas compartan el mismo menú.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader onHome={false} />

      <main>{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Inicio
            </Link>
            <Link to="/certificacion-pmp" className="hover:text-foreground">
              Certificación PMP
            </Link>
            <Link to="/examen-pmp" className="hover:text-foreground">
              Examen PMP
            </Link>
            <Link to="/simulador-examen-pmp" className="hover:text-foreground">
              Simulador PMP
            </Link>
            <Link to="/requisitos-pmp" className="hover:text-foreground">
              Requisitos y precio
            </Link>
            <Link to="/curso-pmp-online" className="hover:text-foreground">
              Curso PMP online
            </Link>
            <Link to="/partners" className="hover:text-foreground">
              Partners
            </Link>
            <Link to="/glosario" className="hover:text-foreground">
              Glosario PMP
            </Link>
            <Link to="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link to="/pmbok-8" className="hover:text-foreground">
              PMBOK 7 vs 8
            </Link>
            <Link to="/pmtech-vs-pmi-study-hall" className="hover:text-foreground">
              vs PMI Study Hall
            </Link>
            <Link to="/pmtech-vs-prepcast" className="hover:text-foreground">
              vs PrepCast
            </Link>
          </nav>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
            PMTech Simulator es un producto independiente. No está afiliado, avalado ni
            patrocinado por el Project Management Institute (PMI)®. PMP® y PMBOK® son marcas
            registradas del PMI.
          </p>
        </div>
      </footer>
    </div>
  );
}
