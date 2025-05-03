"use client";

import { useEffect, useRef, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ReminderTime } from "@/hooks/reminders-context";
import { toast } from "sonner";
import { Bug } from "lucide-react";

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
            new Notification("Mosquito Alert! 🦟", {
              body: reminder?.time ? `It's ${reminder.time}. Close that window or prepare for battle!` : "The mosquitoes are coming! Close your window!",
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
          className="absolute inset-0 w-screen h-screen m-0 p-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-fuchsia-900/95 backdrop-blur-lg"
        >
          {/* Animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated bugs flying around */}
            <Bug className="absolute text-red-400/50 w-8 h-8 left-[10%] top-[20%] animate-float-1" />
            <Bug className="absolute text-red-400/50 w-10 h-10 right-[15%] top-[15%] animate-float-2" />
            <Bug className="absolute text-red-400/50 w-6 h-6 left-[20%] bottom-[20%] animate-float-3" />
            <Bug className="absolute text-red-400/50 w-12 h-12 right-[25%] bottom-[25%] animate-float-4" />
            
            {/* Pulsing glow behind content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] rounded-full bg-red-600/20 animate-pulse-glow"></div>
          </div>
          
          {/* Main content container - Re-enforcing centering */}
          <div className="relative z-10 flex flex-col items-center w-[95vw] max-w-2xl mx-auto bg-background/80 backdrop-blur-md rounded-2xl shadow-2xl border border-destructive/20 p-6 sm:p-8 animate-pop-in">
            {/* Header - Centered within the container */}
            <AlertDialogHeader className="w-full flex flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-4">
                <Bug className="h-12 w-12 text-destructive animate-bounce" />
                <AlertDialogTitle className="text-4xl sm:text-5xl font-extrabold text-destructive drop-shadow-lg animate-fade-in-slide">
                  MOSQUITO INVASION
                </AlertDialogTitle>
                <Bug className="h-12 w-12 text-destructive animate-bounce" />
              </div>
              
              <AlertDialogDescription className="w-full text-xl sm:text-2xl text-primary font-mono mt-2 font-semibold leading-relaxed">
                It&apos;s {reminder?.time} and those blood-thirsty skeeters 🦟 are about to crash your vibe! Close your window ASAP! 🚪💨
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {/* Footer - Centered within the container */}
            <AlertDialogFooter className="flex flex-col items-center mt-8 w-full">
              <AlertDialogAction
                onClick={handleDismiss}
                className="w-full sm:w-2/3 py-6 text-2xl font-bold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-4 focus:ring-destructive/50 focus:outline-none transition shadow-lg animate-pulse"
                autoFocus
              >
                Window Yeeted Shut 🙌
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 
