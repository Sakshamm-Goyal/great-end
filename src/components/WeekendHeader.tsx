"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Palette, Settings2, LayoutTemplate, PanelRight, PanelBottom, PanelTop, House, Share2, Calendar, Undo2, Redo2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type WeekendTheme = "lazy" | "adventurous" | "family";

export interface WeekendHeaderProps {
  className?: string;
  theme: WeekendTheme;
  onThemeChange?: (theme: WeekendTheme) => void;
  onSave?: () => void;
  onLoad?: () => void;
  onClear?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onHelp?: () => void;
  onOpenSettings?: () => void;
  onShare?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExportIcs?: () => void;
  title?: string;
}

const THEME_LABELS: Record<WeekendTheme, string> = {
  lazy: "Lazy Weekend",
  adventurous: "Adventurous",
  family: "Family",
};

export default function WeekendHeader({
  className,
  theme,
  onThemeChange,
  onSave,
  onLoad,
  onClear,
  onImport,
  onExport,
  onHelp,
  onOpenSettings,
  onShare,
  onUndo,
  onRedo,
  onExportIcs,
  title = "Weekendly",
}: WeekendHeaderProps) {
  // Internal helpers to provide subtle feedback even if handlers are not wired yet.
  const safeAction = React.useCallback(
    (label: string, handler?: () => void) => () => {
      try {
        handler?.();
        toast.success(label);
      } catch (e) {
        toast.error(`${label} failed`);
      }
    },
    []
  );

  const handleThemeChange = (next: WeekendTheme) => {
    if (theme === next) return;
    onThemeChange?.(next);
    toast.message("Theme switched", {
      description: THEME_LABELS[next],
    });
  };

  // Layout:
  // - Sticky on desktop
  // - Opaque card background with subtle border and shadow
  return (
    <header
      className={cn(
        "w-full bg-card border-b border-border shadow-sm md:sticky top-0 z-50",
        "transition-colors",
        className
      )}
      role="banner"
    >
      <div className="container w-full max-w-full px-2">
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Brand + Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm"
              aria-hidden="true"
            >
              <House className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-heading text-lg sm:text-xl md:text-2xl tracking-tight truncate">
                  {title}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Palette className="h-3.5 w-3.5" />
                  {THEME_LABELS[theme]}
                </span>
              </div>
              <span className="sr-only">Weekend planning application</span>
            </div>
          </div>

          {/* Theme Tabs (Desktop) */}
          <div className="hidden md:flex items-center">
            <Tabs
              value={theme}
              onValueChange={(v) => handleThemeChange(v as WeekendTheme)}
              className="w-full"
            >
              <TabsList
                aria-label="Select weekend theme"
                className={cn(
                  "bg-secondary text-secondary-foreground",
                  "rounded-full"
                )}
              >
                <TabsTrigger
                  value="lazy"
                  className={tabTriggerClass(theme === "lazy")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-chart-2 shadow-[0_0_0_2px_rgba(255,255,255,0.7)]" />
                    Lazy
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="adventurous"
                  className={tabTriggerClass(theme === "adventurous")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-chart-5 shadow-[0_0_0_2px_rgba(255,255,255,0.7)]" />
                    Adventurous
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="family"
                  className={tabTriggerClass(theme === "family")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-chart-4 shadow-[0_0_0_2px_rgba(255,255,255,0.7)]" />
                    Family
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-secondary hover:bg-muted text-secondary-foreground"
                >
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Plans
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Manage plans</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={safeAction("Plan saved", onSave)}>
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Save current
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={safeAction("Plan loaded", onLoad)}>
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Load a plan
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={safeAction("Undid change", onUndo)}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Undo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={safeAction("Redid change", onRedo)}>
                    <Redo2 className="h-4 w-4 mr-2" />
                    Redo
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={safeAction("Imported successfully", onImport)}>
                    <PanelRight className="h-4 w-4 mr-2" />
                    Import
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={safeAction("Share link copied", onShare)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={safeAction("Exported as .ics", onExportIcs)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Export .ics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={safeAction("Exported successfully", onExport)}>
                    <PanelTop className="h-4 w-4 mr-2" />
                    Export JSON
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={safeAction("Schedule cleared", onClear)}
                >
                  <PanelBottom className="h-4 w-4 mr-2" />
                  Clear schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="secondary"
              className="bg-secondary hover:bg-muted text-secondary-foreground"
              onClick={safeAction("Help opened", onHelp)}
            >
              <House className="h-4 w-4 mr-2" />
              Help
            </Button>

            <Button asChild variant="secondary" className="bg-secondary hover:bg-muted text-secondary-foreground">
              <Link href="/docs" aria-label="Open documentation">Docs</Link>
            </Button>

            <Button
              variant="default"
              className="bg-primary text-primary-foreground hover:opacity-90"
              onClick={safeAction("Settings opened", onOpenSettings)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Open menu"
                  className="bg-secondary hover:bg-muted text-secondary-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Theme
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  aria-checked={theme === "lazy"}
                  role="menuitemradio"
                  onClick={() => handleThemeChange("lazy")}
                >
                  <span className="mr-2 h-2.5 w-2.5 rounded-full bg-chart-2" />
                  Lazy Weekend
                  {theme === "lazy" && (
                    <span className="ml-auto text-[10px] rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
                      Active
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  aria-checked={theme === "adventurous"}
                  role="menuitemradio"
                  onClick={() => handleThemeChange("adventurous")}
                >
                  <span className="mr-2 h-2.5 w-2.5 rounded-full bg-chart-5" />
                  Adventurous
                  {theme === "adventurous" && (
                    <span className="ml-auto text-[10px] rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
                      Active
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  aria-checked={theme === "family"}
                  role="menuitemradio"
                  onClick={() => handleThemeChange("family")}
                >
                  <span className="mr-2 h-2.5 w-2.5 rounded-full bg-chart-4" />
                  Family
                  {theme === "family" && (
                    <span className="ml-auto text-[10px] rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
                      Active
                    </span>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Plans</DropdownMenuLabel>
                <DropdownMenuItem onClick={safeAction("Plan saved", onSave)}>
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Save current
                </DropdownMenuItem>
                <DropdownMenuItem onClick={safeAction("Plan loaded", onLoad)}>
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Load a plan
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={safeAction("Undid change", onUndo)}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Undo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={safeAction("Redid change", onRedo)}>
                  <Redo2 className="h-4 w-4 mr-2" />
                  Redo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={safeAction("Imported successfully", onImport)}>
                  <PanelRight className="h-4 w-4 mr-2" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={safeAction("Share link copied", onShare)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={safeAction("Exported as .ics", onExportIcs)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Export .ics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={safeAction("Exported successfully", onExport)}>
                  <PanelTop className="h-4 w-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={safeAction("Schedule cleared", onClear)}
                >
                  <PanelBottom className="h-4 w-4 mr-2" />
                  Clear schedule
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={safeAction("Help opened", onHelp)}>
                  <House className="h-4 w-4 mr-2" />
                  Help & docs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={safeAction("Settings opened", onOpenSettings)}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

function tabTriggerClass(active: boolean) {
  return cn(
    "rounded-full px-4 py-2 data-[state=active]:shadow-sm",
    "transition-all duration-200",
    active ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : "",
    "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
  );
}