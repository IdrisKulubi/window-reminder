"use client";

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ReminderTime } from "@/hooks/use-reminders";

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
 */
export function FullScreenNotification({ open, reminder, onDismiss }: FullScreenNotificationProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm min-h-screen w-full p-0">
        <AlertDialogHeader className="w-full flex flex-col items-center gap-4">
          <AlertDialogTitle className="text-3xl md:text-5xl font-bold text-destructive text-center drop-shadow-lg">
            Reminder: Close Your Window!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg md:text-2xl text-center text-primary font-mono">
            It's {reminder?.time}. Please make sure your window is closed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full flex flex-col items-center mt-8">
          <AlertDialogAction
            onClick={onDismiss}
            className="w-full max-w-xs py-4 text-xl font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-4 focus:ring-destructive/50 focus:outline-none transition"
            autoFocus
          >
            I Closed the Window
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 