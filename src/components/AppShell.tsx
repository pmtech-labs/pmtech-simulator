import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Dumbbell,

  GraduationCap,
  History,
  LayoutDashboard,
  Menu,
  Route as RouteIcon,
  ShieldCheck,
  Target,
  UserCog,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useCandidateData";
import { signOutCandidate } from "@/services/authService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV = [
  { to: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { to: "/aprendizaje", label: "Ruta de aprendizaje", icon: RouteIcon },
  { to: "/examen", label: "Simulación", icon: Target },
  { to: "/practica", label: "Práctica por dominios", icon: Dumbbell },
  { to: "/historial", label: "Historial", icon: History },
  { to: "/progreso", label: "Mi progreso", icon: BarChart3 },
  { to: "/perfil", label: "Perfil y licencia", icon: UserCog },
] as const;


function NavLinks({
  onNavigate,
  onExamClick,
}: {
  onNavigate?: () => void;
  onExamClick?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        const isExam = item.to === "/examen";
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={(e) => {
              if (isExam) {
                e.preventDefault();
                onExamClick?.();
                return;
              }
              onNavigate?.();
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const { data: user } = useCurrentUser();
  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4">
      <div className="flex items-center gap-2.5 px-1">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-sidebar-accent-foreground">
            PMTech Simulator
          </p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">ECO 2026 · PMBOK 8</p>
        </div>
      </div>

      <NavLinks onNavigate={onNavigate} />

      <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
        <div className="flex items-center gap-2 text-sidebar-accent-foreground">
          <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
          <span className="text-xs font-semibold">{user?.planName ?? "Cargando…"}</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/60">
          {user?.expiresAt
            ? `${user.monthsRemaining} meses restantes · vence el ${user.expiresAt}`
            : "Sin licencia activa"}
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: user } = useCurrentUser();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border lg:block">
        <SidebarInner />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 shadow-panel">
            <SidebarInner onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {actions}
              <div className="hidden items-center gap-2 rounded-full border border-border bg-warning-soft px-3 py-1 md:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-foreground" />
                <span className="text-[11px] font-semibold text-accent-foreground">
                  {user?.planName ?? "Cargando…"}
                  {user?.expiresAt ? ` · ${user.monthsRemaining} meses restantes` : ""}
                </span>
              </div>
              <button
                onClick={() => void signOutCandidate()}
                className="hidden rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Cerrar sesión
              </button>
              <Link
                to="/perfil"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
              >
                {user?.initials ?? "··"}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-border px-4 py-4 text-[11px] leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
          PMTech Simulator es un producto independiente. No está afiliado, avalado ni patrocinado
          por el Project Management Institute (PMI)®. PMP® y PMBOK® son marcas registradas del PMI.
        </footer>
      </div>
    </div>
  );
}
