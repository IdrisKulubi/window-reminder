"use client";

import { useEffect, useRef, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ReminderTime } from "@/hooks/reminders-context";
import { toast } from "sonner";

/**
 * Props for FullScreenNotification.
 */
export interface FullScreenNotificationProps {
  open: boolean;
  reminder: ReminderTime | null;
  onDismiss: () => void;
}

/**
 * Full-screen, accessible notification for due reminders.
 * Uses shadcn/ui AlertDialog for accessibility and focus management.
 * Plays a sound and triggers a push notification when opened.
 */
export function FullScreenNotification({ open, reminder, onDismiss }: FullScreenNotificationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const maxPlayCount = 3; // Maximum number of times to play the sound
  const [isOpen, setIsOpen] = useState(open);

  // Sync with the open prop
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    if (open) {
      console.log("[Notification] Showing notification for reminder:", reminder?.id, reminder?.time);
      setPlayCount(0); // Reset play count when notification opens
      
      // Play sound
      if (audioRef.current) {
        const playSound = () => {
          if (audioRef.current && playCount < maxPlayCount) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((err) => {
              console.error("[Notification] Error playing sound:", err);
            });
            setPlayCount(prev => prev + 1);
          }
        };
        
        playSound(); // Play immediately
        const soundInterval = setInterval(playSound, 10000); // Repeat every 10 seconds
        
        return () => clearInterval(soundInterval);
      }
      
      // Push notification
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          console.log("[Notification] Sending browser notification");
          try {
            new Notification("Window Reminder", {
              body: reminder?.time ? `It's ${reminder.time}. Please close your window!` : "Please close your window!",
              icon: "/window.svg"
            });
          } catch (err) {
            console.error("[Notification] Error creating browser notification:", err);
          }
        } else if (Notification.permission === "default") {
          toast.info("Please allow notifications for better reminders", {
            action: {
              label: "Enable",
              onClick: () => Notification.requestPermission(),
            },
          });
        }
      }
    }
  }, [open, reminder, playCount]);

  const handleDismiss = () => {
    console.log("[Notification] User dismissed notification");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Set local state immediately to close the dialog
    setIsOpen(false);
    // Also call the parent's onDismiss
    onDismiss();
  };

  return (
    <>
      <audio ref={audioRef} src="/reminder.mp3" preload="auto" />
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent
          className="fullscreen-notification-overlay"
        >
          {/* Pulsing background effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="animate-pulse-glow rounded-full w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] opacity-40"></div>
          </div>
          {/* Centered content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[95vw] sm:max-w-md bg-background/90 rounded-xl shadow-lg border border-primary/10 p-6">
            <AlertDialogHeader className="flex flex-col items-center gap-4">
              <AlertDialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-destructive text-center drop-shadow-lg animate-fade-in-slide">
                Reminder: Close Your Window!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base sm:text-lg text-center text-primary font-mono mt-2">
                It&apos;s {reminder?.time}. Please make sure your window is closed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col items-center mt-6">
              <AlertDialogAction
                onClick={handleDismiss}
                className="w-full py-4 text-lg font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-4 focus:ring-destructive/50 focus:outline-none transition"
                autoFocus
              >
                I Closed the Window
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 
