import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppSession } from "./session";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* -------------------- Transacciones -------------------- */

export const listTransacciones = createServerFn({ method: "GET" })
  .middleware([requireAppSession])
  .handler(async () => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("transacciones")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const txPayload = z.object({
  partido: z.string().nullable().optional(),
  temporada: z.string().nullable().optional(),
  categoria: z.string().nullable().optional(),
  cliente: z.string().nullable().optional(),
  num_boletas: z.number().nullable().optional(),
  precio_compra_unit: z.number().nullable().optional(),
  precio_compra_tot: z.number().nullable().optional(),
  precio_venta_unit: z.number().nullable().optional(),
  precio_venta_tot: z.number().nullable().optional(),
  ganancia: z.number().nullable().optional(),
  comision_pct: z.number().nullable().optional(),
  comision_pp: z.number().nullable().optional(),
  quien_recibe: z.string().nullable().optional(),
  tipo_boleta: z.string().nullable().optional(),
  fecha_pago: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
  pagado: z.boolean().nullable().optional(),
  liquidada: z.boolean().nullable().optional(),
  año: z.number().nullable().optional(),
});

export const upsertTransaccion = createServerFn({ method: "POST" })
  .middleware([requireAppSession])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid().optional(), values: txPayload }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("transacciones")
        .update(data.values)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("transacciones").insert(data.values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteTransaccion = createServerFn({ method: "POST" })
  .middleware([requireAppSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("transacciones")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setPagado = createServerFn({ method: "POST" })
  .middleware([requireAppSession])
  .inputValidator((input) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1).max(500),
        pagado: z.boolean(),
        fecha_pago: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("transacciones")
      .update({
        pagado: data.pagado,
        fecha_pago: data.pagado ? data.fecha_pago ?? new Date().toISOString().slice(0, 10) : null,
      })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setLiquidada = createServerFn({ method: "POST" })
  .middleware([requireAppSession])
  .inputValidator((input) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("transacciones")
      .update({ liquidada: true })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------- Ajustes netting -------------------- */

export const listAjustes = createServerFn({ method: "GET" })
  .middleware([requireAppSession])
  .handler(async () => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("ajustes_netting")
      .select("*")
      .order("fecha", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const insertAjuste = createServerFn({ method: "POST" })
  .middleware([requireAppSession])
  .inputValidator((input) =>
    z
      .object({
        descripcion: z.string().min(1).max(500),
        monto: z.number(),
        quien_paga: z.string().min(1).max(100),
        fecha: z.string().min(1).max(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("ajustes_netting").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAjuste = createServerFn({ method: "POST" })
  .middleware([requireAppSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("ajustes_netting")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------- Configuración -------------------- */

export const listConfig = createServerFn({ method: "GET" })
  .middleware([requireAppSession])
  .handler(async () => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from("configuracion").select("*");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertConfig = createServerFn({ method: "POST" })
  .middleware([requireAppSession])
  .inputValidator((input) =>
    z
      .object({
        rows: z
          .array(
            z.object({
              key: z.string().min(1).max(100),
              value: z.string().max(5000),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("configuracion")
      .upsert(data.rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
