import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";

import { Topbar, type YearFilter } from "@/components/layout/Topbar";
import { useTransacciones } from "@/hooks/use-data";
import { fmtDate, EUR } from "@/lib/categories";

export function AgendaPage() {
  const [year, setYear] = useState<YearFilter>("Todo");
  const { data: tx } = useTransacciones();

  const partidos = useMemo(() => {
    const m = new Map<string, { partido: string; fecha: string | null; clientes: Set<string>; boletas: number; ventas: number }>();
    for (const t of tx) {
      if (!t.partido) continue;
      const cur = m.get(t.partido) ?? { partido: t.partido, fecha: null, clientes: new Set<string>(), boletas: 0, ventas: 0 };
      if (t.fecha_pago && (!cur.fecha || t.fecha_pago < cur.fecha)) cur.fecha = t.fecha_pago;
      if (t.cliente) cur.clientes.add(t.cliente);
      cur.boletas += Number(t.num_boletas ?? 0);
      cur.ventas += Number(t.precio_venta_tot ?? 0);
      m.set(t.partido, cur);
    }
    return Array.from(m.values()).sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  }, [tx]);

  const pendientes = tx.filter((t) => !t.pagado).length;

  return (
    <>
      <Topbar title="Ventas de Boletas" subtitle={`${tx.length} transacciones visibles`}
        yearFilter={year} onYearChange={setYear} pendienteCount={pendientes} />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <header>
          <h2 className="text-lg font-semibold">Agenda</h2>
          <p className="text-xs text-muted-foreground">Partidos con ventas registradas</p>
        </header>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {partidos.map((p) => (
            <article key={p.partido} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                  <Calendar size={14} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.partido}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(p.fecha)}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Boletas</dt><dd className="font-semibold">{p.boletas}</dd></div>
                <div><dt className="text-muted-foreground">Clientes</dt><dd className="font-semibold">{p.clientes.size}</dd></div>
                <div><dt className="text-muted-foreground">Ventas</dt><dd className="font-semibold text-amber-300">{EUR(p.ventas)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
