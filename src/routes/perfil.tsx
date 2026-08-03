import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, CreditCard, Loader2, Mail, Pencil, ShieldCheck, User, X } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  DomainLevelBadge,
  DomainMasteryLegend,
} from "@/components/progress/DomainMasteryLegend";
import { DiplomasSection } from "@/components/profile/DiplomasSection";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DOMAINS } from "@/data/mockData";
import { useCurrentUser } from "@/hooks/useCandidateData";
import { supabase } from "@/integrations/supabase/client";
import { PLANS } from "@/services/checkoutService";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/perfil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Perfil y licencia · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Gestiona tu cuenta, revisa tus estadísticas por dominio ECO y el estado de tu licencia básica o premium.",
      },
      { property: "og:title", content: "Perfil y licencia · Simulador PMP" },
      { property: "og:description", content: "Cuenta, estadísticas por dominio y estado de licencia." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleCheckout = (code: PlanCode) => {
    setLoading(code);
    navigate({ to: "/checkout", search: { plan: code } });
  };

  const startNameEdit = () => {
    setEditedName(user?.name ?? "");
    setNameError(null);
    setIsEditingName(true);
  };

  const cancelNameEdit = () => {
    setIsEditingName(false);
    setEditedName("");
    setNameError(null);
  };

  const saveName = async () => {
    const trimmed = editedName.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (trimmed.length > 100) {
      setNameError("El nombre no puede superar los 100 caracteres.");
      return;
    }
    setIsSavingName(true);
    setNameError(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
    setIsSavingName(false);
    if (error) {
      setNameError("No se ha podido guardar el nombre. Inténtalo de nuevo.");
      return;
    }
    setIsEditingName(false);
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
  };

  if (isLoading || !user) {
    return (
      <AppShell title="Perfil y licencia" subtitle="Cargando tu cuenta…">
        <div className="mx-auto max-w-5xl space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Perfil y licencia" subtitle="Cuenta, estadísticas y suscripción">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Datos de la cuenta</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Nombre</p>
                    {isEditingName ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void saveName();
                          if (e.key === "Escape") cancelNameEdit();
                        }}
                        disabled={isSavingName}
                        className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Editar nombre"
                      />
                    ) : (
                      <p className="truncate text-sm font-medium">{user.name}</p>
                    )}
                  </div>
                  {isEditingName ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void saveName()}
                        disabled={isSavingName}
                        className="rounded-md p-1.5 text-success hover:bg-muted disabled:opacity-50"
                        aria-label="Guardar nombre"
                        title="Guardar"
                      >
                        {isSavingName ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelNameEdit}
                        disabled={isSavingName}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
                        aria-label="Cancelar edición"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startNameEdit}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                      aria-label="Editar nombre"
                      title="Editar nombre"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {nameError && <p className="mt-2 text-xs text-destructive">{nameError}</p>}
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Correo electrónico</p>
                  <p className="truncate text-sm font-medium">{user.email}</p>
                </div>
              </div>
              {user.plan === "free" ? (
                <div className="rounded-xl border border-accent bg-warning-soft/50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-accent-foreground" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-accent-foreground">Plan activo</p>
                      <p className="truncate text-sm font-medium">Plan gratuito</p>
                    </div>
                  </div>
                  {user.freeFullSimUsed && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Ya has usado tu simulacro completo de regalo. La práctica por dominio,
                      lección y acumulativa sigue disponible sin límite.{" "}
                      <Link
                        to="/checkout"
                        search={{ plan: "premium_6m" }}
                        className="font-semibold text-foreground hover:underline"
                      >
                        Mejorar mi plan
                      </Link>
                    </p>
                  )}
                </div>
              ) : user.expiresAt ? (
                <div className="flex items-center gap-3 rounded-xl border border-success bg-success-soft px-3 py-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-success">Licencia activa</p>
                    <p className="truncate text-sm font-medium">
                      {user.planName} · vence el {user.expiresAt}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Sin licencia activa</p>
                    <Link to="/checkout" search={{ plan: "premium_6m" }} className="text-sm font-medium hover:underline">
                      Contratar una licencia
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Estadísticas por dominio</h2>
              <DomainMasteryLegend />
            </div>
            <div className="mt-4 space-y-4">
              {DOMAINS.map((d) => (
                <div key={d.code}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate font-medium">{d.name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="num text-muted-foreground">
                        {user.masteryByDomain[d.code]}%
                      </span>
                      <DomainLevelBadge pct={user.masteryByDomain[d.code]} />
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${user.masteryByDomain[d.code]}%`, background: `var(--${d.token})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="num mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              {user.examsTaken} exámenes · {user.questionsAnswered} preguntas ·{" "}
              {user.hoursTrained} h
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold">Planes disponibles</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {PLANS.map((p) => {
              const active = p.code === user.plan;
              return (
                <div
                  key={p.code}
                  className={cn(
                    "rounded-2xl border bg-card p-5",
                    active ? "border-accent shadow-panel" : "border-border",
                  )}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">Licencia {p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.durationMonths} meses de acceso</p>
                    </div>
                    {active && (
                      <span className="shrink-0 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="num mt-3 font-display text-3xl font-bold">
                    {p.price} € <span className="text-sm font-normal text-muted-foreground">IVA incl.</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li
                        key={f.label}
                        className={cn(
                          "flex items-start gap-2 text-sm",
                          f.included ? "text-foreground" : "text-muted-foreground line-through",
                        )}
                      >
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            f.included ? "text-success" : "text-muted-foreground/50",
                          )}
                        />
                        <span className="min-w-0">{f.label}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(p.code)}
                    disabled={loading !== null}
                    className={cn(
                      "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60",
                      active
                        ? "border border-border bg-card hover:bg-secondary"
                        : "bg-primary text-primary-foreground hover:opacity-90",
                    )}
                  >
                    {loading === p.code ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {active ? "Renovar licencia" : `Contratar ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-4 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            El cobro online todavía no está activo: al continuar verás el resumen del plan y cómo
            activar tu licencia con nuestro equipo.
          </p>
        </section>

        <DiplomasSection userName={user.name} />
      </div>
    </AppShell>
  );
}
