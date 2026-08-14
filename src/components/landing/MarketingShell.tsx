import { Link } from "@tanstack/react-router";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AuthNavStatus } from "@/components/AuthNavStatus";
import { TryFreeButton } from "@/components/TryFreeButton";
import { HeaderNav, MobileNav } from "@/components/landing/HeaderNav";

/**
 * Cabecera y pie compactos para las landings de SEO.
 * Reutiliza la navegación agrupada de la home (HeaderNav) para que todas las
 * páginas públicas compartan el mismo menú.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="shrink-0 min-w-fit w-max">
              <p className="whitespace-nowrap font-display text-sm font-semibold leading-tight">
                PMTech Simulator
              </p>
              <p className="whitespace-nowrap text-[11px] leading-tight text-muted-foreground">
                ECO 2026 · PMBOK 8
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 xl:flex">
            <HeaderNav onHome={false} />
            <div className="flex items-center gap-3">
              <AuthNavStatus />
              <TryFreeButton />
            </div>
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <TryFreeButton />
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-border"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="max-h-[75vh] overflow-y-auto border-t border-border bg-card px-4 py-4 xl:hidden">
            <MobileNav onHome={false} onNavigate={() => setOpen(false)} />
            <div className="mt-5 w-fit">
              <AuthNavStatus onClick={() => setOpen(false)} />
            </div>
          </div>
        )}
      </header>


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
