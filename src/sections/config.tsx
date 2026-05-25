import { useEffect, useState } from "react";
import { Save, LogOut, User } from "lucide-react";
import { toast } from "sonner";

import { Topbar } from "@/components/layout/Topbar";
import { listConfig, upsertConfig } from "@/lib/data.functions";
import { logout } from "@/components/auth-gate";

const KEYS = [
  { k: "comision_default", label: "Comisión por defecto (%)", multi: false, def: "50" },
];

const USUARIO = {
  nombre: "Tomás Pérez de Greiff",
  rol: "Administrador",
  email: "tomas@rma-tickets.local",
  telefono: "+57 316 874 9873",
};

export function ConfigPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listConfig();
        const map: Record<string, string> = {};
        for (const k of KEYS) map[k.k] = k.def;
        for (const row of data ?? []) map[row.key] = row.value ?? "";
        setValues(map);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    const rows = KEYS.map((k) => ({ key: k.k, value: values[k.k] ?? "" }));
    try {
      await upsertConfig({ data: { rows } });
      toast.success("Configuración guardada");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <>
      <Topbar title="Configuración" subtitle="Cuenta y preferencias" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        {/* Usuario */}
        <section className="rounded-xl border border-border bg-card p-5">
          <header className="mb-4 flex items-center gap-2">
            <User size={16} className="text-amber-300" />
            <h2 className="text-sm font-semibold">Mi cuenta</h2>
          </header>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-base font-semibold text-amber-300">
              TP
            </div>
            <div className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
              <Field label="Nombre" value={USUARIO.nombre} />
              <Field label="Rol" value={USUARIO.rol} />
              <Field label="Email" value={USUARIO.email} />
              <Field label="Teléfono" value={USUARIO.telefono} />
              <Field label="Clave" value="••••••••" />
              <Field label="Estado" value="Sesión activa" tone="emerald" />
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </section>

        {/* Preferencias */}
        {loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : (
          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Preferencias</h2>
            {KEYS.map((k) => (
              <label key={k.k} className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">{k.label}</span>
                {k.multi ? (
                  <textarea value={values[k.k] ?? ""} onChange={(e) => setValues({ ...values, [k.k]: e.target.value })}
                    className="h-24 w-full rounded-lg border border-border bg-background/40 p-3 text-sm" />
                ) : (
                  <input value={values[k.k] ?? ""} onChange={(e) => setValues({ ...values, [k.k]: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm" />
                )}
              </label>
            ))}
            <button onClick={save}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500/90 px-3 py-2 text-sm font-medium text-amber-950 hover:bg-amber-500">
              <Save size={14} /> Guardar
            </button>
          </section>
        )}
      </main>
    </>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "emerald" }) {
  const c = tone === "emerald" ? "text-emerald-300" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${c}`}>{value}</p>
    </div>
  );
}
