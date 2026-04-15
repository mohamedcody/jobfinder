"use client";

import { useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { GLOBAL_API_ERROR_EVENT } from "@/lib/api/global-api-error";

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

  return <Toaster richColors position="top-right" closeButton />;
}

