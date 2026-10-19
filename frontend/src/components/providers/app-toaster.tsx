"use client";

import { useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { GLOBAL_API_ERROR_EVENT } from "@/api/global-api-error";

export function AppToaster() {
  const lastToastAtRef = useRef(0);

  useEffect(() => {
    const onGlobalApiError = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const now = Date.now();

      // Prevent toast storms when multiple requests fail together.
      if (now - lastToastAtRef.current < 3000) {
        return;
      }

      lastToastAtRef.current = now;
      const message = customEvent.detail?.message || "Something went wrong while contacting the server.";
      toast.error(message);
    };

    window.addEventListener(GLOBAL_API_ERROR_EVENT, onGlobalApiError);

    return () => {
      window.removeEventListener(GLOBAL_API_ERROR_EVENT, onGlobalApiError);
    };
  }, []);

  return (
    <Toaster
      theme="dark"
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group border border-border bg-[#0c0f24]/95 text-foreground backdrop-blur-xl shadow-modal rounded-2xl p-4 text-xs sm:text-sm font-sans",
          title: "font-bold text-white text-xs sm:text-sm",
          description: "text-foreground-muted text-xs mt-0.5",
          actionButton:
            "bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold px-3 py-1.5 transition-colors cursor-pointer",
          cancelButton:
            "bg-surface-elevated hover:bg-surface-hover text-foreground-muted rounded-xl text-xs font-medium px-3 py-1.5 transition-colors cursor-pointer",
          closeButton:
            "border-border bg-surface-elevated hover:bg-surface-hover text-foreground-muted hover:text-foreground rounded-lg transition-colors cursor-pointer",
        },
      }}
    />
  );
}

