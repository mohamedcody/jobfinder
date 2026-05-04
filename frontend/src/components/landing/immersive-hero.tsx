"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { BarChart3, Zap, ArrowRight, ShieldCheck, ChevronDown, UserCircle2, BriefcaseBusiness, Sparkles, Filter, Clock3, LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { Button } from "@/components/ui/button";

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
  { label: "Search Speed", value: "< 1s", hint: "Instant results" },
];

const workflowSteps = [
  {
    title: "Smart Discovery",
    text: "Find the perfect role by searching by title, location, and tech stack with ease.",
    icon: Filter,
  },
  {
    title: "Instant Comparison",
    text: "Compare salaries, requirements, and company culture in one clear view.",
    icon: BarChart3,
  },
  {
    title: "Apply with Confidence",
    text: "Save your favorite jobs and apply quickly with our secure professional portal.",
    icon: ShieldCheck,
  },
];

const highlightCards = [
  {
    title: "Lightning Search",
    text: "Experience a fast, responsive search that helps you explore opportunities without delay.",
    icon: Zap,
    className: "lg:col-span-1",
  },
  {
    title: "Fresh Opportunities",
    text: "Always see the latest listings with filters for the last 24 hours, week, or month.",
    icon: Clock3,
    className: "lg:col-span-1",
  },
  {
    title: "Secure & Private",
    text: "Your data and job search activity are protected with industry-standard security.",
    icon: ShieldCheck,
    className: "lg:col-span-1",
  },
  {
    title: "Expert Insights",
    text: "Get a clear summary of job requirements and company stats to make better decisions.",
    icon: BarChart3,
    className: "lg:col-span-1",
  },
];

function FloatingParticles() {
  const [particlesValues, setParticlesValues] = useState<{size:number, shape:string, delay:number, duration:number, ay:number, ax:number, l:number, t:number}[]>([]);

  useEffect(() => {
    // Generate static random values once on client to prevent layout thrashing & hydration issues
    const values = Array.from({ length: 12 }).map((_, i) => ({
      size: Math.random() * 4 + 2,
      shape: i % 3 === 0 ? "50%" : i % 3 === 1 ? "0%" : "25%",
      delay: Math.random() * 5,
      duration: Math.random() * 15 + 15, // Slower is smoother
      ay: -Math.random() * 80 - 40,
      ax: Math.random() * 30 - 15,
      l: Math.random() * 100,
      t: Math.random() * 100,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticlesValues(values);
  }, []);

  if (particlesValues.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particlesValues.map((val, i) => (
        <motion.div
          key={i}
          className="absolute border border-cyan-400/10 bg-cyan-400/5 will-change-transform transform-gpu"
          style={{
            width: val.size + "px",
            height: val.size + "px",
            borderRadius: val.shape,
            left: val.l + "%",
            top: val.t + "%",
          }}
          animate={{
            y: [0, val.ay, 0],
            x: [0, val.ax, 0],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: val.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

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
    <motion.div style={{ x: springX, y: springY, rotateX, rotateY }} whileTap={{ scale: 0.96 }} className="relative z-20">
      <Link
        href="/jobs"
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className="group relative inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-extrabold text-white bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all overflow-hidden"
        aria-label="Browse jobs"
      >
        <span className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-400/40 via-violet-500/40 to-cyan-400/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ maskImage: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor" }} />
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative inline-flex items-center gap-2">
          Browse Jobs 🚀
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
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
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/login" className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white text-sm font-semibold transition-all backdrop-blur-md shadow-sm hidden sm:inline-flex">
          Login
        </Link>
        <Link href="/register" className="px-5 py-2.5 rounded-full bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/40 text-cyan-50 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-md">
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
        className="profile-trigger flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
      >
        <span className="profile-avatar w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white">
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
          className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-2 shadow-2xl z-50"
          role="menu"
        >
          <Link href="/jobs" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors" role="menuitem" onClick={() => setIsOpen(false)}>
            Browse jobs
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 rounded-xl transition-colors mt-1"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}

export function ImmersiveHero() {
  return (
    <main className="landing-mesh relative min-h-screen overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#083344]/40 to-[#2e1065]/40 mix-blend-overlay z-[1]" />
      <div className="noise-overlay pointer-events-none absolute inset-0 z-[2]" />
      <FloatingParticles />

      <motion.div
        className="glow-orb glow-orb-violet absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-violet-500/10 rounded-full blur-[100px] z-0 will-change-transform transform-gpu"
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="glow-orb glow-orb-cyan absolute bottom-[10%] right-[10%] w-[25rem] h-[25rem] bg-cyan-400/10 rounded-full blur-[100px] z-0 will-change-transform transform-gpu"
        animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="glow-orb glow-orb-teal absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-teal-500/5 rounded-full blur-[120px] z-0 will-change-transform transform-gpu"
        animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <nav className="relative z-50 flex items-center justify-between px-6 py-6 lg:px-12 backdrop-blur-md bg-[#0f172a]/20 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex-shrink-0" aria-label="JobFinder home">
            <span className="block w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              <BriefcaseBusiness className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
          </Link>
          <Link
            href="/"
            className="hidden sm:inline-block text-lg font-extrabold text-white transition-all"
            style={{ letterSpacing: "-0.02em" }}
          >
            JobFinder{" "}
            <span className="text-[0.65rem] uppercase tracking-widest bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent ml-1 font-extrabold border border-cyan-500/30 px-1.5 py-0.5 rounded-md">
              PRO
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex">
          <a href="#features" className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all">
            Features
          </a>
          <a href="#workflow" className="hover:text-violet-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] transition-all">
            Workflow
          </a>
          <a href="#proof" className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all">
            Proof
          </a>
        </div>

        <AuthActions />
      </nav>

      <section className="relative z-10 flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl items-center text-center">
        <motion.div
          className="mx-auto flex w-full flex-col items-center text-center relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-100 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            <span>Premium SaaS Experience</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="hero-title mt-4 max-w-5xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl lg:text-[5.5rem] bg-gradient-to-br from-white via-cyan-50 to-slate-400 bg-clip-text text-transparent pb-2 px-2"
            style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
          >
            Discover Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 drop-shadow-sm">Dream Tech Role</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-300/90 sm:text-xl mx-auto font-light"
          >
            Enter a premium, lightning-fast job search workspace where refined filters,
            intelligent matching, and crystal-clear workflows help you land the role you deserve.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:gap-4 relative z-20">
            <Button
              variant="primary"
              size="lg"
              className="group"
              asChild
            >
              <Link href="/jobs">
                Browse Jobs <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              asChild
            >
              <Link href="/register">
                Register
              </Link>
            </Button>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-8 text-sm text-slate-400 font-medium">
            No signup required to explore listings. Start free in seconds.
          </motion.p>
        </motion.div>
      </section>

      <section id="proof" className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8 pt-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-3">
          {trustStats.map((stat, i) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative p-7 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div>
                   <p className="text-sm font-bold text-cyan-200 tracking-wider uppercase">{stat.label}</p>
                   <p className="text-xs text-slate-400 mt-1.5">{stat.hint}</p>
                 </div>
                 <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-inner backdrop-blur-sm">
                    {/* Abstract animated micro chart */}
                    <div className="flex items-end gap-1 h-6 w-6 relative top-1">
                      <motion.div animate={{ height: ["40%", "90%", "40%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 bg-cyan-400 rounded-t-sm" />
                      <motion.div animate={{ height: ["70%", "30%", "70%"] }} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 bg-violet-400 rounded-t-sm" />
                      <motion.div animate={{ height: ["30%", "100%", "30%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 bg-cyan-200 rounded-t-sm" />
                    </div>
                 </div>
              </div>
              <p className="text-5xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-slate-200 bg-clip-text text-transparent relative z-10">{stat.value}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 px-4 py-28 sm:px-6 lg:px-8 border-y border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-300 sm:text-5xl tracking-tight pb-2"
            >
              Professional Grade. Ultimate Edge.
            </motion.h2>
            <p className="mt-5 text-lg text-slate-300/80 font-light tracking-wide max-w-2xl mx-auto">Tools engineered for serious job hunters seeking precision, speed, and reliability.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {highlightCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative p-8 rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden hover:border-cyan-400/40 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                >
                  <div className="absolute -top-10 -right-10 p-6 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                     <Icon className="w-64 h-64 text-cyan-400" strokeWidth={1} />
                  </div>
                  <div className="relative z-10 flex items-center gap-5 mb-5">
                     <div className="w-14 h-14 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-400/20 group-hover:border-cyan-400/60 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                        <Icon className="h-7 w-7 text-cyan-300 group-hover:animate-pulse" aria-hidden="true" strokeWidth={1.5} />
                     </div>
                     <h3 className="text-2xl font-bold text-white tracking-wide">{card.title}</h3>
                  </div>
                  <p className="relative z-10 mt-2 text-base leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{card.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="relative z-10 px-4 py-32 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mx-auto w-full max-w-6xl">
          <div className="text-center mb-24">
             <h2 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">How it works</h2>
             <p className="mt-4 text-cyan-100/60 text-lg">Your streamlined path to success.</p>
          </div>

          <div className="relative flex flex-col md:flex-row gap-8 justify-between items-center md:items-stretch pb-10">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent hidden md:block -translate-y-1/2 z-0"></div>
            
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40, rotateX: 20 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.2, duration: 0.7, type: "spring", bounce: 0.4 }}
                  whileHover={{ y: -15, scale: 1.05 }}
                  style={{ perspective: 1000 }}
                  className="relative z-10 flex-1 w-full max-w-sm mx-auto md:max-w-none"
                >
                  <div className="h-full relative p-8 rounded-[2rem] border border-white/20 bg-slate-900/60 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.3)] transition-all duration-300 border-t-white/30">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border-2 border-violet-500 text-violet-300 text-lg font-black w-12 h-12 flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                       {index + 1}
                    </div>
                    <div className="mt-6 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <Icon className="h-10 w-10 text-cyan-300" aria-hidden="true" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                      <p className="text-base leading-relaxed text-slate-300">{step.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.4 }}
            className="mt-20 flex flex-col items-center text-center p-12 relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl mx-auto max-w-4xl"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 opacity-60"></div>
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]"></div>
             <div className="absolute -top-20 -left-20 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]"></div>

            <h3 className="text-3xl font-bold text-white relative z-10 mb-4">Ready to accelerate?</h3>
            <p className="text-lg text-slate-300 relative z-10 max-w-2xl mb-8">
              Join thousands of tech professionals finding better roles faster with our premium filters and clean workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
              <Link href="/jobs" className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:scale-105 transition-all text-lg flex items-center justify-center gap-2">
                Explore Jobs Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        dir="rtl"
      >
         <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300 animate-pulse"></div>
            <div className="relative px-6 py-2.5 bg-slate-900/90 border border-white/20 backdrop-blur-xl rounded-full text-xs font-medium text-cyan-50 shadow-2xl flex items-center gap-2 hover:border-cyan-400/50 transition-colors">
               <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
               <span className="tracking-wide text-[0.7rem]">تم التصميم والتطوير بواسطة</span>
               <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300 text-[0.75rem]">Mohamed Saad Abdallah</span>
            </div>
         </div>
      </motion.div>
    </main>
  );
}
