"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRemindersContext, ReminderRecurrence, RecurrenceType } from "@/hooks/reminders-context";
import { CheckCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export interface ReminderTimePickerProps {
  className?: string;
}

export function ReminderTimePicker({ className }: ReminderTimePickerProps) {
  const [time, setTime] = useState<string>(""); // "HH:mm"
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1,2,3,4,5]); // Default: Mon-Fri
  const [selectedDates, setSelectedDates] = useState<number[]>([1]);
  const { addReminder, hasError, errorMessage } = useRemindersContext();
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
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

  return (
    <form
      onSubmit={handleAdd}
      className={`flex flex-col gap-6 w-full max-w-sm mx-auto relative ${className ?? ""}`}
      aria-label="Set a window closing reminder"
    >
      <label htmlFor="reminder-time" className="font-medium text-lg text-primary text-center mb-2">
        What time do you want to close the window?
      </label>
      <input
        id="reminder-time"
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
        required
        className={`w-full text-3xl px-4 py-3 rounded-lg border border-input bg-background text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary transition ${shake ? "animate-shake" : ""}`}
        aria-label="Select time for reminder"
      />
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm text-primary mb-1">How often?</label>
        <RadioGroup
          value={recurrenceType}
          onValueChange={val => setRecurrenceType(val as RecurrenceType)}
          className="flex flex-row gap-4 justify-center"
        >
          <RadioGroupItem value="daily" id="rec-daily" />
          <label htmlFor="rec-daily" className="mr-2 cursor-pointer">Every day</label>
          <RadioGroupItem value="weekly" id="rec-weekly" />
          <label htmlFor="rec-weekly" className="mr-2 cursor-pointer">On these days</label>
          <RadioGroupItem value="monthly" id="rec-monthly" />
          <label htmlFor="rec-monthly" className="cursor-pointer">On these dates</label>
        </RadioGroup>
        {recurrenceType === "weekly" && (
          <div className="flex flex-wrap gap-2 mt-2 justify-center" aria-label="Select days of week">
            {WEEKDAYS.map((d, i) => (
              <label key={d} className="flex items-center gap-1 cursor-pointer">
                <Checkbox checked={selectedDays.includes(i)} onCheckedChange={() => toggleDay(i)} id={`weekday-${i}`} />
                <span className="text-sm">{d}</span>
              </label>
            ))}
          </div>
        )}
        {recurrenceType === "monthly" && (
          <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto justify-center" aria-label="Select dates of month">
            {MONTH_DAYS.map(date => (
              <label key={date} className="flex items-center gap-1 cursor-pointer w-10">
                <Checkbox checked={selectedDates.includes(date)} onCheckedChange={() => toggleDate(date)} id={`monthday-${date}`} />
                <span className="text-sm">{date}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <Button
        type="submit"
        className="w-full font-semibold text-base text-lg py-3"
        disabled={!time}
        aria-disabled={!time}
      >
        Set Reminder
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