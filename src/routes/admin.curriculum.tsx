import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FileSearch,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell, DataTable } from "@/components/admin/AdminShell";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import {
  deleteCourseUnit,
  listAdminCourseUnits,
  moveCourseUnit,
  previewUnitCoverage,
  saveCourseUnit,
  setCourseUnitStatus,
  type AdminCourseUnit,
} from "@/lib/curriculum.functions";
import { listEcoDomains, listEcoTasks } from "@/services/adminService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/curriculum")({
  component: CurriculumPage,
});

interface FormState {
  id?: string;
  title: string;
  description: string;
  sequence: number;
  taskIds: string[];
}

const EMPTY: FormState = { title: "", description: "", sequence: 1, taskIds: [] };

function CurriculumPage() {
  const email = useAdminEmail();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fetchUnits = useServerFn(listAdminCourseUnits);
  const save = useServerFn(saveCourseUnit);
  const setStatus = useServerFn(setCourseUnitStatus);
  const remove = useServerFn(deleteCourseUnit);
  const move = useServerFn(moveCourseUnit);

  const units = useQuery({ queryKey: ["admin-course-units"], queryFn: () => fetchUnits() });
  const domains = useQuery({ queryKey: ["eco-domains"], queryFn: listEcoDomains });
  const tasks = useQuery({ queryKey: ["eco-tasks"], queryFn: listEcoTasks });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-course-units"] });

  const saveMutation = useMutation({
    mutationFn: (input: FormState) => save({ data: input }),
    onSuccess: () => {
      toast.success("Unidad guardada");
      setForm(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: "draft" | "published" }) => setStatus({ data: input }),
    onSuccess: () => {
      toast.success("Estado actualizado");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Unidad eliminada");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveMutation = useMutation({
    mutationFn: (input: { id: string; direction: "up" | "down" }) => move({ data: input }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const rows: AdminCourseUnit[] = units.data ?? [];
  const nextSequence = rows.length ? Math.max(...rows.map((u) => u.sequence)) + 1 : 1;

  return (
    <AdminShell
      title="Currículo de lecciones"
      description="Temario propio del curso (distinto de la taxonomía ECO de PMI)"
      email={email}
      actions={
        <button
          onClick={() => setForm({ ...EMPTY, sequence: nextSequence })}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Nueva unidad
        </button>
      }
    >
      {units.error ? (
        <p className="text-sm text-destructive">
          No se han podido cargar las unidades: {(units.error as Error).message}
        </p>
      ) : units.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <p className="mb-3 flex items-start gap-2 rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Las unidades en <strong className="mx-1 text-foreground">borrador</strong> no son
            seleccionables por los candidatos en ningún modo de práctica. Una unidad sin tareas ECO
            mapeadas no puede publicarse.
          </p>

          <DataTable
            empty={!rows.length}
            head={
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Unidad</th>
                <th className="px-3 py-2">Tareas ECO</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            }
          >
            {rows.map((u, i) => (
              <tr key={u.id} className="align-top">
                <td className="px-3 py-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="num w-5">{u.sequence}</span>
                    <div className="flex flex-col">
                      <button
                        aria-label={`Subir ${u.title}`}
                        disabled={i === 0 || moveMutation.isPending}
                        onClick={() => moveMutation.mutate({ id: u.id, direction: "up" })}
                        className="rounded border border-border p-0.5 hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        aria-label={`Bajar ${u.title}`}
                        disabled={i === rows.length - 1 || moveMutation.isPending}
                        onClick={() => moveMutation.mutate({ id: u.id, direction: "down" })}
                        className="mt-0.5 rounded border border-border p-0.5 hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <p className="font-medium">{u.title}</p>
                  {u.description && (
                    <p className="mt-0.5 max-w-md text-xs text-muted-foreground">{u.description}</p>
                  )}
                </td>
                <td className="num px-3 py-2">
                  <span className={cn(u.taskIds.length ? "" : "text-destructive")}>
                    {u.taskIds.length}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      u.status === "published"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {u.status === "published" ? "Publicada" : "Borrador"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() =>
                        setForm({
                          id: u.id,
                          title: u.title,
                          description: u.description ?? "",
                          sequence: u.sequence,
                          taskIds: u.taskIds,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </button>
                    <button
                      onClick={() => setPreviewId(u.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary"
                    >
                      <FileSearch className="h-3 w-3" /> Vista previa
                    </button>
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          id: u.id,
                          status: u.status === "published" ? "draft" : "published",
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary"
                    >
                      {u.status === "published" ? (
                        <>
                          <EyeOff className="h-3 w-3" /> Despublicar
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Publicar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la unidad "${u.title}"?`)) deleteMutation.mutate(u.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </>
      )}

      {form && (
        <UnitForm
          form={form}
          setForm={setForm}
          domains={domains.data ?? []}
          tasks={tasks.data ?? []}
          saving={saveMutation.isPending}
          onSubmit={() => saveMutation.mutate(form)}
          onClose={() => setForm(null)}
        />
      )}

      {previewId && <UnitPreviewDialog id={previewId} onClose={() => setPreviewId(null)} />}
    </AdminShell>
  );
}

function UnitPreviewDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const preview = useServerFn(previewUnitCoverage);
  const query = useQuery({
    queryKey: ["unit-preview", id],
    queryFn: () => preview({ data: { id } }),
    retry: false,
  });

  const data = query.data;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-foreground/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Vista previa de cobertura</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Preguntas publicadas que alimentarían cada modo de práctica.
            </p>
          </div>
          <button onClick={onClose} className="rounded-md border border-border p-1 hover:bg-secondary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {query.isPending ? (
          <Loader2 className="mt-4 h-4 w-4 animate-spin text-muted-foreground" />
        ) : query.error ? (
          <p className="mt-4 text-sm text-destructive">{(query.error as Error).message}</p>
        ) : data ? (
          <>
            <p className="mt-4 text-sm font-medium">
              <span className="num mr-2 text-muted-foreground">Lección {data.sequence}</span>
              {data.unitTitle}
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Practicar esta lección
                </p>
                <p className="num mt-1 font-display text-2xl font-bold">
                  {data.unitQuiz.questionCount}
                </p>
                <p className="num mt-1 text-[11px] text-muted-foreground">
                  preguntas · {data.unitQuiz.taskCount} tareas ECO
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Simulacro acumulativo
                </p>
                <p className="num mt-1 font-display text-2xl font-bold">
                  {data.cumulative.questionCount}
                </p>
                <p className="num mt-1 text-[11px] text-muted-foreground">
                  preguntas · {data.cumulative.unitCount} unidades · {data.cumulative.taskCount} tareas
                </p>
              </div>
            </div>

            {data.unitQuiz.questionCount === 0 && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Sin preguntas publicadas: el modo «Practicar esta lección» fallaría para los candidatos.
              </p>
            )}

            {data.unitQuiz.tasksWithoutQuestions.length > 0 && (
              <div className="mt-3 rounded-md border border-border p-3">
                <p className="text-xs font-medium">
                  Tareas mapeadas sin preguntas publicadas{" "}
                  <span className="num text-muted-foreground">
                    ({data.unitQuiz.tasksWithoutQuestions.length})
                  </span>
                </p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                  {data.unitQuiz.tasksWithoutQuestions.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function UnitForm({
  form,
  setForm,
  domains,
  tasks,
  saving,
  onSubmit,
  onClose,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  domains: { id: string; code: string; name: string }[];
  tasks: { id: string; domain_id: string; task_number: number; title: string }[];
  saving: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const grouped = useMemo(
    () =>
      domains.map((d) => ({
        domain: d,
        tasks: tasks
          .filter((t) => t.domain_id === d.id)
          .sort((a, b) => a.task_number - b.task_number),
      })),
    [domains, tasks],
  );

  const toggleTask = (id: string) =>
    setForm({
      ...form,
      taskIds: form.taskIds.includes(id)
        ? form.taskIds.filter((t) => t !== id)
        : [...form.taskIds, id],
    });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-foreground/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">
          {form.id ? "Editar unidad" : "Nueva unidad del currículo"}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]">
          <label className="text-xs font-medium">
            Título
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-medium">
            Secuencia
            <input
              type="number"
              min={1}
              value={form.sequence}
              onChange={(e) => setForm({ ...form, sequence: Number(e.target.value) })}
              className="num mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
        </div>

        <label className="mt-3 block text-xs font-medium">
          Descripción
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
        </label>

        <div className="mt-4">
          <p className="text-xs font-medium">
            Tareas ECO mapeadas{" "}
            <span className="num text-muted-foreground">({form.taskIds.length})</span>
          </p>
          {!form.taskIds.length && (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-accent-foreground">
              <AlertTriangle className="h-3 w-3" /> Sin tareas mapeadas no podrás publicar la unidad.
            </p>
          )}
          <div className="mt-2 max-h-64 space-y-3 overflow-y-auto rounded-md border border-border p-3">
            {grouped.map(({ domain, tasks: list }) => (
              <div key={domain.id}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {domain.name}
                </p>
                <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
                  {list.map((t) => (
                    <label key={t.id} className="flex items-start gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={form.taskIds.includes(t.id)}
                        onChange={() => toggleTask(t.id)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="num text-muted-foreground">{t.task_number}. </span>
                        {t.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={saving || !form.title.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />} Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
