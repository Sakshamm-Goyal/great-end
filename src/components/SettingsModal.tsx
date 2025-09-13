"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings2,
  Save, 
  RotateCcw, 
  Sun, 
  Moon, 
  Monitor,
  Calendar
} from "lucide-react"
import { toast } from "sonner"

export interface SettingsData {
  theme: "lazy" | "adventurous" | "family"
  colorScheme: "light" | "dark" | "system"
  autoSave: boolean
  defaultDuration: number
  timeFormat: "12h" | "24h"
  notifications: boolean
  startTime: string
  endTime: string
  weekendStart: "friday" | "saturday"
  showTutorial: boolean
  compactMode: boolean
}

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSettings: SettingsData
  onSettingsChange: (settings: SettingsData) => void
  onResetSettings: () => void
}

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
}

export default function SettingsModal({
  open,
  onOpenChange,
  currentSettings,
  onSettingsChange,
  onResetSettings,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<SettingsData>(currentSettings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setSettings(currentSettings)
    setHasChanges(false)
  }, [currentSettings, open])

  const handleSettingChange = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSettingsChange(settings)
    setHasChanges(false)
    toast.success("Settings saved")
    onOpenChange(false) // Close the modal after saving
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    onResetSettings()
    toast.success("Settings reset to defaults")
  }

  const handleClose = () => {
    if (hasChanges) {
      const shouldSave = window.confirm("You have unsaved changes. Save before closing?")
      if (shouldSave) {
        handleSave()
      }
    }
    onOpenChange(false)
  }

  const themeOptions = [
    { value: "lazy", label: "Lazy", description: "Slow & cozy activities", icon: "🌅" },
    { value: "adventurous", label: "Adventurous", description: "Active & bold experiences", icon: "🎢" },
    { value: "family", label: "Family", description: "Together time activities", icon: "👨‍👩‍👧‍👦" },
  ]

  const colorSchemeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[50vh] overflow-hidden flex flex-col border-2 border-primary/20 shadow-2xl">
        <DialogHeader className="pb-2 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            Settings
            {hasChanges && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Unsaved changes" />
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="space-y-2">
            {/* Theme Settings */}
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="theme-select" className="text-sm font-medium text-foreground">Default Theme</Label>
                <Select value={settings.theme} onValueChange={(value: any) => handleSettingChange("theme", value)}>
                  <SelectTrigger className="h-8 border-2 border-border/50 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{option.icon}</span>
                          <div>
                            <div className="font-medium text-base">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-scheme" className="text-sm font-medium">Color Scheme</Label>
                <Select value={settings.colorScheme} onValueChange={(value: any) => handleSettingChange("colorScheme", value)}>
                  <SelectTrigger className="h-8 border-2 border-border/50 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value} className="py-2">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{option.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border-2 border-border/30 bg-gradient-to-r from-muted/20 to-muted/10 hover:border-primary/30 transition-all duration-200">
                <div className="space-y-1">
                  <Label htmlFor="compact-mode" className="text-sm font-medium">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Use smaller spacing and condensed layout</p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
                />
              </div>
            </div>

            {/* Time & Schedule Settings */}
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-sm font-medium">Default Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={settings.startTime}
                    onChange={(e) => handleSettingChange("startTime", e.target.value)}
                    className="h-8 text-sm border-2 border-border/50 hover:border-primary/50 transition-colors"
                  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-sm font-medium">Default End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={settings.endTime}
                  onChange={(e) => handleSettingChange("endTime", e.target.value)}
                    className="h-8 text-sm border-2 border-border/50 hover:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-duration" className="text-sm font-medium">Default Activity Duration</Label>
                <div className="relative">
                  <Input
                    id="default-duration"
                    type="number"
                    min={15}
                    step={15}
                    value={settings.defaultDuration}
                    onChange={(e) => handleSettingChange("defaultDuration", parseInt(e.target.value) || 60)}
                    className="h-8 text-sm pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-format" className="text-sm font-medium">Time Format</Label>
                <Select value={settings.timeFormat} onValueChange={(value: any) => handleSettingChange("timeFormat", value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h" className="py-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">12-hour (AM/PM)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="24h" className="py-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">24-hour</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekend-start" className="text-sm font-medium">Weekend Starts On</Label>
                <Select value={settings.weekendStart} onValueChange={(value: any) => handleSettingChange("weekendStart", value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saturday" className="py-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Saturday</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friday" className="py-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Friday Evening</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Behavior Settings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg border-2 border-border/30 bg-gradient-to-r from-muted/20 to-muted/10 hover:border-primary/30 transition-all duration-200">
                <div className="space-y-1">
                  <Label htmlFor="auto-save" className="text-sm font-medium">Auto-save</Label>
                  <p className="text-xs text-muted-foreground">Automatically save changes to your plans</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border-2 border-border/30 bg-gradient-to-r from-muted/20 to-muted/10 hover:border-primary/30 transition-all duration-200">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="text-sm font-medium">Notifications</Label>
                  <p className="text-xs text-muted-foreground">Show browser notifications for reminders</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border-2 border-border/30 bg-gradient-to-r from-muted/20 to-muted/10 hover:border-primary/30 transition-all duration-200">
                <div className="space-y-1">
                  <Label htmlFor="show-tutorial" className="text-sm font-medium">Show Tutorial</Label>
                  <p className="text-xs text-muted-foreground">Display tutorial on first visit</p>
                </div>
                <Switch
                  id="show-tutorial"
                  checked={settings.showTutorial}
                  onCheckedChange={(checked) => handleSettingChange("showTutorial", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 bg-muted/5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClose}
              className="border-2 border-border/50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={!hasChanges}
              className={`border-2 transition-all duration-200 ${
                hasChanges 
                  ? "border-primary hover:border-primary/80 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl" 
                  : "border-gray-300 bg-gray-100 cursor-not-allowed"
              }`}
            >
              <Save className="h-3 w-3 mr-1" />
              {hasChanges ? "Save Changes" : "No Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}