"use client";

import type { ReactNode } from "react";
import { AuthMobileIntro } from "@/components/auth/auth-mobile-intro";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { useEffect, useState } from "react";

function AuthParticles() {
  const [particlesValues, setParticlesValues] = useState<{w:number,h:number,l:number,t:number,ay:number,ax:number,d:number}[]>([]);

  useEffect(() => {
    // Generate static values to prevent layout thrashing and pure React recalculations
    const values = Array.from({ length: 30 }).map(() => ({
      w: Math.random() * 4 + 2,
      h: Math.random() * 4 + 2,
      l: Math.random() * 100,
      t: Math.random() * 100,
      ay: -Math.random() * 80 - 40,
      ax: Math.random() * 30 - 15,
      d: Math.random() * 10 + 10,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticlesValues(values);
  }, []);

  if (particlesValues.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particlesValues.map((val, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-400/20 blur-[1px] "
          style={{
            width: val.w + "px",
            height: val.h + "px",
            left: val.l + "%",
            top: val.t + "%",
            animation: `float-particle-${i} ${val.d}s infinite linear`
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: particlesValues.map((val, i) => `
        @keyframes float-particle-${i} {
          0% { transform: translate(0px, 0px); opacity: 0.1; }
          50% { transform: translate(${val.ax}px, ${val.ay}px); opacity: 0.6; }
          100% { transform: translate(0px, 0px); opacity: 0.1; }
        }
      `).join('\n')}} />
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center px-4 py-6 sm:px-6 sm:py-10 bg-[#050914] overflow-hidden">
      {/* Dynamic Mesh Gradient Background - Simplified */}
      <div className="absolute inset-0 z-[1] mix-blend-screen hidden lg:block pointer-events-none">
        <div className="absolute top-0 left-[10%] w-[50rem] h-[50rem] bg-violet-600/10 rounded-full blur-[100px] will-change-transform transform-gpu animate-slow-pan" />
        <div className="absolute bottom-[10%] right-[10%] w-[40rem] h-[40rem] bg-cyan-500/10 rounded-full blur-[100px] will-change-transform transform-gpu animate-slow-pan-reverse" />
      </div>

      <div className="absolute inset-0 z-[2] opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.4) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
      <AuthParticles />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-stretch gap-6 lg:flex-row lg:gap-12">
        <div className="w-full lg:hidden flex-none">
          <AuthMobileIntro />
        </div>

        <div className="hidden w-full lg:block lg:flex-1">
          <AuthShowcase />
        </div>
        <div className="flex w-full items-start lg:items-center justify-center lg:flex-1">{children}</div>
      </div>
    </main>
  );
}
