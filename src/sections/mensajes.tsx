import { useMemo, useState } from "react";
import { Copy, DollarSign, MessageSquare, CheckCircle2, Gift, Heart } from "lucide-react";
import { toast } from "sonner";

import { Topbar, type YearFilter } from "@/components/layout/Topbar";
import { useTransacciones } from "@/hooks/use-data";
import { EUR } from "@/lib/categories";

export function MensajesPage() {
  const [year, setYear] = useState<YearFilter>("Todo");
  const { data: tx } = useTransacciones();
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
          <h2 className="text-lg font-semibold">Mensajes</h2>
          <p className="text-xs text-muted-foreground">Plantillas listas para copiar y pegar en WhatsApp.</p>
        </header>

        <DisponibilidadCard />
        <ConfirmacionCard tone="emerald" who="Tomas" icon={<MessageSquare size={14} />} title="Confirmación de compra · Tomas"
          desc="Mensaje de confirmación con los datos bancarios de Tomás." tx={tx}
          bankBlock={`Para completar la reserva, te comparto los métodos de pago:\n\n1. Transferencia bancaria\n   BBVA · IBAN: ES91 0182 2458 1302 0118 4928\n   BIC: BBVAESMMXXX\n   Titular: Tomás Pérez de Greiff\n   Dirección: General Pardiñas 46\n\n2. Bizum: +57 316 874 9873`} />

        <ConfirmacionCard tone="violet" who="Iker" icon={<MessageSquare size={14} />} title="Confirmación de compra · Iker"
          desc="Mensaje de confirmación con los datos bancarios de Iker." tx={tx}
          bankBlock={`Para completar la reserva, te comparto los métodos de pago:\n\n1. Transferencia bancaria\n   CaixaBank · ES18 2100 0595 2113 0025 1467\n   Titular: Iker Fernández López\n\n2. Bizum: +34 645 54 97 97`} />
        <SimpleTemplateCard icon={<CheckCircle2 size={14} />} title="Confirmación de entrega"
          desc="Mensaje para cuando las entradas ya fueron entregadas." tx={tx}
          builder={(t) => `Hola ${firstName(t.cliente)},\n\nTe confirmo la entrega de las ${t.num_boletas} entrada(s) para ${t.partido}.\nMuchas gracias por la confianza. ¡Disfruta el partido! 🏟️⚽`} />
        <SimpleTemplateCard icon={<Gift size={14} />} title="Agradecimiento breve"
          desc="Mensaje corto de agradecimiento post-partido." tx={tx}
          builder={(t) => `Hola ${firstName(t.cliente)},\n\nGracias por confiar en nosotros para ${t.partido}.\nCuando quieras boletas para el próximo, escríbeme y te las consigo. 🤝`} />
        <SimpleTemplateCard icon={<Heart size={14} />} title="Agradecimiento / Post Partido"
          desc="Mensaje para pedir feedback y comentarios después del partido." tx={tx}
          builder={(t) => `Hola ${firstName(t.cliente)}, espero que estés muy bien!\n\nQuería saber cómo había sido tu experiencia en el partido con los asientos, y escuchar tus comentarios, tanto positivos como negativos.\n\nTrabajamos siempre para dar el mejor servicio y que nuestros clientes puedan tener la mejor experiencia posible. Si consideras que hay algo que pueda mejorar, por favor házmelo saber. Espero que lo hayas pasado super bién. ¡Un abrazo! Quedo al tanto de tus comentarios.`} />
      </main>
    </>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Mensaje copiado");
  } catch { toast.error("No se pudo copiar"); }
}

function CardShell({ icon, title, desc, tone, children }: { icon: React.ReactNode; title: string; desc: string; tone: "amber" | "emerald" | "violet" | "sky"; children: React.ReactNode }) {
  const toneBg = tone === "amber" ? "bg-amber-500/15 text-amber-300"
    : tone === "emerald" ? "bg-emerald-500/15 text-emerald-300"
    : tone === "violet" ? "bg-violet-500/15 text-violet-300"
    : "bg-sky-500/15 text-sky-300";
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneBg}`}>{icon}</span>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function DisponibilidadCard() {
  const equipos = [
    "Real Madrid", "FC Barcelona", "Atlético de Madrid", "Athletic Club",
    "Real Sociedad", "Sevilla FC", "Valencia CF", "Villarreal CF", "Real Betis",
  ];
  const [local, setLocal] = useState("Real Madrid");
  const [rival, setRival] = useState("");
  const [comp, setComp] = useState("LaLiga");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horaConf, setHoraConf] = useState(true);
  const [precios, setPrecios] = useState<Record<string, string>>({});

  const cats = ["Cat. 1 Premium", "Cat. 1", "Cat. 2 Lateral", "Cat. 2 Fondo", "Cat. 3", "VIP"];

  const mensaje = useMemo(() => {
    if (!rival) return "";
    const lineas: string[] = [
      `Hola! Tengo disponibilidad para ${local} vs ${rival} (${comp}).`,
      fecha ? `📅 ${fecha}${hora ? ` · ${hora}${horaConf ? "" : " (por confirmar)"}` : ""}` : "",
      "",
      "Precios por categoría:",
      ...cats.filter((c) => precios[c]).map((c) => `• ${c}: ${precios[c]} €`),
      "",
      "Avísame si te interesa para apartar.",
    ];
    return lineas.filter(Boolean).join("\n");
  }, [local, rival, comp, fecha, hora, horaConf, precios]);

  return (
    <CardShell icon={<DollarSign size={14} />} title="Disponibilidad de precios" tone="sky"
      desc="Genera un mensaje con el partido, competición, fecha y precios por categoría.">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Equipo local">
          <select value={local} onChange={(e) => setLocal(e.target.value)} className={inputCls}>
            {equipos.map((eq) => <option key={eq}>{eq}</option>)}
          </select>
        </Field>
        <Field label="Equipo rival">
          <input value={rival} onChange={(e) => setRival(e.target.value)} placeholder="Ej. Athletic Bilbao" className={inputCls} />
        </Field>
        <Field label="Competición">
          <select value={comp} onChange={(e) => setComp(e.target.value)} className={inputCls}>
            <option>LaLiga</option><option>Champions</option><option>Copa</option><option>Amistoso</option>
          </select>
        </Field>
        <Field label="Fecha"><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} /></Field>
        <Field label="Hora (España)">
          <div className="flex items-center gap-2">
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={inputCls} />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={horaConf} onChange={(e) => setHoraConf(e.target.checked)} />
              Hora confirmada
            </label>
          </div>
        </Field>
      </div>
      <p className="mt-4 mb-2 text-xs text-muted-foreground">Precios por categoría (opcional — dejar vacío para omitir)</p>
      <div className="grid gap-2 md:grid-cols-3">
        {cats.map((c) => (
          <Field key={c} label={c}>
            <input placeholder="€ —" value={precios[c] ?? ""} onChange={(e) => setPrecios({ ...precios, [c]: e.target.value })} className={inputCls} />
          </Field>
        ))}
      </div>
      <textarea readOnly value={mensaje} placeholder="El mensaje se generará aquí…"
        className="mt-4 h-40 w-full resize-y rounded-lg border border-border bg-background/40 p-3 font-mono text-xs" />
      <button disabled={!mensaje} onClick={() => copyText(mensaje)}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25 disabled:opacity-40">
        <Copy size={12} /> Copiar mensaje
      </button>
    </CardShell>
  );
}

function ConfirmacionCard({
  tone, who, icon, title, desc, tx, bankBlock,
}: {
  tone: "emerald" | "violet"; who: string; icon: React.ReactNode; title: string; desc: string;
  tx: ReturnType<typeof useTransacciones>["data"]; bankBlock: string;
}) {
  const opciones = tx.filter((t) => !t.quien_recibe || t.quien_recibe === who).slice(0, 50);
  const [id, setId] = useState("");
  const sel = opciones.find((t) => t.id === id);
  const mensaje = sel
    ? `Hola ${firstName(sel.cliente)},\n\nTe confirmo la compra para el partido entre Real Madrid y ${sel.partido}.\n🎟️ ${sel.num_boletas} entradas · ${sel.categoria ?? "—"} · ${Math.round(Number(sel.precio_venta_unit ?? 0))} €/entrada\n\nTotal a pagar: ${EUR(Number(sel.precio_venta_tot))}\n\n${bankBlock}`
    : "";
  return (
    <CardShell icon={icon} title={title} desc={desc} tone={tone}>
      <Field label="Selecciona la transacción">
        <select value={id} onChange={(e) => setId(e.target.value)} className={inputCls}>
          <option value="">— Selecciona una venta —</option>
          {opciones.map((t) => (
            <option key={t.id} value={t.id}>
              {t.partido} · {t.cliente} · {t.num_boletas}x
            </option>
          ))}
        </select>
      </Field>
      <textarea readOnly value={mensaje}
        className="mt-3 h-44 w-full resize-y rounded-lg border border-border bg-background/40 p-3 font-mono text-xs"
        placeholder="Selecciona una venta para generar el mensaje…" />
      <button disabled={!mensaje} onClick={() => copyText(mensaje)}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25 disabled:opacity-40">
        <Copy size={12} /> Copiar mensaje
      </button>
    </CardShell>
  );
}

function SimpleTemplateCard({
  icon, title, desc, tx, builder,
}: {
  icon: React.ReactNode; title: string; desc: string;
  tx: ReturnType<typeof useTransacciones>["data"];
  builder: (t: ReturnType<typeof useTransacciones>["data"][number]) => string;
}) {
  const [id, setId] = useState("");
  const sel = tx.find((t) => t.id === id);
  const mensaje = sel ? builder(sel) : "";
  return (
    <CardShell icon={icon} title={title} desc={desc} tone="emerald">
      <Field label="Selecciona la transacción">
        <select value={id} onChange={(e) => setId(e.target.value)} className={inputCls}>
          <option value="">— Selecciona una venta —</option>
          {tx.slice(0, 50).map((t) => (
            <option key={t.id} value={t.id}>{t.partido} · {t.cliente} · {t.num_boletas}x</option>
          ))}
        </select>
      </Field>
      <textarea readOnly value={mensaje}
        className="mt-3 h-32 w-full resize-y rounded-lg border border-border bg-background/40 p-3 font-mono text-xs" />
      <button disabled={!mensaje} onClick={() => copyText(mensaje)}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25 disabled:opacity-40">
        <Copy size={12} /> Copiar mensaje
      </button>
    </CardShell>
  );
}

function firstName(full: string | null | undefined) {
  if (!full) return "—";
  return full.trim().split(/\s+/)[0];
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
