import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { getAppSession } from "@/lib/session-impl.server";

type Body = { messages?: unknown };

export const Route = createFileRoute("/api/asistente")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Require app session (browser sends the session cookie automatically).
        const session = await getAppSession();
        if (!session.data?.authed) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { messages } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Build lightweight business context from Supabase (admin client, RLS bypassed)
        let contexto = "";
        try {
          const { data: tx } = await supabaseAdmin
            .from("transacciones")
            .select("partido,cliente,categoria,num_boletas,precio_venta_tot,ganancia,comision_pp,quien_recibe,pagado,fecha_pago,temporada")
            .order("created_at", { ascending: false })
            .limit(200);

          if (tx?.length) {
            let ventas = 0, ganancia = 0, miParte = 0, boletas = 0, porCobrar = 0;
            const clientes = new Map<string, { n: number; total: number; pend: number }>();
            const partidos = new Map<string, { n: number; ventas: number }>();
            for (const t of tx) {
              const vt = Number(t.precio_venta_tot ?? 0);
              ventas += vt;
              ganancia += Number(t.ganancia ?? 0);
              miParte += Number(t.comision_pp ?? 0);
              boletas += Number(t.num_boletas ?? 0);
              if (!t.pagado) porCobrar += vt;
              if (t.cliente) {
                const c = clientes.get(t.cliente) ?? { n: 0, total: 0, pend: 0 };
                c.n += 1; c.total += vt; if (!t.pagado) c.pend += vt;
                clientes.set(t.cliente, c);
              }
              if (t.partido) {
                const p = partidos.get(t.partido) ?? { n: 0, ventas: 0 };
                p.n += 1; p.ventas += vt;
                partidos.set(t.partido, p);
              }
            }
            const topClientes = [...clientes.entries()]
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 10)
              .map(([n, v]) => `- ${n}: ${v.n} compras · €${Math.round(v.total)}${v.pend > 0 ? ` · pendiente €${Math.round(v.pend)}` : ""}`)
              .join("\n");
            const topPartidos = [...partidos.entries()]
              .sort((a, b) => b[1].ventas - a[1].ventas)
              .slice(0, 8)
              .map(([n, v]) => `- ${n}: ${v.n} ventas · €${Math.round(v.ventas)}`)
              .join("\n");

            contexto = `\n\nDATOS ACTUALES (últimas 200 transacciones):
- Total ventas: €${Math.round(ventas)}
- Ganancia bruta: €${Math.round(ganancia)}
- Mi parte (Tomás): €${Math.round(miParte)}
- Boletas vendidas: ${boletas}
- Pendiente de cobro: €${Math.round(porCobrar)}
- Total transacciones: ${tx.length}

TOP CLIENTES:
${topClientes}

TOP PARTIDOS:
${topPartidos}`;
          }
        } catch (e) {
          console.error("ctx error", e);
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const system = `Eres el asistente IA de RMA Tickets, una plataforma de gestión de venta de entradas del Real Madrid operada por Tomás Pérez de Greiff e Iker Fernández López.

Tu rol:
- Ayudas a Tomás a analizar ventas, clientes, partidos y rentabilidad.
- Sugieres mensajes para WhatsApp (precios, confirmaciones, post-partido).
- Calculas comisiones, márgenes y balances entre socios.
- Eres conciso, directo y usas €. Responde en español.
- Cuando te pidan análisis usa los DATOS ACTUALES; si faltan datos, dilo.
${contexto}`;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
