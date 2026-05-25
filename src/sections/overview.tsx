import { useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Ticket,
  BarChart3,
  Percent,
  AlertCircle,
  ArrowLeftRight,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { Topbar, type YearFilter } from "@/components/layout/Topbar";
import { useTransacciones, useAjustes } from "@/hooks/use-data";
import { EUR, PCT } from "@/lib/categories";

export function OverviewPage() {
  const [year, setYear] = useState<YearFilter>("Todo");
  const { data: tx, loading } = useTransacciones();
  const { data: ajustes } = useAjustes();

  const filtered = useMemo(
    () => (year === "Todo" ? tx : tx.filter((t) => String(t.año) === year)),
    [tx, year],
  );

  const k = useMemo(() => {
    let ventas = 0, costo = 0, ganancia = 0, miParte = 0, boletas = 0, porCobrar = 0;
    let saldoIker = 0;
    const partidos = new Set<string>();
    for (const t of filtered) {
      const vt = Number(t.precio_venta_tot ?? 0);
      ventas += vt;
      costo += Number(t.precio_compra_tot ?? 0);
      ganancia += Number(t.ganancia ?? 0);
      miParte += Number(t.comision_pp ?? 0);
      boletas += Number(t.num_boletas ?? 0);
      if (!t.pagado) porCobrar += vt;
      if (t.partido) partidos.add(t.partido);
      if (t.quien_recibe === "Iker" && !t.liquidada) saldoIker += Number(t.comision_pp ?? 0);
    }
    // Aplicar ajustes (IKER paga = +; TOMAS = -)
    for (const a of ajustes) {
      const m = Number(a.monto ?? 0);
      if (a.quien_paga === "IKER" || a.quien_paga === "Iker") saldoIker += m;
      else saldoIker -= m;
    }
    const margen = ventas > 0 ? ganancia / ventas : 0;
    const miMargen = ventas > 0 ? miParte / ventas : 0;
    return {
      ventas, costo, ganancia, miParte, boletas, porCobrar,
      partidos: partidos.size, saldoIker, margen, miMargen,
    };
  }, [filtered, ajustes]);

  const pendientes = filtered.filter((t) => !t.pagado).length;

  // Comparativa por temporada
  const seasons = useMemo(() => {
    const m = new Map<string, { ventas: number; ganancia: number; miParte: number; n: number }>();
    for (const t of filtered) {
      const key = t.temporada ?? "—";
      const cur = m.get(key) ?? { ventas: 0, ganancia: 0, miParte: 0, n: 0 };
      cur.ventas += Number(t.precio_venta_tot ?? 0);
      cur.ganancia += Number(t.ganancia ?? 0);
      cur.miParte += Number(t.comision_pp ?? 0);
      cur.n += 1;
      m.set(key, cur);
    }
    return Array.from(m, ([temp, v]) => ({ temp, ...v }))
      .sort((a, b) => (a.temp < b.temp ? 1 : -1));
  }, [filtered]);

  // Mi ganancia por partido (top 10) — barras horizontales
  const gananciaPorPartido = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of filtered) {
      const k = t.partido ?? "—";
      m.set(k, (m.get(k) ?? 0) + Number(t.comision_pp ?? 0));
    }
    return Array.from(m, ([partido, v]) => ({ partido, v }))
      .sort((a, b) => b.v - a.v).slice(0, 10);
  }, [filtered]);

  // Ingresos vs costos por partido (top 8)
  const ingresosVsCostos = useMemo(() => {
    const m = new Map<string, { ventas: number; costo: number }>();
    for (const t of filtered) {
      const k = t.partido ?? "—";
      const cur = m.get(k) ?? { ventas: 0, costo: 0 };
      cur.ventas += Number(t.precio_venta_tot ?? 0);
      cur.costo += Number(t.precio_compra_tot ?? 0);
      m.set(k, cur);
    }
    return Array.from(m, ([partido, v]) => ({ partido, ...v }))
      .sort((a, b) => b.ventas - a.ventas).slice(0, 8);
  }, [filtered]);

  return (
    <>
      <Topbar
        title="Ventas de Boletas"
        subtitle={`${filtered.length} transacciones visibles`}
        yearFilter={year}
        onYearChange={setYear}
        pendienteCount={pendientes}
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* KPIs row 1 */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<TrendingUp size={14} />} label="Mi Ganancia" value={EUR(k.miParte)}
            footer={`${PCT(k.miMargen)} sobre ventas`} accent />
          <Kpi icon={<DollarSign size={14} />} label="Total Ventas" value={EUR(k.ventas)}
            footer={`Costo: ${EUR(k.costo)}`} />
          <Kpi icon={<Ticket size={14} />} label="Boletas" value={String(k.boletas)}
            footer={`${filtered.length} transacciones`} />
          <Kpi icon={<BarChart3 size={14} />} label="Ganancia Bruta" value={EUR(k.ganancia)}
            footer="Antes de partir" />
        </div>
        {/* KPIs row 2 */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<Percent size={14} />} label="Mi Margen" value={PCT(k.miMargen)}
            footer={`${EUR(k.miParte)} neto`} tone="pink" />
          <Kpi icon={<AlertCircle size={14} />} label="Por Cobrar" value={EUR(k.porCobrar)}
            footer={`${pendientes} sin cobrar`} tone="rose" />
          <Kpi icon={<ArrowLeftRight size={14} />} label="Balance Iker" value={EUR(Math.abs(k.saldoIker))}
            footer={k.saldoIker >= 0 ? "Iker te debe" : "Le debes a Iker"} tone="emerald" />
          <Kpi icon={<Trophy size={14} />} label="# Partidos" value={String(k.partidos)}
            footer="eventos distintos" />
        </div>

        {/* Comparativa por temporada */}
        <section className="rounded-xl border border-border bg-card">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Comparativa por temporada</h2>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Temporada</th>
                  <th className="px-4 py-2 text-left font-medium">Ventas</th>
                  <th className="px-4 py-2 text-left font-medium">Ganancia bruta</th>
                  <th className="px-4 py-2 text-left font-medium">Mi parte</th>
                  <th className="px-4 py-2 text-left font-medium">Transacciones</th>
                  <th className="px-4 py-2 text-right font-medium">Margen</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s.temp} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {s.temp}
                      </span>
                    </td>
                    <td className="px-4 py-3">{EUR(s.ventas)}</td>
                    <td className="px-4 py-3 text-emerald-400">{EUR(s.ganancia)}</td>
                    <td className="px-4 py-3 text-emerald-400">{EUR(s.miParte)}</td>
                    <td className="px-4 py-3">{s.n}</td>
                    <td className="px-4 py-3 text-right">{s.ventas ? PCT(s.ganancia / s.ventas) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Mi Ganancia por Partido</h3>
            <p className="mb-3 text-xs text-muted-foreground">Tu ingreso personal neto — top 10</p>
            <div className="h-[320px]">
              {loading ? <Loading /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gananciaPorPartido} layout="vertical" margin={{ left: 80 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} hide />
                    <YAxis type="category" dataKey="partido"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={80} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => EUR(v)} />
                    <Bar dataKey="v" fill="var(--gold-500)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Ingresos vs Costos</h3>
            <p className="mb-3 text-xs text-muted-foreground">Por partido (top 8)</p>
            <div className="h-[320px]">
              {loading ? <Loading /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresosVsCostos}>
                    <XAxis dataKey="partido" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      angle={-20} textAnchor="end" height={60} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => EUR(v)} />
                    <Bar dataKey="costo" fill="var(--surface-500)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ventas" fill="var(--gold-500)" radius={[4, 4, 0, 0]}>
                      {ingresosVsCostos.map((_, i) => <Cell key={i} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Loading() {
  return <p className="p-12 text-center text-sm text-muted-foreground">Cargando…</p>;
}

function Kpi({
  icon, label, value, footer, accent, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  footer?: string;
  accent?: boolean;
  tone?: "emerald" | "pink" | "rose";
}) {
  const toneRing =
    tone === "emerald" ? "ring-emerald-500/20 [&_.kpi-icon]:bg-emerald-500/15 [&_.kpi-icon]:text-emerald-300"
    : tone === "pink" ? "ring-pink-500/20 [&_.kpi-icon]:bg-pink-500/15 [&_.kpi-icon]:text-pink-300"
    : tone === "rose" ? "ring-rose-500/20 [&_.kpi-icon]:bg-rose-500/15 [&_.kpi-icon]:text-rose-300"
    : accent ? "[&_.kpi-icon]:bg-amber-500/15 [&_.kpi-icon]:text-amber-300"
    : "[&_.kpi-icon]:bg-muted [&_.kpi-icon]:text-muted-foreground";
  return (
    <div className={`group rounded-xl border border-border bg-card p-4 ring-1 ring-transparent transition-colors ${toneRing}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="kpi-icon flex h-7 w-7 items-center justify-center rounded-md">{icon}</span>
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${accent ? "text-amber-300" : "text-foreground"}`}>{value}</p>
      {footer && <p className="mt-1 text-xs text-muted-foreground">{footer}</p>}
    </div>
  );
}
