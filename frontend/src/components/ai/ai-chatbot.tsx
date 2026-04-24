import { useState } from "react";

export default function AiChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating AI Chatbot Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-linear-to-br from-purple-600 to-blue-500 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:scale-105 transition-transform duration-300 focus:outline-none"
        aria-label="Open AI Chatbot"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.037 2 11c0 2.387 1.07 4.55 2.89 6.21-.13.98-.53 2.13-1.36 3.03a.75.75 0 0 0 .82 1.22c1.7-.44 3.13-1.23 4.13-1.85A11.6 11.6 0 0 0 12 21c5.523 0 10-4.037 10-9s-4.477-10-10-10Z"/></svg>
      </button>
      {/* Chatbot Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[90vw] bg-neutral-900 border border-purple-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-2 bg-linear-to-r from-purple-700 to-blue-600 text-white font-semibold">
            <span>AI Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-xl">×</button>
          </div>
          <div className="flex-1 p-4 text-neutral-200 text-sm overflow-y-auto" style={{minHeight: '180px'}}>
            <div className="italic opacity-70">How can I help you today? (This is a UI demo. AI integration coming soon.)</div>
          </div>
          <form className="flex border-t border-neutral-800">
            <input
              type="text"
              className="flex-1 bg-transparent px-3 py-2 text-white focus:outline-none"
              placeholder="Type your question..."
              disabled
            />
            <button type="submit" className="px-4 py-2 text-purple-400 cursor-not-allowed" disabled>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}


