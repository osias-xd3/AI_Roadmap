"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User as UserIcon, Sparkles, ShieldAlert, RotateCcw } from "lucide-react";
import { ChatMessage } from "../lib/types";
import { sendChatMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePhaseTitle?: string;
}

const STARTER_PROMPTS = [
  "How do I implement Linear Regression from scratch in NumPy?",
  "Explain backpropagation intuitive calculus from Phase 4",
  "Recommend the first paper I should read for Phase 5",
  "How should I structure my GitHub repo for the Phase projects?",
];

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  activePhaseTitle,
}) => {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Roadmap Tutor and technical mentor. I am strictly scoped to assist you with the 12 roadmap phases, machine learning math, algorithms from scratch in NumPy, code implementations, and computer science concepts. What topic or phase can I help you conquer today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Please sign in with Google to chat with the AI Tutor.",
          },
        ]);
        setLoading(false);
        return;
      }

      const res = await sendChatMessage(token, updatedMessages, activePhaseTitle);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Tutor Notice: ${err.message || "Failed to reach the AI Tutor service. Please verify your connection."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat reset! Ask me anything about Python tooling, ML math, transformers, LLMs, or your GitHub projects.",
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">AI Roadmap Tutor</h2>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Gemini 2.5
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activePhaseTitle ? `Context: ${activePhaseTitle}` : "Phases 0–11 Technical Mentor"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Strict Scope Guardrail Banner */}
          <div className="px-4 py-2 bg-blue-950/30 border-b border-blue-900/30 flex items-center gap-2 text-[11px] text-blue-300">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-blue-400" />
            <span>Strictly guarded to AI, ML, Data Science, Coding, and Roadmap queries.</span>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role !== "user" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/10"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
                <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>Thinking through code and math...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/80">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {STARTER_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(promptText)}
                  disabled={loading}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-850 hover:border-blue-500/40 border border-slate-800 text-slate-300 text-[11px] transition"
                >
                  <Sparkles className="w-3 h-3 inline mr-1 text-blue-400" />
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-850 bg-slate-900/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about math, NumPy from-scratch, papers, or code..."
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 transition shadow-lg shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
