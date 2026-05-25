import { useMemo, useState } from "react";
import { Plus, Trash2, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

import { Topbar, type YearFilter } from "@/components/layout/Topbar";
import { useTransacciones, useAjustes } from "@/hooks/use-data";
import { insertAjuste, deleteAjuste as deleteAjusteFn, setLiquidada } from "@/lib/data.functions";
import { EUR, fmtDate } from "@/lib/categories";

export function NettingPage() {
  const [year, setYear] = useState<YearFilter>("Todo");
  const { data: tx, refresh: refreshTx } = useTransacciones();
  const { data: ajustes, refresh: refreshAj } = useAjustes();

  const saldo = useMemo(() => {
    let iker = 0, tomas = 0;
    for (const t of tx) {
      if (t.liquidada) continue;
      const v = Number(t.comision_pp ?? 0);
      if (t.quien_recibe === "Iker") iker += v;
      if (t.quien_recibe === "Tomas") tomas += v;
    }
    let neto = iker - tomas;
    for (const a of ajustes) {
      const m = Number(a.monto ?? 0);
      if ((a.quien_paga ?? "").toUpperCase() === "IKER") neto += m;
      else neto -= m;
    }
    return { iker, tomas, neto };
  }, [tx, ajustes]);

  const pendientes = tx.filter((t) => !t.pagado).length;
  const sinLiquidar = tx.filter((t) => t.pagado && !t.liquidada);

  // Form
  const [desc, setDesc] = useState("");
  const [monto, setMonto] = useState("");
  const [quien, setQuien] = useState<"IKER" | "TOMAS">("IKER");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  async function addAjuste() {
    if (!desc || !monto) return;
    try {
      await insertAjuste({ data: { descripcion: desc, monto: Number(monto), quien_paga: quien, fecha } });
      toast.success("Ajuste registrado"); setDesc(""); setMonto(""); refreshAj();
    } catch (e) { toast.error((e as Error).message); }
  }
  async function deleteAjuste(id: string) {
    try {
      await deleteAjusteFn({ data: { id } });
      toast.success("Ajuste eliminado"); refreshAj();
    } catch (e) { toast.error((e as Error).message); }
  }
  async function liquidarPendientes() {
    const ids = sinLiquidar.map((t) => t.id);
    if (!ids.length) { toast.info("No hay transacciones para liquidar"); return; }
    try {
      await setLiquidada({ data: { ids } });
      toast.success(`${ids.length} transacciones liquidadas`); refreshTx();
    } catch (e) { toast.error((e as Error).message); }
  }

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
          <h2 className="text-lg font-semibold">Liquidación</h2>
          <p className="text-xs text-muted-foreground">Saldo neto entre Iker y Tomás · ajustes manuales</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <SaldoBox label="Recibido por Iker" value={EUR(saldo.iker)} tone="emerald" />
          <SaldoBox label="Recibido por Tomás" value={EUR(saldo.tomas)} tone="violet" />
          <SaldoBox
            label={saldo.neto >= 0 ? "Iker te debe" : "Le debes a Iker"}
            value={EUR(Math.abs(saldo.neto))}
            tone="amber"
            big
          />
        </div>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Transacciones por liquidar</h3>
              <p className="text-xs text-muted-foreground">{sinLiquidar.length} pagadas pero no liquidadas</p>
            </div>
            <button onClick={liquidarPendientes}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25">
              <ArrowLeftRight size={12} /> Liquidar pendientes
            </button>
          </div>
        </section>

        {/* Form ajuste */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Nuevo ajuste manual</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción"
              className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm md:col-span-2" />
            <input value={monto} onChange={(e) => setMonto(e.target.value)} type="number" placeholder="Monto €"
              className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm" />
            <select value={quien} onChange={(e) => setQuien(e.target.value as "IKER" | "TOMAS")}
              className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
              <option value="IKER">IKER paga</option>
              <option value="TOMAS">TOMÁS paga</option>
            </select>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
              className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm md:col-span-3" />
            <button onClick={addAjuste}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500/90 px-3 py-2 text-sm font-medium text-amber-950 hover:bg-amber-500">
              <Plus size={14} /> Agregar
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <header className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Ajustes</h3>
          </header>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2">Paga</th>
                <th className="px-4 py-2 text-right">Monto</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ajustes.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin ajustes</td></tr>
              )}
              {ajustes.map((a) => (
                <tr key={a.id} className="border-t border-border/40">
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(a.fecha)}</td>
                  <td className="px-4 py-3">{a.descripcion}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] ring-1 ring-inset ${
                      (a.quien_paga ?? "").toUpperCase() === "IKER"
                        ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
                        : "bg-violet-500/10 text-violet-300 ring-violet-500/30"
                    }`}>{a.quien_paga}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{EUR(Number(a.monto))}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteAjuste(a.id)} className="text-muted-foreground hover:text-rose-400">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}

function SaldoBox({ label, value, tone, big }: { label: string; value: string; tone: "amber" | "emerald" | "violet"; big?: boolean }) {
  const cls = tone === "amber" ? "bg-amber-500/10 ring-amber-500/30 text-amber-300"
    : tone === "emerald" ? "bg-emerald-500/10 ring-emerald-500/30 text-emerald-300"
    : "bg-violet-500/10 ring-violet-500/30 text-violet-300";
  return (
    <div className={`rounded-xl ring-1 ring-inset p-4 ${cls}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className={`mt-2 font-semibold tracking-tight ${big ? "text-4xl" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
