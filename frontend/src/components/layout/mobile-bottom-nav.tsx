"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface MobileBottomNavProps {
  items: NavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Hide on auth pages
  if (
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-[#07091a] via-[#07091a]/95 to-transparent backdrop-blur-lg">
      <div className="flex items-center justify-around bg-[#0a0c24]/80 border border-white/5 rounded-[2rem] p-2 shadow-2xl">
        {items.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname?.startsWith(item.href);
            
          return (
            <Link key={item.href} href={item.href} className="relative p-3 group">
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-violet-600/20 rounded-2xl border border-violet-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "h-5 w-5 transition-colors relative z-10",
                isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
