"use client";

import { Button } from "@/components/ui/button";
import { useReminders } from "@/hooks/use-reminders";
import { Trash2 } from "lucide-react";

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
  const { reminders, removeReminder } = useReminders();

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
            <span className="font-mono text-lg tracking-wider text-primary">
              {reminder.time}
            </span>
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

// Tailwind custom animation class (add to your global CSS if not present):
// .animate-fade-in-slide { animation: fade-in-slide 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
// @keyframes fade-in-slide { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } } 