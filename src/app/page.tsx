"use client";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ReminderTimePicker } from "@/components/reminder-time-picker";
import { ReminderList } from "@/components/reminder-list";
import { useReminders } from "@/hooks/use-reminders";
import { useReminderTimer } from "@/hooks/use-reminder-timer";
import { FullScreenNotification } from "@/components/full-screen-notification";

export default function Home() {
  const { reminders } = useReminders();
  const { dueReminder, dismissReminder } = useReminderTimer(reminders);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <FullScreenNotification
        open={!!dueReminder}
        reminder={dueReminder}
        onDismiss={dismissReminder}
      />
      <div className="flex flex-col items-center gap-4 w-full max-w-lg py-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary text-center">Window Reminder</h1>
        <p className="text-muted-foreground text-center text-base max-w-md">
          Set one or more times to get a full-screen reminder to close your window. Simple, beautiful, and private.
        </p>
        <ModeToggle />
      </div>
      <div className="w-full max-w-lg flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-semibold text-center text-primary mb-2">What time do you want to close the window?</h2>
          <ReminderTimePicker />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-medium text-primary mb-1">Your Reminders</h3>
          <ReminderList />
        </div>
      </div>
    </div>
  );
}

