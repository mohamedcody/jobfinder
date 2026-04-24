import { Eye, CheckCircle, Bell, TrendingUp } from "lucide-react";

export function ActivityFeed() {
  return (
    <aside className="flex w-[85vw] sm:w-80 shrink-0 snap-center flex-col gap-6 p-6 border-l border-white/10 bg-[#050914]/80 backdrop-blur-xl h-[100dvh] sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Live Activity</h3>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
          <Bell className="h-5 w-5 text-slate-300" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-linear-to-br from-cyan-900/30 to-violet-900/30 border border-white/5 shadow-inner">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Profile Strength</h4>
        </div>
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-linear-to-r from-violet-500 to-cyan-400 w-[85%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
        </div>
        <p className="text-xs text-slate-400 mt-2">You are in the top 15% of candidates for React roles.</p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Events</h4>
        {[
          { icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", title: "Profile Viewed", time: "2m ago", desc: "A recruiter from Google viewed your profile." },
          { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", title: "Application Seen", time: "1h ago", desc: "Your application for Senior Frontend Dev was reviewed." },
          { icon: Eye, color: "text-violet-400", bg: "bg-violet-500/10", title: "Profile Viewed", time: "3h ago", desc: "A startup founder checked your GitHub portfolio." },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
            <div className={`p-2 rounded-lg ${item.bg} mt-1 shadow-inner`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
