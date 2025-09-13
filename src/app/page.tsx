"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import WeekendHeader from "@/components/WeekendHeader";
import ActivityBrowser, { type Activity } from "@/components/ActivityBrowser";
import WeekendSchedule, { type WeekendActivity } from "@/components/WeekendSchedule";
import SettingsModal, { type SettingsData } from "@/components/SettingsModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";

type WeekendTheme = "lazy" | "adventurous" | "family";

export default function Page() {
  const [theme, setTheme] = useState<WeekendTheme>("lazy");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    theme: "lazy",
    colorScheme: "system",
    autoSave: true,
    defaultDuration: 60,
    timeFormat: "12h",
    notifications: true,
    startTime: "09:00",
    endTime: "22:00",
    weekendStart: "saturday",
    showTutorial: true,
    compactMode: false,
  });

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("weekendly.settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as SettingsData;
        setSettings(prev => ({ ...prev, ...parsed }));
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.colorScheme) applyColorScheme(parsed.colorScheme);
      }
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
    }
  }, [applyColorScheme]);

  // Listen for system color scheme changes when using "system" mode
  useEffect(() => {
    if (settings.colorScheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyColorScheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [settings.colorScheme, applyColorScheme]);

  // Persist theme
  useEffect(() => {
    const t = localStorage.getItem("weekendly.theme") as WeekendTheme | null;
    if (t === "lazy" || t === "adventurous" || t === "family") setTheme(t);

    // Auto-import from URL hash share link
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#plan=")) {
        const encoded = hash.slice(6);
        const json = atob(decodeURIComponent(encoded));
        const data = JSON.parse(json) as { theme?: WeekendTheme; activities?: WeekendActivity[] };
        if (data.theme === "lazy" || data.theme === "adventurous" || data.theme === "family") setTheme(data.theme);
        if (Array.isArray(data.activities)) {
          setActivities(data.activities);
          setScheduleKey((k) => k + 1);
          toast.success("Plan imported from link");
        }
        // Clean hash to avoid re-import on refresh
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("weekendly.theme", theme); } catch {}
  }, [theme]);

  // Source of truth for the schedule; WeekendSchedule manages its own state,
  // but we mirror changes here so we can augment (e.g., add from ActivityBrowser)
  const [activities, setActivities] = useState<WeekendActivity[]>([]);
  // History for undo/redo
  const [past, setPast] = useState<WeekendActivity[][]>([]);
  const [future, setFuture] = useState<WeekendActivity[][]>([]);
  // Force remount key when we need to inject external additions (so WeekendSchedule re-reads initialActivities)
  const [scheduleKey, setScheduleKey] = useState(0);
  // Help dialog
  const [helpOpen, setHelpOpen] = useState(false);
  // Clear confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Tutorial state
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showIntroBar, setShowIntroBar] = useState(false);

  // Spotlight refs
  const headerRef = useRef<HTMLDivElement | null>(null);
  const browserRef = useRef<HTMLDivElement | null>(null);
  const scheduleRef = useRef<HTMLDivElement | null>(null);

  // Recompute spotlight target rect on step/resize/scroll
  const [spotRect, setSpotRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const steps = useMemo(
    () => [
      { ref: headerRef, title: "Pick a theme", body: "Choose Lazy, Adventurous, or Family to tailor ideas." },
      { ref: browserRef, title: "Browse activities", body: "Search, filter and add manually; drag items to schedule." },
      { ref: scheduleRef, title: "Build your plan", body: "Drop items onto Saturday/Sunday; edit duration and notes." },
      { ref: headerRef, title: "Save • Export • Share", body: "Use header actions or shortcuts to save, export .ics, or share." },
    ],
    []
  );

  useEffect(() => {
    if (!tutorialOpen) return;
    const update = () => {
      const step = steps[tutorialStep];
      const el = step?.ref.current;
      if (!el) { setSpotRect(null); return; }
      // Ensure target is visible before measuring
      try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch {}
      const r = el.getBoundingClientRect();
      // Use viewport coordinates (fixed overlay), no scroll offsets
      setSpotRect({ x: r.left - 8, y: r.top - 8, w: r.width + 16, h: r.height + 16 });
    };
    // Measure on next frames to ensure layout settled
    const raf1 = requestAnimationFrame(update);
    const raf2 = requestAnimationFrame(update);
    const onScroll = () => update();
    const onResize = () => update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const id = setInterval(update, 200);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearInterval(id);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [tutorialOpen, tutorialStep, steps]);

  // Auto-save current theme plan on change (silent)
  useEffect(() => {
    try { localStorage.setItem(storageKey(theme), JSON.stringify(activities)); } catch {}
  }, [activities, theme]);

  // First-time onboarding
  useEffect(() => {
    try {
      const seen = localStorage.getItem("weekendly.tutorial.seen");
      if (!seen) { setShowIntroBar(true); setTutorialStep(0); setTutorialOpen(true); }
    } catch {}
  }, []);

  const startTutorial = useCallback(() => {
    setShowIntroBar(false);
    setTutorialStep(0);
    setTutorialOpen(true);
  }, []);

  const finishTutorial = useCallback(() => {
    try { localStorage.setItem("weekendly.tutorial.seen", "1"); } catch {}
    setTutorialOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    setTutorialStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setTutorialStep((s) => Math.max(s - 1, 0));
  }, []);

  // Lock body scroll while tutorial is open
  useEffect(() => {
    if (tutorialOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [tutorialOpen]);

  const handleThemeChange = useCallback((t: WeekendTheme) => {
    setTheme(t);
  }, []);

  const handleSettingsChange = useCallback((newSettings: SettingsData) => {
    setSettings(newSettings);
    try {
      localStorage.setItem("weekendly.settings", JSON.stringify(newSettings));
    } catch (error) {
      console.warn("Failed to save settings to localStorage:", error);
    }
    // Update theme if it changed
    if (newSettings.theme !== theme) {
      setTheme(newSettings.theme);
    }
    // Apply color scheme
    applyColorScheme(newSettings.colorScheme);
  }, [theme]);

  const applyColorScheme = useCallback((colorScheme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    if (colorScheme === "dark") {
      root.classList.add("dark");
    } else if (colorScheme === "light") {
      root.classList.remove("dark");
    } else {
      // System - follow system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, []);

  const handleResetSettings = useCallback(() => {
    const defaultSettings: SettingsData = {
      theme: "lazy",
      colorScheme: "system",
      autoSave: true,
      defaultDuration: 60,
      timeFormat: "12h",
      notifications: true,
      startTime: "09:00",
      endTime: "22:00",
      weekendStart: "saturday",
      showTutorial: true,
      compactMode: false,
    };
    setSettings(defaultSettings);
    setTheme("lazy");
    try {
      localStorage.setItem("weekendly.settings", JSON.stringify(defaultSettings));
    } catch (error) {
      console.warn("Failed to reset settings in localStorage:", error);
    }
  }, []);

  const handleScheduleChange = useCallback((list: WeekendActivity[]) => {
    setPast((p) => [...p, activities]);
    setFuture([]);
    setActivities(list);
  }, [activities]);

  const addFromBrowser = useCallback(
    (a: Activity) => {
      // Map ActivityBrowser item into WeekendSchedule format
      const categoryMap = (cat: string): WeekendActivity["category"] => {
        switch (cat) {
          case "Adventure":
            return "outdoor";
          case "Family":
            return "other";
          case "Relax":
          default:
            return "home";
        }
      };

      const moodMap = (moods: string[]): WeekendActivity["mood"] | undefined => {
        const lower = moods.map((m) => m.toLowerCase());
        if (lower.some((m) => ["energetic", "playful"].includes(m))) return "energetic";
        if (lower.some((m) => ["social"].includes(m))) return "social";
        if (lower.some((m) => ["calm", "cozy"].includes(m))) return "chill";
        if (lower.some((m) => ["curious", "creative"].includes(m))) return "focus";
        return undefined;
      };

      const newItem: WeekendActivity = {
        id: `ext_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: a.title,
        category: categoryMap(a.category),
        day: a.day || "saturday",
        start: a.start || pickNextStartTime(activities),
        durationMins: Math.max(15, a.durationMin - (a.durationMin % 15)),
        mood: moodMap(a.moods),
        notes: a.description || "",
      };

      setPast((p) => [...p, activities]);
      setFuture([]);
      setActivities((prev) => {
        const merged = [...prev, newItem];
        // Trigger a remount so WeekendSchedule picks up new initialActivities
        setScheduleKey((k) => k + 1);
        return merged;
      });
    },
    [activities]
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) { toast.message("Nothing to undo"); return p; }
      const prev = p[p.length - 1];
      setFuture((f) => [activities, ...f]);
      setActivities(prev);
      setScheduleKey((k) => k + 1);
      toast.success("Undid change");
      return p.slice(0, -1);
    });
  }, [activities]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) { toast.message("Nothing to redo"); return f; }
      const next = f[0];
      setPast((p) => [...p, activities]);
      setActivities(next);
      setScheduleKey((k) => k + 1);
      toast.success("Redid change");
      return f.slice(1);
    });
  }, [activities]);

  const clearSchedule = useCallback(() => {
    setPast((p) => [...p, activities]);
    setFuture([]);
    setActivities([]);
    setScheduleKey((k) => k + 1);
    toast.message("Schedule cleared");
  }, [activities]);

  const savePlan = useCallback(() => {
    const key = storageKey(theme);
    try {
      localStorage.setItem(key, JSON.stringify(activities));
      toast.success("Plan saved");
    } catch { toast.error("Save failed"); }
  }, [activities, theme]);

  const loadPlan = useCallback(() => {
    const key = storageKey(theme);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) { toast.message("No saved plan for theme"); return; }
      const parsed = JSON.parse(raw) as WeekendActivity[];
      setPast((p) => [...p, activities]);
      setFuture([]);
      setActivities(parsed);
      setScheduleKey((k) => k + 1);
      toast.success("Plan loaded");
    } catch { toast.error("Load failed"); }
  }, [theme, activities]);

  const exportPlan = useCallback(() => {
    const text = JSON.stringify({ theme, activities }, null, 2);
    try {
      navigator.clipboard.writeText(text);
      toast.success("Plan JSON copied to clipboard");
    } catch {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weekendly-plan.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.message("Plan JSON downloaded");
    }
  }, [activities, theme]);

  const exportIcs = useCallback(() => {
    try {
      const { sat, sun } = getUpcomingWeekend();
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Weekendly//Planner//EN",
      ];
      const toDate = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}T${String(d.getUTCHours()).padStart(2,'0')}${String(d.getUTCMinutes()).padStart(2,'0')}00Z`;
      const parseTime = (t: string) => { const [h,m] = t.split(":").map(Number); return { h, m }; };
      activities.forEach((a, idx) => {
        const base = a.day === "saturday" ? new Date(sat) : new Date(sun);
        const { h, m } = parseTime(a.start);
        const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), h, m));
        const end = new Date(start.getTime() + a.durationMins * 60000);
        lines.push(
          "BEGIN:VEVENT",
          `UID:${Date.now()}-${idx}@weekendly`,
          `DTSTAMP:${toDate(new Date())}`,
          `DTSTART:${toDate(start)}`,
          `DTEND:${toDate(end)}`,
          `SUMMARY:${escapeIcs(a.title)}`,
          `DESCRIPTION:${escapeIcs(a.notes || "")}`,
          "END:VEVENT"
        );
      });
      lines.push("END:VCALENDAR");
      const blob = new Blob([lines.join("\n")], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weekendly-${theme}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Calendar (.ics) downloaded");
    } catch { toast.error("Calendar export failed"); }
  }, [activities, theme]);

  const importPlan = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as { theme?: WeekendTheme; activities?: WeekendActivity[] };
        if (data.theme) setTheme(data.theme);
        if (Array.isArray(data.activities)) {
          setPast((p) => [...p, activities]);
          setFuture([]);
          setActivities(data.activities);
          setScheduleKey((k) => k + 1);
          toast.success("Plan imported");
        }
      } catch { toast.error("Import failed"); }
    };
    input.click();
  }, [activities]);

  const sharePlan = useCallback(() => {
    try {
      const payload = JSON.stringify({ theme, activities });
      const encoded = encodeURIComponent(btoa(payload));
      const url = `${window.location.origin}${window.location.pathname}#plan=${encoded}`;
      navigator.clipboard.writeText(url);
      toast.success("Share link copied");
    } catch { toast.error("Share failed"); }
  }, [theme, activities]);

  // Keyboard shortcuts (placed after callbacks to avoid TDZ)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      // Tutorial navigation keys
      if (tutorialOpen) {
        if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") { e.preventDefault(); nextStep(); return; }
        if (e.key === "ArrowLeft") { e.preventDefault(); prevStep(); return; }
        if (e.key === "Escape") { e.preventDefault(); finishTutorial(); return; }
      }
      if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); savePlan(); }
      if (mod && !shift && e.key.toLowerCase() === "e") { e.preventDefault(); exportPlan(); }
      if (mod && shift && e.key.toLowerCase() === "e") { e.preventDefault(); exportIcs(); }
      if (mod && e.key.toLowerCase() === "i") { e.preventDefault(); importPlan(); }
      if (mod && e.key.toLowerCase() === "l") { e.preventDefault(); sharePlan(); }
      if (mod && !shift && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
      if ((mod && shift && e.key.toLowerCase() === "z") || (mod && e.key.toLowerCase() === "y")) { e.preventDefault(); redo(); }
      if (e.key === "?" || (mod && e.key.toLowerCase() === "/")) { e.preventDefault(); setHelpOpen(true); }
      if (e.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [savePlan, exportPlan, exportIcs, importPlan, sharePlan, undo, redo, tutorialOpen, nextStep, prevStep, finishTutorial]);

  const pageBg = useMemo(
    () =>
      theme === "adventurous"
        ? "from-sky-100 via-amber-50 to-lime-50 dark:from-sky-900/20 dark:via-amber-900/10 dark:to-lime-900/10"
        : theme === "family"
        ? "from-pink-50 via-violet-50 to-blue-50 dark:from-pink-900/10 dark:via-violet-900/10 dark:to-blue-900/10"
        : "from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-900/10 dark:via-teal-900/10 dark:to-emerald-900/10",
    [theme]
  );

  return (
    <div className={`min-h-dvh w-full bg-gradient-to-b ${pageBg}`}>
      <div ref={headerRef}>
        <WeekendHeader
          theme={theme}
          onThemeChange={handleThemeChange}
          onSave={savePlan}
          onLoad={loadPlan}
          onClear={() => setConfirmOpen(true)}
          onImport={importPlan}
          onExport={exportPlan}
          onHelp={() => setHelpOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onShare={sharePlan}
          onUndo={undo}
          onRedo={redo}
          onExportIcs={exportIcs}
          title="Weekendly"
        />
      </div>

      <main className="container mx-auto max-w-full px-2 py-4 md:py-6">
        {showIntroBar && (
          <div className="mb-4 md:mb-6 rounded-xl border bg-card p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <p className="font-semibold">New to Weekendly?</p>
              <p className="text-sm text-muted-foreground">Take a 2-minute guided tour to learn how to plan your weekend.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={startTutorial} className="">Start tutorial</Button>
              <Button variant="secondary" onClick={() => setShowIntroBar(false)}>Maybe later</Button>
            </div>
          </div>
        )}

        {/* Mobile/Tablet: stacked */}
        <div className="lg:hidden space-y-4">
          <section ref={browserRef} className="rounded-xl border bg-card shadow-sm p-3">
            <h2 className="mb-3 text-base font-heading font-semibold">Activity Browser</h2>
            <ActivityBrowser
              onAddActivity={addFromBrowser}
              onThemeSelect={(t) => setTheme(t)}
              className=""
            />
          </section>
          <section ref={scheduleRef} className="rounded-xl border bg-card shadow-sm p-3">
            <h2 className="mb-3 text-base font-heading font-semibold">Weekend Planner</h2>
            <WeekendSchedule
              key={scheduleKey}
              initialActivities={activities}
              onChange={handleScheduleChange}
              className="w-full"
            />
          </section>
        </div>

        {/* Desktop: resizable split panes */}
        <div className="hidden lg:block">
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="weekendly.split"
            className="h-[calc(100dvh-12rem)]"
          >
            <ResizablePanel defaultSize={30} minSize={24}>
              <div className="h-full pr-2">
                <div ref={browserRef} className="sticky top-20 space-y-3 max-h-[calc(100dvh-10rem)] overflow-auto">
                  <div className="rounded-xl border bg-card shadow-sm p-3">
                    <h2 className="mb-3 text-lg font-heading font-semibold">Activity Browser</h2>
                    <ActivityBrowser
                      onAddActivity={addFromBrowser}
                      onThemeSelect={(t) => setTheme(t)}
                      className=""
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="mx-1 opacity-60 hover:opacity-100 transition-opacity" />
            <ResizablePanel defaultSize={70} minSize={50}>
              <div className="h-full pl-2">
                <div ref={scheduleRef} className="sticky top-20 space-y-3 max-h-[calc(100dvh-10rem)] overflow-auto">
                  <div className="rounded-xl border bg-card shadow-sm p-3">
                    <h2 className="mb-3 text-lg font-heading font-semibold">Weekend Planner</h2>
                    <WeekendSchedule
                      key={scheduleKey}
                      initialActivities={activities}
                      onChange={handleScheduleChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        Made with joy for delightful weekends — Weekendly
      </footer>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Weekendly Guide</DialogTitle>
            <DialogDescription>
              Your quick reference: Manual Add, shortcuts, saving, sharing, and tips.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h4 className="mb-1 font-medium text-foreground">Add Manually</h4>
              <p>
                In the Activity Browser (left), click <span className="font-semibold text-foreground">"Add manually"</span> beside Reset to create a custom activity.
              </p>
            </section>
            <section>
              <h4 className="mb-1 font-medium text-foreground">Keyboard Shortcuts</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cmd/Ctrl+S — Save plan</li>
                <li>Cmd/Ctrl+E — Export JSON</li>
                <li>Cmd/Ctrl+Shift+E — Export calendar (.ics)</li>
                <li>Cmd/Ctrl+I — Import plan</li>
                <li>Cmd/Ctrl+L — Copy share link</li>
                <li>Cmd/Ctrl+Z — Undo • Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y — Redo</li>
                <li>? or Cmd/Ctrl+/ — Open this help</li>
              </ul>
            </section>
            <section>
              <h4 className="mb-1 font-medium text-foreground">Tips</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Drag cards into the schedule; we auto-pick the next time slot.</li>
                <li>Plans save per theme and persist locally.</li>
                <li>Share links encode your plan; opening them imports automatically.</li>
              </ul>
            </section>
            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => { setHelpOpen(false); startTutorial(); }}>Start tutorial</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spotlight Tutorial Overlay */}
      {tutorialOpen && (
        <div className="fixed inset-0 z-[80]">
          {/* Dim background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={nextStep} />
          {/* Highlight ring */}
          {spotRect && (
            <>
              <div
                className="absolute rounded-xl ring-4 ring-primary/90 shadow-[0_0_0_8px_rgba(255,255,255,0.25)] pointer-events-none transition-all duration-200"
                style={{ left: spotRect.x, top: spotRect.y, width: spotRect.w, height: spotRect.h }}
              />
              {/* Clickable hotspot to avoid interacting with underlying UI */}
              <button
                aria-label="Next"
                onClick={nextStep}
                className="absolute bg-transparent"
                style={{ left: spotRect.x, top: spotRect.y, width: spotRect.w, height: spotRect.h }}
              />
            </>
          )}
          {/* Tooltip panel */}
          <div
            className="absolute max-w-sm rounded-xl border bg-card text-card-foreground shadow-lg p-4 sm:p-5"
            style={{
              left: spotRect
                ? Math.max(16, Math.min(window.innerWidth - 16 - 360, spotRect.x))
                : Math.max(16, Math.min(window.innerWidth - 16 - 360, window.innerWidth / 2 - 180)),
              top: spotRect
                ? (spotRect.y + spotRect.h + 12 > window.innerHeight - 160
                    ? Math.max(16, spotRect.y - 12 - 140)
                    : spotRect.y + spotRect.h + 12)
                : Math.max(16, window.innerHeight / 2 - 80),
            }}
            role="dialog"
            aria-modal="true"
          >
            <p className="text-xs text-muted-foreground mb-1">Step {tutorialStep + 1} of {steps.length}</p>
            <h4 className="font-heading text-lg font-semibold mb-1">{steps[tutorialStep].title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{steps[tutorialStep].body}</p>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={finishTutorial}>Skip</Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={prevStep} disabled={tutorialStep === 0}>Back</Button>
                {tutorialStep < steps.length - 1 ? (
                  <Button size="sm" onClick={nextStep}>Next</Button>
                ) : (
                  <Button size="sm" onClick={finishTutorial}>Finish</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all activities from your current theme plan. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearSchedule}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentSettings={settings}
        onSettingsChange={handleSettingsChange}
        onResetSettings={handleResetSettings}
      />
    </div>
  );
}

function storageKey(theme: WeekendTheme) {
  return `weekendly.plan.${theme}`;
}

function pickNextStartTime(existing: WeekendActivity[]): string {
  // Find the next 30-minute slot on Saturday after the latest existing Saturday event, else 10:00
  const satActs = existing.filter((a) => a.day === "saturday");
  if (satActs.length === 0) return "10:00";
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const maxEnd = satActs.reduce((max, a) => Math.max(max, toMinutes(a.start) + a.durationMins), 7 * 60);
  const rounded = Math.ceil(maxEnd / 30) * 30;
  const clamped = Math.min(rounded, 22 * 60 + 30);
  const h = String(Math.floor(clamped / 60)).padStart(2, "0");
  const m = String(clamped % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function getUpcomingWeekend() {
  const now = new Date();
  const day = now.getDay(); // 0 Sun .. 6 Sat
  const diffToSat = (6 - day + 7) % 7;
  const diffToSun = (7 - day + 7) % 7;
  const sat = new Date(now);
  sat.setDate(now.getDate() + diffToSat);
  sat.setHours(0, 0, 0, 0);
  const sun = new Date(now);
  sun.setDate(now.getDate() + diffToSun);
  sun.setHours(0, 0, 0, 0);
  return { sat, sun };
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}