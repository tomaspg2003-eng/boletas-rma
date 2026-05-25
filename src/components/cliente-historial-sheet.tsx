import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useTransacciones, type Transaccion } from "@/hooks/use-data";
import { avatarFor, categoryClass, EUR, fmtDate } from "@/lib/categories";
import { CheckCircle2, Clock } from "lucide-react";

export function ClienteHistorialSheet({
  cliente,
  onClose,
}: {
  cliente: string | null;
  onClose: () => void;
}) {
  const { data: tx } = useTransacciones();

  const { items, totals, seasons } = useMemo(() => {
    const items = (cliente ? tx.filter((t) => (t.cliente ?? "") === cliente) : [])
      .sort((a, b) => (b.fecha_pago ?? b.created_at).localeCompare(a.fecha_pago ?? a.created_at));
    const totals = items.reduce(
      (acc, t) => {
        acc.boletas += Number(t.num_boletas ?? 0);
        acc.total += Number(t.precio_venta_tot ?? 0);
        acc.miParte += Number(t.comision_pp ?? 0);
        if (!t.pagado) acc.pendiente += Number(t.precio_venta_tot ?? 0);
        return acc;
      },
      { boletas: 0, total: 0, miParte: 0, pendiente: 0 },
    );
    const m = new Map<string, { total: number; miParte: number; boletas: number; n: number; pendiente: number }>();
    for (const t of items) {
      const key = t.temporada ?? "—";
      const cur = m.get(key) ?? { total: 0, miParte: 0, boletas: 0, n: 0, pendiente: 0 };
      cur.total += Number(t.precio_venta_tot ?? 0);
      cur.miParte += Number(t.comision_pp ?? 0);
      cur.boletas += Number(t.num_boletas ?? 0);
      cur.n += 1;
      if (!t.pagado) cur.pendiente += Number(t.precio_venta_tot ?? 0);
      m.set(key, cur);
    }
    const seasons = Array.from(m, ([temp, v]) => ({ temp, ...v }))
      .sort((a, b) => (a.temp < b.temp ? 1 : -1));
    return { items, totals, seasons };
  }, [tx, cliente]);

  const a = avatarFor(cliente ?? "");

  return (
    <Sheet open={!!cliente} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto sm:max-w-xl">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${a.className}`}>
              {a.initials}
            </div>
            <div>
              <SheetTitle className="text-left">{cliente ?? ""}</SheetTitle>
              <SheetDescription className="text-left">
                {items.length} transacció{items.length === 1 ? "n" : "nes"} en el historial
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Stat label="Total gastado" value={EUR(totals.total)} />
          <Stat label="Mi parte" value={EUR(totals.miParte)} tone="amber" />
          <Stat label="Boletas" value={String(totals.boletas)} />
          <Stat label="Pendiente" value={EUR(totals.pendiente)} tone={totals.pendiente > 0 ? "rose" : "emerald"} />
        </div>

        <h3 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Desglose por temporada
        </h3>
        {seasons.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Sin datos.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Temporada</th>
                  <th className="px-3 py-2 text-right font-medium">Tx</th>
                  <th className="px-3 py-2 text-right font-medium">Boletas</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                  <th className="px-3 py-2 text-right font-medium">Mi parte</th>
                  <th className="px-3 py-2 text-right font-medium">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s.temp} className="border-t border-border/60">
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{s.temp}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{s.n}</td>
                    <td className="px-3 py-2 text-right">{s.boletas}</td>
                    <td className="px-3 py-2 text-right">{EUR(s.total)}</td>
                    <td className="px-3 py-2 text-right text-amber-300">{EUR(s.miParte)}</td>
                    <td className={`px-3 py-2 text-right ${s.pendiente > 0 ? "text-rose-300" : "text-muted-foreground"}`}>
                      {EUR(s.pendiente)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Historial
        </h3>
        <div className="space-y-2 pb-8">
          {items.length === 0 && (
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              Sin transacciones.
            </p>
          )}
          {items.map((t: Transaccion) => (
            <article key={t.id} className="rounded-xl border border-border bg-card p-3.5">
              <header className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold leading-tight">{t.partido ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(t.fecha_pago)} · {t.temporada ?? "—"}
                  </p>
                </div>
                {t.pagado ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300 ring-1 ring-emerald-500/30">
                    <CheckCircle2 size={11} /> Pagado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300 ring-1 ring-amber-500/30">
                    <Clock size={11} /> Pendiente
                  </span>
                )}
              </header>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {t.categoria && <span className={categoryClass(t.categoria)}>{t.categoria}</span>}
                <span className="text-muted-foreground">{t.num_boletas ?? 0} boletas</span>
                <span className="ml-auto font-semibold">{EUR(Number(t.precio_venta_tot))}</span>
              </div>
              {t.notas && (
                <p className="mt-2 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                  {t.notas}
                </p>
              )}
            </article>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "amber" | "emerald" | "rose" }) {
  const c =
    tone === "amber" ? "text-amber-300"
    : tone === "emerald" ? "text-emerald-300"
    : tone === "rose" ? "text-rose-300"
    : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${c}`}>{value}</p>
    </div>
  );
}
