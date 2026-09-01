import type { DomainCode } from "@/types/exam";

export const DOMAIN_LABELS: Record<DomainCode, string> = {
  people: "Personas (People)",
  process: "Procesos (Process)",
  business: "Entorno de negocio (Business Environment)",
};

function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsv(headers: string[], rows: (string | number)[][]) {
  return [headers, ...rows].map((row) => row.map(escapeCsv).join(";")).join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM para que Excel interprete correctamente los acentos
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Genera un documento imprimible y abre el diálogo de impresión del navegador,
 * desde el que el usuario puede guardar como PDF.
 */
export function openPrintablePdf(title: string, subtitle: string, bodyHtml: string) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:ui-sans-serif,system-ui,"Segoe UI",Arial,sans-serif;color:#12182b;margin:32px;line-height:1.5}
  h1{font-size:20px;margin:0 0 4px}
  h2{font-size:15px;margin:28px 0 10px;border-bottom:1px solid #d9dee9;padding-bottom:6px}
  h3{font-size:13px;margin:18px 0 6px}
  p,li,td,th{font-size:12px}
  .muted{color:#5b6478}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{border:1px solid #d9dee9;padding:6px 8px;text-align:left;vertical-align:top}
  th{background:#f3f5f9;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  .item{page-break-inside:avoid;border:1px solid #d9dee9;border-radius:8px;padding:12px;margin-bottom:12px}
  .tag{display:inline-block;background:#f3f5f9;border-radius:4px;padding:2px 6px;font-size:10px;margin-right:6px}
  .ok{color:#1a7f52}
  .ko{color:#b3261e}
  footer{margin-top:32px;font-size:10px;color:#7a8395;border-top:1px solid #d9dee9;padding-top:8px}
  @media print{body{margin:16mm}}
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<p class="muted">${escapeHtml(subtitle)}</p>
${bodyHtml}
<footer>Top PM Simulator · Producto independiente, no afiliado al Project Management Institute (PMI®).</footer>
</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
  return true;
}

export { escapeHtml };
