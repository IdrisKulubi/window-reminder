"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Interface for a single reminder time (24-hour format, e.g., "21:30").
 */
export interface ReminderTime {
  id: string; // unique identifier
  time: string; // "HH:mm"
}

/**
 * Hook return type.
 */
export interface UseReminders {
  reminders: ReminderTime[];
  addReminder: (time: string) => boolean;
  removeReminder: (id: string) => void;
  clearReminders: () => void;
  hasError: boolean;
  errorMessage: string | null;
}

const STORAGE_KEY = "window-reminder:reminders";

/**
 * Custom hook for managing reminder times with localStorage persistence.
 * Handles validation, error state, and provides add/remove/clear functions.
 */
export function useReminders(): UseReminders {
  const [reminders, setReminders] = useState<ReminderTime[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load reminders from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch {
      setHasError(true);
      setErrorMessage("Failed to load reminders from storage.");
    }
  }, []);

  // Persist reminders to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch {
      setHasError(true);
      setErrorMessage("Failed to save reminders to storage.");
    }
  }, [reminders]);

  // Validate time string (HH:mm, 24-hour)
  const isValidTime = (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

  // Add a new reminder (returns true if added, false if invalid/duplicate)
  const addReminder = useCallback((time: string) => {
    setHasError(false);
    setErrorMessage(null);
    if (!isValidTime(time)) {
      setHasError(true);
      setErrorMessage("Invalid time format. Use HH:mm (24-hour).");
      return false;
    }
    if (reminders.some(r => r.time === time)) {
      setHasError(true);
      setErrorMessage("Reminder for this time already exists.");
      return false;
    }
    setReminders(prev => [
      ...prev,
      { id: crypto.randomUUID(), time },
    ]);
    return true;
  }, [reminders]);

  // Remove a reminder by id
  const removeReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  // Clear all reminders
  const clearReminders = useCallback(() => {
    setReminders([]);
  }, []);

  return {
    reminders,
    addReminder,
    removeReminder,
    clearReminders,
    hasError,
    errorMessage,
  };
} 