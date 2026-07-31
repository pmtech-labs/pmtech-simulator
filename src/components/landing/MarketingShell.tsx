import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Cabecera y pie compactos para las landings de SEO.
 * Reutiliza el lenguaje visual de la home sin duplicar su navegación por anclas.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
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

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden whitespace-nowrap text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-3 py-2 text-[13px] font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Empezar ahora <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
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
            <Link to="/pmbok-8" className="hover:text-foreground">
              PMBOK 7 vs 8
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
