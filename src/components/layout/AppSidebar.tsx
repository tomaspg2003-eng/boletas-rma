import {
  LayoutDashboard,
  Table2,
  Users,
  Trophy,
  ArrowLeftRight,
  Settings,
  Calendar,
  MessageSquare,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTransaccionDialog } from "@/contexts/transaccion-dialog-context";
import { useSection, type Section } from "@/contexts/section-context";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import nucleoLogo from "@/assets/nucleo-logo.svg";
import clubCrest from "@/assets/club-crest.png";

const navItems: { title: string; section: Section; icon: typeof LayoutDashboard }[] = [
  { title: "Overview",       section: "overview",      icon: LayoutDashboard },
  { title: "Transacciones",  section: "transacciones", icon: Table2 },
  { title: "Clientes",       section: "clientes",      icon: Users },
  { title: "Partidos",       section: "partidos",      icon: Trophy },
  { title: "Mensajes",       section: "mensajes",      icon: MessageSquare },
  { title: "Agenda",         section: "agenda",        icon: Calendar },
  { title: "Liquidación",    section: "netting",       icon: ArrowLeftRight },
  { title: "Asistente IA",   section: "asistente",     icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { openCreate } = useTransaccionDialog();
  const { section, setSection } = useSection();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4 gap-3">
        <button
          onClick={() => setSection("overview")}
          className="flex items-center gap-2.5 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10 ring-1 ring-sidebar-primary/25">
            <img src={clubCrest} alt="RMA" className="h-7 w-7 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">RMA Tickets</span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/45">
                Gestión de Ventas
              </span>
            </div>
          )}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2.5 border-t border-sidebar-border/60 pt-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/70 shrink-0">
              Powered by
            </span>
            <img src={nucleoLogo} alt="Núcleo" className="h-5 w-auto object-contain opacity-100 shrink-0" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = section === item.section;
                return (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="relative h-10 rounded-lg data-[active=true]:bg-transparent"
                      data-active={active}
                      onClick={() => setSection(item.section)}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-lg bg-sidebar-primary/15 ring-1 ring-sidebar-primary/30"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <item.icon
                        className={`relative z-10 size-4 ${
                          active ? "text-sidebar-primary" : "text-sidebar-foreground/55"
                        }`}
                      />
                      <span
                        className={`relative z-10 text-sm font-medium ${
                          active ? "text-sidebar-primary" : "text-sidebar-foreground/75"
                        }`}
                      >
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-3 gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Configuración"
              className="h-10 rounded-lg"
              data-active={section === "config"}
              onClick={() => setSection("config")}
            >
              <Settings className="size-4" />
              <span className="text-sm">Configuración</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Button
          onClick={openCreate}
          size={collapsed ? "icon" : "default"}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-semibold shadow-sm"
        >
          <PlusCircle className="size-4" />
          {!collapsed && <span>Nueva Entrada</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
