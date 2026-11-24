"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Msg = { from: "bot" | "user"; text: string };

// Edit these answers so they match your real features.
const FAQ: { keys: string[]; answer: string }[] = [
  { keys: ["login", "sign in", "account"], answer: "Click Login at the top right and sign in with your campus email." },
  { keys: ["demo", "tour"], answer: "Click Explore Live Demo to try the platform with sample campus data." },
  { keys: ["grade", "grading", "marks"], answer: "Professors get automated grading with a fair curve and a visible evidence trail." },
  { keys: ["attendance", "performance", "mastery"], answer: "Students see performance, attendance and concept mastery on their dashboard." },
  { keys: ["grievance", "complaint", "privacy", "safe"], answer: "Concerns can be raised through a zero-knowledge grievance flow that protects your identity." },
  { keys: ["hello", "hi", "hey"], answer: "Hi! I'm the CAMPUS-NEXUS assistant. Ask me about login, grades, attendance or the demo." },
];

function getReply(text: string): string {
  const t = text.toLowerCase();
  const hit = FAQ.find((f) => f.keys.some((k) => t.includes(k)));
  return hit ? hit.answer : "I'm not sure about that yet. Try asking about login, grades, attendance or the demo.";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! I'm the CAMPUS-NEXUS assistant. How can I help?" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: getReply(text) }]);
    }, 400);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-96 w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl dark:border-emerald-900 dark:bg-slate-900 sm:w-80">
          <div className="flex items-center justify-between bg-emerald-700 px-4 py-3 text-white">
            <span className="text-sm font-semibold">CAMPUS-NEXUS Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
                <span
                  className={
                    "inline-block max-w-[85%] rounded-xl px-3 py-2 text-sm " +
                    (m.from === "user"
                      ? "bg-amber-400 text-slate-900"
                      : "bg-emerald-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100")
                  }
                >
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 border-t border-emerald-100 p-2 dark:border-slate-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask something..."
              className="flex-1 rounded-lg border border-emerald-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-slate-600"
            />
            <button onClick={send} aria-label="Send" className="rounded-lg bg-emerald-700 p-2 text-white">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-lg hover:scale-105"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}