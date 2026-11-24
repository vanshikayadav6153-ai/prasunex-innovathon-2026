"use client";

import { useEffect } from "react";
import { flushSafeQueue } from "@/lib/offline-queue";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js");
      // New workers do not leave a stale client running. The worker contains no
      // authenticated response cache, so activation is safe.
      if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
    };
    void register();
    const flush = () => void flushSafeQueue();
    window.addEventListener("online", flush);
    flush();
    return () => window.removeEventListener("online", flush);
  }, []);
  return null;
}
