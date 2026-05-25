// Estilos de badges para categorías de boletas
export function categoryClass(cat?: string | null): string {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset";
  switch (cat) {
    case "Cat 1":
      return `${base} bg-amber-500/10 text-amber-300 ring-amber-500/30`;
    case "Cat 1 Premium":
      return `${base} bg-orange-500/10 text-orange-300 ring-orange-500/30`;
    case "Cat 2 Lateral":
      return `${base} bg-violet-500/10 text-violet-300 ring-violet-500/30`;
    case "Cat 2 Fondo":
      return `${base} bg-sky-500/10 text-sky-300 ring-sky-500/30`;
    case "Cat 3":
      return `${base} bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-500/30`;
    case "VIP":
      return `${base} bg-yellow-500/15 text-yellow-300 ring-yellow-500/40`;
    default:
      return `${base} bg-muted text-muted-foreground ring-border`;
  }
}

export function quienRecibeClass(q?: string | null): string {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset";
  if (q === "Iker") return `${base} bg-emerald-500/10 text-emerald-300 ring-emerald-500/30`;
  if (q === "Tomas") return `${base} bg-violet-500/10 text-violet-300 ring-violet-500/30`;
  return `${base} bg-muted text-muted-foreground ring-border`;
}

// Color de avatar deterministico por nombre
const AVATAR_PALETTE = [
  ["bg-pink-500/15", "text-pink-300", "ring-pink-500/30"],
  ["bg-amber-500/15", "text-amber-300", "ring-amber-500/30"],
  ["bg-violet-500/15", "text-violet-300", "ring-violet-500/30"],
  ["bg-sky-500/15", "text-sky-300", "ring-sky-500/30"],
  ["bg-emerald-500/15", "text-emerald-300", "ring-emerald-500/30"],
  ["bg-rose-500/15", "text-rose-300", "ring-rose-500/30"],
  ["bg-indigo-500/15", "text-indigo-300", "ring-indigo-500/30"],
  ["bg-teal-500/15", "text-teal-300", "ring-teal-500/30"],
];
export function avatarFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const [bg, text, ring] = AVATAR_PALETTE[h % AVATAR_PALETTE.length];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return { initials, className: `${bg} ${text} ring-1 ring-inset ${ring}` };
}

export const EUR = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const PCT = (n: number) => `${(n * 100).toFixed(1)}%`;

export const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(dt);
};
