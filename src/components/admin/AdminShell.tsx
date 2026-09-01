import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  Database,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/curriculum", label: "Currículo", icon: GraduationCap },
  { to: "/admin/connectors", label: "Conectores LLM", icon: Boxes },
  { to: "/admin/generate", label: "Generar preguntas", icon: Sparkles },
  { to: "/admin/review", label: "Revisión del banco", icon: Database },
  { to: "/admin/rechazadas", label: "Rechazadas y retiradas", icon: ShieldAlert },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/metricas", label: "Métricas", icon: BarChart3 },
] as const;



export function AdminShell({
  title,
  description,
  email,
  actions,
  children,
}: {
  title: string;
  description?: string;
  email?: string | null;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-muted/40 text-foreground lg:flex">
      <aside className="border-b border-border bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            AD
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">Panel interno</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Simulador PMP®</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {ADMIN_NAV.map((item) => {
            const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">{title}</h1>
            {description && (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {email && <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

export function DataTable({
  head,
  children,
  empty,
}: {
  head: ReactNode;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead className="bg-muted/70 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
          {head}
        </thead>
        <tbody className="divide-y divide-border">
          {empty ? (
            <tr>
              <td colSpan={12} className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between gap-3 pt-3 text-xs text-muted-foreground">
      <span>
        Página {page} de {last} · {total} registros
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-md border border-border px-2.5 py-1 font-medium disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          disabled={page >= last}
          onClick={() => onPage(page + 1)}
          className="rounded-md border border-border px-2.5 py-1 font-medium disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
