import { useEffect, useState, type FormEvent } from "react";
import { Lock, LogIn, Loader2, Ticket } from "lucide-react";
import { loginWithPassword, logoutSession, checkSession } from "@/lib/app-auth.functions";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await checkSession();
        if (!cancelled) setAuthed(Boolean(res?.authed));
      } catch {
        if (!cancelled) setAuthed(false);
      } finally {
        if (!cancelled) {
          setReady(true);
          requestAnimationFrame(() => setMounted(true));
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginWithPassword({ data: { password: pwd } });
      if (!res?.ok) {
        setError("Clave incorrecta");
        setLoading(false);
        return;
      }
      // Smooth transition before entering
      window.setTimeout(() => setAuthed(true), 600);
    } catch {
      setError("No se pudo iniciar sesión");
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border/80 bg-card/90 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-600/10 ring-1 ring-amber-400/30">
            <Loader2 size={20} className="animate-spin text-amber-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">RMA Tickets</h1>
            <p className="mt-1 text-xs text-muted-foreground">Cargando acceso seguro…</p>
          </div>
        </div>
      </div>
    );
  }
  if (authed) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div
        className={`relative w-full max-w-sm transition-all duration-700 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div
          className={`mb-6 flex flex-col items-center text-center transition-all delay-100 duration-700 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-600/10 ring-1 ring-amber-400/30">
            <Ticket size={20} className="text-amber-300" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">RMA Tickets</h1>
          <p className="mt-1 text-xs text-muted-foreground">Plataforma de gestión de boletas</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20">
              <Lock size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Acceso privado</h2>
              <p className="text-[11px] text-muted-foreground">Inicia sesión para continuar</p>
            </div>
          </div>

          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Clave</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoFocus
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            placeholder="••••••••"
          />
          <div className={`overflow-hidden transition-all duration-300 ${error ? "mt-2 max-h-8 opacity-100" : "max-h-0 opacity-0"}`}>
            <p className="text-xs text-rose-400">{error}</p>
          </div>

          <button
            type="submit"
            disabled={loading || !pwd}
            className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2.5 text-sm font-semibold text-amber-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (<><Loader2 size={14} className="animate-spin" /> Entrando…</>) : (<><LogIn size={14} className="transition-transform group-hover:translate-x-0.5" /> Entrar</>)}
          </button>
        </form>

        <div
          className={`mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80 transition-all delay-500 duration-1000 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <span>Powered by</span>
          <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text font-semibold tracking-wide text-transparent">Nucleo</span>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-500 ${
          loading ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={26} className="animate-spin text-amber-300" />
          <p className="text-xs text-muted-foreground">Cargando tu plataforma…</p>
        </div>
      </div>
    </div>
  );
}

export async function logout() {
  try { await logoutSession(); } catch { /* ignore */ }
  if (typeof window !== "undefined") window.location.reload();
}
