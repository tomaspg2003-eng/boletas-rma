import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Topbar } from "@/components/layout/Topbar";

const transport = new DefaultChatTransport({ api: "/api/asistente" });

const SUGERENCIAS = [
  "¿Quién es mi mejor cliente este año?",
  "Resume las ventas del último mes",
  "¿Cuánto me debe Iker ahora mismo?",
  "Redacta un mensaje de disponibilidad para el próximo clásico",
];

export function AsistentePage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({ transport });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const loading = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <>
      <Topbar title="Asistente IA" subtitle="Pregúntale sobre tu negocio" />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">Asistente RMA</h2>
                    <p className="text-xs text-muted-foreground">
                      Conectado con tus transacciones, clientes y partidos.
                    </p>
                  </div>
                </div>
                <p className="mb-3 text-xs font-medium text-muted-foreground">Prueba con:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-lg border border-border bg-background/40 px-3 py-2 text-left text-xs text-foreground/80 hover:border-amber-500/40 hover:text-amber-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const mine = m.role === "user";
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      mine
                        ? "bg-amber-500/90 text-amber-950"
                        : "border border-border bg-card text-foreground/90"
                    }`}
                  >
                    {mine ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_li]:my-0">
                        <ReactMarkdown>{text || "…"}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> Pensando…
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                Error: {error.message}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-background/60 p-3 md:p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); submit(input); }}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); submit(input);
                }
              }}
              placeholder="Escribe tu pregunta… (Enter para enviar)"
              rows={1}
              className="max-h-40 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
