"use client";
import { useEffect } from "react";

/**
 * Registers the service worker for PWA offline support.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error("Service worker registration failed:", err);
        });
    }
  }, []);
  return null;
} 