"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AUTH_SESSION_EVENT,
  clearToken,
  getToken,
  hasValidToken,
  saveToken,
  TOKEN_KEY,
} from "@/lib/auth/token-storage";

export const useAuthSession = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const isMountedRef = useRef(true);

  const syncToken = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    setToken(hasValidToken() ? getToken() : null);
    setIsSessionReady(true);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === null) {
        syncToken();
      }
    };

    queueMicrotask(syncToken);

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_SESSION_EVENT, syncToken);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_SESSION_EVENT, syncToken);
    };
  }, [syncToken]);

  const login = useCallback((newToken: string) => {
    saveToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  return {
    token,
    isSessionReady,
    isAuthenticated,
    login,
    logout,
  };
};
