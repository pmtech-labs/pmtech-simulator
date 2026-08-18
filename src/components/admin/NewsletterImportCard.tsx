import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { importNewsletterCsv, type ImportResult } from "@/lib/newsletterImport.functions";

/** Divide una línea CSV respetando comillas dobles. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else quoted = !quoted;
    } else if ((char === "," || char === ";") && !quoted) {
      out.push(current);
      current = "";
    } else current += char;
  }
  out.push(current);
  return out.map((v) => v.trim());
}

type ParsedRow = {
  email: string;
  fullName?: string | null;
  status: "subscribed" | "unsubscribed";
  createdAt?: string | null;
};

function parseCsv(text: string): ParsedRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/^"|"$/g, ""));
  const idx = (...names: string[]) => headers.findIndex((h) => names.includes(h));

  const iEmail = idx("email", "email_address", "correo");
  const iName = idx("name", "full_name", "nombre");
  const iActive = idx("active_subscription", "active", "subscribed");
  const iCreated = idx("created_at", "subscribed_at", "fecha");
  if (iEmail === -1) return [];

  const rows: ParsedRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line).map((c) => c.replace(/^"|"$/g, ""));
    const email = (cells[iEmail] ?? "").toLowerCase();
    if (!email || !email.includes("@")) continue;
    const activeRaw = iActive !== -1 ? (cells[iActive] ?? "").toLowerCase() : "true";
    const active = !["false", "0", "no", "unsubscribed"].includes(activeRaw);
    rows.push({
      email,
      fullName: iName !== -1 ? cells[iName] || null : null,
      status: active ? "subscribed" : "unsubscribed",
      createdAt: iCreated !== -1 ? cells[iCreated] || null : null,
    });
  }
  return rows;
}

/** Importa el CSV exportado desde Substack y lo mergea por email en la base de datos. */
export function NewsletterImportCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const rows = parseCsv(await file.text());
      if (rows.length === 0) {
        setError("El CSV no contiene una columna 'email' válida o está vacío.");
        return;
      }
      const res = await importNewsletterCsv({ data: { rows } });
      setResult(res);
      await queryClient.invalidateQueries({ queryKey: ["admin", "newsletter-stats"] });
    } catch {
      setError("No se ha podido importar el CSV. Revisa el archivo e inténtalo de nuevo.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Boletín · Importar suscriptores de Substack</h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Exporta tu lista en Substack (Settings → Subscribers → Export) y súbela aquí. Se hace
          merge por email: se dan de alta los nuevos, se actualizan los existentes y se marcan como
          baja los que ya no están activos.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Importar CSV de Substack
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {result && (
        <p className="mt-2 text-xs text-muted-foreground">
          Importados {result.received} registros · {result.inserted} nuevos · {result.updated}{" "}
          actualizados · {result.unsubscribed} bajas.
        </p>
      )}
    </section>
  );
}
