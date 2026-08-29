import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { BrandLockup } from "@/components/BrandLogo";

import {
  provisionFreeLicense,
  signUpCandidate,
  subscribeNewsletterOptIn,
} from "@/services/authService";

interface RegistroSearch {
  plan?: string;
}

export const Route = createFileRoute("/registro")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): RegistroSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Crear cuenta · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Crea tu cuenta gratuita en el simulador PMP en español y descubre por qué fallas, no solo cuánto.",
      },
      { property: "og:title", content: "Crear cuenta · Simulador PMP" },
      { property: "og:description", content: "Regístrate y empieza tu diagnóstico PMP ECO 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const { plan } = Route.useSearch();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [wantsNewsletter, setWantsNewsletter] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) {
      setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const { needsEmailConfirmation } = await signUpCandidate({
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
      });
      // Consentimiento expreso del boletín: nunca bloquea el alta de cuenta.
      if (wantsNewsletter) {
        await subscribeNewsletterOptIn({
          email: email.trim(),
          fullName: fullName.trim() || undefined,
        });
      }
      if (needsEmailConfirmation) {
        setPendingEmail(true);
        return;
      }

      // Plan gratuito real: se aprovisiona al instante (idempotente en el backend).
      try {
        await provisionFreeLicense();
      } catch {
        setWarning(
          "Tu cuenta se ha creado, pero no hemos podido activar el plan gratuito automáticamente. Puedes seguir e intentarlo más tarde o escribirnos.",
        );
      }
      const paidPlan = plan === "basica_3m" || plan === "premium_1m" || plan === "premium_6m";
      navigate({ to: paidPlan ? `/checkout?plan=${plan}` : "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No hemos podido crear tu cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <BrandLockup size="lg" />
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          {pendingEmail ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-7 w-7 text-success" />
              <h1 className="mt-3 text-lg font-semibold">Confirma tu correo</h1>
              <p className="mt-1 text-justify text-sm leading-relaxed text-muted-foreground">
                Te hemos enviado un enlace de confirmación a <strong>{email}</strong>. Cuando lo
                abras podrás iniciar sesión y continuar con tu preparación.
              </p>
              <Link
                to="/login"
                search={plan ? { plan } : {}}
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-center text-lg font-semibold">Crear cuenta</h1>
              <p className="mt-1 text-justify text-sm text-muted-foreground">
                {plan === "basica_3m" || plan === "premium_1m" || plan === "premium_6m"
                  ? "Regístrate para continuar con la contratación de tu licencia."
                  : "Plan gratuito real: práctica ilimitada sin cronómetro y un medio examen de regalo (90 preguntas)."}
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <div>
                  <label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                    Nombre y apellidos
                  </label>
                  <input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                    Contraseña (mínimo 8 caracteres)
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">
                    Repite la contraseña
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-2.5 pt-1">
                  <label className="flex cursor-pointer items-start gap-2.5 text-justify text-xs leading-relaxed text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                    />
                    <span>
                      Acepto los <strong className="font-semibold text-foreground">Términos y Condiciones</strong> y la{" "}
                      <strong className="font-semibold text-foreground">Política de Privacidad</strong>{" "}
                      <span className="text-muted-foreground">(obligatorio)</span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2.5 text-justify text-xs leading-relaxed text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={wantsNewsletter}
                      onChange={(e) => setWantsNewsletter(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                    />
                    <span>
                      Quiero recibir el boletín semanal PMP y novedades del producto{" "}
                      <span className="text-muted-foreground">(opcional)</span>
                    </span>
                  </label>
                </div>

                {warning && (
                  <p className="rounded-lg border border-accent/40 bg-warning-soft p-2.5 text-xs text-accent-foreground">
                    {warning}
                  </p>
                )}

                {error && (
                  <p className="rounded-lg border border-destructive/40 bg-danger-soft p-2.5 text-xs text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Crear cuenta
                </button>

                <div className="space-y-2 pt-1 text-justify text-[11px] leading-relaxed text-muted-foreground">
                  <p>
                    Al crear una cuenta, tratamos tus datos (nombre y correo electrónico) para
                    gestionar tu registro y darte acceso al simulador, en base a la ejecución del
                    contrato de servicio que aceptas. Si marcas la casilla del boletín, además
                    trataremos tu correo para enviarte el boletín semanal y novedades, en base a tu
                    consentimiento expreso — puedes retirarlo cuando quieras desde el enlace de baja
                    en cualquier email o desde tu perfil, sin que afecte a tu cuenta del simulador.
                  </p>
                  <p>
                    <strong className="font-semibold text-foreground">
                      Encargados de tratamiento:
                    </strong>{" "}
                    usamos Supabase (alojamiento y autenticación), Resend (envío de correos y del
                    boletín) y, si te suscribes al boletín, Substack (plataforma de envío del
                    boletín semanal) — todos actúan como encargados de tratamiento bajo nuestras
                    instrucciones, nunca ceden tus datos a terceros con fines propios.
                  </p>
                  <p>
                    <strong className="font-semibold text-foreground">Tus derechos:</strong> puedes
                    ejercer tus derechos de acceso, rectificación, supresión, limitación,
                    portabilidad y oposición en cualquier momento. Consulta los datos del
                    responsable del tratamiento y el canal de contacto en la{" "}
                    <Link
                      to="/politica-de-privacidad"
                      className="font-semibold text-foreground hover:underline"
                    >
                      Política de Privacidad
                    </Link>{" "}
                    y en el{" "}
                    <Link to="/aviso-legal" className="font-semibold text-foreground hover:underline">
                      Aviso Legal
                    </Link>
                    .
                  </p>

                </div>
              </form>


              <p className="mt-4 border-t border-border pt-4 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  search={plan ? { plan } : {}}
                  className="font-semibold text-foreground hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
