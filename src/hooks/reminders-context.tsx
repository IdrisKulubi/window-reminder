"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

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
}

const RemindersContext = createContext<RemindersContextValue | undefined>(undefined);

const STORAGE_KEY = "window-reminder:reminders";

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<ReminderTime[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      return updated;
    });
    return true;
  }, [reminders]);

  const removeReminder = useCallback((id: string) => {
    setReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      console.log("[Reminders] Removed id:", id, "Updated:", updated);
      return updated;
    });
  }, []);

  const clearReminders = useCallback(() => {
    setReminders([]);
    console.log("[Reminders] Cleared all reminders");
  }, []);

  const value: RemindersContextValue = {
    reminders,
    addReminder,
    removeReminder,
    clearReminders,
    hasError,
    errorMessage,
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