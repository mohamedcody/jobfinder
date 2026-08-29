"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hasValidToken, clearToken } from "@/lib/auth/token-storage";
import { AUTH_EXPIRED_EVENT } from "@/lib/api/create-api-client";
import { Sparkles } from "lucide-react";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/saved", "/settings", "/jobs"];
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentPath = pathname || "/";
      const isProtected = PROTECTED_ROUTES.some((route) => currentPath.startsWith(route));
      const isPublicOnly = PUBLIC_ROUTES.some((route) => currentPath.startsWith(route));
      
      let valid = false;
      try {
        valid = hasValidToken();
      } catch (e) {
        console.warn("Storage access denied or error:", e);
      }

      if (isProtected && !valid) {
        // Redirect to login if trying to access protected route without auth
        const callbackUrl = encodeURIComponent(currentPath);
        router.replace(`/login?callbackUrl=${callbackUrl}`);
      } else if (isPublicOnly && valid) {
        // Redirect to dashboard if trying to access login/register while authenticated
        router.replace("/dashboard");
      } else {
        // Authorized to view this page
        setIsAuthorized(true);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Global listener for 401/403 errors triggered by API requests
  useEffect(() => {
    const handleAuthExpired = () => {
      try {
        clearToken();
      } catch(e) {}
      const currentPath = window.location.pathname || "/";
      if (PROTECTED_ROUTES.some((route) => currentPath.startsWith(route))) {
        router.replace(`/login?callbackUrl=${encodeURIComponent(currentPath)}&expired=true`);
      }
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [router]);

  const currentPath = pathname || "/";
  if (isChecking || (!isAuthorized && PROTECTED_ROUTES.some(r => currentPath.startsWith(r)))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07091a]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/20 animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
