"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Moon, Sun, Monitor, Save, Bell, Link as LinkIcon } from "lucide-react"

interface AccountPreferencesProps {
  theme: "light" | "dark" | "system"
  autosaveFrequency: string
  notifications: {
    audiobookReady: boolean
    bookReviewReady: boolean
    weeklyProgress: boolean
  }
  onThemeChange: (theme: "light" | "dark" | "system") => void
  onAutosaveChange: (frequency: string) => void
  onNotificationChange: (key: string, value: boolean) => void
}

export function AccountPreferences({
  theme,
  autosaveFrequency,
  notifications,
  onThemeChange,
  onAutosaveChange,
  onNotificationChange,
}: AccountPreferencesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Account Settings</h3>

          <div className="space-y-6">
            {/* Theme */}
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={() => onThemeChange("light")}
                    className="w-4 h-4 text-[#a6261c] border-input focus:ring-[#a6261c]"
                  />
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Light</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={() => onThemeChange("dark")}
                    className="w-4 h-4 text-[#a6261c] border-input focus:ring-[#a6261c]"
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Dark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="system"
                    checked={theme === "system"}
                    onChange={() => onThemeChange("system")}
                    className="w-4 h-4 text-[#a6261c] border-input focus:ring-[#a6261c]"
                  />
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">System</span>
                </label>
              </div>
            </div>

            {/* Autosave Frequency */}
            <div className="space-y-2">
              <Label htmlFor="autosave">Autosave Frequency</Label>
              <Select value={autosaveFrequency} onValueChange={onAutosaveChange}>
                <SelectTrigger id="autosave">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Every 5 seconds</SelectItem>
                  <SelectItem value="10">Every 10 seconds</SelectItem>
                  <SelectItem value="30">Every 30 seconds</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notification Settings */}
            <div className="space-y-3">
              <Label>Notifications</Label>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    Notify me when audiobook is ready
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications.audiobookReady}
                    onChange={(e) => onNotificationChange("audiobookReady", e.target.checked)}
                    className="w-4 h-4 text-[#a6261c] border-input rounded focus:ring-[#a6261c]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    Notify me when book review completes
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications.bookReviewReady}
                    onChange={(e) => onNotificationChange("bookReviewReady", e.target.checked)}
                    className="w-4 h-4 text-[#a6261c] border-input rounded focus:ring-[#a6261c]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    Weekly progress summary
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyProgress}
                    onChange={(e) => onNotificationChange("weeklyProgress", e.target.checked)}
                    className="w-4 h-4 text-[#a6261c] border-input rounded focus:ring-[#a6261c]"
                  />
                </label>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Label>Connected Accounts</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Google Drive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Not Connected</span>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Calendar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Not Connected</span>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

