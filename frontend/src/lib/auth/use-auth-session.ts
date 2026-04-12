"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AUTH_SESSION_EVENT,
  clearToken,
  getToken,
  hasValidToken,
  saveToken,
  TOKEN_KEY,
} from "@/lib/auth/token-storage";

export const useAuthSession = () => {
  const [token, setToken] = useState<string | null>(() =>
    hasValidToken() ? getToken() : null,
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY) {
        setToken(event.newValue);
      }
    };

    const syncToken = () => {
      setToken(hasValidToken() ? getToken() : null);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_SESSION_EVENT, syncToken);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_SESSION_EVENT, syncToken);
    };
  }, []);

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
    isAuthenticated,
    login,
    logout,
  };
};
