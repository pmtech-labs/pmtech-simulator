import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell, DataTable, Pager } from "@/components/admin/AdminShell";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  createConnector,
  deactivateConnector,
  listConnectors,
  type ConnectorProvider,
} from "@/services/adminService";

export const Route = createFileRoute("/admin/connectors")({
  component: ConnectorsPage,
});

const PROVIDERS: { value: ConnectorProvider; label: string }[] = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "openai_compatible", label: "OpenAI-compatible" },
  { value: "google", label: "Google" },
];

const PAGE_SIZE = 20;

function ConnectorsPage() {
  const email = useAdminEmail();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const connectors = useQuery({
    queryKey: ["admin-connectors", page],
    queryFn: () => listConnectors(page, PAGE_SIZE),
  });

  const deactivate = useMutation({
    mutationFn: deactivateConnector,
    onSuccess: () => {
      toast.success("Conector desactivado");
      qc.invalidateQueries({ queryKey: ["admin-connectors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = connectors.data?.rows ?? [];

  return (
    <AdminShell
      title="Conectores LLM"
      description="La API key se guarda en Vault y nunca se devuelve al frontend"
      email={email}
      actions={
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Nuevo conector
        </button>
      }
    >
      {connectors.error ? (
        <p className="text-sm text-destructive">
          No se han podido cargar los conectores: {(connectors.error as Error).message}
        </p>
      ) : connectors.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <DataTable
            empty={rows.length === 0}
            head={
              <tr>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Proveedor</th>
                <th className="px-3 py-2">Modelo</th>
                <th className="px-3 py-2">URL base</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Creado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            }
          >
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{c.provider}</td>
                <td className="num px-3 py-2 text-muted-foreground">{c.model_id}</td>
                <td className="px-3 py-2 text-muted-foreground">{c.api_base_url ?? "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      c.is_active
                        ? "rounded-md bg-success-soft px-2 py-0.5 text-xs font-semibold text-success"
                        : "rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {c.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="num px-3 py-2 text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("es-ES")}
                </td>
                <td className="px-3 py-2 text-right">
                  {c.is_active && (
                    <button
                      disabled={deactivate.isPending}
                      onClick={() => deactivate.mutate(c.id)}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
          <Pager
            page={page}
            pageSize={PAGE_SIZE}
            total={connectors.data?.total ?? rows.length}
            onPage={setPage}
          />
        </>
      )}

      {open && <ConnectorForm onClose={() => setOpen(false)} />}
    </AdminShell>
  );
}

function ConnectorForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<ConnectorProvider>("anthropic");
  const [modelId, setModelId] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const key = apiKey;
    // La key sale del estado del cliente inmediatamente tras componer la petición.
    setApiKey("");
    try {
      await createConnector({
        name,
        provider,
        model_id: modelId,
        api_base_url: baseUrl || undefined,
        api_key: key,
      });
      toast.success("Conector creado. La API key queda guardada en Vault.");
      qc.invalidateQueries({ queryKey: ["admin-connectors"] });
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Nuevo conector LLM</h2>

        <Field label="Nombre">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Proveedor">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ConnectorProvider)}
            className={inputCls}
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Modelo (ej. claude-sonnet-4-6, gpt-4.1)">
          <input required value={modelId} onChange={(e) => setModelId(e.target.value)} className={inputCls} />
        </Field>
        {(provider === "openai_compatible" || provider === "google") && (
          <Field label="URL base (opcional)">
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className={inputCls} />
          </Field>
        )}
        <Field label="API key (se envía una sola vez y no vuelve a mostrarse)">
          <input
            required
            type="password"
            autoComplete="new-password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Crear conector"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
