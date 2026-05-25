import { createContext, useContext, useState, type ReactNode } from "react";

export type Section =
  | "overview"
  | "transacciones"
  | "clientes"
  | "partidos"
  | "mensajes"
  | "agenda"
  | "netting"
  | "asistente"
  | "config";

type Ctx = {
  section: Section;
  setSection: (s: Section) => void;
};

const SectionContext = createContext<Ctx | null>(null);

export function SectionProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<Section>("overview");
  return (
    <SectionContext.Provider value={{ section, setSection }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  const ctx = useContext(SectionContext);
  if (!ctx) throw new Error("useSection must be used within SectionProvider");
  return ctx;
}
