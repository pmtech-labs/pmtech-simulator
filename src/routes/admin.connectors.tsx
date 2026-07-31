import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, RefreshCw, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell, DataTable, Pager } from "@/components/admin/AdminShell";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  createConnector,
  deactivateConnector,
  listConnectors,
  listProviderModels,
  setDefaultConnector,
  updateConnector,
  type ConnectorProvider,
  type LlmConnector,
  type ProviderModel,
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

  const makeDefault = useMutation({
    mutationFn: setDefaultConnector,
    onSuccess: () => {
      toast.success("Conector marcado como predeterminado");
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
                <th className="px-3 py-2">Predeterminado</th>
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
                <td className="px-3 py-2">
                  {c.is_default ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-warning-soft px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                      <Star className="h-3 w-3 fill-current" /> Predeterminado
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="num px-3 py-2 text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("es-ES")}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                  {!c.is_default && (
                    <button
                      type="button"
                      disabled={makeDefault.isPending}
                      onClick={() => makeDefault.mutate(c.id)}
                      title="Marcar como predeterminado"
                      aria-label={`Marcar ${c.name} como conector predeterminado`}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                    >
                      <Star className="h-3.5 w-3.5" /> Predeterminado
                    </button>
                  )}
                  {c.is_active && (
                    <button
                      disabled={deactivate.isPending}
                      onClick={() => deactivate.mutate(c.id)}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                    >
                      Desactivar
                    </button>
                  )}
                  </div>
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
      {editing && <ConnectorForm connector={editing} onClose={() => setEditing(null)} />}
    </AdminShell>
  );
}

function ConnectorForm({
  connector,
  onClose,
}: {
  connector?: LlmConnector;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(connector);
  const [name, setName] = useState(connector?.name ?? "");
  const [provider, setProvider] = useState<ConnectorProvider>(
    (connector?.provider as ConnectorProvider) ?? "anthropic",
  );
  const [modelId, setModelId] = useState(connector?.model_id ?? "");
  const [baseUrl, setBaseUrl] = useState(connector?.api_base_url ?? "");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  const [models, setModels] = useState<ProviderModel[]>([]);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  /** Firma de los datos con los que se cargó la lista: si cambian, hay que revalidar. */
  const signature = `${provider}|${apiKey}|${baseUrl}`;
  const [loadedSignature, setLoadedSignature] = useState<string | null>(null);
  const modelsReady = models.length > 0 && loadedSignature === signature;

  const checkModels = useCallback(
    async (sig: string, useStoredKey: boolean) => {
      setChecking(true);
      setCheckError(null);
      try {
        const list = await listProviderModels(
          useStoredKey && connector
            ? { connector_id: connector.id }
            : { provider, api_key: apiKey, api_base_url: baseUrl || undefined },
        );
        if (list.length === 0) {
          setModels([]);
          setLoadedSignature(null);
          setCheckError("El proveedor no ha devuelto ningún modelo disponible.");
          return;
        }
        setModels(list);
        setLoadedSignature(sig);
        setModelId((current) => (list.some((m) => m.id === current) ? current : list[0].id));
      } catch (err) {
        setModels([]);
        setLoadedSignature(null);
        setCheckError((err as Error).message);
      } finally {
        setChecking(false);
      }
    },
    [apiKey, baseUrl, connector, provider],
  );

  // Al abrir la edición, carga los modelos con la clave ya guardada en Vault.
  useEffect(() => {
    if (connector) void checkModels(`${connector.provider}||${connector.api_base_url ?? ""}`, true);
    // Solo en el montaje del formulario de edición.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Comprobación automática (debounce) en cuanto hay proveedor + API key escrita.
  useEffect(() => {
    if (!apiKey) return;
    if (loadedSignature === signature) return;
    const t = setTimeout(() => void checkModels(signature, false), 500);
    return () => clearTimeout(t);
  }, [apiKey, signature, loadedSignature, checkModels]);

  // Si cambian proveedor / clave / URL base, la lista deja de ser válida.
  useEffect(() => {
    if (loadedSignature && loadedSignature !== signature) {
      setModels([]);
      setModelId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!modelsReady || !modelId) {
      toast.error("Comprueba primero los modelos disponibles y elige uno de la lista.");
      return;
    }
    setSaving(true);
    const key = apiKey;
    // La key sale del estado del cliente inmediatamente tras componer la petición.
    setApiKey("");
    try {
      if (connector) {
        await updateConnector({
          id: connector.id,
          ...(name !== connector.name ? { name } : {}),
          ...(modelId !== connector.model_id ? { model_id: modelId } : {}),
          ...(baseUrl !== (connector.api_base_url ?? "") ? { api_base_url: baseUrl } : {}),
          ...(key ? { api_key: key } : {}),
        });
        toast.success(
          key
            ? "Conector actualizado y clave rotada. La clave anterior deja de estar disponible; los jobs ya completados no se ven afectados (siguen trazados al mismo conector, solo cambia la clave que se usará a partir de ahora)."
            : "Conector actualizado. La API key guardada se mantiene sin cambios.",
        );
      } else {
        await createConnector({
          name,
          provider,
          model_id: modelId,
          api_base_url: baseUrl || undefined,
          api_key: key,
        });
        toast.success("Conector creado. La API key queda guardada en Vault.");
      }
      qc.invalidateQueries({ queryKey: ["admin-connectors"] });
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const canCheck = isEdit ? Boolean(apiKey) || Boolean(connector) : Boolean(apiKey);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-foreground/50 px-4 py-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">{isEdit ? "Editar conector LLM" : "Nuevo conector LLM"}</h2>

        <Field label="Nombre">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Proveedor">
          <select
            value={provider}
            disabled={isEdit}
            onChange={(e) => setProvider(e.target.value as ConnectorProvider)}
            className={inputCls + (isEdit ? " opacity-60" : "")}
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        {(provider === "openai_compatible" || provider === "google") && (
          <Field label="URL base (opcional)">
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className={inputCls} />
          </Field>
        )}
        <Field
          label={
            isEdit
              ? "API key (déjalo en blanco para mantener la clave actual, o escribe una nueva para rotarla)"
              : "API key (se envía una sola vez y no vuelve a mostrarse)"
          }
        >
          <input
            required={!isEdit}
            type="password"
            autoComplete="new-password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Modelo">
          <select
            required
            value={modelId}
            disabled={!modelsReady}
            onChange={(e) => setModelId(e.target.value)}
            className={inputCls + (modelsReady ? "" : " opacity-60")}
          >
            {!modelsReady && <option value="">Comprueba primero los modelos disponibles</option>}
            {modelsReady &&
              models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label ?? m.id}
                </option>
              ))}
          </select>
        </Field>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={checking || !canCheck}
            onClick={() => void checkModels(signature, isEdit && !apiKey)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
          >
            {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Comprobar modelos disponibles
          </button>
          {checking && <span className="text-xs text-muted-foreground">Consultando al proveedor…</span>}
          {!checking && modelsReady && (
            <span className="text-xs text-success">{models.length} modelos disponibles</span>
          )}
        </div>

        {checkError && (
          <p className="rounded-md border border-destructive/50 bg-destructive/5 p-2 text-xs text-destructive">
            {checkError}
          </p>
        )}

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
            disabled={saving || !modelsReady}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear conector"}
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
