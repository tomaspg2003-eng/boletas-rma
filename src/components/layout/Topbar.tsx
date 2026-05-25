import { useEffect, useState } from "react";
import { AlertCircle, Moon, Sun } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const YEARS = ["Todo", "2024", "2025", "2026"] as const;
export type YearFilter = (typeof YEARS)[number];

interface TopbarProps {
  title: string;
  subtitle?: string;
  yearFilter?: YearFilter;
  onYearChange?: (year: YearFilter) => void;
  pendienteCount?: number;
}

export function Topbar({
  title,
  subtitle,
  yearFilter,
  onYearChange,
  pendienteCount = 0,
}: TopbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("rma-theme");
    return (saved as "light" | "dark") ?? "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rma-theme", theme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex flex-col leading-tight">
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {pendienteCount > 0 && (
          <div className="hidden items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning sm:flex">
            <AlertCircle size={11} />
            {pendienteCount} sin cobrar
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {yearFilter && onYearChange && (
          <div className="hidden items-center gap-0.5 rounded-lg bg-muted p-1 md:flex">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => onYearChange(y)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all",
                  yearFilter === y
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {y}
              </button>
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
}
