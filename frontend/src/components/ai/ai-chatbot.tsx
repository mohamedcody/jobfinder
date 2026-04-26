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
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    if (line.startsWith("* ") || line.startsWith("- ")) {
      return (
        <li key={i} className="ml-3 list-disc text-sm" dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
      );
    }
    return <p key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm **JobBot**. How can I help you today?",
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
    const handleTriggerChat = (e: CustomEvent) => {
      const { text, autoSend } = e.detail;
      setIsOpen(true);
      if (autoSend) {
        sendMessage(text);
      } else {
        setInput(text);
      }
    };
    window.addEventListener("trigger-ai-chat" as any, handleTriggerChat as any);
    return () => window.removeEventListener("trigger-ai-chat" as any, handleTriggerChat as any);
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
      setMessages((prev) => [...prev, { id: "err", role: "assistant", content: "❌ Error occurred.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow-2xl md:h-16 md:w-16"
        aria-label="Toggle AI Assistant"
      >
        <Sparkles className="h-6 w-6 md:h-7 md:w-7" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-[60] flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900/90 shadow-2xl backdrop-blur-2xl sm:right-6 sm:w-[380px] md:bottom-28"
            style={{ height: "500px", maxHeight: "75dvh" }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between bg-white/5 px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-600/30">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-black text-white">JobBot AI</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-violet-600 text-white" : "bg-white/10 text-slate-200"}`}>
                    {formatMessage(msg.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl px-4 py-3 flex gap-1 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="p-4 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button key={p.label} onClick={() => sendMessage(p.text)} className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs text-slate-300 transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/20">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 h-10 w-10 rounded-xl flex items-center justify-center transition-colors">
                  <Send className="h-4 w-4 text-white" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
