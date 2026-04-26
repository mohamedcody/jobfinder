"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Briefcase,
  FileText,
  Lightbulb,
  Send,
  Sparkles,
  Star,
  X,
  User,
  ArrowRight
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: Briefcase, label: "Jobs", text: "Suggest jobs based on my skills in React" },
  { icon: FileText, label: "CV tips", text: "Help me write a strong CV summary" },
  { icon: Lightbulb, label: "Skills", text: "What skills should I learn next?" },
  { icon: Star, label: "Interviews", text: "Top 5 interview tips" },
];

const SYSTEM_PROMPT = `You are JobBot, an expert AI career assistant for JobFinder PRO.
Always be encouraging, professional, and concise. Format responses with markdown — bold key terms, use bullet points for lists.`;

async function callGemini(messages: Message[]): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return "⚠️ Gemini API key is not configured.";

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Understood! I'm JobBot." }] },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response received.";
}

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-cyan-400'>$1</strong>");
    if (line.startsWith("* ") || line.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc text-[13px] leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
      );
    }
    return <p key={i} className="text-[13px] leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm **JobBot**. I'm here to help you land your **dream role**. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleTriggerChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { text, autoSend } = customEvent.detail;
      setIsOpen(true);
      if (autoSend) {
        sendMessage(text);
      } else {
        setInput(text);
      }
    };
    window.addEventListener("trigger-ai-chat", handleTriggerChat);
    return () => window.removeEventListener("trigger-ai-chat", handleTriggerChat);
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await callGemini([...messages, userMsg]);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-ai", role: "assistant", content: reply, timestamp: new Date() }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: "err", role: "assistant", content: "❌ Error connecting to AI service.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] md:h-16 md:w-16 border border-white/20"
        aria-label="Toggle AI Assistant"
      >
        <div className="relative">
          <Sparkles className="h-6 w-6 md:h-7 md:w-7" />
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 blur-sm" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="fixed bottom-24 right-4 z-[60] flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#07091a]/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl sm:right-6 sm:w-[400px] md:bottom-28"
            style={{ height: "600px", maxHeight: "80dvh" }}
          >
            {/* Header: Premium Glassmorphism */}
            <div className="relative shrink-0 overflow-hidden px-6 py-5 border-b border-white/5 bg-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/40">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#07091a]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-tight">JobBot Oracle</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Expert Assistant</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center bg-white/5 text-slate-400 hover:text-white transition-all hover:rotate-90">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages: Smooth Flow */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white ${msg.role === "user" ? "bg-indigo-600" : "bg-white/10"}`}>
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`relative px-5 py-3.5 shadow-xl ${msg.role === "user" ? "rounded-2xl rounded-tr-none bg-indigo-600 text-white" : "rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-slate-200"}`}>
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Area */}
            <div className="shrink-0 p-6 bg-white/[0.02] border-t border-white/5">
              {/* Quick Prompts */}
              {messages.length <= 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button 
                      key={p.label} 
                      onClick={() => sendMessage(p.text)} 
                      className="group flex items-center gap-2 bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-all"
                    >
                      <p.icon className="h-3.5 w-3.5" />
                      {p.label}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }} 
                className="relative group"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask JobBot Anything..."
                  className="w-full bg-[#07091a] border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 h-11 w-11 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
              </form>
              <p className="text-center mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Powered by JobFinder Quantum Engine</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
