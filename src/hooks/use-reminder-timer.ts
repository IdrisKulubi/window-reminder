"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReminderTime } from "@/hooks/use-reminders";

/**
 * Interface for the timer hook return value.
 */
export interface UseReminderTimer {
  dueReminder: ReminderTime | null;
  dismissReminder: () => void;
}

const DISMISSED_KEY = "window-reminder:dismissed";

/**
 * Returns today's date string (YYYY-MM-DD) in local time.
 */
function getToday(): string {
  const now = new Date();
  return now.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

/**
 * Returns current time string (HH:mm, 24-hour) in local time.
 */
function getCurrentTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // HH:mm
}

/**
 * Returns the current weekday (0=Sun, 1=Mon, ... 6=Sat) and date (1-31).
 */
function getCurrentWeekdayAndDate(): { weekday: number; date: number } {
  const now = new Date();
  return { weekday: now.getDay(), date: now.getDate() };
}

/**
 * Checks if a reminder is due now, based on time and recurrence.
 */
function isReminderDue(reminder: ReminderTime, nowTime: string, weekday: number, date: number): boolean {
  if (reminder.time !== nowTime) return false;
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

/**
 * Custom hook to check if a reminder is due and not yet dismissed today.
 * Checks every minute. Persists dismissed reminders in localStorage.
 */
export function useReminderTimer(reminders: ReminderTime[]): UseReminderTimer {
  const [dueReminder, setDueReminder] = useState<ReminderTime | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get dismissed reminders for today from localStorage
  const getDismissed = (): string[] => {
    try {
      const all = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}") as Record<string, string[]>;
      return all[getToday()] || [];
    } catch {
      return [];
    }
  };

  // Mark a reminder as dismissed for today
  const dismissReminder = useCallback(() => {
    if (!dueReminder) return;
    try {
      const all = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}") as Record<string, string[]>;
      const today = getToday();
      all[today] = Array.from(new Set([...(all[today] || []), dueReminder.id]));
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(all));
      setDueReminder(null);
    } catch {
      // ignore
    }
  }, [dueReminder]);

  // Check for due reminders every minute
  useEffect(() => {
    function checkReminders() {
      const nowTime = getCurrentTime();
      const { weekday, date } = getCurrentWeekdayAndDate();
      const dismissed = getDismissed();
      const due = reminders.find(r =>
        isReminderDue(r, nowTime, weekday, date) && !dismissed.includes(r.id)
      );
      setDueReminder(due || null);
    }
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reminders]);

  return { dueReminder, dismissReminder };
} 