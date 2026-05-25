import { useEffect, useState, useSyncExternalStore, useCallback } from "react";
import { listTransacciones } from "@/lib/data.functions";
import { listAjustes } from "@/lib/data.functions";

export type Transaccion = {
  id: string;
  partido: string | null;
  temporada: string | null;
  categoria: string | null;
  cliente: string | null;
  num_boletas: number | null;
  precio_compra_unit: number | null;
  precio_compra_tot: number | null;
  precio_venta_unit: number | null;
  precio_venta_tot: number | null;
  ganancia: number | null;
  comision_pct: number | null;
  comision_pp: number | null;
  quien_recibe: string | null;
  tipo_boleta: string | null;
  fecha_pago: string | null;
  notas: string | null;
  pagado: boolean | null;
  liquidada: boolean | null;
  año: number | null;
  created_at: string;
};

export type Ajuste = {
  id: string;
  descripcion: string | null;
  monto: number | null;
  quien_paga: string | null;
  fecha: string | null;
  created_at: string;
};

/* -------------------------------------------------------------------------- */
/* Generic shared store: one fetch, all subscribers, instant navigation       */
/* -------------------------------------------------------------------------- */
type Store<T> = {
  data: T[];
  loading: boolean;
  loaded: boolean;
  inflight: Promise<void> | null;
  listeners: Set<() => void>;
  snapshot: { data: T[]; loading: boolean };
};

function createStore<T>(fetcher: () => Promise<T[]>) {
  const store: Store<T> = {
    data: [],
    loading: false,
    loaded: false,
    inflight: null,
    listeners: new Set(),
    snapshot: { data: [], loading: false },
  };

  const emit = () => {
    store.snapshot = { data: store.data, loading: store.loading };
    store.listeners.forEach((l) => l());
  };

  const load = (force = false) => {
    if (store.inflight) return store.inflight;
    if (store.loaded && !force) return Promise.resolve();
    store.loading = true;
    emit();
    store.inflight = fetcher()
      .then((rows) => {
        store.data = rows;
        store.loaded = true;
      })
      .catch(() => {
        // keep previous data on error
      })
      .finally(() => {
        store.loading = false;
        store.inflight = null;
        emit();
      });
    return store.inflight;
  };

  return {
    subscribe(l: () => void) {
      store.listeners.add(l);
      return () => store.listeners.delete(l);
    },
    getSnapshot: () => store.snapshot,
    ensure: () => load(false),
    refresh: () => load(true),
  };
}

const txStore = createStore<Transaccion>(async () => {
  const data = await listTransacciones();
  return (data as Transaccion[]) ?? [];
});

const ajStore = createStore<Ajuste>(async () => {
  const data = await listAjustes();
  return (data as Ajuste[]) ?? [];
});

export function useTransacciones() {
  const snap = useSyncExternalStore(txStore.subscribe, txStore.getSnapshot, txStore.getSnapshot);
  useEffect(() => { txStore.ensure(); }, []);
  const refresh = useCallback(() => txStore.refresh(), []);
  return { data: snap.data, loading: snap.loading && snap.data.length === 0, refresh };
}

export function useAjustes() {
  const snap = useSyncExternalStore(ajStore.subscribe, ajStore.getSnapshot, ajStore.getSnapshot);
  useEffect(() => { ajStore.ensure(); }, []);
  const refresh = useCallback(() => ajStore.refresh(), []);
  return { data: snap.data, loading: snap.loading && snap.data.length === 0, refresh };
}

// Expose for manual invalidation (e.g. after a mutation in a dialog)
export const invalidateTransacciones = () => txStore.refresh();
export const invalidateAjustes = () => ajStore.refresh();

// dummy to keep useState import unused-clean
void useState;
