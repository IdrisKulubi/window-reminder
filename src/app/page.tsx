"use client";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ReminderTimePicker } from "@/components/reminder-time-picker";
import { ReminderList } from "@/components/reminder-list";
import { RemindersProvider } from "@/hooks/reminders-context";
import { useRemindersContext } from "@/hooks/reminders-context";
import { FullScreenNotification } from "@/components/full-screen-notification";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

function ReminderApp() {
  const { currentReminder, dismissCurrentReminder } = useRemindersContext();
  const [testNotification, setTestNotification] = useState<boolean>(false);
  
  // Simulate a test reminder
  const handleTestNotification = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setTestNotification(true);
        toast.info("Test notification shown", {
          description: "This lets you test that sounds and notifications work correctly"
        });
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            toast.success("Notifications enabled! Click the test button again.");
          }
        });
      } else {
        toast.error("Notifications blocked by browser", {
          description: "Please enable notifications in your browser settings to get reminders"
        });
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-lg py-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary text-center">Window Reminder</h1>
        <p className="text-muted-foreground text-center text-base max-w-md">
          Set one or more times to get a full-screen reminder to close your window. Simple, beautiful, and private.
        </p>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleTestNotification}
            title="Test notifications"
            className="relative"
          >
            <BellRing className="h-5 w-5" />
          </Button>
        </div>
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
      
      {/* Full-screen notification when a reminder is triggered */}
      <FullScreenNotification 
        open={currentReminder !== null || testNotification} 
        reminder={currentReminder || (testNotification ? { id: 'test', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), recurrence: { type: 'daily' } } : null)} 
        onDismiss={() => {
          if (testNotification) {
            setTestNotification(false);
          } else {
            dismissCurrentReminder();
          }
        }} 
      />
    </div>
  );
}

export default function Home() {
  return (
    <RemindersProvider>
      <ReminderApp />
    </RemindersProvider>
  );
}

