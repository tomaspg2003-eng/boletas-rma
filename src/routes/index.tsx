import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGate } from "@/components/auth-gate";
import { SectionProvider, useSection } from "@/contexts/section-context";
import { OverviewPage } from "@/sections/overview";
import { TransaccionesPage } from "@/sections/transacciones";
import { ClientesPage } from "@/sections/clientes";
import { PartidosPage } from "@/sections/partidos";
import { MensajesPage } from "@/sections/mensajes";
import { AgendaPage } from "@/sections/agenda";
import { NettingPage } from "@/sections/netting";
import { ConfigPage } from "@/sections/config";
import { AsistentePage } from "@/sections/asistente";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "RMA Tickets — Gestión" }] }),
  component: () => (
    <AuthGate>
      <SectionProvider>
        <AppShell>
          <SectionRouter />
        </AppShell>
      </SectionProvider>
    </AuthGate>
  ),
});

function SectionRouter() {
  const { section } = useSection();
  const content = (() => {
    switch (section) {
      case "transacciones": return <TransaccionesPage />;
      case "clientes":      return <ClientesPage />;
      case "partidos":      return <PartidosPage />;
      case "mensajes":      return <MensajesPage />;
      case "agenda":        return <AgendaPage />;
      case "netting":       return <NettingPage />;
      case "asistente":     return <AsistentePage />;
      case "config":        return <ConfigPage />;
      default:              return <OverviewPage />;
    }
  })();
  return (
    <div key={section} className="animate-section-in flex min-h-0 flex-1 flex-col">
      {content}
    </div>
  );
}
