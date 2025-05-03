"use client";

import { Button } from "@/components/ui/button";
import { useRemindersContext, ReminderTime } from "@/hooks/reminders-context";
import { Trash2, Clock, Calendar, X } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatRecurrence(reminder: ReminderTime): string {
  const { recurrence } = reminder;
  if (recurrence.type === "daily") return "Daily";
  if (recurrence.type === "weekly" && recurrence.days) {
    return recurrence.days
      .sort((a, b) => a - b)
      .map(d => WEEKDAYS[d])
      .join(", ") || "Weekly";
  }
  if (recurrence.type === "monthly" && recurrence.dates) {
    return recurrence.dates
      .sort((a, b) => a - b)
      .map(d => `${d}${d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}`)
      .join(", ") || "Monthly";
  }
  return "";
}

// Format time from 24h to 12h with AM/PM
function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minuteStr} ${ampm}`;
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
  const { reminders, removeReminder, clearReminders } = useRemindersContext();
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">{reminders.length} reminder{reminders.length !== 1 ? 's' : ''}</span>
        
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10 text-xs flex items-center h-7 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all reminders?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all your reminders. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  clearReminders();
                  setConfirmOpen(false);
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Clear All Reminders
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <ul className={`w-full flex flex-col gap-2 ${className ?? ""}`}
        aria-label="Reminder times list"
      >
        {reminders
          .sort((a, b) => a.time.localeCompare(b.time))
          .map(reminder => (
            <li
              key={reminder.id}
              className="flex items-center justify-between bg-muted rounded-lg px-4 py-3 shadow-sm hover:bg-accent transition-colors group animate-fade-in-slide"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-mono text-lg tracking-wider text-primary">{reminder.time}</span>
                  <span className="text-xs font-medium text-muted-foreground">({formatTime(reminder.time)})</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{formatRecurrence(reminder)}</span>
                </div>
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
    </div>
  );
}

