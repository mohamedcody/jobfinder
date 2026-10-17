"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

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

  const getMobileLabel = (label: string) => {
    switch (label.toLowerCase()) {
      case "dashboard":
        return "Home";
      case "explore jobs":
        return "Jobs";
      case "saved matches":
        return "Saved";
      case "cv parser":
        return "CV AI";
      case "my profile":
        return "Profile";
      case "recruiter ats":
        return "Recruiter";
      case "settings":
        return "Settings";
      default:
        return label;
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-5 pt-2 bg-gradient-to-t from-[#080913] via-[#080913]/95 to-transparent backdrop-blur-lg"
    >
      <div className="flex items-center justify-around bg-[#0c0e22]/95 border border-white/[0.08] rounded-2xl p-1.5 shadow-2xl">
        {items.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname?.startsWith(item.href);
            
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-xl group transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-violet-600/20 rounded-xl border border-violet-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors relative z-10",
                  isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight mt-1 relative z-10 truncate max-w-full",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}
              >
                {getMobileLabel(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
