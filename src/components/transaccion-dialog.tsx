import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { upsertTransaccion } from "@/lib/data.functions";
import type { Transaccion } from "@/hooks/use-data";

type Mode = "create" | "edit";

const CATEGORIAS = ["Cat. 1 Premium", "Cat. 1", "Cat. 2 Lateral", "Cat. 2 Fondo", "Cat. 3", "VIP"];
const TIPOS = ["Digital", "Física", "PDF", "Móvil"];
const TEMPORADAS = ["23/24", "24/25", "25/26", "26/27"];

type FormState = {
  partido: string;
  temporada: string;
  categoria: string;
  cliente: string;
  num_boletas: string;
  precio_compra_unit: string;
  precio_venta_unit: string;
  comision_pct: string;
  quien_recibe: string;
  tipo_boleta: string;
  fecha_pago: string;
  notas: string;
  pagado: boolean;
};

function emptyForm(): FormState {
  return {
    partido: "",
    temporada: "25/26",
    categoria: "Cat. 1",
    cliente: "",
    num_boletas: "1",
    precio_compra_unit: "",
    precio_venta_unit: "",
    comision_pct: "0.5",
    quien_recibe: "Iker",
    tipo_boleta: "Digital",
    fecha_pago: "",
    notas: "",
    pagado: false,
  };
}

function fromTx(t: Transaccion): FormState {
  return {
    partido: t.partido ?? "",
    temporada: t.temporada ?? "25/26",
    categoria: t.categoria ?? "Cat. 1",
    cliente: t.cliente ?? "",
    num_boletas: String(t.num_boletas ?? 1),
    precio_compra_unit: String(t.precio_compra_unit ?? ""),
    precio_venta_unit: String(t.precio_venta_unit ?? ""),
    comision_pct: String(t.comision_pct ?? 0.5),
    quien_recibe: t.quien_recibe ?? "Iker",
    tipo_boleta: t.tipo_boleta ?? "Digital",
    fecha_pago: t.fecha_pago ?? "",
    notas: t.notas ?? "",
    pagado: !!t.pagado,
  };
}

export function TransaccionDialog({
  open, mode, initial, onClose, onSaved,
}: {
  open: boolean;
  mode: Mode;
  initial?: Transaccion | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(mode === "edit" && initial ? fromTx(initial) : emptyForm());
  }, [open, mode, initial]);

  const calc = useMemo(() => {
    const n = Number(form.num_boletas) || 0;
    const pcu = Number(form.precio_compra_unit) || 0;
    const pvu = Number(form.precio_venta_unit) || 0;
    const pct = Number(form.comision_pct) || 0;
    const compra = n * pcu;
    const venta = n * pvu;
    const ganancia = venta - compra;
    const miParte = ganancia * pct;
    return { compra, venta, ganancia, miParte };
  }, [form]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.partido || !form.cliente) {
      toast.error("Partido y cliente son obligatorios");
      return;
    }
    setSaving(true);
    const año = form.temporada
      ? 2000 + Number(form.temporada.split("/")[1])
      : new Date().getFullYear();
    const payload = {
      partido: form.partido,
      temporada: form.temporada,
      categoria: form.categoria,
      cliente: form.cliente,
      num_boletas: Number(form.num_boletas) || 0,
      precio_compra_unit: Number(form.precio_compra_unit) || 0,
      precio_compra_tot: calc.compra,
      precio_venta_unit: Number(form.precio_venta_unit) || 0,
      precio_venta_tot: calc.venta,
      ganancia: calc.ganancia,
      comision_pct: Number(form.comision_pct) || 0,
      comision_pp: calc.miParte,
      quien_recibe: form.quien_recibe,
      tipo_boleta: form.tipo_boleta,
      fecha_pago: form.fecha_pago || null,
      notas: form.notas || null,
      pagado: form.pagado,
      año,
    };
    try {
      await upsertTransaccion({
        data: { id: mode === "edit" && initial ? initial.id : undefined, values: payload },
      });
      setSaving(false);
      toast.success(mode === "edit" ? "Transacción actualizada" : "Transacción creada");
      onSaved();
      onClose();
    } catch (e) {
      setSaving(false);
      toast.error((e as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar transacción" : "Nueva transacción"}</DialogTitle>
          <DialogDescription>
            Los totales se calculan automáticamente a partir de boletas y precio unitario.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Partido *">
            <input value={form.partido} onChange={(e) => set("partido", e.target.value)}
              placeholder="Real Madrid vs Athletic Bilbao" className={inputCls} />
          </Field>
          <Field label="Cliente *">
            <input value={form.cliente} onChange={(e) => set("cliente", e.target.value)}
              placeholder="Nombre completo" className={inputCls} />
          </Field>
          <Field label="Temporada">
            <select value={form.temporada} onChange={(e) => set("temporada", e.target.value)} className={inputCls}>
              {TEMPORADAS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Categoría">
            <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)} className={inputCls}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Nº Boletas">
            <input type="number" min={1} value={form.num_boletas}
              onChange={(e) => set("num_boletas", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Tipo de boleta">
            <select value={form.tipo_boleta} onChange={(e) => set("tipo_boleta", e.target.value)} className={inputCls}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Precio compra unit. (€)">
            <input type="number" step="0.01" value={form.precio_compra_unit}
              onChange={(e) => set("precio_compra_unit", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Precio venta unit. (€)">
            <input type="number" step="0.01" value={form.precio_venta_unit}
              onChange={(e) => set("precio_venta_unit", e.target.value)} className={inputCls} />
          </Field>

          <Field label="Quién recibe">
            <select value={form.quien_recibe} onChange={(e) => set("quien_recibe", e.target.value)} className={inputCls}>
              <option>Iker</option>
              <option>Tomas</option>
            </select>
          </Field>
          <Field label="Comisión (0-1)">
            <input type="number" step="0.01" min={0} max={1} value={form.comision_pct}
              onChange={(e) => set("comision_pct", e.target.value)} className={inputCls} />
          </Field>

          <Field label="Fecha de pago">
            <input type="date" value={form.fecha_pago}
              onChange={(e) => set("fecha_pago", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Estado">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background/40 px-3 text-sm">
              <input type="checkbox" checked={form.pagado}
                onChange={(e) => set("pagado", e.target.checked)} />
              Pagado
            </label>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Notas">
              <textarea value={form.notas} onChange={(e) => set("notas", e.target.value)}
                rows={2} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs sm:grid-cols-4">
          <Stat label="Compra total" value={`€ ${calc.compra.toFixed(2)}`} />
          <Stat label="Venta total" value={`€ ${calc.venta.toFixed(2)}`} />
          <Stat label="Ganancia" value={`€ ${calc.ganancia.toFixed(2)}`} />
          <Stat label="Mi parte" value={`€ ${calc.miParte.toFixed(2)}`} accent />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Crear transacción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-semibold ${accent ? "text-amber-300" : ""}`}>{value}</p>
    </div>
  );
}
