import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Exporta los suscriptores nuevos desde la última exportación (CSV) para
 * importarlos manualmente en Substack antes del envío semanal.
 */
export function NewsletterExportCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export_newsletter_subscribers`,
        { headers: { Authorization: `Bearer ${session?.access_token ?? ""}` } },
      );
      if (!res.ok) throw new Error("export_failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nuevos_suscriptores_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("No se ha podido generar la exportación. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Boletín</h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Descarga los nuevos suscriptores desde la última exportación e impórtalos en Substack
          (Settings → Subscribers → Import) antes de enviar el boletín semanal.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Exportar nuevos suscriptores (CSV)
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  );
}
