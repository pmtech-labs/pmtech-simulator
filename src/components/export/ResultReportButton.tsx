import { FileText } from "lucide-react";
import { toast } from "sonner";

import { exportResultReportPdf, type ResultReportInput } from "@/lib/resultReport";

export function ResultReportButton({
  report,
  className,
}: {
  report: ResultReportInput;
  className?: string;
}) {
  const onClick = () => {
    const ok = exportResultReportPdf(report);
    if (ok) toast.success("Informe listo: guárdalo como PDF desde el diálogo de impresión.");
    else toast.error("El navegador ha bloqueado la ventana emergente. Permítela e inténtalo de nuevo.");
  };

  return (
    <button
      onClick={onClick}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
      }
    >
      <FileText className="h-4 w-4" /> Descargar informe (PDF)
    </button>
  );
}
