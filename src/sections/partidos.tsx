import { useMemo, useState } from "react";
import { Star, TrendingDown, Trophy } from "lucide-react";

import { Topbar, type YearFilter } from "@/components/layout/Topbar";
import { useTransacciones } from "@/hooks/use-data";
import { categoryClass, EUR, PCT } from "@/lib/categories";

type Row = {
  partido: string;
  ganancia: number;
  miParte: number;
  ventas: number;
  boletas: number;
  clientes: number;
  transacciones: number;
  categorias: Map<string, number>;
};

export function PartidosPage() {
  const [year, setYear] = useState<YearFilter>("Todo");
  const { data: tx } = useTransacciones();

  const rows: Row[] = useMemo(() => {
    const base = year === "Todo" ? tx : tx.filter((t) => String(t.año) === year);
    const m = new Map<string, Row>();
    for (const t of base) {
      const k = t.partido ?? "—";
      const cur = m.get(k) ?? {
        partido: k, ganancia: 0, miParte: 0, ventas: 0, boletas: 0,
        clientes: 0, transacciones: 0, categorias: new Map<string, number>(),
      };
      cur.ganancia += Number(t.ganancia ?? 0);
      cur.miParte += Number(t.comision_pp ?? 0);
      cur.ventas += Number(t.precio_venta_tot ?? 0);
      cur.boletas += Number(t.num_boletas ?? 0);
      cur.transacciones += 1;
      if (t.categoria) cur.categorias.set(t.categoria, (cur.categorias.get(t.categoria) ?? 0) + 1);
      m.set(k, cur);
    }
    // contar clientes únicos
    for (const r of m.values()) {
      const set = new Set<string>();
      for (const t of base) if (t.partido === r.partido && t.cliente) set.add(t.cliente);
      r.clientes = set.size;
    }
    return Array.from(m.values()).sort((a, b) => b.ganancia - a.ganancia);
  }, [tx, year]);

  const topRent = rows.slice(0, 3);
  const maxGan = topRent[0]?.ganancia ?? 1;
  const menorMargen = [...rows]
    .filter((r) => r.ventas > 0)
    .sort((a, b) => a.ganancia / a.ventas - b.ganancia / b.ventas)
    .slice(0, 3);

  const pendientes = tx.filter((t) => !t.pagado).length;

  return (
    <>
      <Topbar
        title="Ventas de Boletas"
        subtitle={`${tx.length} transacciones visibles`}
        yearFilter={year} onYearChange={setYear}
        pendienteCount={pendientes}
      />
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <header>
          <h2 className="text-lg font-semibold">Partidos</h2>
          <p className="text-xs text-muted-foreground">{rows.length} partidos · analytics por evento</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <TopCard title="MÁS RENTABLES" icon={<Star size={14} />} tone="amber">
            {topRent.map((r, i) => (
              <Bar key={r.partido} idx={i + 1} label={r.partido} value={r.ganancia} max={maxGan} valueColor="text-amber-300" />
            ))}
          </TopCard>
          <TopCard title="MENOR MARGEN" icon={<TrendingDown size={14} />} tone="rose">
            {menorMargen.map((r, i) => (
              <div key={r.partido} className="flex items-center gap-3 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15 text-xs font-semibold text-rose-300">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.partido}</p>
                  <p className="text-xs text-muted-foreground">{PCT(r.ganancia / r.ventas)} margen</p>
                </div>
                <p className="text-sm font-semibold text-rose-300">{EUR(r.ganancia)}</p>
              </div>
            ))}
          </TopCard>
        </div>

        {/* Ranking completo */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Trophy size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold">Ranking completo</h3>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Partido</th>
                  <th className="px-4 py-3 text-right">Ganancia</th>
                  <th className="px-4 py-3 text-right">Ventas</th>
                  <th className="px-4 py-3 text-right">Boletas</th>
                  <th className="px-4 py-3 text-right">Margen %</th>
                  <th className="px-4 py-3 text-right"># Transacc.</th>
                  <th className="px-4 py-3 text-left">Categorías</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.partido} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.partido}</p>
                      <p className="text-xs text-muted-foreground">{r.clientes} clientes · {r.boletas} boletas</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-300">
                      {EUR(r.ganancia)}
                      <p className="text-[10px] font-normal text-muted-foreground">Mi parte: {EUR(r.miParte)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">{EUR(r.ventas)}</td>
                    <td className="px-4 py-3 text-right">{r.boletas}</td>
                    <td className="px-4 py-3 text-right">{r.ventas ? PCT(r.ganancia / r.ventas) : "—"}</td>
                    <td className="px-4 py-3 text-right">{r.transacciones}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Array.from(r.categorias.entries()).map(([c, n]) => (
                          <span key={c} className={categoryClass(c)}>{c} ×{n}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

function TopCard({ title, icon, tone, children }: { title: string; icon: React.ReactNode; tone: "amber" | "rose"; children: React.ReactNode }) {
  const color = tone === "amber" ? "text-amber-400" : "text-rose-400";
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${color}`}>
        {icon}<span>{title}</span>
      </header>
      <div className="divide-y divide-border/40">{children}</div>
    </section>
  );
}

function Bar({ idx, label, value, max, valueColor }: { idx: number; label: string; value: number; max: number; valueColor: string }) {
  const pct = Math.max(4, (value / max) * 100);
  return (
    <div className="py-2.5">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-xs font-semibold text-amber-300">{idx}</span>
        <p className="flex-1 text-sm font-medium">{label}</p>
        <p className={`text-sm font-semibold ${valueColor}`}>{EUR(value)}</p>
      </div>
      <div className="mt-2 ml-9 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-amber-500/70 to-amber-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
