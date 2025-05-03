"use client";

import { Button } from "@/components/ui/button";
import { useRemindersContext, ReminderTime } from "@/hooks/reminders-context";
import { Trash2 } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatRecurrence(reminder: ReminderTime): string {
  const { recurrence } = reminder;
  if (recurrence.type === "daily") return "Daily";
  if (recurrence.type === "weekly" && recurrence.days) {
    return recurrence.days
      .sort((a, b) => a - b)
      .map(d => WEEKDAYS[d])
      .join("/") || "Weekly";
  }
  if (recurrence.type === "monthly" && recurrence.dates) {
    return recurrence.dates
      .sort((a, b) => a - b)
      .map(d => `${d}${d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}`)
      .join("/") || "Monthly";
  }
  return "";
}

/**
 * Props for ReminderList.
 */
export interface ReminderListProps {
  className?: string;
}

/**
 * Displays a list of all reminder times with remove buttons.
 * Accessible, beautiful, and responsive.
 */
export function ReminderList({ className }: ReminderListProps) {
  const { reminders, removeReminder } = useRemindersContext();

  if (reminders.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className ?? ""}`}
        aria-live="polite"
      >
        No reminders set yet. Add your first reminder!
      </div>
    );
  }

  return (
    <ul className={`w-full max-w-sm mx-auto flex flex-col gap-2 ${className ?? ""}`}
      aria-label="Reminder times list"
    >
      {reminders
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(reminder => (
          <li
            key={reminder.id}
            className="flex items-center justify-between bg-muted rounded-lg px-4 py-2 shadow-sm hover:bg-accent transition-colors group animate-fade-in-slide"
          >
            <div className="flex flex-col">
              <span className="font-mono text-lg tracking-wider text-primary">{reminder.time}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{formatRecurrence(reminder)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove reminder for ${reminder.time}`}
              onClick={() => removeReminder(reminder.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </li>
        ))}
    </ul>
  );
}

