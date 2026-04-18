"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  Clock3,
  Filter,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useAuthSession } from "@/lib/auth/use-auth-session";

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: "blur(14px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: "easeOut",
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const trustStats = [
  { label: "Live Jobs Indexed", value: "12,480+", hint: "Updated every hour" },
  { label: "Average Match Quality", value: "98%", hint: "AI-assisted ranking" },
  { label: "Search Response Time", value: "< 1s", hint: "Optimized API pipeline" },
];

const workflowSteps = [
  {
    title: "Smart Discovery",
    text: "Search by role, location, and stack with precision filters that surface what actually matters.",
    icon: Filter,
  },
  {
    title: "Instant Evaluation",
    text: "Compare salary ranges, posting freshness, and company fit in one clean visual workflow.",
    icon: BarChart3,
  },
  {
    title: "Confident Application",
    text: "Move from shortlist to application quickly with secure access and seamless session flow.",
    icon: ShieldCheck,
  },
];

const highlightCards = [
  {
    title: "Lightning Search",
    text: "Debounced query UX, race-safe requests, and fast render paths for smooth exploration.",
    icon: Zap,
    className: "lg:col-span-2",
  },
  {
    title: "Freshness Filters",
    text: "Filter by published date: 24h, week, month, and custom windows without backend spam.",
    icon: Clock3,
    className: "lg:col-span-1",
  },
  {
    title: "Pro-Grade Security",
    text: "JWT session handling with robust auth states and predictable fallback UX for edge cases.",
    icon: ShieldCheck,
    className: "lg:col-span-1",
  },
  {
    title: "Actionable Insights",
    text: "Visual summaries, quality cues, and clearer listing metadata for better decision speed.",
    icon: BarChart3,
    className: "lg:col-span-2",
  },
];

function MagneticCta() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 210, damping: 20, mass: 0.25 });
  const springY = useSpring(mouseY, { stiffness: 210, damping: 20, mass: 0.25 });

  const rotateX = useTransform(springY, [-24, 24], [8, -8]);
  const rotateY = useTransform(springX, [-24, 24], [-8, 8]);

  const handleMove = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    mouseX.set(x * 0.16);
    mouseY.set(y * 0.16);
  };

  const reset = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div style={{ x: springX, y: springY, rotateX, rotateY }} whileTap={{ scale: 0.96 }}>
      <Link
        href="/jobs"
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className="magnetic-cta group relative inline-flex items-center gap-2 rounded-2xl px-9 py-4 text-base font-extrabold text-white"
        aria-label="Browse jobs"
      >
        <span className="absolute inset-0 rounded-2xl border border-white/35 opacity-60 transition group-hover:opacity-100" />
        <span className="relative inline-flex items-center gap-2">
          Browse Jobs 🚀
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </motion.div>
  );
}

function AuthActions() {
  const { isAuthenticated, isSessionReady, logout } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const label = useMemo(() => {
    if (!isSessionReady) {
      return "Checking";
    }

    return isAuthenticated ? "Authenticated" : "Guest";
  }, [isAuthenticated, isSessionReady]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="user-chip" aria-live="polite">
          {label}
        </span>
        <Link href="/login" className="nav-ghost-btn">
          Login
        </Link>
        <Link href="/register" className="nav-ghost-btn hidden sm:inline-flex">
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="profile-trigger"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
      >
        <span className="profile-avatar">
              <UserCircle2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="hidden text-xs font-semibold text-slate-200 sm:inline">{label}</span>
        <ChevronDown className="h-4 w-4 text-slate-300" aria-hidden="true" />
      </button>

      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="profile-dropdown"
          role="menu"
        >
          <Link href="/jobs" className="profile-dropdown-item" role="menuitem" onClick={() => setIsOpen(false)}>
            Browse jobs
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="profile-dropdown-item text-rose-200"
            role="menuitem"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Logout
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}

export function ImmersiveHero() {
  return (
    <main className="landing-mesh relative min-h-screen overflow-hidden">
      <div className="noise-overlay pointer-events-none absolute inset-0 z-[1]" />

      <motion.div
        className="glow-orb glow-orb-violet"
        animate={{ x: [0, 60, 0], y: [0, -45, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 16, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="glow-orb glow-orb-cyan"
        animate={{ x: [0, -70, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="glow-orb glow-orb-teal"
        animate={{ x: [0, -40, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      <header className="fixed inset-x-0 top-0 z-30 px-4 py-4 sm:px-7">
        <nav className="glass-top-nav mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
          <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="JobFinder home">
            <span className="brand-icon-wrap">
              <BriefcaseBusiness className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-sm font-black tracking-tight text-white sm:text-base">
              JobFinder <span className="brand-pro">PRO</span>
            </span>
          </Link>

          <div className="hidden items-center gap-5 text-xs font-semibold text-slate-300 lg:flex">
            <a href="#features" className="nav-inline-link">
              Features
            </a>
            <a href="#workflow" className="nav-inline-link">
              Workflow
            </a>
            <a href="#proof" className="nav-inline-link">
              Proof
            </a>
          </div>

          <AuthActions />
        </nav>
      </header>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 pt-28 pb-12 sm:px-8 lg:px-10">
        <motion.div
          className="mx-auto flex w-full max-w-6xl flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={itemVariants} className="hero-chip">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
            Immersive Hiring Experience
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="hero-title mt-7 max-w-5xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl"
          >
            Discover Your Dream Tech Role
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-7 max-w-3xl text-base leading-7 text-slate-200/90 sm:text-lg"
          >
            Enter a premium, lightning-fast job search workspace where refined filters,
            intelligent matching, and crystal-clear workflows help you land the role you deserve.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <MagneticCta />

            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link href="/login" className="hero-ghost-btn">
                Login
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link href="/register" className="hero-ghost-btn hero-ghost-alt">
                Register
              </Link>
            </motion.div>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-5 text-sm text-slate-300/90">
            No signup required to explore listings. Start free in seconds.
          </motion.p>
        </motion.div>
      </section>

      <section id="proof" className="relative z-10 px-5 pb-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-3">
          {trustStats.map((stat) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="trust-tile"
            >
              <p className="trust-value">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{stat.label}</p>
              <p className="mt-1 text-xs text-slate-300">{stat.hint}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            className="section-title"
          >
            Built for serious job hunters and modern hiring teams.
          </motion.h2>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {highlightCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.98, y: 14, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`bento-tile ${card.className}`}
                >
                  <div className="bento-icon-wrap">
                    <Icon className="h-4 w-4 text-cyan-100" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="relative z-10 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="section-title">How it works in 3 clean steps.</h2>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
                  className="workflow-tile"
                >
                  <span className="workflow-index">0{index + 1}</span>
                  <div className="workflow-icon-wrap">
                    <Icon className="h-4 w-4 text-violet-100" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{step.text}</p>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.4 }}
            className="closing-cta mt-8"
          >
            <p className="text-sm text-slate-200 sm:text-base">
              Ready to move faster? Start exploring roles with premium filters and cleaner decision flow.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/jobs" className="cta-inline-primary">
                Explore Jobs
              </Link>
              <Link href="/register" className="cta-inline-secondary">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
        className="credit-glass-bar"
        dir="rtl"
      >
        تم تطوير هذا موقع بواسطة mohamed saad abdallah
      </motion.div>
    </main>
  );
}


