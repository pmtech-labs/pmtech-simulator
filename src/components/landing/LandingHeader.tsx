import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { BrandMark } from "@/components/BrandLogo";
import { AuthNavStatus } from "@/components/AuthNavStatus";
import { TryFreeButton } from "@/components/TryFreeButton";
import { HeaderNav, MobileNav } from "@/components/landing/HeaderNav";

/**
 * Cabecera unificada para la home y las landings de marketing.
 * Garantiza el mismo padding, max-width y comportamiento responsive.
 */
export function LandingHeader({ onHome = false }: { onHome?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-8 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 lg:mr-4">
          <BrandMark className="h-9 w-9" />
          <div className="shrink-0 min-w-fit w-max">
            <p className="whitespace-nowrap font-display text-sm font-semibold leading-tight">
              Top PM Simulator
            </p>
            <p className="whitespace-nowrap text-[11px] leading-tight text-muted-foreground">
              por Glacimonto · ECO 2026
            </p>
          </div>
        </Link>



        <div className="hidden items-center gap-6 xl:flex">
          <HeaderNav onHome={onHome} />
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
          <MobileNav onHome={onHome} onNavigate={() => setOpen(false)} />
          <div className="mt-5 w-fit">
            <AuthNavStatus onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
