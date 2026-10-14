"use client";

import React from "react";
import { Bot, Award, LogIn, LogOut, Sparkles, Compass } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "./NotificationBell";

interface NavbarProps {
  onOpenTutor: () => void;
  onOpenCertModal: () => void;
  overallProgress: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTutor,
  onOpenCertModal,
  overallProgress,
}) => {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-90 transition duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-indigo-300 to-purple-400 font-black text-sm border border-white/10">
              v3
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                AI Roadmap Hub
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                100% Free Resources
              </span>
            </div>
            {/* Progress Mini Bar */}
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 sm:w-32 bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400"
                  style={{ width: `${Math.max(overallProgress, 2)}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-300">
                {overallProgress}% <span className="text-slate-400 hidden sm:inline">Completed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Certifications Modal Trigger */}
          <button
            onClick={onOpenCertModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/40 rounded-xl transition shadow-sm hover:shadow-amber-500/10 active:scale-95"
            title="Browse verified free AI & CS certifications"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Certifications</span>
          </button>

          {/* AI Tutor Drawer Trigger */}
          <button
            onClick={onOpenTutor}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl transition shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95 border border-indigo-400/30"
          >
            <Bot className="w-4 h-4 text-cyan-200" />
            <span className="font-bold">AI Tutor</span>
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile / Google Sign-In */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border-2 border-indigo-500/50 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center border border-white/20">
                    {user.displayName?.[0] || user.email?.[0] || "U"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl transition active:scale-95 shadow-sm"
                title="Sign in with Google Account"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Google Sign-In</span>
              </button>
              <button
                onClick={continueAsGuest}
                className="hidden md:flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-xl transition active:scale-95"
                title="Try out the roadmap without logging in"
              >
                <span>Demo Student</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

