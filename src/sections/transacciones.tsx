import { useMemo, useState } from "react";
import { Search, Filter, Download, Check, CheckCheck, Pencil, Trash2 } from "lucide-react";

import { Topbar, type YearFilter } from "@/components/layout/Topbar";
import { useTransacciones } from "@/hooks/use-data";
import { deleteTransaccion, setPagado } from "@/lib/data.functions";
import { categoryClass, quienRecibeClass, EUR, fmtDate } from "@/lib/categories";
import { useTransaccionDialog } from "@/contexts/transaccion-dialog-context";
import { toast } from "sonner";
import { useEffect } from "react";

export function TransaccionesPage() {
  const [year, setYear] = useState<YearFilter>("Todo");
  const [q, setQ] = useState("");
  const { data: tx, loading, refresh } = useTransacciones();
  const { openCreate, openEdit, version } = useTransaccionDialog();

  useEffect(() => { refresh(); }, [version, refresh]);

  async function deleteTx(id: string) {
    if (!confirm("¿Eliminar esta transacción? Esta acción no se puede deshacer.")) return;
    try {
      await deleteTransaccion({ data: { id } });
      toast.success("Transacción eliminada"); refresh();
    } catch (e) { toast.error((e as Error).message); }
  }

  const filtered = useMemo(() => {
    const yr = year === "Todo" ? tx : tx.filter((t) => String(t.año) === year);
    if (!q.trim()) return yr;
    const s = q.toLowerCase();
    return yr.filter((t) =>
      (t.partido ?? "").toLowerCase().includes(s) ||
      (t.cliente ?? "").toLowerCase().includes(s) ||
      (t.notas ?? "").toLowerCase().includes(s),
    );
  }, [tx, year, q]);

  const pendientes = filtered.filter((t) => !t.pagado).length;

  async function togglePagado(id: string, val: boolean) {
    try {
      await setPagado({ data: { ids: [id], pagado: val } });
      toast.success(val ? "Marcado como pagado" : "Marcado como pendiente"); refresh();
    } catch (e) { toast.error((e as Error).message); }
  }

  async function marcarTodoAlDia() {
    const ids = filtered.filter((t) => !t.pagado).map((t) => t.id);
    if (!ids.length) { toast.info("Ya está todo al día"); return; }
    if (!confirm(`Marcar ${ids.length} transacciones como pagadas?`)) return;
    try {
      await setPagado({ data: { ids, pagado: true } });
      toast.success(`${ids.length} transacciones al día`); refresh();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <>
      <Topbar
        title="Ventas de Boletas"
        subtitle={`${filtered.length} de ${tx.length} registros`}
        yearFilter={year}
        onYearChange={setYear}
        pendienteCount={pendientes}
      />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Transacciones</h2>
            <p className="text-xs text-muted-foreground">{filtered.length} de {tx.length} registros</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-400"
            >
              + Nueva Entrada
            </button>
            <button
              onClick={marcarTodoAlDia}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25"
            >
              <CheckCheck size={14} /> Todo al día
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted/40">
              <Download size={14} /> Exportar Excel
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted/40">
              <Filter size={14} /> Filtros
            </button>
          </div>
        </header>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por partido, cliente o notas…"
            className="w-full rounded-lg border border-border bg-card px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <Th>Partido</Th><Th>Cliente</Th><Th>Categoría</Th>
                  <Th className="text-right">Boletas</Th>
                  <Th className="text-right">Venta Total</Th>
                  <Th className="text-right">Ganancia</Th>
                  <Th className="text-right">Mi parte</Th>
                  <Th>Recibió</Th><Th>Tipo</Th><Th>Fecha</Th>
                  <Th className="text-center">Pagado</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={12} className="p-8 text-center text-muted-foreground">Cargando…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={12} className="p-8 text-center text-muted-foreground">Sin resultados</td></tr>
                )}
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{t.partido ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground/85">{t.cliente ?? "—"}</td>
                    <td className="px-4 py-3">
                      {t.categoria
                        ? <span className={categoryClass(t.categoria)}>{t.categoria}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">{t.num_boletas ?? 0}</td>
                    <td className="px-4 py-3 text-right">{EUR(Number(t.precio_venta_tot))}</td>
                    <td className="px-4 py-3 text-right">{EUR(Number(t.ganancia))}</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-300">
                      {EUR(Number(t.comision_pp))}
                    </td>
                    <td className="px-4 py-3">
                      {t.quien_recibe
                        ? <span className={quienRecibeClass(t.quien_recibe)}>{t.quien_recibe}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.tipo_boleta ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(t.fecha_pago)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePagado(t.id, !t.pagado)}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                          t.pagado ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300" : "border-border text-transparent hover:border-amber-400/40"
                        }`}
                        aria-label="Toggle pagado"
                      >
                        {t.pagado && <Check size={12} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-amber-300"
                          aria-label="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteTx(t.id)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
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

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-medium ${className ?? ""}`}>{children}</th>;
}
