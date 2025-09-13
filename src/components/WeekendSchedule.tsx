"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CalendarPlus2, CalendarX2, ChartGantt, Clock6, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DayKey = "saturday" | "sunday";

type Mood = "chill" | "energetic" | "social" | "focus";

type Category = "outdoor" | "food" | "fitness" | "culture" | "home" | "other";

export interface WeekendActivity {
  id: string;
  title: string;
  category: Category;
  day: DayKey;
  start: string; // "HH:MM" 24h
  durationMins: number; // minutes, >= 15
  mood?: Mood;
  notes?: string;
}

interface WeekendScheduleProps {
  className?: string;
  initialActivities?: WeekendActivity[];
  onChange?: (activities: WeekendActivity[]) => void;
  startHour?: number; // default 5
  endHour?: number; // default 23
}

const HOURS_FALLBACK_START = 5;
const HOURS_FALLBACK_END = 23;
const MIN_SLOT_MINUTES = 15;

const categoryPalette: Record<Category, string> = {
  outdoor: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  food: "bg-gradient-to-r from-amber-400 to-orange-500",
  fitness: "bg-gradient-to-r from-blue-400 to-blue-600",
  culture: "bg-gradient-to-r from-purple-400 to-purple-600",
  home: "bg-gradient-to-r from-slate-400 to-slate-600",
  other: "bg-gradient-to-r from-gray-400 to-gray-600",
};

const categoryBorderPalette: Record<Category, string> = {
  outdoor: "border-emerald-300",
  food: "border-amber-300",
  fitness: "border-blue-300",
  culture: "border-purple-300",
  home: "border-slate-300",
  other: "border-gray-300",
};

const moodBadge: Record<Mood, string> = {
  chill: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200",
  energetic: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200",
  social: "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200",
  focus: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200",
};

function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return h * 60 + (m || 0);
}

function toTimeString(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function roundToStep(minutes: number, step: number) {
  return Math.round(minutes / step) * step;
}

function hasConflict(activities: WeekendActivity[], candidate: WeekendActivity, excludeId?: string) {
  const dayActs = activities.filter((a) => a.day === candidate.day && a.id !== excludeId);
  const cStart = toMinutes(candidate.start);
  const cEnd = cStart + candidate.durationMins;
  
  // Debug logging
  console.log('Checking conflict for:', candidate.title, 'at', candidate.start, 'duration:', candidate.durationMins);
  console.log('Existing activities on', candidate.day, ':', dayActs.map(a => `${a.title} (${a.start}-${toTimeString(toMinutes(a.start) + a.durationMins)})`));
  
  const hasOverlap = dayActs.some((a) => {
    const aStart = toMinutes(a.start);
    const aEnd = aStart + a.durationMins;
    const overlaps = cStart < aEnd && aStart < cEnd;
    if (overlaps) {
      console.log('Conflict detected with:', a.title, '(', a.start, '-', toTimeString(aEnd), ')');
    }
    return overlaps;
  });
  
  console.log('Has conflict:', hasOverlap);
  return hasOverlap;
}

export default function WeekendSchedule({
  className,
  initialActivities,
  onChange,
  startHour = HOURS_FALLBACK_START,
  endHour = HOURS_FALLBACK_END,
}: WeekendScheduleProps) {
  const [activities, setActivities] = useState<WeekendActivity[]>(() => initialActivities || []);
  const [dayTab, setDayTab] = useState<DayKey>("saturday");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverDay, setHoverDay] = useState<DayKey | null>(null);
  const [hoverMinutes, setHoverMinutes] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<WeekendActivity | null>(null);

  const saturdayRef = useRef<HTMLDivElement | null>(null);
  const sundayRef = useRef<HTMLDivElement | null>(null);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = startHour; h <= endHour; h++) list.push(h);
    return list;
  }, [startHour, endHour]);

  useEffect(() => {
    if (onChange) onChange(activities);
  }, [activities, onChange]);

  // Keep refs for potential future use; calculations rely on event targets.
  useEffect(() => {
    // no-op, retained to avoid unused ref linting in some setups
  }, []);


  // Handle external drag payloads from Activity Browser
  // Expected dataTransfer type: "application/weekendly-activity" -> JSON { title, category, durationMins }
  const getMinutesFromElement = useCallback(
    (clientY: number, el: HTMLElement | null) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      // Account for vertical padding in the track area (py-2 ~= 8px at Tailwind defaults)
      const PADDING_TOP = 8;
      const PADDING_BOTTOM = 8;
      const usableTop = rect.top + PADDING_TOP;
      const usableHeight = Math.max(1, rect.height - (PADDING_TOP + PADDING_BOTTOM));
      const y = clientY - usableTop;
      const totalMinutes = (endHour - startHour) * 60;
      const ratio = clamp(y / usableHeight, 0, 1);
      const minutes = startHour * 60 + roundToStep(ratio * totalMinutes, MIN_SLOT_MINUTES);
      return minutes;
    },
    [startHour, endHour]
  );

  const handleDragOver = (e: React.DragEvent, day: DayKey) => {
    e.preventDefault();
    // Hint for cursor/UX
    try {
      e.dataTransfer.dropEffect = "copy";
    } catch {}
    setHoverDay(day);
    const container = e.currentTarget as HTMLElement;
    const mins = getMinutesFromElement(e.clientY, container);
    setHoverMinutes(mins);
  };

  const handleDragLeave = () => {
    setHoverDay(null);
    setHoverMinutes(null);
  };

  const handleDrop = (e: React.DragEvent, day: DayKey) => {
    e.preventDefault();
    const container = e.currentTarget as HTMLElement;
    const mins = getMinutesFromElement(e.clientY, container);
    setHoverDay(null);
    setHoverMinutes(null);
    if (mins == null) return;

    const internalId = e.dataTransfer.getData("text/activity-id");
    const external = e.dataTransfer.getData("application/weekendly-activity");

    if (internalId) {
      // Move existing activity
      setActivities((prev) => {
        const found = prev.find((a) => a.id === internalId);
        if (!found) return prev;
        const duration = found.durationMins;
        const startStr = toTimeString(clamp(mins, startHour * 60, endHour * 60 - duration));
        const updated: WeekendActivity = { ...found, day, start: startStr };
        if (hasConflict(prev, updated, internalId)) {
          toast.error("Scheduling conflict", { description: "This overlaps with another activity." });
          return prev;
        }
        return prev.map((a) => (a.id === internalId ? updated : a));
      });
      setDraggingId(null);
    } else if (external) {
      try {
        const payload = JSON.parse(external) as Partial<WeekendActivity> & {
          title: string;
          category: Category;
          durationMins: number;
        };
        if (!payload.title || !payload.category || !payload.durationMins) {
          toast.error("Invalid activity", { description: "Missing required fields." });
          return;
        }
        const duration = Math.max(MIN_SLOT_MINUTES, roundToStep(payload.durationMins, MIN_SLOT_MINUTES));
        const startStr = toTimeString(clamp(mins, startHour * 60, endHour * 60 - duration));
        const newAct: WeekendActivity = {
          id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          title: payload.title,
          category: payload.category,
          durationMins: duration,
          day,
          start: startStr,
          mood: (payload.mood as Mood) || undefined,
          notes: payload.notes || "",
        };
        setActivities((prev) => {
          if (hasConflict(prev, newAct)) {
            toast.error("Scheduling conflict", { description: "This overlaps with another activity." });
            return prev;
          }
          toast.success("Added to schedule", { description: `${newAct.title} scheduled on ${capitalize(day)}.` });
          return [...prev, newAct];
        });
      } catch {
        toast.error("Couldn't add activity", { description: "Drag from the activity browser to add." });
      }
    }
  };

  const openEdit = (activity: WeekendActivity) => {
    setEditDraft({ ...activity });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editDraft) return;
    const cleaned: WeekendActivity = {
      ...editDraft,
      title: editDraft.title.trim() || "Untitled",
      durationMins: Math.max(MIN_SLOT_MINUTES, roundToStep(editDraft.durationMins, MIN_SLOT_MINUTES)),
      start: normalizeTime(editDraft.start),
    };
    setActivities((prev) => {
      if (hasConflict(prev, cleaned, cleaned.id)) {
        toast.error("Scheduling conflict", { description: "Adjusted time overlaps another activity." });
        return prev;
      }
      return prev.map((a) => (a.id === cleaned.id ? cleaned : a));
    });
    setEditOpen(false);
  };

  const removeActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    toast.message("Removed activity");
  };

  const actsByDay = useMemo(() => {
    const map: Record<DayKey, WeekendActivity[]> = { saturday: [], sunday: [] };
    for (const a of activities) map[a.day].push(a);
    map.saturday.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    map.sunday.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    return map;
  }, [activities]);

  const exportText = () => {
    console.log("Export text clicked");
    
    try {
      const lines: string[] = [];
      lines.push("Weekendly Schedule");
      lines.push("==================");
      lines.push("");
      
      (["saturday", "sunday"] as DayKey[]).forEach((day) => {
        lines.push(`${capitalize(day)}:`);
        actsByDay[day].forEach((a) => {
          const end = toTimeString(toMinutes(a.start) + a.durationMins);
          lines.push(`- ${a.start}–${end} • ${a.title} [${a.category}]${a.mood ? ` (${a.mood})` : ""}`);
          if (a.notes) lines.push(`  Notes: ${a.notes}`);
        });
        if (actsByDay[day].length === 0) lines.push("- (no activities)");
        lines.push("");
      });
      
      const text = lines.join("\n");
      console.log("Generated text:", text);
      
      // Try clipboard first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          console.log("Text copied to clipboard");
          toast.success("Schedule copied to clipboard", { description: "Share your plans anywhere." });
        }).catch((err) => {
          console.error("Clipboard error:", err);
          downloadTextFile(text);
        });
      } else {
        downloadTextFile(text);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", { description: "Could not export schedule. Please try again." });
    }
  };

  const downloadTextFile = (text: string) => {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weekendly-schedule.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Schedule downloaded", { description: "Check your downloads folder." });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", { description: "Could not download file. Please try again." });
    }
  };

  const exportImage = () => {
    // Create a high-quality export that matches the original UI
    const w = 1400;
    const h = 800;
    const pad = 40;
    const colGap = 40;
    const colWidth = (w - pad * 2 - colGap) / 2;
    const headerH = 80;
    const axisW = 80;
    const trackH = h - pad * 2 - headerH;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clean background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Header
    ctx.fillStyle = "#1f2937";
    ctx.font = "700 28px Inter, system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Weekendly Schedule", pad + 20, pad + 40);

    const days: DayKey[] = ["saturday", "sunday"];
    const totalMins = (endHour - startHour) * 60;

    days.forEach((day, i) => {
      const x0 = pad + 20 + i * (colWidth + colGap);
      const y0 = pad + 80;

      // Day header
      ctx.fillStyle = "#374151";
      ctx.font = "700 20px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(capitalize(day), x0, y0 - 10);

      // Timeline container
      ctx.fillStyle = "#f9fafb";
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      roundRect(ctx, x0, y0, colWidth, trackH, 12);
      ctx.fill();
      ctx.stroke();

      // Hour grid lines
      for (let hIdx = startHour; hIdx <= endHour; hIdx++) {
        const y = y0 + ((hIdx - startHour) / (endHour - startHour)) * trackH;
        
        // Grid line
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0 + axisW, y);
        ctx.lineTo(x0 + colWidth - 12, y);
        ctx.stroke();

        // Hour label
        ctx.fillStyle = "#6b7280";
        ctx.font = "500 12px Inter, system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${String(hIdx).padStart(2, "0")}:00`, x0 + 12, y + 3);
      }

      // Activities
      const acts = actsByDay[day];
      acts.forEach((a) => {
        const s = toMinutes(a.start);
        const e = s + a.durationMins;
        const yS = y0 + ((s - startHour * 60) / totalMins) * trackH;
        const yE = y0 + ((e - startHour * 60) / totalMins) * trackH;
        const rectX = x0 + axisW + 8;
        const rectY = yS + 4;
        const rectW = colWidth - axisW - 20;
        const rectH = Math.max(50, yE - yS - 8);

        // Card background - subtle gradient
        const categoryColor = getCategoryColor(a.category);
        ctx.fillStyle = categoryColor.background;
        roundRect(ctx, rectX, rectY, rectW, rectH, 12);
        ctx.fill();

        // Card border
        ctx.strokeStyle = categoryColor.border;
        ctx.lineWidth = 2;
        roundRect(ctx, rectX, rectY, rectW, rectH, 12);
        ctx.stroke();

        // Category dot and label
        const dotX = rectX + 16;
        const dotY = rectY + 16;
        ctx.fillStyle = categoryColor.dot;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#6b7280";
        ctx.font = "600 11px Inter, system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(a.category.toUpperCase(), dotX + 12, dotY + 3);

        // Title
        ctx.fillStyle = "#1f2937";
        ctx.font = "700 14px Inter, system-ui, sans-serif";
        ctx.fillText(a.title, rectX + 16, rectY + 36);

        // Time display - blue badge
        const timeText = `${a.start}–${toTimeString(e)}`;
        const timeW = ctx.measureText(timeText).width + 16;
        const timeH = 20;
        const timeX = rectX + 16;
        const timeY = rectY + 48;

        // Time background - blue badge
        ctx.fillStyle = "#3b82f6";
        roundRect(ctx, timeX, timeY, timeW, timeH, 6);
        ctx.fill();

        // Time text
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 11px Inter, system-ui, sans-serif";
        ctx.fillText(timeText, timeX + 8, timeY + 13);

        // Duration
        ctx.fillStyle = "#6b7280";
        ctx.font = "500 11px Inter, system-ui, sans-serif";
        ctx.fillText(`• ${a.durationMins}m`, timeX + timeW + 8, timeY + 13);

        // Mood if available
        if (a.mood) {
          ctx.fillStyle = "#6b7280";
          ctx.font = "500 10px Inter, system-ui, sans-serif";
          ctx.fillText(`#${a.category} · ${a.mood}`, rectX + 16, rectY + rectH - 8);
        }
      });
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weekendly-schedule.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Image exported");
    });
  };

  // Mobile swipe between days
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const sx = touchStartX.current;
    const ex = e.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (sx == null || ex == null) return;
    const dx = ex - sx;
    if (Math.abs(dx) > 40) {
      setDayTab((d) => (dx < 0 ? (d === "saturday" ? "sunday" : "sunday") : d === "sunday" ? "saturday" : "saturday"));
    }
  };

  return (
    <section
      className={cn(
        "w-full max-w-full rounded-2xl bg-card shadow-sm border border-[color:var(--border)]",
        "p-3 sm:p-4",
        className
      )}
      aria-label="Weekend schedule"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <ChartGantt className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading text-foreground">Weekend Schedule</h2>
            <p className="text-sm text-muted-foreground">Plan your Saturday and Sunday activities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportText} aria-label="Export as text">
            <Calendar className="mr-2 size-4" />
            Export Text
          </Button>
          <Button size="sm" onClick={exportImage} aria-label="Export as image">
            <CalendarDays className="mr-2 size-4" />
            Export Image
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-muted-foreground/20">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-foreground">💡 Tip:</span> Drag activities from the browser to schedule them, or rearrange existing ones. Click any activity to edit details.
        </p>
      </div>

      {/* Desktop two-column timelines; Mobile uses Tabs */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        <Timeline
          label="Saturday"
          dayKey="saturday"
          refEl={saturdayRef}
          hours={hours}
          startHour={startHour}
          endHour={endHour}
          activities={actsByDay.saturday}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          draggingId={draggingId}
          hoverDay={hoverDay}
          hoverMinutes={hoverMinutes}
          onCardDragStart={setDraggingId}
          onCardDragEnd={() => setDraggingId(null)}
          onEdit={openEdit}
          onRemove={removeActivity}
        />
        <Timeline
          label="Sunday"
          dayKey="sunday"
          refEl={sundayRef}
          hours={hours}
          startHour={startHour}
          endHour={endHour}
          activities={actsByDay.sunday}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          draggingId={draggingId}
          hoverDay={hoverDay}
          hoverMinutes={hoverMinutes}
          onCardDragStart={setDraggingId}
          onCardDragEnd={() => setDraggingId(null)}
          onEdit={openEdit}
          onRemove={removeActivity}
        />
      </div>

      <div className="md:hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Tabs value={dayTab} onValueChange={(v) => setDayTab(v as DayKey)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="saturday">Saturday</TabsTrigger>
            <TabsTrigger value="sunday">Sunday</TabsTrigger>
          </TabsList>
          <TabsContent value="saturday" className="mt-3">
            <Timeline
              label="Saturday"
              dayKey="saturday"
              refEl={saturdayRef}
              hours={hours}
              startHour={startHour}
              endHour={endHour}
              activities={actsByDay.saturday}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              draggingId={draggingId}
              hoverDay={hoverDay}
              hoverMinutes={hoverMinutes}
              onCardDragStart={setDraggingId}
              onCardDragEnd={() => setDraggingId(null)}
              onEdit={openEdit}
              onRemove={removeActivity}
              compact
            />
          </TabsContent>
          <TabsContent value="sunday" className="mt-3">
            <Timeline
              label="Sunday"
              dayKey="sunday"
              refEl={sundayRef}
              hours={hours}
              startHour={startHour}
              endHour={endHour}
              activities={actsByDay.sunday}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              draggingId={draggingId}
              hoverDay={hoverDay}
              hoverMinutes={hoverMinutes}
              onCardDragStart={setDraggingId}
              onCardDragEnd={() => setDraggingId(null)}
              onEdit={openEdit}
              onRemove={removeActivity}
              compact
            />
          </TabsContent>
        </Tabs>
      </div>

      <EditDialog
        open={editOpen}
        activity={editDraft}
        onOpenChange={setEditOpen}
        onChange={setEditDraft}
        onSave={saveEdit}
        onDelete={() => {
          if (editDraft) removeActivity(editDraft.id);
          setEditOpen(false);
        }}
      />
    </section>
  );
}

function Timeline(props: {
  label: string;
  dayKey: DayKey;
  refEl: React.MutableRefObject<HTMLDivElement | null>;
  hours: number[];
  startHour: number;
  endHour: number;
  activities: WeekendActivity[];
  draggingId: string | null;
  hoverDay: DayKey | null;
  hoverMinutes: number | null;
  onDragOver: (e: React.DragEvent, day: DayKey) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, day: DayKey) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  onEdit: (a: WeekendActivity) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}) {
  const {
    label,
    dayKey,
    refEl,
    hours,
    startHour,
    endHour,
    activities,
    draggingId,
    hoverDay,
    hoverMinutes,
    onDragOver,
    onDragLeave,
    onDrop,
    onCardDragStart,
    onCardDragEnd,
    onEdit,
    onRemove,
    compact,
  } = props;

  const totalMinutes = (endHour - startHour) * 60;

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-muted-foreground/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <Clock6 className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-foreground">{label}</h3>
            <p className="text-xs text-muted-foreground">Available {startHour}:00–{endHour}:00</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">{activities.length} activities</div>
          <div className="text-xs text-muted-foreground">scheduled</div>
        </div>
      </div>

      <div
        ref={(el) => {
          refEl.current = el;
        }}
        role="list"
        aria-label={`${label} timeline`}
        className={cn(
          "relative w-full max-w-full rounded-xl border-2 border-muted-foreground/20 bg-gradient-to-b from-background to-muted/20",
          "overflow-hidden shadow-sm",
          "transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-md"
        )}
        onDragOver={(e) => onDragOver(e, dayKey)}
        onDragLeave={() => onDragLeave()}
        onDrop={(e) => onDrop(e, dayKey)}
      >
        {/* Hour grid */}
        <div className="absolute inset-0 pointer-events-none">
          {hours.map((h, idx) => {
            const topPct = ((h - startHour) / (endHour - startHour)) * 100;
            return (
              <div
                key={idx}
                className="absolute left-16 right-0 border-t border-muted-foreground/10"
                style={{ top: `${topPct}%` }}
                aria-hidden="true"
              />
            );
          })}
          {/* Labels column */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-b from-muted/40 to-muted/20 backdrop-blur-sm border-r border-muted-foreground/20">
            {hours.map((h, idx) => {
              const topPct = ((h - startHour) / (endHour - startHour)) * 100;
              return (
                <div
                  key={idx}
                  className="absolute -translate-y-1/2 left-2 text-xs font-medium text-muted-foreground select-none"
                  style={{ top: `${topPct}%` }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop overlay */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity",
            hoverDay === dayKey ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[color:var(--sidebar-accent)]/30" />
          {hoverDay === dayKey && hoverMinutes != null && (
            <div
              className="absolute left-16 right-2 h-[2px] bg-[color:var(--sidebar-primary)] shadow-[0_0_0_2px_rgba(0,0,0,0.02)]"
              style={{
                // Align with the padded track (same 8px offset used by activity blocks)
                top: `calc(${((hoverMinutes - startHour * 60) / totalMinutes) * 100}% + 8px)`,
              }}
            />
          )}
        </div>

        {/* Activity track area with padding left for axis */}
        <div className="relative pl-16 pr-2 py-2 min-h-[440px] sm:min-h-[560px]">
          {activities.length === 0 && (
            <EmptyHint />
          )}

          {activities.map((a) => {
            const s = toMinutes(a.start);
            const e = s + a.durationMins;
            const topPct = ((s - startHour * 60) / totalMinutes) * 100;
            const heightPct = (a.durationMins / totalMinutes) * 100;
            const isDragging = draggingId === a.id;
            const showDetails = a.durationMins >= 90;
            const isTight = a.durationMins < 50;
            const isVeryTight = a.durationMins < 30;

            return (
              <div
                key={a.id}
                role="listitem"
                aria-label={`${a.title}, ${a.start}, ${a.durationMins} minutes`}
                className={cn(
                  "absolute left-20 right-4 rounded-xl shadow-lg border-2 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm overflow-hidden",
                  "transition-all duration-300 ease-out cursor-pointer group",
                  "hover:shadow-xl hover:scale-[1.02] hover:border-primary/30",
                  categoryBorderPalette[a.category],
                  isDragging ? "opacity-60 scale-[0.98] shadow-2xl z-50" : "z-10",
                  // Add subtle category-based gradient overlay
                  a.category === "outdoor" && "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent before:pointer-events-none",
                  a.category === "food" && "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-amber-500/10 before:to-transparent before:pointer-events-none",
                  a.category === "fitness" && "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-blue-500/10 before:to-transparent before:pointer-events-none",
                  a.category === "culture" && "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-purple-500/10 before:to-transparent before:pointer-events-none",
                  a.category === "home" && "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-slate-500/10 before:to-transparent before:pointer-events-none",
                  a.category === "other" && "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-gray-500/10 before:to-transparent before:pointer-events-none"
                )}
                style={{
                  top: `calc(${topPct}% + 8px)`,
                  height: `calc(${Math.max(heightPct, (MIN_SLOT_MINUTES / totalMinutes) * 100)}% - 16px)`,
                  minHeight: '90px',
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/activity-id", a.id);
                  onCardDragStart(a.id);
                }}
                onDragEnd={onCardDragEnd}
                onClick={() => onEdit(a)}
              >
                <div className={cn("flex items-start justify-between gap-2 min-w-0", isVeryTight ? "mb-1 p-3" : isTight ? "mb-1.5 p-3" : "mb-2 p-4")}>
                  <div className="min-w-0 flex-1">
                    <div className={cn("flex items-center gap-2 min-w-0", isVeryTight ? "mb-0.5" : "mb-1")}>
                      <span
                        className={cn(
                          "inline-block size-2.5 rounded-full ring-2 ring-white shadow-sm shrink-0",
                          categoryPalette[a.category]
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn("font-semibold text-muted-foreground uppercase tracking-wide truncate", isVeryTight ? "text-[11px]" : "text-xs")}>
                        {a.category}
                      </span>
                    </div>
                    <h4 className={cn("font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors", isVeryTight ? "text-sm mb-2" : "text-sm mb-2")}>
                      {a.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-foreground mb-1">
                      <span className="font-mono bg-blue-100 text-blue-900 border border-blue-200 rounded px-2 py-0.5 font-semibold shadow-sm">
                        {a.start}–{toTimeString(e)}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-semibold text-foreground">{a.durationMins}m</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onRemove(a.id);
                    }}
                    className={cn("shrink-0 inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20 opacity-0 group-hover:opacity-100 transition-all duration-200", isVeryTight ? "size-5" : "size-6")}
                    aria-label={`Remove ${a.title}`}
                  >
                    <CalendarX2 className={cn(isVeryTight ? "size-3" : "size-3.5")} />
                  </button>
                </div>
                {showDetails && (a.mood || a.notes) && (
                  <div className={cn("pt-1.5 border-t border-muted-foreground/10", isTight ? "mt-1" : "mt-2")}>
                    {showDetails && a.mood && (
                      <div className="mb-1">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                            moodBadge[a.mood]
                          )}
                        >
                          {a.mood}
                        </span>
                      </div>
                    )}
                    {showDetails && a.notes && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 break-words leading-tight">
                        {a.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {compact && (
        <p className="sr-only">Swipe horizontally to switch between Saturday and Sunday.</p>
      )}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-10 rounded-lg border border-dashed border-[color:var(--border)] bg-muted/50">
      <CalendarPlus2 className="size-6 text-[color:var(--sidebar-primary)]" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">
        Drag activities here to start planning your day.
      </p>
      <p className="text-xs text-muted-foreground">
        Tip: You can drag from the activity browser or tap a time to add.
      </p>
    </div>
  );
}

function EditDialog({
  open,
  activity,
  onOpenChange,
  onChange,
  onSave,
  onDelete,
}: {
  open: boolean;
  activity: WeekendActivity | null;
  onOpenChange: (v: boolean) => void;
  onChange: (a: WeekendActivity | null) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit activity</DialogTitle>
          <DialogDescription>Adjust timing, mood, and notes. Conflicts will be checked automatically.</DialogDescription>
        </DialogHeader>
        {activity && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={activity.title}
                  onChange={(e) => onChange({ ...activity, title: e.target.value })}
                  placeholder="Activity title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={activity.category}
                  onValueChange={(v) => onChange({ ...activity, category: v as Category })}
                >
                  <SelectTrigger id="category" aria-label="Category">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="culture">Culture</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Start time</Label>
                <Input
                  id="start"
                  type="time"
                  step={MIN_SLOT_MINUTES * 60}
                  value={activity.start}
                  onChange={(e) => onChange({ ...activity, start: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration (mins)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={MIN_SLOT_MINUTES}
                  step={MIN_SLOT_MINUTES}
                  value={activity.durationMins}
                  onChange={(e) =>
                    onChange({
                      ...activity,
                      durationMins: parseInt(e.target.value || "0", 10),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="day">Day</Label>
                <Select
                  value={activity.day}
                  onValueChange={(v) => onChange({ ...activity, day: v as DayKey })}
                >
                  <SelectTrigger id="day" aria-label="Day">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mood">Mood</Label>
                <Select
                  value={activity.mood || "chill"}
                  onValueChange={(v) => onChange({ ...activity, mood: v as Mood })}
                >
                  <SelectTrigger id="mood" aria-label="Mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chill">Chill</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="focus">Focus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={activity.notes || ""}
                onChange={(e) => onChange({ ...activity, notes: e.target.value })}
                placeholder="Add details, location, reminders..."
                className="min-h-24"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="text-[color:var(--destructive)] hover:bg-[color:var(--destructive)]/10"
              >
                <CalendarX2 className="mr-2 size-4" />
                Remove
              </Button>
              <Button type="submit" className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* Utils for export canvas */
function getCssVar(name: string): string | null {
  if (typeof window === "undefined") return null;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || null;
}

function withAlpha(hexOrCss: string, alpha: number) {
  // rudimentary: if hex, convert to rgba; else return original if alpha=1
  if (alpha >= 1) return hexOrCss;
  const hexMatch = hexOrCss.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrCss;
}

function categoryToHex(cat: Category) {
  // Map to defined tokens approximate
  switch (cat) {
    case "outdoor":
      return getCssVar("--chart-1") || "#6fb8d0";
    case "food":
      return getCssVar("--chart-3") || "#ffe46a";
    case "fitness":
      return getCssVar("--chart-4") || "#a8d8c8";
    case "culture":
      return getCssVar("--chart-5") || "#7aa6f8";
    case "home":
      return getCssVar("--muted") || "#f2f5f7";
    default:
      return getCssVar("--secondary") || "#f5f8f9";
  }
}

function getCategoryColor(cat: Category) {
  switch (cat) {
    case "outdoor":
      return {
        background: "#f0fdf4",
        border: "#22c55e",
        dot: "#16a34a"
      };
    case "food":
      return {
        background: "#fffbeb",
        border: "#f59e0b",
        dot: "#d97706"
      };
    case "fitness":
      return {
        background: "#eff6ff",
        border: "#3b82f6",
        dot: "#2563eb"
      };
    case "culture":
      return {
        background: "#faf5ff",
        border: "#8b5cf6",
        dot: "#7c3aed"
      };
    case "home":
      return {
        background: "#f8fafc",
        border: "#64748b",
        dot: "#475569"
      };
    default:
      return {
        background: "#f9fafb",
        border: "#9ca3af",
        dot: "#6b7280"
      };
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy);
      line = words[n] + " ";
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yy);
}

function normalizeTime(val: string) {
  if (!/^\d{1,2}:\d{2}$/.test(val)) return "08:00";
  const [h, m] = val.split(":").map(Number);
  return `${String(clamp(h, 0, 23)).padStart(2, "0")}:${String(clamp(m, 0, 59)).padStart(2, "0")}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
