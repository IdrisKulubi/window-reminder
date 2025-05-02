"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReminders } from "@/hooks/use-reminders";
import { CheckCircle } from "lucide-react";

/**
 * Props for ReminderTimePicker.
 */
export interface ReminderTimePickerProps {
  className?: string;
}

/**
 * Dropdown-based time picker for adding reminder times.
 * Accessible, mobile-friendly, and easy to use.
 */
export function ReminderTimePicker({ className }: ReminderTimePickerProps) {
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const { addReminder, hasError, errorMessage } = useReminders();
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setShake(false);
    if (hour && minute) {
      const time = `${hour}:${minute}`;
      const added = addReminder(time);
      if (added) {
        setHour("");
        setMinute("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1200);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  // Generate hour and minute options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <form
      onSubmit={handleAdd}
      className={`flex flex-col md:flex-row items-center gap-4 w-full max-w-sm mx-auto relative ${className ?? ""}`}
      aria-label="Add reminder time"
    >
      <div className={`flex gap-2 w-full transition-transform duration-300 ${shake ? "animate-shake" : ""}`}>
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger className="w-20" aria-label="Hour">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {hours.map(h => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xl font-bold self-center">:</span>
        <Select value={minute} onValueChange={setMinute}>
          <SelectTrigger className="w-20" aria-label="Minute">
            <SelectValue placeholder="Minute" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        className="w-full md:w-auto font-semibold text-base"
        disabled={!hour || !minute}
        aria-disabled={!hour || !minute}
      >
        Add Reminder
      </Button>
      {/* Success animation */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
        {success && (
          <CheckCircle className="text-green-500 w-8 h-8 animate-pop-in" aria-label="Reminder added!" />
        )}
      </div>
      {/* Error animation */}
      {hasError && errorMessage && (
        <div
          className={`text-red-600 text-sm mt-2 w-full text-center transition-all duration-300 ${shake ? "animate-shake" : ""}`}
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </form>
  );
}

// Tailwind custom animation classes (add to your global CSS if not present):
// .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
// @keyframes pop-in { 0% { transform: scale(0.7); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
// .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
// @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } } 