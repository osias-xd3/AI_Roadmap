"use client";

import React from "react";
import { Bot, Award, LogIn, LogOut, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
            v3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">
                AI Roadmap Hub
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Free Resources
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Overall Progress: {overallProgress}%</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Certifications Modal Trigger */}
          <button
            onClick={onOpenCertModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition shadow-sm"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Certifications</span>
          </button>

          {/* AI Tutor Drawer Trigger */}
          <button
            onClick={onOpenTutor}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            <Bot className="w-4 h-4" />
            <span>AI Tutor</span>
            <Sparkles className="w-3 h-3 text-blue-200" />
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile / Google Sign-In */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 pl-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-full border border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.displayName?.[0] || user.email?.[0] || "U"}
                </div>
              )}
              <button
                onClick={signOut}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Google Sign-In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
