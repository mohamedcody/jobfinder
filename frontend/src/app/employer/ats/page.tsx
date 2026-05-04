"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Search, Mail, Calendar, MessageSquare, ChevronDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

const initialColumns = [
  { id: "sourced", title: "Sourced", count: 12, color: "bg-slate-500" },
  { id: "screening", title: "Screening", count: 8, color: "bg-cyan-500" },
  { id: "interview", title: "Interviewing", count: 3, color: "bg-violet-500" },
  { id: "offered", title: "Offered", count: 1, color: "bg-green-500" },
];

const mockCandidates = [
  { id: 1, name: "Sarah Jenkins", role: "Senior Frontend Eng", match: "98%", status: "interview", avatar: "SJ" },
  { id: 2, name: "Ahmed Hassan", role: "React Developer", match: "92%", status: "screening", avatar: "AH" },
  { id: 3, name: "David Chen", role: "UI/UX Designer", match: "85%", status: "sourced", avatar: "DC" },
  { id: 4, name: "Elena Rodriguez", role: "Frontend Lead", match: "95%", status: "offered", avatar: "ER" },
];

export default function EmployerATSPage() {
  const [activeTab, setActiveTab] = useState("pipeline");

  return (
    <div className="min-h-[100dvh] text-white p-4 md:p-8 relative">
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="min-w-fit w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex flex-wrap items-center gap-2 leading-tight">
              Frontend Developer <span className="text-slate-400 font-medium text-lg sm:text-xl ms-1">#REQ-204</span>
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-400 mt-1">San Francisco, CA (Remote) • Posted 4 days ago</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button variant="default" className="w-full sm:w-auto py-3 sm:py-2">Share Job</Button>
            <Button variant="primary" className="w-full sm:w-auto py-3 sm:py-2">Edit Posting</Button>
          </div>
        </header>

        {/* Analytics Summary */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 custom-scrollbar snap-x">
          {[
            { label: "Total Views", value: "2,451", trend: "+12%" },
            { label: "AI Matches Found", value: "34", trend: "+5%" },
            { label: "Applications", value: "128", trend: "-2%" },
            { label: "Time to Hire", value: "14 days", trend: "Fast" },
          ].map((stat, i) => (
            <GlassPanel key={i} padding="sm" className="min-w-[200px] md:min-w-0 snap-start shrink-0 focus-within:ring-2 focus-within:ring-cyan-500">
              <h4 className="text-sm text-slate-400 font-medium">{stat.label}</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md">{stat.trend}</span>
              </div>
            </GlassPanel>
          ))}
        </div>

        {/* ATS Board */}
        <GlassPanel padding="none" className="rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[600px]">
          
          {/* Board Header / Controls */}
          <div className="p-4 border-b border-white/10 bg-black/20 overflow-x-auto custom-scrollbar">
            <div className="flex justify-between items-center gap-8 min-w-max">
              
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 shrink-0" role="tablist">
                {["pipeline", "list", "ai-insights"].map((tab) => (
                  <button 
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${activeTab === tab ? "bg-white/10 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                  >
                    {tab.replace("-", " ")}
                  </button>
                ))}
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                  <input 
                    type="text" 
                    placeholder="Search candidates..." 
                    aria-label="Search candidates"
                    dir="auto"
                    className="ps-9 pe-4 py-1.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500 text-white w-64 transition-all"
                  />
                </div>
                <Button variant="ghost" size="sm" className="gap-2 border-white/20 text-slate-300 hover:text-white hover:border-white/40">
                  Filter <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

            </div>
          </div>

          {/* Kanban Board / List View */}
          <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* Mobile Column Selector (Visible only on mobile/tablet) */}
            <div className="lg:hidden p-4 border-b border-white/5 flex gap-2 overflow-x-auto custom-scrollbar bg-black/10">
              {initialColumns.map(col => (
                <button
                  key={col.id}
                  onClick={() => setActiveTab(col.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    activeTab === col.id 
                    ? `bg-white/10 text-white ${col.color.replace("bg-", "border-")}` 
                    : "bg-white/5 text-slate-500 border-transparent"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${col.color}`} />
                  {col.title}
                  <span className="opacity-60">{col.count}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-x-auto p-4 lg:p-6 flex lg:gap-6 custom-scrollbar snap-x snap-mandatory pb-24 lg:pb-6">
              {initialColumns.map(col => {
                const columnCandidates = mockCandidates.filter(c => c.status === col.id);
                // On mobile, only show the active stage
                const isVisibleOnMobile = activeTab === "pipeline" || activeTab === col.id;
                
                return (
                  <div 
                    key={col.id} 
                    className={`w-full lg:w-[320px] shrink-0 flex flex-col gap-4 snap-center transition-opacity duration-300 ${
                      !isVisibleOnMobile ? "hidden lg:flex" : "flex"
                    }`}
                  >
                    <div className="flex items-center justify-between hidden lg:flex">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} aria-hidden="true" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{col.title}</h3>
                        <span className="text-xs font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full" aria-label={`${columnCandidates.length} candidates`}>{columnCandidates.length}</span>
                      </div>
                      <button 
                        aria-label={`Column options for ${col.title}`}
                        title={`Column options for ${col.title}`}
                        className="text-slate-400 hover:text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar lg:pe-2 pb-4">
                      {columnCandidates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                          <p className="text-sm text-slate-500 font-medium">No candidates yet</p>
                        </div>
                      ) : (
                        columnCandidates.map(candidate => (
                          <div 
                            key={candidate.id} 
                            role="article"
                            tabIndex={0}
                            aria-label={`Candidate ${candidate.name}, ${candidate.role}`}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-grab hover:bg-white/10 hover:border-white/20 transition-all group hover:-translate-y-0.5 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 relative"
                          >
                            {/* Card Content ... */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-sm font-bold text-white" aria-hidden="true">
                                  {candidate.avatar}
                                </div>
                                <div className="min-w-0 pr-6">
                                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{candidate.name}</h4>
                                  <p className="text-xs text-slate-300 truncate">{candidate.role}</p>
                                </div>
                              </div>
                              <button aria-label="Candidate options" className="text-slate-500 hover:text-slate-300 absolute right-4 top-4">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                              <div className="flex items-center gap-1">
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Mail className="h-3.5 w-3.5" /></button>
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><MessageSquare className="h-3.5 w-3.5" /></button>
                              </div>
                              <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                                {candidate.match} Match
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                      <button className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-white hover:bg-white/5 rounded-xl border border-dashed border-white/10 transition-colors shrink-0 mt-2">
                        <Plus className="h-3.5 w-3.5" /> Add Candidate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassPanel>
        
      </div>
    </div>
  );
}
