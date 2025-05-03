"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export type RecurrenceType = "daily" | "weekly" | "monthly";

export interface ReminderRecurrence {
  type: RecurrenceType;
  days?: number[];
  dates?: number[];
}

export interface ReminderTime {
  id: string;
  time: string;
  recurrence: ReminderRecurrence;
}

export interface RemindersContextValue {
  reminders: ReminderTime[];
  addReminder: (time: string, recurrence: ReminderRecurrence) => boolean;
  removeReminder: (id: string) => void;
  clearReminders: () => void;
  hasError: boolean;
  errorMessage: string | null;
  // Timer-related
  currentReminder: ReminderTime | null;
  dismissCurrentReminder: () => void;
}

const RemindersContext = createContext<RemindersContextValue | undefined>(undefined);

const STORAGE_KEY = "window-reminder:reminders";
const DISMISSED_KEY = "window-reminder:dismissed";

function getToday(): string {
  const now = new Date();
  return now.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function getCurrentWeekdayAndDate(): { weekday: number; date: number } {
  const now = new Date();
  return { weekday: now.getDay(), date: now.getDate() };
}

function isReminderDue(reminder: ReminderTime, now: Date, weekday: number, date: number): boolean {
  // Reminder time for today
  const [hh, mm] = reminder.time.split(":").map(Number);
  const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  // Only trigger if reminder time is <= now (today)
  if (reminderDate > now) return false;
  const { recurrence } = reminder;
  if (recurrence.type === "daily") return true;
  if (recurrence.type === "weekly" && recurrence.days) {
    return recurrence.days.includes(weekday);
  }
  if (recurrence.type === "monthly" && recurrence.dates) {
    return recurrence.dates.includes(date);
  }
  return false;
}

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<ReminderTime[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentReminder, setCurrentReminder] = useState<ReminderTime | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialCheckDone = useRef(false);

  // Get dismissed reminders for today from localStorage
  const getDismissed = useCallback((): string[] => {
    try {
      const all = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}") as Record<string, string[]>;
      return all[getToday()] || [];
    } catch (err) {
      console.error("[Reminders] Error reading dismissed reminders:", err);
      return [];
    }
  }, []);

  // Mark a reminder as dismissed for today
  const dismissCurrentReminder = useCallback(() => {
    if (!currentReminder) return;
    
    console.log("[Reminders] Dismissing current reminder:", currentReminder.id, currentReminder.time);
    try {
      const all = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}") as Record<string, string[]>;
      const today = getToday();
      all[today] = Array.from(new Set([...(all[today] || []), currentReminder.id]));
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(all));
      setCurrentReminder(null);
    } catch (err) {
      console.error("[Reminders] Error dismissing reminder:", err);
    }
  }, [currentReminder]);

  // Check for due reminders
  const checkReminders = useCallback(() => {
    if (reminders.length === 0) return;
    
    const now = new Date();
    const { weekday, date } = getCurrentWeekdayAndDate();
    const dismissed = getDismissed();
    
    console.log(`[Reminders] Checking ${reminders.length} reminders at ${now.toTimeString()}. Dismissed today: ${dismissed.length}`);
    
    for (const reminder of reminders) {
      const isDue = isReminderDue(reminder, now, weekday, date);
      const isDismissed = dismissed.includes(reminder.id);
      
      console.log(`[Reminders] Reminder ${reminder.id} (${reminder.time}): isDue=${isDue}, isDismissed=${isDismissed}`);
      
      if (isDue && !isDismissed) {
        console.log(`[Reminders] FOUND DUE REMINDER: ${reminder.id} at ${reminder.time}`);
        setCurrentReminder(reminder);
        return; // Only show one reminder at a time
      }
    }
    
    // If we get here, no due reminders were found
    if (currentReminder) {
      console.log(`[Reminders] Clearing current reminder: no due reminders found`);
      setCurrentReminder(null);
    }
  }, [reminders, getDismissed, currentReminder]);

  // Load reminders from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReminders(parsed);
        console.log("[Reminders] Loaded from storage:", parsed);
      }
    } catch (err) {
      setHasError(true);
      setErrorMessage("Failed to load reminders from storage.");
      console.error("[Reminders] Error loading from storage:", err);
    }
  }, []);

  // Start timer when reminders are loaded
  useEffect(() => {
    // Initial check after reminders are loaded
    if (reminders.length > 0 && !initialCheckDone.current) {
      console.log("[Reminders] Initial check after load");
      initialCheckDone.current = true;
      checkReminders();
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up new interval
    console.log("[Reminders] Starting timer check interval");
    intervalRef.current = setInterval(checkReminders, 10000); // every 10 seconds
    
    return () => {
      if (intervalRef.current) {
        console.log("[Reminders] Cleaning up timer interval");
        clearInterval(intervalRef.current);
      }
    };
  }, [reminders, checkReminders]);

  // Persist reminders to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
      console.log("[Reminders] Saved to storage:", reminders);
    } catch (err) {
      setHasError(true);
      setErrorMessage("Failed to save reminders to storage.");
      console.error("[Reminders] Error saving to storage:", err);
    }
  }, [reminders]);

  // Validation functions
  const isValidTime = (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  const isValidRecurrence = (recurrence: ReminderRecurrence) => {
    if (recurrence.type === "weekly") {
      return Array.isArray(recurrence.days) && recurrence.days.length > 0;
    }
    if (recurrence.type === "monthly") {
      return Array.isArray(recurrence.dates) && recurrence.dates.length > 0 && recurrence.dates.every(d => d >= 1 && d <= 31);
    }
    return true;
  };

  // Add a new reminder
  const addReminder = useCallback((time: string, recurrence: ReminderRecurrence) => {
    setHasError(false);
    setErrorMessage(null);
    if (!isValidTime(time)) {
      setHasError(true);
      setErrorMessage("Invalid time format. Use HH:mm (24-hour).");
      console.warn("[Reminders] Invalid time format:", time);
      return false;
    }
    if (!isValidRecurrence(recurrence)) {
      setHasError(true);
      setErrorMessage("Please select valid recurrence options.");
      console.warn("[Reminders] Invalid recurrence:", recurrence);
      return false;
    }
    if (reminders.some(r => r.time === time && JSON.stringify(r.recurrence) === JSON.stringify(recurrence))) {
      setHasError(true);
      setErrorMessage("Reminder for this time and recurrence already exists.");
      console.warn("[Reminders] Duplicate reminder:", time, recurrence);
      return false;
    }
    const newReminder = { id: crypto.randomUUID(), time, recurrence };
    setReminders(prev => {
      const updated = [...prev, newReminder];
      console.log("[Reminders] Added:", newReminder);
      // Immediately check if this new reminder should be triggered
      setTimeout(() => checkReminders(), 100);
      return updated;
    });
    return true;
  }, [reminders, checkReminders]);

  // Remove a reminder by id
  const removeReminder = useCallback((id: string) => {
    setReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      console.log("[Reminders] Removed id:", id, "Updated:", updated);
      return updated;
    });
    // If the current reminder is being removed, clear it
    if (currentReminder && currentReminder.id === id) {
      setCurrentReminder(null);
    }
  }, [currentReminder]);

  // Clear all reminders
  const clearReminders = useCallback(() => {
    setReminders([]);
    setCurrentReminder(null);
    console.log("[Reminders] Cleared all reminders");
  }, []);

  const value: RemindersContextValue = {
    reminders,
    addReminder,
    removeReminder,
    clearReminders,
    hasError,
    errorMessage,
    currentReminder,
    dismissCurrentReminder,
  };

  return (
    <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>
  );
}

export function useRemindersContext() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error("useRemindersContext must be used within a RemindersProvider");
  return ctx;
} 