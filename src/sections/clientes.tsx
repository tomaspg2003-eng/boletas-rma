import { useMemo, useState } from "react";
import { Search, AlertCircle, ChevronRight, LayoutGrid, List } from "lucide-react";

import { Topbar, type YearFilter } from "@/components/layout/Topbar";
import { useTransacciones } from "@/hooks/use-data";
import { avatarFor, EUR, fmtDate } from "@/lib/categories";
import { ClienteHistorialSheet } from "@/components/cliente-historial-sheet";

export function ClientesPage() {
  const [year, setYear] = useState<YearFilter>("Todo");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string | null>(null);
  const { data: tx } = useTransacciones();

  const clientes = useMemo(() => {
    const base = year === "Todo" ? tx : tx.filter((t) => String(t.año) === year);
    const m = new Map<string, {
      nombre: string; n: number; total: number; boletas: number;
      ultima: string | null; pendiente: number;
    }>();
    for (const t of base) {
      const name = (t.cliente ?? "").trim();
      if (!name) continue;
      const cur = m.get(name) ?? { nombre: name, n: 0, total: 0, boletas: 0, ultima: null, pendiente: 0 };
      cur.n += 1;
      cur.total += Number(t.precio_venta_tot ?? 0);
      cur.boletas += Number(t.num_boletas ?? 0);
      if (!t.pagado) cur.pendiente += Number(t.precio_venta_tot ?? 0);
      if (t.fecha_pago && (!cur.ultima || t.fecha_pago > cur.ultima)) cur.ultima = t.fecha_pago;
      m.set(name, cur);
    }
    let list = Array.from(m.values()).sort((a, b) => b.total - a.total);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((c) => c.nombre.toLowerCase().includes(s));
    }
    return list;
  }, [tx, year, q]);

  const pendienteCount = tx.filter((t) => !t.pagado).length;

  return (
    <>
      <Topbar
        title="Ventas de Boletas"
        subtitle={`${tx.length} transacciones visibles`}
        yearFilter={year} onYearChange={setYear}
        pendienteCount={pendienteCount}
      />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Clientes</h2>
            <p className="text-xs text-muted-foreground">{clientes.length} clientes registrados</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar cliente…"
                className="w-64 rounded-lg border border-border bg-card px-9 py-2 text-sm placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="flex rounded-lg border border-border bg-card p-0.5">
              <button onClick={() => setView("grid")}
                className={`rounded-md p-1.5 ${view === "grid" ? "bg-amber-500/15 text-amber-300" : "text-muted-foreground"}`}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setView("list")}
                className={`rounded-md p-1.5 ${view === "list" ? "bg-amber-500/15 text-amber-300" : "text-muted-foreground"}`}>
                <List size={14} />
              </button>
            </div>
          </div>
        </header>

        {view === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clientes.map((c) => {
              const a = avatarFor(c.nombre);
              const pendiente = c.pendiente > 0;
              return (
                <article
                  key={c.nombre}
                  onClick={() => setSelected(c.nombre)}
                  className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-amber-500/30"
                >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${a.className}`}>
                          {a.initials}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-semibold">{c.nombre}</p>
                          <p className="text-xs text-muted-foreground">{c.n} transacció{c.n === 1 ? "n" : "nes"}</p>
                        </div>
                      </div>
                      {pendiente && <AlertCircle size={14} className="text-amber-400" />}
                    </div>
                    <dl className="mt-4 space-y-1.5 text-xs">
                      <Row label="Total gastado" value={<span className="font-semibold">{EUR(c.total)}</span>} />
                      <Row label="Boletas" value={String(c.boletas)} />
                      <Row label="Última compra" value={fmtDate(c.ultima)} />
                    </dl>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                        pendiente ? "bg-amber-500/10 text-amber-300 ring-amber-500/30" : "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
                      }`}>
                        {pendiente ? "Pendiente" : "Al día"}
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-right">Transacciones</th>
                  <th className="px-4 py-3 text-right">Boletas</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Última</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr
                    key={c.nombre}
                    onClick={() => setSelected(c.nombre)}
                    className="cursor-pointer border-b border-border/40 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td className="px-4 py-3 text-right">{c.n}</td>
                    <td className="px-4 py-3 text-right">{c.boletas}</td>
                    <td className="px-4 py-3 text-right">{EUR(c.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(c.ultima)}</td>
                    <td className="px-4 py-3">
                      {c.pendiente > 0
                        ? <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300 ring-1 ring-amber-500/30">Pendiente</span>
                        : <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300 ring-1 ring-emerald-500/30">Al día</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        <ClienteHistorialSheet cliente={selected} onClose={() => setSelected(null)} />
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground/90">{value}</dd>
    </div>
  );
}
