import { useState } from "react";
import { GraduationCap, Loader2, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { submitTrainingLead } from "@/lib/leads.functions";

const INTERESTS = [
  { value: "35_horas", label: "35 horas de formación (requisito PMI)" },
  { value: "bootcamp", label: "Bootcamp intensivo de preparación PMP" },
  { value: "in_company", label: "Formación para mi empresa (in-company)" },
  { value: "no_especificado", label: "Aún no lo tengo claro, quiero asesoramiento" },
] as const;

export function TrainingContactForm() {
  const submit = useServerFn(submitTrainingLead);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    trainingInterest: "35_horas" as (typeof INTERESTS)[number]["value"],
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await submit({ data: form });
      setDone(true);
      toast.success("Solicitud enviada. Te escribimos en menos de 24 h laborables.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se ha podido enviar la solicitud.",
      );
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-card p-8 text-center shadow-panel">
        <GraduationCap className="mx-auto h-9 w-9 text-accent" />
        <h3 className="mt-3 font-display text-lg font-semibold">Solicitud recibida</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Gracias, {form.fullName.split(" ")[0]}. Un formador PMP revisará tu caso y te
          contactará en menos de 24 horas laborables con las opciones y fechas disponibles.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-panel"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="text-xs font-semibold">
            Nombre y apellidos *
          </label>
          <input
            id="lead-name"
            required
            maxLength={120}
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className={`mt-1.5 ${inputClass}`}
            placeholder="Ana García"
          />
        </div>
        <div>
          <label htmlFor="lead-email" className="text-xs font-semibold">
            Email profesional *
          </label>
          <input
            id="lead-email"
            type="email"
            required
            maxLength={255}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={`mt-1.5 ${inputClass}`}
            placeholder="ana@empresa.com"
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className="text-xs font-semibold">
            Teléfono (opcional)
          </label>
          <input
            id="lead-phone"
            maxLength={40}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={`mt-1.5 ${inputClass}`}
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <label htmlFor="lead-company" className="text-xs font-semibold">
            Empresa (opcional)
          </label>
          <input
            id="lead-company"
            maxLength={160}
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            className={`mt-1.5 ${inputClass}`}
            placeholder="Nombre de tu organización"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lead-interest" className="text-xs font-semibold">
            ¿Qué necesitas?
          </label>
          <select
            id="lead-interest"
            value={form.trainingInterest}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                trainingInterest: e.target.value as typeof f.trainingInterest,
              }))
            }
            className={`mt-1.5 ${inputClass}`}
          >
            {INTERESTS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lead-message" className="text-xs font-semibold">
            Cuéntanos tu situación (opcional)
          </label>
          <textarea
            id="lead-message"
            maxLength={1000}
            rows={3}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className={`mt-1.5 ${inputClass}`}
            placeholder="Ej.: llevo 4 años gestionando proyectos, quiero presentarme al examen en otoño."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          <>
            Solicitar información <Send className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Usaremos tus datos solo para responder a esta solicitud. Sin spam, sin cesión a
        terceros.
      </p>
    </form>
  );
}
