"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReminderTime } from "@/hooks/use-reminders";


export interface UseReminderTimer {
  dueReminder: ReminderTime | null;
  dismissReminder: () => void;
}

const DISMISSED_KEY = "window-reminder:dismissed";

function getToday(): string {
  const now = new Date();
  return now.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function getCurrentTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // HH:mm
}


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
      all[today] = Array.from(new Set([...(all[today] || []), dueReminder.time]));
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(all));
      setDueReminder(null);
    } catch {
      // ignore
    }
  }, [dueReminder]);

  useEffect(() => {
    function checkReminders() {
      const now = getCurrentTime();
      const dismissed = getDismissed();
      const due = reminders.find(r => r.time === now && !dismissed.includes(r.time));
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