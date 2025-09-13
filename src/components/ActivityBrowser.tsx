"use client"

import React, { useEffect, useMemo, useState } from "react"
import { RollerCoaster, Sunset, CalendarSearch, CalendarPlus, LayoutGrid, Play, TimerReset, Grid2x2Check, Spade, SquareMenu, SquareActivity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type ThemeKey = "lazy" | "adventurous" | "family"
type Difficulty = "easy" | "medium" | "hard"

export type Activity = {
  id: string
  title: string
  description: string
  category: string
  durationMin: number
  difficulty: Difficulty
  moods: string[]
  icon?: "RollerCoaster" | "Sunset" | "CalendarPlus" | "CalendarSearch" | "LayoutGrid" | "Play" | "TimerReset" | "Grid2x2Check" | "Spade" | "SquareMenu" | "SquareActivity"
  day?: 'saturday' | 'sunday'
  start?: string
}

export interface ActivityBrowserProps {
  activities?: Activity[]
  onAddActivity?: (activity: Activity) => void
  onThemeSelect?: (theme: ThemeKey) => void
  className?: string
  style?: React.CSSProperties
}

const defaultActivities: Activity[] = [
  {
    id: "walk-park",
    title: "Morning Park Walk",
    description: "A calm stroll to start the day fresh.",
    category: "Relax",
    durationMin: 45,
    difficulty: "easy",
    moods: ["calm", "outdoors"],
    icon: "Sunset",
  },
  {
    id: "roller-thrill",
    title: "Theme Park Thrills",
    description: "Roller coasters and adrenaline rush.",
    category: "Adventure",
    durationMin: 180,
    difficulty: "hard",
    moods: ["energetic", "social"],
    icon: "RollerCoaster",
  },
  {
    id: "brunch",
    title: "Family Brunch",
    description: "Pancakes, laughs, and stories.",
    category: "Family",
    durationMin: 90,
    difficulty: "easy",
    moods: ["social", "cozy"],
    icon: "SquareMenu",
  },
  {
    id: "museum",
    title: "Local Museum Visit",
    description: "Explore art and history exhibits.",
    category: "Relax",
    durationMin: 120,
    difficulty: "medium",
    moods: ["curious", "indoors"],
    icon: "LayoutGrid",
  },
  {
    id: "hike",
    title: "Trail Hike",
    description: "Scenic route with moderate climb.",
    category: "Adventure",
    durationMin: 150,
    difficulty: "medium",
    moods: ["outdoors", "energetic"],
    icon: "Spade",
  },
  {
    id: "movie-night",
    title: "Cozy Movie Night",
    description: "Blankets, snacks, feel-good film.",
    category: "Relax",
    durationMin: 120,
    difficulty: "easy",
    moods: ["cozy", "indoors"],
    icon: "Play",
  },
  {
    id: "picnic",
    title: "Picnic in the Meadow",
    description: "Sun, snacks, and board games.",
    category: "Family",
    durationMin: 100,
    difficulty: "easy",
    moods: ["outdoors", "cheerful"],
    icon: "CalendarPlus",
  },
  {
    id: "craft",
    title: "DIY Craft Session",
    description: "Create something fun together.",
    category: "Family",
    durationMin: 75,
    difficulty: "medium",
    moods: ["creative", "indoors"],
    icon: "Grid2x2Check",
  },
  {
    id: "coffee-crawl",
    title: "Cafe Hop",
    description: "Visit a few cozy cafes nearby.",
    category: "Relax",
    durationMin: 90,
    difficulty: "easy",
    moods: ["social", "cozy"],
    icon: "CalendarSearch",
  },
  {
    id: "game-arcade",
    title: "Arcade Hour",
    description: "Games, tickets, and friendly rivalry.",
    category: "Adventure",
    durationMin: 60,
    difficulty: "easy",
    moods: ["playful", "energetic"],
    icon: "SquareActivity",
  },
]

const categoryMeta: Record<
  string,
  { icon: React.ElementType; hueClass: string; badgeClass: string }
> = {
  Relax: {
    icon: Sunset,
    hueClass: "bg-chart-2/40 text-sidebar-primary",
    badgeClass: "bg-muted text-foreground",
  },
  Adventure: {
    icon: RollerCoaster,
    hueClass: "bg-chart-1/40 text-sidebar-primary",
    badgeClass: "bg-chart-1/20 text-sidebar-primary",
  },
  Family: {
    icon: SquareMenu,
    hueClass: "bg-chart-4/40 text-sidebar-primary",
    badgeClass: "bg-chart-4/20 text-foreground",
  },
}

const themePresets: { key: ThemeKey; label: string; icon: React.ElementType; hint: string }[] = [
  { key: "lazy", label: "Lazy", icon: Sunset, hint: "Slow & cozy" },
  { key: "adventurous", label: "Adventurous", icon: RollerCoaster, hint: "Active & bold" },
  { key: "family", label: "Family", icon: SquareMenu, hint: "Together time" },
]

function minutesToLabel(min: number) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function DifficultyBadge({ level }: { level: Difficulty }) {
  const map: Record<Difficulty, { text: string; className: string }> = {
    easy: { text: "Easy", className: "bg-chart-3/30 text-foreground" },
    medium: { text: "Medium", className: "bg-accent/30 text-foreground" },
    hard: { text: "Hard", className: "bg-destructive/20 text-destructive" },
  }
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", map[level].className)}>
      <Grid2x2Check className="size-3.5" aria-hidden="true" />
      {map[level].text}
    </span>
  )
}

export default function ActivityBrowser({
  activities = defaultActivities,
  onAddActivity,
  onThemeSelect,
  className,
  style,
}: ActivityBrowserProps) {
  const [query, setQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [activeTheme, setActiveTheme] = useState<ThemeKey | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [mTitle, setMTitle] = useState("")
  const [mDesc, setMDesc] = useState("")
  const [mCategory, setMCategory] = useState<string>("Relax")
  const [mDuration, setMDuration] = useState<number>(60)
  const [mDifficulty, setMDifficulty] = useState<Difficulty>("easy")
  const [mMoods, setMMoods] = useState<string>("")
  
  // State for manually added activities - initialize from localStorage
  const [manualActivities, setManualActivities] = useState<Activity[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('weekendly.manualActivities')
      if (saved) {
        const parsed = JSON.parse(saved) as Activity[]
        return parsed
      }
    } catch (error) {
      console.warn('Failed to load manual activities from localStorage:', error)
    }
    return []
  })

  // Save manual activities to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('weekendly.manualActivities', JSON.stringify(manualActivities))
    } catch (error) {
      console.warn('Failed to save manual activities to localStorage:', error)
    }
  }, [manualActivities])

  // Combine default activities with manually added ones
  const allActivities = useMemo(() => [...activities, ...manualActivities], [activities, manualActivities])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(allActivities.map((a) => a.category)))
    // Ensure known categories appear first in a pleasing order
    const order = ["Relax", "Adventure", "Family"]
    unique.sort((a, b) => {
      const ia = order.indexOf(a)
      const ib = order.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    return unique
  }, [allActivities])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allActivities.filter((a) => {
      if (selectedCategories.length && !selectedCategories.includes(a.category)) return false
      if (!q) return true
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.moods.some((m) => m.toLowerCase().includes(q))
      )
    })
  }, [allActivities, query, selectedCategories])

  useEffect(() => {
    if (activeTheme === "lazy") {
      setSelectedCategories(["Relax"])
      setQuery("cozy")
    } else if (activeTheme === "adventurous") {
      setSelectedCategories(["Adventure"])
      setQuery("")
    } else if (activeTheme === "family") {
      setSelectedCategories(["Family"])
      setQuery("")
    }
  }, [activeTheme])

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  function resetToDefaults() {
    setManualActivities([])
    setQuery("")
    setSelectedCategories([])
    setActiveTheme(null)
    // Clear localStorage
    try {
      localStorage.removeItem('weekendly.manualActivities')
    } catch (error) {
      console.warn('Failed to clear manual activities from localStorage:', error)
    }
  }

  function handleDragStart(e: React.DragEvent, activity: Activity) {
    // Map ActivityBrowser category to WeekendSchedule category
    const categoryMap = (cat: string, title: string): string => {
      // Special cases based on activity title
      if (title.toLowerCase().includes("park") || title.toLowerCase().includes("walk")) {
        return "outdoor";
      }
      if (title.toLowerCase().includes("museum") || title.toLowerCase().includes("gallery")) {
        return "culture";
      }
      if (title.toLowerCase().includes("movie") || title.toLowerCase().includes("cafe")) {
        return "home";
      }
      
      // General category mapping
      switch (cat) {
        case "Adventure":
          return "outdoor";
        case "Family":
          return "other";
        case "Relax":
          return "culture";
        default:
          return "home";
      }
    };

    // Map moods to WeekendSchedule mood format
    const moodMap = (moods: string[]): string | undefined => {
      const lower = moods.map((m) => m.toLowerCase());
      if (lower.some((m) => ["energetic", "playful"].includes(m))) return "energetic";
      if (lower.some((m) => ["social"].includes(m))) return "social";
      if (lower.some((m) => ["calm", "cozy"].includes(m))) return "chill";
      if (lower.some((m) => ["curious", "creative"].includes(m))) return "focus";
      return undefined;
    };

    // Set data for external drag to WeekendSchedule
    const payload = {
      title: activity.title,
      category: categoryMap(activity.category, activity.title),
      durationMins: activity.durationMin,
      mood: moodMap(activity.moods),
      notes: activity.description
    }
    e.dataTransfer.setData("application/weekendly-activity", JSON.stringify(payload))
    e.dataTransfer.effectAllowed = "copy"
    // Provide a lightweight drag image fallback (optional)
  }

  function handleDropInternal(e: React.DragEvent) {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    const act = activities.find((a) => a.id === id)
    if (act && onAddActivity) {
      onAddActivity(act)
    }
  }

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedDay, setSelectedDay] = useState<'saturday' | 'sunday'>('saturday')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  function handleAddClick(a: Activity) {
    setSelectedActivity(a)
    setSelectedDay('saturday')
    
    // Suggest appropriate time based on activity type
    let suggestedTime = '09:00'
    if (a.title.toLowerCase().includes('morning') || a.title.toLowerCase().includes('breakfast')) {
      suggestedTime = '08:00'
    } else if (a.title.toLowerCase().includes('evening') || a.title.toLowerCase().includes('dinner')) {
      suggestedTime = '18:00'
    } else if (a.title.toLowerCase().includes('night') || a.title.toLowerCase().includes('movie')) {
      suggestedTime = '20:00'
    } else if (a.title.toLowerCase().includes('lunch') || a.title.toLowerCase().includes('brunch')) {
      suggestedTime = '12:00'
    }
    
    setSelectedTime(suggestedTime)
    setAddDialogOpen(true)
  }

  function handleConfirmAdd() {
    if (selectedActivity && onAddActivity) {
      // Create a modified activity with the selected day and time
      const modifiedActivity = {
        ...selectedActivity,
        day: selectedDay,
        start: selectedTime
      }
      onAddActivity(modifiedActivity)
      setAddDialogOpen(false)
      setSelectedActivity(null)
    }
  }

  return (
    <section
      className={cn(
        "w-full max-w-full rounded-2xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-border/60",
        "backdrop-blur-[1px]",
        className
      )}
      style={style}
      aria-label="Activity browser"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <CalendarSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities, moods, or categories"
            aria-label="Search activities"
            className="pl-9 bg-secondary border-input focus-visible:ring-ring text-foreground"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={() => setResetDialogOpen(true)}
          aria-label="Reset to defaults"
        >
          <TimerReset className="size-4" aria-hidden="true" />
          Reset
        </Button>
        <Button type="button" className="gap-2" onClick={() => setManualOpen(true)} aria-label="Add activity manually">
          <CalendarPlus className="size-4" aria-hidden="true" />
          Add manually
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {themePresets.map((t) => {
          const Icon = t.icon
          const active = activeTheme === t.key
          return (
            <Button
              key={t.key}
              type="button"
              variant={active ? "default" : "secondary"}
              onClick={() => {
                const next = active ? null : t.key
                setActiveTheme(next)
                if (next && onThemeSelect) onThemeSelect(next)
              }}
              className={cn(
                "h-9 rounded-full px-3 sm:px-4 gap-2 transition-all",
                active ? "shadow-sm" : "hover:bg-secondary/80"
              )}
              aria-pressed={active}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="text-sm font-medium">{t.label}</span>
              <span className="hidden sm:inline text-xs text-muted-foreground">• {t.hint}</span>
            </Button>
          )
        })}
      </div>

      <div className="mb-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filter by category:</span>
          {categories.map((cat) => {
            const meta = categoryMeta[cat] ?? {
              icon: LayoutGrid,
              hueClass: "bg-muted",
              badgeClass: "bg-muted text-foreground",
            }
            const Icon = meta.icon
            const active = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground border-transparent" : "bg-secondary hover:bg-secondary/80 text-foreground"
                )}
                aria-pressed={active}
                aria-label={`Filter by ${cat}`}
                type="button"
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="font-medium">{cat}</span>
              </button>
            )
          })}
          </div>
          {manualActivities.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {manualActivities.length} custom activit{manualActivities.length === 1 ? 'y' : 'ies'}
            </div>
          )}
        </div>
      </div>

      <div
        className="mb-4 rounded-xl border border-dashed border-border/80 bg-secondary/60 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropInternal}
        aria-label="Drop an activity here to add to schedule"
        role="region"
      >
        Drag activities into your schedule. You can also drop here to add quickly.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((a) => {
          const Icon = (a.icon && iconFromName(a.icon)) || LayoutGrid
          const meta = categoryMeta[a.category] ?? {
            icon: LayoutGrid,
            hueClass: "bg-muted",
            badgeClass: "bg-muted text-foreground",
          }
          return (
            <article
              key={a.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border bg-card transition-colors",
                "hover:border-ring focus-within:border-ring shadow-sm hover:shadow-md"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, a)}
              role="button"
              aria-label={`Activity card: ${a.title}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleAddClick(a)
                }
              }}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-lg p-2 shrink-0", meta.hueClass)}>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold leading-tight text-foreground">{a.title}</h3>
                          {a.id.startsWith('manual-') && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {a.description}
                        </p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0", meta.badgeClass)}>
                        {a.category}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                          <TimerReset className="size-3.5" aria-hidden="true" />
                          {minutesToLabel(a.durationMin)}
                        </span>
                        <DifficultyBadge level={a.difficulty} />
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {a.moods.map((mood, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="rounded-full bg-secondary text-foreground text-xs px-2 py-0.5"
                          >
                            {mood}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground font-medium">
                      Drag to schedule
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                      onClick={() => handleAddClick(a)}
                      aria-label={`Add ${a.title} to schedule`}
                    >
                      <CalendarPlus className="size-4" aria-hidden="true" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-chart-1 via-chart-3 to-chart-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </article>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-secondary/60 p-6 text-center">
          <LayoutGrid className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No activities match your search. Try a different query or theme.</p>
        </div>
      )}

      {/* Manual Add Dialog */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add activity manually</DialogTitle>
            <DialogDescription>Create a custom activity and add it to the activity browser.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="e.g., Sunset photography" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="mt-1 w-full rounded-md border border-input bg-secondary p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
                value={mDesc}
                onChange={(e) => setMDesc(e.target.value)}
                placeholder="What is it about?"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-secondary p-2 text-sm text-foreground"
                  value={mCategory}
                  onChange={(e) => setMCategory(e.target.value)}
                >
                  <option>Relax</option>
                  <option>Adventure</option>
                  <option>Family</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (mins)</label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={mDuration}
                  onChange={(e) => setMDuration(parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-secondary p-2 text-sm text-foreground"
                  value={mDifficulty}
                  onChange={(e) => setMDifficulty(e.target.value as Difficulty)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Moods (comma separated)</label>
                <Input value={mMoods} onChange={(e) => setMMoods(e.target.value)} placeholder="cozy, social" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setManualOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!mTitle.trim()) return
                  const moods = mMoods
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                  const newAct: Activity = {
                    id: `manual-${Date.now()}`,
                    title: mTitle.trim(),
                    description: mDesc.trim(),
                    category: mCategory,
                    durationMin: Math.max(15, mDuration - (mDuration % 15)),
                    difficulty: mDifficulty,
                    moods,
                    icon: mCategory === "Adventure" ? "RollerCoaster" : mCategory === "Family" ? "SquareMenu" : "Sunset",
                  }
                  // Add to manual activities list so it shows in the browser
                  setManualActivities(prev => [...prev, newAct])
                  setManualOpen(false)
                  setMTitle("")
                  setMDesc("")
                  setMCategory("Relax")
                  setMDuration(60)
                  setMDifficulty("easy")
                  setMMoods("")
                }}
              >
                Add to browser
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Activity Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Activity to Schedule</DialogTitle>
            <DialogDescription>
              Choose when and where to schedule "{selectedActivity?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Day Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Day</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedDay === 'saturday' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay('saturday')}
                  className="flex-1"
                >
                  Saturday
                </Button>
                <Button
                  variant={selectedDay === 'sunday' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay('sunday')}
                  className="flex-1"
                >
                  Sunday
                </Button>
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Activity Preview */}
            {selectedActivity && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">{selectedActivity.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedActivity.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedActivity.durationMin}m
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedActivity.difficulty}
                  </Badge>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAdd}
                className="flex-1"
              >
                Add to {selectedDay === 'saturday' ? 'Saturday' : 'Sunday'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all your custom activities and reset filters. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDefaults}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

function iconFromName(name: Activity["icon"]) {
  switch (name) {
    case "RollerCoaster":
      return RollerCoaster
    case "Sunset":
      return Sunset
    case "CalendarPlus":
      return CalendarPlus
    case "CalendarSearch":
      return CalendarSearch
    case "LayoutGrid":
      return LayoutGrid
    case "Play":
      return Play
    case "TimerReset":
      return TimerReset
    case "Grid2x2Check":
      return Grid2x2Check
    case "Spade":
      return Spade
    case "SquareMenu":
      return SquareMenu
    case "SquareActivity":
      return SquareActivity
    default:
      return LayoutGrid
  }
}