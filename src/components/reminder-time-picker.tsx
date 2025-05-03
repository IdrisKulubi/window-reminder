"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRemindersContext, ReminderRecurrence, RecurrenceType } from "@/hooks/reminders-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function getNextTriggerTime(time: string, recurrence: ReminderRecurrence): Date {
  const now = new Date();
  const [hh, mm] = time.split(":").map(Number);
  let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  if (recurrence.type === "daily") {
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }
  if (recurrence.type === "weekly" && recurrence.days) {
    let minDiff = 8, targetDay = now.getDay();
    for (const d of recurrence.days) {
      let diff = (d - now.getDay() + 7) % 7;
      if (diff === 0 && next <= now) diff = 7;
      if (diff < minDiff) {
        minDiff = diff;
        targetDay = d;
      }
    }
    next.setDate(next.getDate() + minDiff);
    return next;
  }
  if (recurrence.type === "monthly" && recurrence.dates) {
    const today = now.getDate();
    let minDiff = 32, targetDate = today;
    for (const d of recurrence.dates) {
      let diff = d - today;
      if (diff === 0 && next <= now) diff = 32;
      if (diff < 0) diff += 31;
      if (diff < minDiff) {
        minDiff = diff;
        targetDate = d;
      }
    }
    next.setDate(now.getDate() + minDiff);
    return next;
  }
  // fallback: tomorrow
  next.setDate(next.getDate() + 1);
  return next;
}

export interface ReminderTimePickerProps {
  className?: string;
}

export function ReminderTimePicker({ className }: ReminderTimePickerProps) {
  const [time, setTime] = useState<string>(""); // "HH:mm"
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1,2,3,4,5]); // Default: Mon-Fri
  const [selectedDates, setSelectedDates] = useState<number[]>([1]);
  const { addReminder, hasError, errorMessage } = useRemindersContext();
  const [shake, setShake] = useState(false);
  const [nextTrigger, setNextTrigger] = useState<Date | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setShake(false);
    if (!time) return;
    let recurrence: ReminderRecurrence;
    if (recurrenceType === "weekly") {
      recurrence = { type: "weekly", days: selectedDays };
    } else if (recurrenceType === "monthly") {
      recurrence = { type: "monthly", dates: selectedDates };
    } else {
      recurrence = { type: "daily" };
    }
    const added = addReminder(time, recurrence);
    if (added) {
      setTime("");
      const next = getNextTriggerTime(time, recurrence);
      setNextTrigger(next);
      toast.success(
        `Reminder set! Next reminder will trigger at ${next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${next.toLocaleDateString()}`
      );
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // Handlers for recurrence selection
  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };
  const toggleDate = (date: number) => {
    setSelectedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  // Format time for display
  const formatTimeExample = (hour24: number): string => {
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour24.toString().padStart(2, '0')}:00 = ${hour12}:00 ${ampm}`;
  };

  return (
    <form
      onSubmit={handleAdd}
      className={`flex flex-col gap-6 w-full max-w-sm mx-auto relative ${className ?? ""}`}
      aria-label="Set a window closing reminder"
    >
      <label htmlFor="reminder-time" className="font-medium text-lg text-primary text-center mb-2 drop-shadow-md">
        When do the skeeters attack your vibe?
      </label>
      <input
        id="reminder-time"
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
        required
        className={`w-full text-3xl px-4 py-3 rounded-lg border border-input bg-background/70 text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary transition ${shake ? "animate-shake" : ""}`}
        aria-label="Select time for reminder"
      />
      <div className="flex flex-col gap-2 text-xs text-primary/90 bg-background/40 p-3 rounded-lg shadow-sm text-center">
        <p className="font-medium">Time is in 24-hour format, bestie</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
          <div>{formatTimeExample(9)}</div>
          <div>{formatTimeExample(13)}</div>
          <div>{formatTimeExample(17)}</div>
          <div>{formatTimeExample(21)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-background/40 p-4 rounded-lg shadow-sm">
        <label className="font-medium text-sm text-primary mb-1 drop-shadow-sm">Mosquito defense schedule?</label>
        <RadioGroup
          value={recurrenceType}
          onValueChange={val => setRecurrenceType(val as RecurrenceType)}
          className="flex flex-row gap-4 justify-center"
        >
          <RadioGroupItem value="daily" id="rec-daily" />
          <label htmlFor="rec-daily" className="mr-2 cursor-pointer text-primary/90">Daily grind</label>
          <RadioGroupItem value="weekly" id="rec-weekly" />
          <label htmlFor="rec-weekly" className="mr-2 cursor-pointer text-primary/90">Weekly rotation</label>
          <RadioGroupItem value="monthly" id="rec-monthly" />
          <label htmlFor="rec-monthly" className="cursor-pointer text-primary/90">Monthly vibe</label>
        </RadioGroup>
        {recurrenceType === "weekly" && (
          <div className="flex flex-wrap gap-2 mt-2 justify-center bg-background/30 p-2 rounded-md" aria-label="Select days of week">
            {WEEKDAYS.map((d, i) => (
              <label key={d} className="flex items-center gap-1 cursor-pointer">
                <Checkbox checked={selectedDays.includes(i)} onCheckedChange={() => toggleDay(i)} id={`weekday-${i}`} />
                <span className="text-sm text-primary/90">{d}</span>
              </label>
            ))}
          </div>
        )}
        {recurrenceType === "monthly" && (
          <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto justify-center bg-background/30 p-2 rounded-md" aria-label="Select dates of month">
            {MONTH_DAYS.map(date => (
              <label key={date} className="flex items-center gap-1 cursor-pointer w-10">
                <Checkbox checked={selectedDates.includes(date)} onCheckedChange={() => toggleDate(date)} id={`monthday-${date}`} />
                <span className="text-sm text-primary/90">{date}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <Button
        type="submit"
        className="w-full font-semibold text-base text-lg py-3 shadow-md bg-primary hover:bg-primary/90"
        disabled={!time}
        aria-disabled={!time}
      >
        Schedule Mosquito Blockade
      </Button>
      {/* Error animation */}
      {hasError && errorMessage && (
        <div
          className={`text-red-600 text-sm mt-2 w-full text-center transition-all duration-300 bg-background/40 p-2 rounded-md ${shake ? "animate-shake" : ""}`}
          role="alert"
        >
          {errorMessage}
        </div>
      )}
      {nextTrigger && (
        <div className="text-xs text-green-500 text-center mt-2 font-medium bg-background/40 p-2 rounded-md shadow-sm">
          Next mosquito defense at {nextTrigger.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on {nextTrigger.toLocaleDateString()} ✨
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