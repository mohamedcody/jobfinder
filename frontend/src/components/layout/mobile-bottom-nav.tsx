"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/jobs" },
    { icon: Search, label: "Search", href: "/jobs/search" },
    { icon: Briefcase, label: "ATS", href: "/employer/ats" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  // Do not show the bottom nav on authentication pages or the landing page
  if (
    pathname === "/" || 
    pathname?.startsWith("/login") || 
    pathname?.startsWith("/register")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-[#050914]/90 backdrop-blur-xl border-t border-white/10 pb-6 pt-2 px-2 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/") && item.href !== "/jobs";
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "flex flex-col items-center p-2 min-h-[48px] min-w-[48px] justify-center transition-all",
              isActive 
                ? "text-cyan-400 scale-110" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
