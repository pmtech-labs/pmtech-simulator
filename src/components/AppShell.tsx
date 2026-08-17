import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Dumbbell,

  GraduationCap,
  History,
  LayoutDashboard,
  Menu,
  PlayCircle,
  Route as RouteIcon,
  ShieldCheck,
  Target,
  UserCog,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useCandidateData";
import { signOutCandidate } from "@/services/authService";
import { clearExamProgress, describeProgress, loadExamProgress } from "@/lib/examResume";
import { FULL_SIM_SECTIONS_NOTE } from "@/lib/examCopy";
import { HelpLinks } from "@/components/support/HelpLinks";
import { cn } from "@/lib/utils";

import { ChatbotWidget } from "@/components/support/ChatbotWidget";
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
  { to: "/examen", label: "Simulación completa", icon: Target },
  { to: "/practica", label: "Prácticas parciales", icon: Dumbbell },
  { to: "/historial", label: "Historial", icon: History },
  { to: "/progreso", label: "Mi progreso", icon: BarChart3 },
  { to: "/glosario", label: "Glosario PMP", icon: BookMarked },
] as const;

/** Enlaces de soporte/cuenta: van al pie del sidebar, separados del estudio diario. */
const SECONDARY_NAV = [
  { to: "/instrucciones", label: "Instrucciones", icon: BookOpen },
  { to: "/perfil", label: "Perfil y licencia", icon: UserCog },
] as const;




/** Permite a cualquier vista dentro de AppShell abrir el aviso previo a la simulación. */
const ExamStartContext = createContext<(() => void) | null>(null);

/** Devuelve la función que abre el popup de aviso de simulación (null fuera de AppShell). */
export function useExamStartPrompt() {
  return useContext(ExamStartContext);
}

function NavLinks({
  onNavigate,
  onExamClick,
  items = NAV,
}: {
  onNavigate?: () => void;
  onExamClick?: () => void;
  items?: readonly { to: string; label: string; icon: typeof LayoutDashboard }[];
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {

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

function SidebarInner({
  onNavigate,
  onExamClick,
  resume,
  onResume,
}: {
  onNavigate?: () => void;
  onExamClick?: () => void;
  resume?: ReturnType<typeof describeProgress> | null;
  onResume?: () => void;
}) {
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

      <NavLinks onNavigate={onNavigate} onExamClick={onExamClick} />

      {resume && (
        <button
          onClick={onResume}
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-primary/10 px-3 py-2 text-left text-xs font-semibold text-sidebar-accent-foreground transition-colors hover:bg-sidebar-primary/20"
        >
          <PlayCircle className="h-4 w-4 shrink-0 text-sidebar-primary" />
          <span className="min-w-0">
            <span className="block truncate">Reanudar simulación</span>
            <span className="block truncate text-[11px] font-normal text-sidebar-foreground/60">
              {resume.answered} de {resume.total} respondidas
            </span>
          </span>
        </button>
      )}

      <div className="mt-auto space-y-3">
        <div className="border-t border-sidebar-border pt-3">
          <NavLinks onNavigate={onNavigate} items={SECONDARY_NAV} />
        </div>

        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
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
  const [showExamConfirm, setShowExamConfirm] = useState(false);
  const [inProgress, setInProgress] = useState<ReturnType<typeof describeProgress> | null>(null);
  const [saved, setSaved] = useState<ReturnType<typeof describeProgress> | null>(null);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Detecta si hay una simulación en curso para mostrar el acceso rápido.
  useEffect(() => {
    const refresh = () => {
      const progress = loadExamProgress();
      setSaved(progress ? describeProgress(progress) : null);
    };
    refresh();
    window.addEventListener("focus", refresh);
    const t = setInterval(refresh, 15000);
    return () => {
      window.removeEventListener("focus", refresh);
      clearInterval(t);
    };
  }, [pathname]);

  const openExamConfirm = () => {
    const progress = loadExamProgress();
    setInProgress(progress ? describeProgress(progress) : null);
    setShowExamConfirm(true);
  };

  const startExam = (resume: boolean) => {
    setShowExamConfirm(false);
    setOpen(false);
    if (!resume) clearExamProgress();
    void navigate({ to: "/examen", search: resume ? { reanudar: "1" } : {} });
  };

  const resumeNow = () => {
    setOpen(false);
    void navigate({ to: "/examen", search: { reanudar: "1" } });
  };

  const showResume = Boolean(saved) && pathname !== "/examen";
  // Plan gratuito: el simulacro completo (180 preguntas) NUNCA está incluido, ni una vez --
  // no es "ya lo usaste", es que este plan no lo incluye. El regalo real de una sola vez
  // es el medio examen (90 preguntas), que tiene su propio flujo dedicado (StartHalfSimCard
  // en dashboard.tsx) y no pasa por este diálogo genérico de "simulación completa".
  const freeSimBlocked = user?.plan === "free" && !inProgress;
  // Planes de pago con límite (1 y 3 meses): una vez agotado el cupo, mismo tratamiento
  // que el plan gratuito bloqueado pero con mensaje distinto -- aquí sí había cupo, se
  // consumió, y se empuja hacia el plan de 6 meses (simulacros ilimitados).
  const paidLimitReached =
    user?.plan !== "free" && user?.fullSimLimit != null && (user?.fullSimUsed ?? 0) >= user.fullSimLimit && !inProgress;
  const simBlocked = freeSimBlocked || paidLimitReached;

  return (
    <ExamStartContext.Provider value={openExamConfirm}>
      <div className="flex min-h-screen w-full bg-background">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border lg:block">
          <SidebarInner
            onExamClick={openExamConfirm}
            resume={showResume ? saved : null}
            onResume={resumeNow}
          />
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 shadow-panel">
              <SidebarInner
                onNavigate={() => setOpen(false)}
                onExamClick={openExamConfirm}
                resume={showResume ? saved : null}
                onResume={resumeNow}
              />
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
                {showResume && (
                  <Button size="sm" onClick={resumeNow} className="gap-1.5 whitespace-nowrap">
                    <PlayCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Reanudar simulación</span>
                    <span className="sm:hidden">Reanudar</span>
                  </Button>
                )}
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

      <Dialog open={showExamConfirm} onOpenChange={setShowExamConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {freeSimBlocked
                ? "El simulacro completo no está en tu plan"
                : paidLimitReached
                  ? "Ya usaste tus simulacros completos"
                  : inProgress
                    ? "Tienes una simulación en curso"
                    : "¿Iniciar simulación de examen?"}
            </DialogTitle>
            <DialogDescription>
              {freeSimBlocked
                ? "El plan gratuito no incluye el simulacro completo (180 preguntas). Tu regalo es un medio examen (90 preguntas) desde el panel, y la práctica por dominio, lección y acumulativa sigue disponible sin límite. Mejora tu plan para acceder a simulacros completos ilimitados."
                : paidLimitReached
                  ? `Ya usaste los ${user?.fullSimLimit} simulacros completos incluidos en tu plan actual. Pasa al plan de 6 meses para simulacros ilimitados.`
                  : inProgress
                    ? `Dejaste sin terminar “${inProgress.label}” con ${inProgress.answered} de ${inProgress.total} preguntas respondidas. Puedes retomarla donde la dejaste o empezar una nueva desde cero.`
                    : "Vas a comenzar una sesión de simulación PMP con tiempo limitado. Asegúrate de tener disponibilidad antes de empezar."}
            </DialogDescription>
          </DialogHeader>
          {!simBlocked && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              <p>{FULL_SIM_SECTIONS_NOTE}</p>
              <HelpLinks onNavigate={() => setShowExamConfirm(false)} />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">

            <Button variant="outline" onClick={() => setShowExamConfirm(false)}>
              Cancelar
            </Button>
            {simBlocked ? (
              <Button asChild>
                <Link to="/checkout" search={{ plan: "premium_6m" }} onClick={() => setShowExamConfirm(false)}>
                  Mejorar mi plan
                </Link>
              </Button>
            ) : (
              <>
                {inProgress && (
                  <Button variant="outline" onClick={() => startExam(false)}>
                    Empezar de cero
                  </Button>
                )}
                <Button onClick={() => startExam(Boolean(inProgress))}>
                  {inProgress ? "Reanudar simulación" : "Comenzar simulación"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChatbotWidget />
    </ExamStartContext.Provider>

  );
}
