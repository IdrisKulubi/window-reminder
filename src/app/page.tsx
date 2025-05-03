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
import { BellRing, Bug } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent relative z-10">
      {/* Header with title */}
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl px-4 py-8 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg mb-8 mt-6">
        <div className="flex items-center gap-3">
          <Bug className="h-8 w-8 text-destructive animate-bounce" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary text-center drop-shadow-md">No Skeeters Allowed</h1>
          <Bug className="h-8 w-8 text-destructive animate-bounce" />
        </div>
        <p className="text-primary/90 text-center text-base max-w-md px-4 drop-shadow-sm">
          Set reminders to close your windows because those blood-sucking demons don&apos;t pay rent. 
          <span className="block mt-1 text-xs">✨ slay the mosquitoes, not your vibe ✨</span>
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

      {/* Main content - centered with larger max width */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 px-4 mb-8 z-10">
        {/* Time picker section - takes full width on mobile, half on desktop */}
        <div className="flex-1 flex flex-col items-center bg-background/30 backdrop-blur-md p-6 rounded-xl shadow-lg min-h-[400px] justify-center">
          <h2 className="text-xl font-semibold text-center text-primary mb-6 drop-shadow-md">When to yeet that window shut?</h2>
          <ReminderTimePicker className="w-full max-w-sm" />
        </div>
        
        {/* Reminders list section - takes full width on mobile, half on desktop */}
        <div className="flex-1 flex flex-col items-center bg-background/30 backdrop-blur-md p-6 rounded-xl shadow-lg min-h-[400px]">
          <h3 className="text-xl font-semibold text-primary mb-4 drop-shadow-md">Your Anti-Mosquito Schedule</h3>
          <ReminderList className="w-full" />
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

