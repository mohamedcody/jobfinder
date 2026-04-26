"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Briefcase, Home, Search, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { icon: Home, label: "Hub", href: "/dashboard" },
  { icon: Briefcase, label: "Jobs", href: "/jobs" },
  { icon: Bookmark, label: "Saved", href: "/saved" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pb-5 pt-2 lg:hidden"
      style={{
        background: "linear-gradient(180deg, rgb(7 9 26 / 85%), rgb(7 9 26 / 95%))",
        backdropFilter: "blur(12px) saturate(1.2)",
        borderTop: "1px solid rgb(255 255 255 / 8%)",
        boxShadow: "0 -16px 40px rgb(2 6 23 / 60%), inset 0 1px 0 rgb(255 255 255 / 6%)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/jobs"
            ? pathname === "/jobs"
            : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("mobile-nav-item", isActive && "active")}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <item.icon
                className={cn(
                  "mb-1 h-5 w-5 transition-all",
                  isActive ? "text-white drop-shadow-[0_0_6px_rgba(139,44,245,0.8)]" : "text-slate-600"
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </motion.div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
