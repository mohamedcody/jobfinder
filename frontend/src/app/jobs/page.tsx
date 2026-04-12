"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  Rocket, 
  Shield, 
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { JobsNavbar } from "@/components/jobs/jobs-navbar";
import { JobsList } from "@/components/jobs/jobs-list";
import { useAuthSession } from "@/lib/auth/use-auth-session";

export default function JobsPage() {
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4">
        <div className="scale-in dashboard-panel max-w-md rounded-3xl p-10 text-center">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            {/* Animated Glow */}
            <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-violet-500 to-purple-600 opacity-20" />
            
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-2xl shadow-purple-500/40">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="gradient-text text-2xl font-black">Verifying Session</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Redirecting you to the login page securely...
          </p>
          
          {/* Loading Dots */}
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl" />
      </div>

      <JobsNavbar />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Premium Hero Section */}
        <section className="fade-up dashboard-panel mb-10 overflow-hidden rounded-3xl p-8 sm:p-10">
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-64 w-64 opacity-30">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-violet-400 to-purple-600 blur-3xl" />
          </div>

          <div className="relative">
            {/* Status Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-4 py-2 text-sm font-bold text-purple-700 ring-1 ring-purple-500/20">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
              </div>
              Live Opportunities Updated Daily
            </div>

            {/* Hero Content */}
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              {/* Left: Text Content */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-2xl shadow-purple-500/30">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                      Discover Your Next
                      <span className="block gradient-text-rainbow">Dream Role</span>
                    </h1>
                    
                    <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                      Browse through curated job opportunities with intelligent search, 
                      elegant filters, and a lightning-fast experience designed to help you land your ideal position.
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  {[
                    { icon: Zap, label: "Instant Results", color: "from-yellow-500 to-orange-500" },
                    { icon: Shield, label: "Verified Jobs", color: "from-green-500 to-emerald-500" },
                    { icon: TrendingUp, label: "Fresh Postings", color: "from-blue-500 to-cyan-500" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CTA Card */}
              <div className="glass-card space-y-4 rounded-2xl p-6 lg:min-w-[280px]">
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-black text-slate-900">Quick Actions</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">Active Searches</span>
                    <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-1 text-xs font-bold text-white">
                      24/7
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">Match Rate</span>
                    <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
                      98%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">Response Time</span>
                    <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 px-2.5 py-1 text-xs font-bold text-white">
                      &lt;1s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs List */}
        <div className="fade-up" style={{ animationDelay: "0.2s" }}>
          <JobsList />
        </div>
      </main>
    </div>
  );
}
