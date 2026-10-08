"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "@/config/env";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
        }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: number;
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
            },
          ) => void;
        };
      };
    };
  }
}

const providers = [
  { label: "Google", provider: "google" },
  { label: "Apple", provider: "apple" },
  { label: "LinkedIn", provider: "linkedin" },
] as const;

const ProviderIcon = ({ provider }: { provider: (typeof providers)[number]["provider"] }) => {
  if (provider === "google") return <span className="text-xl font-black text-[#4285F4]">G</span>;
  if (provider === "apple") return <span className="text-base font-black text-slate-100">A</span>;
  return <span className="text-xs font-black tracking-tight text-white">in</span>;
};

interface AuthSocialLoginProps {
  onGoogleLogin: (idToken: string) => void;
  isGoogleLoading: boolean;
}

const GOOGLE_SCRIPT_ID = "google-identity-services";

export function AuthSocialLogin({
  onGoogleLogin,
  isGoogleLoading,
}: AuthSocialLoginProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleError, setGoogleError] = useState<string | null>(
    env.GOOGLE_CLIENT_ID ? null : "Google Login is not configured.",
  );

  const onGoogleLoginRef = useRef(onGoogleLogin);
  useEffect(() => {
    onGoogleLoginRef.current = onGoogleLogin;
  }, [onGoogleLogin]);

  useEffect(() => {
    if (!env.GOOGLE_CLIENT_ID) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        setGoogleError("Google Login could not be loaded.");
        return;
      }

      if (googleButtonRef.current.hasChildNodes()) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: env.GOOGLE_CLIENT_ID,
        callback: ({ credential }) => {
          if (!credential) {
            return;
          }
          onGoogleLoginRef.current(credential);
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular"
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      if (window.google) {
        initializeGoogle();
      } else {
        existingScript.addEventListener("load", initializeGoogle, { once: true });
        existingScript.addEventListener(
          "error",
          () => setGoogleError("Google Login could not be loaded."),
          { once: true },
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => setGoogleError("Google Login could not be loaded.");
    document.head.appendChild(script);
  }, []);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-[11px] font-black uppercase tracking-[0.42em] text-slate-300">OR</span>
        <div className="h-px flex-1 bg-white/20" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {providers.map(({ label, provider }) => {
          const isGoogle = provider === "google";
          return (
            <div key={label} className="relative w-full group">
              <button
                type="button"
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition-all group-hover:-translate-y-0.5 ${
                  provider === "linkedin"
                    ? "border-sky-400/60 bg-sky-600 text-white group-hover:bg-sky-700"
                    : "border-white/20 bg-slate-900/45 text-slate-100 group-hover:border-cyan-300/40 group-hover:bg-slate-800/55"
                } ${isGoogleLoading && isGoogle ? "pointer-events-none opacity-60" : ""}`}
              >
                <ProviderIcon provider={provider} />
                {label}
              </button>
              
              {isGoogle && (
                <div 
                  ref={googleButtonRef}
                  className="absolute inset-0 z-10 overflow-hidden opacity-[0.01] [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full"
                />
              )}
            </div>
          );
        })}
      </div>
      {isGoogleLoading && (
        <p className="mt-2 text-center text-xs text-slate-400">Signing in with Google...</p>
      )}
      {googleError && (
        <p className="mt-2 text-center text-xs text-rose-300">{googleError}</p>
      )}
    </div>
  );
}
