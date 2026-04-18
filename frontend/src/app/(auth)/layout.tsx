"use client";

import type { ReactNode } from "react";
import { AuthMobileIntro } from "@/components/auth/auth-mobile-intro";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function AuthParticles() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const particles = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-cyan-400/20 blur-[1px]"
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
          }}
          animate={{
            y: [0, -Math.random() * 120 - 60, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-10 bg-[#050914] overflow-hidden">
      {/* Dynamic Mesh Gradient Background */}
      <div className="absolute inset-0 z-[1] mix-blend-screen">
        <motion.div
          className="absolute top-0 left-[10%] w-[50rem] h-[50rem] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[10%] w-[40rem] h-[40rem] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none"
          animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute inset-0 z-[2] opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.4) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
      <AuthParticles />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-stretch gap-8 lg:flex-row lg:gap-12">
        <div className="w-full lg:hidden">
          <AuthMobileIntro />
        </div>

        <div className="hidden w-full lg:block lg:flex-1">
          <AuthShowcase />
        </div>
        <div className="flex w-full items-center justify-center lg:flex-1">{children}</div>
      </div>
    </main>
  );
}
