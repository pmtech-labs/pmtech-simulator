import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell, DataTable, Pager } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  listAdminUsers,
  patchAdminUser,
  type AdminUserAction,
  type AdminUserRow,
} from "@/services/adminService";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsersPage,
});

const PAGE_SIZE = 20;
const inputCls = "rounded-md border border-border bg-background px-2.5 py-1.5 text-xs";

const PLAN_OPTIONS = [
  { value: "", label: "Todos los planes" },
  { value: "free", label: "Gratis" },
  { value: "basic", label: "Básica" },
  { value: "premium_1m", label: "Premium 1 mes" },
  { value: "premium_6m", label: "Premium" },
];

const PLAN_CHANGE_OPTIONS = PLAN_OPTIONS.filter((p) => p.value !== "");

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function planLabel(code: string | null) {
  if (!code) return "Sin plan";
  return PLAN_CHANGE_OPTIONS.find((p) => p.value === code)?.label ?? code;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>;
  const tone =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "expired" || status === "revoked"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {status}
    </span>
  );
}

interface PendingAction {
  user: AdminUserRow;
  action: AdminUserAction;
  title: string;
  description: string;
}

function AdminUsersPage() {
  const email = useAdminEmail();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [onlyAdmins, setOnlyAdmins] = useState(false);
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [planDialogUser, setPlanDialogUser] = useState<AdminUserRow | null>(null);
  const [newPlan, setNewPlan] = useState("premium_6m");

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      plan_code: planCode || undefined,
      only_admins: onlyAdmins || undefined,
    }),
    [search, planCode, onlyAdmins],
  );

  const users = useQuery({
    queryKey: ["admin-users", filters, page],
    queryFn: () => listAdminUsers(filters, page, PAGE_SIZE),
  });

  const mutation = useMutation({
    mutationFn: (input: AdminUserAction) => patchAdminUser(input),
    onSuccess: () => {
      toast.success("Acción aplicada correctamente");
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "No se ha podido aplicar la acción");
    },
    onSettled: () => setPending(null),
  });

  const rows = users.data?.rows ?? [];

  return (
    <AdminShell
      title="Gestión de usuarios"
      description="Licencias, planes y permisos de los usuarios registrados"
      email={email}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por email…"
          className={`${inputCls} w-56`}
        />
        <select
          value={planCode}
          onChange={(e) => {
            setPlanCode(e.target.value);
            setPage(1);
          }}
          className={inputCls}
        >
          {PLAN_OPTIONS.map((p) => (
            <option key={p.value || "all"} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyAdmins}
            onChange={(e) => {
              setOnlyAdmins(e.target.checked);
              setPage(1);
            }}
          />
          Solo admins
        </label>
        {users.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {users.isError && (
        <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {users.error instanceof Error ? users.error.message : "Error al cargar los usuarios"}
        </p>
      )}

      <DataTable
        empty={!users.isPending && rows.length === 0}
        head={
          <tr>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">Registrado</th>
            <th className="px-3 py-2 font-medium">Último acceso</th>
            <th className="px-3 py-2 font-medium">Plan actual</th>
            <th className="px-3 py-2 font-medium">Estado licencia</th>
            <th className="px-3 py-2 font-medium">Caduca</th>
            <th className="px-3 py-2 text-right font-medium">Exámenes</th>
            <th className="px-3 py-2 font-medium">Admin</th>
            <th className="px-3 py-2 text-right font-medium">Acciones</th>
          </tr>
        }
      >
        {rows.map((u) => (
          <tr key={u.user_id} className="align-middle hover:bg-muted/40">
            <td className="max-w-[240px] truncate px-3 py-2 font-medium">{u.email}</td>
            <td className="px-3 py-2 text-xs text-muted-foreground">{fmtDate(u.signed_up_at)}</td>
            <td className="px-3 py-2 text-xs text-muted-foreground">
              {fmtDate(u.last_sign_in_at)}
            </td>
            <td className="px-3 py-2 text-xs">{planLabel(u.current_plan_code)}</td>
            <td className="px-3 py-2">
              <StatusBadge status={u.latest_license_status} />
            </td>
            <td className="px-3 py-2 text-xs text-muted-foreground">
              {fmtDate(u.current_expires_at)}
            </td>
            <td className="px-3 py-2 text-right text-xs">{u.exams_taken ?? 0}</td>
            <td className="px-3 py-2">
              {u.is_admin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </span>
              )}
            </td>
            <td className="px-3 py-2 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 px-2">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs">Licencia</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() =>
                      mutation.mutate({
                        user_id: u.user_id,
                        action: "extend_license",
                        days: 30,
                      })
                    }
                  >
                    Extender 30 días
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setNewPlan(u.current_plan_code ?? "premium_6m");
                      setPlanDialogUser(u);
                    }}
                  >
                    Cambiar de plan…
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() =>
                      setPending({
                        user: u,
                        action: { user_id: u.user_id, action: "revoke_license" },
                        title: "Revocar licencia activa",
                        description: `Se revocará la licencia activa de ${u.email}. El usuario perderá el acceso de pago inmediatamente.`,
                      })
                    }
                  >
                    Revocar licencia
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Permisos</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() =>
                      setPending({
                        user: u,
                        action: {
                          user_id: u.user_id,
                          action: "toggle_admin",
                          make_admin: !u.is_admin,
                        },
                        title: u.is_admin ? "Quitar rol admin" : "Dar rol admin",
                        description: u.is_admin
                          ? `${u.email} dejará de tener acceso al panel interno.`
                          : `${u.email} tendrá acceso completo al panel interno.`,
                      })
                    }
                  >
                    {u.is_admin ? "Quitar rol admin" : "Dar rol admin"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      </DataTable>

      {users.isPending && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <Pager
        page={page}
        pageSize={PAGE_SIZE}
        total={users.data?.total ?? rows.length}
        onPage={setPage}
      />

      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending?.title}</DialogTitle>
            <DialogDescription>{pending?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => pending && mutation.mutate(pending.action)}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(planDialogUser)}
        onOpenChange={(open) => !open && setPlanDialogUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar de plan</DialogTitle>
            <DialogDescription>
              Se creará una licencia nueva para {planDialogUser?.email} y la anterior quedará
              marcada como sustituida.
            </DialogDescription>
          </DialogHeader>
          <select
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {PLAN_CHANGE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogUser(null)}>
              Cancelar
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => {
                if (!planDialogUser) return;
                mutation.mutate({
                  user_id: planDialogUser.user_id,
                  action: "change_plan",
                  plan_code: newPlan,
                });
                setPlanDialogUser(null);
              }}
            >
              Aplicar plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
