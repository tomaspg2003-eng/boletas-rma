import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { TransaccionDialog } from "@/components/transaccion-dialog";
import { invalidateTransacciones, type Transaccion } from "@/hooks/use-data";

type Ctx = {
  openCreate: () => void;
  openEdit: (t: Transaccion) => void;
  /** Bump to notify subscribers a save happened (so they can refresh). */
  version: number;
};

const TransaccionDialogContext = createContext<Ctx | null>(null);

export function TransaccionDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [initial, setInitial] = useState<Transaccion | null>(null);
  const [version, setVersion] = useState(0);

  const openCreate = useCallback(() => {
    setMode("create");
    setInitial(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((t: Transaccion) => {
    setMode("edit");
    setInitial(t);
    setOpen(true);
  }, []);

  return (
    <TransaccionDialogContext.Provider value={{ openCreate, openEdit, version }}>
      {children}
      <TransaccionDialog
        open={open}
        mode={mode}
        initial={initial}
        onClose={() => setOpen(false)}
        onSaved={() => { setVersion((v) => v + 1); invalidateTransacciones(); }}
      />
    </TransaccionDialogContext.Provider>
  );
}

export function useTransaccionDialog() {
  const ctx = useContext(TransaccionDialogContext);
  if (!ctx) throw new Error("useTransaccionDialog must be used within TransaccionDialogProvider");
  return ctx;
}
