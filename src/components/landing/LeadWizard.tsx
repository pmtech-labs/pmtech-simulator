import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { submitTrainingLead } from "@/lib/leads.functions";

const CALL_URL = "https://isaaclopezpena.com/contacto/";
const CONTACT_EMAIL = "contacto@glacimonto.com";

const GOALS = [
  {
    value: "35_horas" as const,
    label: "Conseguir las 35 horas y presentarme al examen",
  },
  {
    value: "bootcamp" as const,
    label: "Aprobar cuanto antes con preparación intensiva",
  },
  {
    value: "in_company" as const,
    label: "Certificar a mi equipo (in-company)",
  },
  {
    value: "no_especificado" as const,
    label: "Aún estoy explorando opciones",
  },
];

const STEPS = ["Tú", "Empresa", "Objetivo"];

export function LeadWizard() {
  const submit = useServerFn(submitTrainingLead);
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    goal: "35_horas" as (typeof GOALS)[number]["value"],
  });

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

  const canContinue =
    step === 0
      ? form.fullName.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email)
      : true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const goalLabel = GOALS.find((g) => g.value === form.goal)?.label ?? "";
      await submit({
        data: {
          fullName: form.fullName,
          email: form.email,
          phone: "",
          company: form.company,
          trainingInterest: form.goal,
          message: `Objetivo indicado en la home: ${goalLabel}`,
        },
      });
      setDone(true);
      toast.success("Recibido. Te escribimos en menos de 24 h laborables.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se ha podido enviar tu solicitud.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contacto" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Cuéntanos dónde estás y te decimos por dónde empezar
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Tres pasos de treinta segundos. Sin llamadas comerciales insistentes: te
              respondemos con un diagnóstico honesto de tu situación y las opciones que
              tienen sentido para ti.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Respuesta en menos de 24 h laborables",
                "Te decimos también si no necesitas formación",
                "Opción de llamada de 20 minutos sin compromiso",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 transition-transform duration-300 hover:translate-x-1"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {done ? (
            <div className="rounded-2xl border border-accent/40 bg-card p-8 text-center shadow-panel">
              <CheckCircle2 className="mx-auto h-9 w-9 text-success" />
              <h3 className="mt-3 font-display text-lg font-semibold">
                Gracias, {form.fullName.split(" ")[0]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Hemos recibido tu objetivo. Te escribimos en menos de 24 horas laborables.
                Si prefieres adelantar, puedes agendar la llamada ahora.
              </p>
              <a
                href={CALL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5"
              >
                <CalendarClock className="h-4 w-4" /> Agendar una llamada
              </a>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-6 shadow-panel"
            >
              <div className="flex items-center gap-2">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex flex-1 flex-col gap-1.5">
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i <= step ? "bg-accent" : "bg-border"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold transition-colors duration-300 ${
                        i <= step ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {i + 1}. {label}
                    </span>
                  </div>
                ))}
              </div>

              <div key={step} className="mt-6 animate-fade-in space-y-4">
                {step === 0 && (
                  <>
                    <div>
                      <label htmlFor="wiz-name" className="text-xs font-semibold">
                        Nombre y apellidos *
                      </label>
                      <input
                        id="wiz-name"
                        maxLength={120}
                        value={form.fullName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, fullName: e.target.value }))
                        }
                        className={`mt-1.5 ${inputClass}`}
                        placeholder="Ana García"
                      />
                    </div>
                    <div>
                      <label htmlFor="wiz-email" className="text-xs font-semibold">
                        Email profesional *
                      </label>
                      <input
                        id="wiz-email"
                        type="email"
                        maxLength={255}
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className={`mt-1.5 ${inputClass}`}
                        placeholder="ana@empresa.com"
                      />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <div>
                    <label htmlFor="wiz-company" className="text-xs font-semibold">
                      Empresa (opcional)
                    </label>
                    <input
                      id="wiz-company"
                      maxLength={160}
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      className={`mt-1.5 ${inputClass}`}
                      placeholder="Nombre de tu organización"
                    />
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      Nos ayuda a saber si te interesa una preparación individual o para un
                      equipo completo.
                    </p>
                  </div>
                )}

                {step === 2 && (
                  <fieldset>
                    <legend className="text-xs font-semibold">¿Cuál es tu objetivo?</legend>
                    <div className="mt-2 space-y-2">
                      {GOALS.map((g) => {
                        const active = form.goal === g.value;
                        return (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
                            className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                              active
                                ? "border-accent bg-accent/10 font-semibold"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            {g.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => setStep((s) => s + 1)}
                    className="group inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                      </>
                    ) : (
                      <>
                        Enviar y recibir propuesta <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              <a
                href={CALL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-accent"
              >
                <CalendarClock className="h-4 w-4 text-accent" /> Prefiero agendar una llamada
              </a>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Usaremos tus datos solo para responderte. Sin spam, sin cesión a terceros.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
