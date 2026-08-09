import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Info, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminShell, DataTable } from "@/components/admin/AdminShell";
import { useAdminEmail } from "@/hooks/useAdminEmail";
import { getAdminMetrics, type MetricsGranularity } from "@/services/adminService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/metricas")({
  component: AdminMetricsPage,
});

const GRANULARITIES: { value: MetricsGranularity; label: string; periods: number }[] = [
  { value: "week", label: "Semana", periods: 12 },
  { value: "month", label: "Mes", periods: 12 },
  { value: "year", label: "Año", periods: 5 },
];

const SALES_RANGES = [
  { value: "1m", label: "Último mes", months: 1 },
  { value: "3m", label: "Último trimestre", months: 3 },
  { value: "12m", label: "Último año", months: 12 },
  { value: "all", label: "Todo", months: 0 },
];

const eur = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function rangeStart(months: number): string | undefined {
  if (!months) return undefined;
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

function fmtPeriod(value: string, granularity: MetricsGranularity) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  if (granularity === "year") return String(d.getFullYear());
  if (granularity === "month")
    return d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Section({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function AdminMetricsPage() {
  const email = useAdminEmail();
  const [granularity, setGranularity] = useState<MetricsGranularity>("month");
  const [salesRange, setSalesRange] = useState("12m");

  const periods = GRANULARITIES.find((g) => g.value === granularity)?.periods ?? 12;
  const salesFrom = useMemo(
    () => rangeStart(SALES_RANGES.find((r) => r.value === salesRange)?.months ?? 0),
    [salesRange],
  );

  const metrics = useQuery({
    queryKey: ["admin-metrics", granularity, periods, salesFrom],
    queryFn: () =>
      getAdminMetrics({
        granularity,
        periods,
        ...(salesFrom ? { sales_from: salesFrom } : {}),
      }),
  });

  const data = metrics.data;

  const mrrData = (data?.mrr_trend ?? []).map((r) => ({
    ...r,
    label: fmtPeriod(r.period_start, granularity),
    mrr: r.mrr_cents / 100,
  }));

  const signupsData = (data?.signups_vs_purchases ?? []).map((r) => ({
    ...r,
    label: fmtPeriod(r.period_start, granularity),
  }));

  const salesData = (data?.sales_by_plan ?? []).map((r) => ({
    ...r,
    revenue: r.revenue_cents / 100,
  }));

  return (
    <AdminShell
      title="Métricas de negocio"
      description="Ingresos, conversión y ventas por producto"
      email={email}
      actions={
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {GRANULARITIES.map((g) => (
            <button
              key={g.value}
              onClick={() => setGranularity(g.value)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                granularity === g.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      }
    >
      {data?.data_limitations && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>{data.data_limitations}</p>
        </div>
      )}

      {metrics.isError && (
        <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {metrics.error instanceof Error ? metrics.error.message : "Error al cargar las métricas"}
        </p>
      )}

      {metrics.isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Usuarios totales"
              value={String(data?.summary.total_users ?? 0)}
            />
            <KpiCard
              label="Licencias de pago activas"
              value={String(data?.summary.active_paid_licenses ?? 0)}
            />
            <KpiCard label="MRR actual" value={eur(data?.summary.current_mrr_cents ?? 0)} />
            <KpiCard
              label="Conversión global"
              value={`${(data?.summary.overall_conversion_pct ?? 0).toFixed(1)} %`}
            />
          </div>

          <Section title="Tendencia de MRR" description="Ingresos recurrentes por periodo">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={60} />
                  <Tooltip
                    formatter={(value: number, name) =>
                      name === "mrr"
                        ? [`${value.toLocaleString("es-ES")} €`, "MRR"]
                        : [value, "Licencias activas"]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="active_paid_licenses"
                    stroke="transparent"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section
            title="Registros vs compras"
            description="Conversión de registros a licencias de pago por periodo"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={signupsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    unit="%"
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="signups" name="Registros" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="left" dataKey="purchases" name="Compras" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversion_pct"
                    name="Conversión %"
                    stroke="hsl(var(--destructive))"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section
            title="Ventas por producto"
            description="Compras e ingresos por plan en el rango seleccionado"
            actions={
              <select
                value={salesRange}
                onChange={(e) => setSalesRange(e.target.value)}
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
              >
                {SALES_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            }
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="plan_name"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString("es-ES")} €`, "Ingresos"]} />
                  <Bar dataKey="revenue" radius={[0, 3, 3, 0]} fill="hsl(var(--primary))">
                    {salesData.map((row) => (
                      <Cell key={row.plan_code} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <DataTable
                empty={salesData.length === 0}
                head={
                  <tr>
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-3 py-2 text-right font-medium">Compras</th>
                    <th className="px-3 py-2 text-right font-medium">Ingresos</th>
                  </tr>
                }
              >
                {salesData.map((row) => (
                  <tr key={row.plan_code} className="hover:bg-muted/40">
                    <td className="px-3 py-2">{row.plan_name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.purchases}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {eur(row.revenue_cents)}
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </Section>
        </>
      )}
    </AdminShell>
  );
}
