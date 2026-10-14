"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
  CheckCircle2,
  Code2,
  ShieldCheck,
  BookOpen,
  Bookmark,
  Sparkles,
  Save,
  Check,
  FolderGit2,
} from "lucide-react";
import { Phase } from "../lib/types";

interface PhaseCardProps {
  phase: Phase;
  completedTopics: string[];
  githubUrl: string;
  onToggleTopic: (topicKey: string) => void;
  onSaveGithubUrl: (phaseId: string, url: string) => void;
  onOpenTutorForPhase: (phaseTitle: string) => void;
}

// Domain theme configuration mapped by phase_number
const getPhaseTheme = (num: number) => {
  switch (num) {
    case 0:
      return {
        category: "Python Tooling",
        gradient: "from-cyan-500 to-blue-600",
        badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        cardBorder: "border-cyan-500/20 hover:border-cyan-500/40",
        progressGradient: "from-cyan-500 to-blue-500",
        accentText: "text-cyan-400",
        lightBg: "bg-cyan-950/10",
      };
    case 1:
      return {
        category: "AI Mathematics",
        gradient: "from-blue-600 to-indigo-600",
        badgeBg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        cardBorder: "border-blue-500/20 hover:border-blue-500/40",
        progressGradient: "from-blue-500 to-indigo-500",
        accentText: "text-blue-400",
        lightBg: "bg-blue-950/10",
      };
    case 2:
      return {
        category: "Data Science & EDA",
        gradient: "from-teal-500 to-emerald-600",
        badgeBg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
        cardBorder: "border-teal-500/20 hover:border-teal-500/40",
        progressGradient: "from-teal-500 to-emerald-500",
        accentText: "text-teal-400",
        lightBg: "bg-teal-950/10",
      };
    case 3:
      return {
        category: "Classical ML",
        gradient: "from-emerald-500 to-green-600",
        badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        cardBorder: "border-emerald-500/20 hover:border-emerald-500/40",
        progressGradient: "from-emerald-500 to-green-500",
        accentText: "text-emerald-400",
        lightBg: "bg-emerald-950/10",
      };
    case 4:
      return {
        category: "Deep Learning",
        gradient: "from-purple-500 to-violet-600",
        badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        cardBorder: "border-purple-500/20 hover:border-purple-500/40",
        progressGradient: "from-purple-500 to-indigo-500",
        accentText: "text-purple-400",
        lightBg: "bg-purple-950/10",
      };
    case 5:
      return {
        category: "NLP & Transformers",
        gradient: "from-indigo-500 to-purple-600",
        badgeBg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        cardBorder: "border-indigo-500/20 hover:border-indigo-500/40",
        progressGradient: "from-indigo-500 to-purple-500",
        accentText: "text-indigo-400",
        lightBg: "bg-indigo-950/10",
      };
    case 6:
      return {
        category: "Computer Vision",
        gradient: "from-rose-500 to-pink-600",
        badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        cardBorder: "border-rose-500/20 hover:border-rose-500/40",
        progressGradient: "from-rose-500 to-pink-500",
        accentText: "text-rose-400",
        lightBg: "bg-rose-950/10",
      };
    case 7:
      return {
        category: "LLMs & Agentic AI",
        gradient: "from-orange-500 to-amber-600",
        badgeBg: "bg-orange-500/15 text-orange-300 border-orange-500/30",
        cardBorder: "border-orange-500/20 hover:border-orange-500/40",
        progressGradient: "from-orange-500 to-amber-500",
        accentText: "text-orange-400",
        lightBg: "bg-orange-950/10",
      };
    case 8:
      return {
        category: "Reinforcement Learning",
        gradient: "from-fuchsia-500 to-pink-600",
        badgeBg: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
        cardBorder: "border-fuchsia-500/20 hover:border-fuchsia-500/40",
        progressGradient: "from-fuchsia-500 to-pink-500",
        accentText: "text-fuchsia-400",
        lightBg: "bg-fuchsia-950/10",
      };
    case 9:
      return {
        category: "Frontier & Multi-Modal",
        gradient: "from-sky-500 to-indigo-600",
        badgeBg: "bg-sky-500/15 text-sky-300 border-sky-500/30",
        cardBorder: "border-sky-500/20 hover:border-sky-500/40",
        progressGradient: "from-sky-500 to-indigo-500",
        accentText: "text-sky-400",
        lightBg: "bg-sky-950/10",
      };
    case 10:
      return {
        category: "MLOps & Engineering",
        gradient: "from-teal-500 to-cyan-600",
        badgeBg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
        cardBorder: "border-teal-500/20 hover:border-teal-500/40",
        progressGradient: "from-teal-500 to-cyan-500",
        accentText: "text-teal-400",
        lightBg: "bg-teal-950/10",
      };
    case 11:
    default:
      return {
        category: "Research & Portfolio",
        gradient: "from-amber-500 to-yellow-600",
        badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        cardBorder: "border-amber-500/20 hover:border-amber-500/40",
        progressGradient: "from-amber-500 to-yellow-500",
        accentText: "text-amber-400",
        lightBg: "bg-amber-950/10",
      };
  }
};

export const PhaseCard: React.FC<PhaseCardProps> = ({
  phase,
  completedTopics,
  githubUrl,
  onToggleTopic,
  onSaveGithubUrl,
  onOpenTutorForPhase,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [urlInput, setUrlInput] = useState(githubUrl || "");
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const theme = getPhaseTheme(phase.phase_number);

  // Compute completion stats for this phase
  const totalTopics = phase.topics.length;
  const completedInPhase = phase.topics.filter((t) =>
    completedTopics.includes(`${phase.id}:${t}`)
  ).length;
  const percentCompleted =
    totalTopics > 0 ? Math.round((completedInPhase / totalTopics) * 100) : 0;
  const isPhaseCompleted = percentCompleted === 100 && !!githubUrl;

  const handleSaveUrl = async () => {
    setIsSavingUrl(true);
    await onSaveGithubUrl(phase.id, urlInput);
    setIsSavingUrl(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isUrlValid =
    urlInput.trim().startsWith("https://github.com/") ||
    urlInput.trim().startsWith("http://github.com/");

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isPhaseCompleted
          ? "border-emerald-500/40 bg-slate-900/90 shadow-xl shadow-emerald-950/20"
          : `bg-slate-900/70 ${theme.cardBorder} hover:shadow-xl hover:shadow-black/40`
      }`}
    >
      {/* Header Bar */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] bg-slate-950/30">
        <div className="flex items-start gap-4">
          {/* Phase Number Badge */}
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-lg ${
              isPhaseCompleted
                ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/25"
                : `bg-gradient-to-tr ${theme.gradient} text-white shadow-black/30`
            }`}
          >
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/80">
              PHASE
            </span>
            <span className="text-xl leading-none font-black">
              {phase.phase_number}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {phase.title}
              </h3>
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
              >
                {theme.category}
              </span>
              {isPhaseCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Conquered
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 mt-1.5">
              <span className="bg-slate-800/90 px-2 py-0.5 rounded-md text-slate-200 font-medium border border-white/5">
                {phase.duration}
              </span>
              {phase.parallel_with && (
                <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                  Parallel: {phase.parallel_with}
                </span>
              )}
              <span className="text-slate-400">
                <span className="font-semibold text-slate-200">
                  {completedInPhase}
                </span>{" "}
                of {totalTopics} topics complete
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Progress Bar */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
          {/* Progress Bar */}
          <div className="flex-1 md:w-36 bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                percentCompleted === 100
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : `bg-gradient-to-r ${theme.progressGradient}`
              }`}
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-200 w-10 text-right">
            {percentCompleted}%
          </span>

          {/* Ask AI Tutor for Phase */}
          <button
            onClick={() =>
              onOpenTutorForPhase(`Phase ${phase.phase_number}: ${phase.title}`)
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition active:scale-95 shadow-sm"
            title="Ask AI Tutor about this phase"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Ask</span> Tutor
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 rounded-lg transition"
            aria-label="Toggle details"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 space-y-6 animate-in fade-in duration-200">
          {/* Topics Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${theme.accentText} flex items-center gap-1.5`}
              >
                <CheckCircle2 className="w-4 h-4" /> Topics & Milestones
              </h4>
              <span className="text-[11px] font-medium text-slate-400">
                {completedInPhase}/{totalTopics} checked
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {phase.topics.map((topic, idx) => {
                const topicKey = `${phase.id}:${topic}`;
                const isChecked = completedTopics.includes(topicKey);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                      isChecked
                        ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                        : "bg-slate-950/40 border-white/[0.05] hover:border-white/10 hover:bg-slate-800/30 text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleTopic(topicKey)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <span
                      className={`text-sm leading-relaxed ${
                        isChecked ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {topic}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Resources: Core vs Reference */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Core Resources */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Core Resources (100% Free)
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified Free
                </span>
              </div>
              <ul className="space-y-3">
                {phase.core_resources.map((res, idx) => (
                  <li key={idx} className="text-sm group">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-300 group-hover:text-cyan-200 font-semibold hover:underline"
                    >
                      <span>{res.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition" />
                    </a>
                    {res.note && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                        {res.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reference Resources */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4" /> Supplemental References
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Deep Dive
                </span>
              </div>
              <ul className="space-y-3">
                {phase.reference_resources.map((res, idx) => (
                  <li key={idx} className="text-sm group">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-300 group-hover:text-white font-medium hover:underline"
                    >
                      <span>{res.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-slate-300 transition" />
                    </a>
                    {res.note && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                        {res.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* From Scratch Exercise & Self-Check Gate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Build From Scratch Task */}
            <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/25 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                <Code2 className="w-4 h-4 text-amber-400" /> Build From Scratch Task
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {phase.from_scratch_exercise}
              </p>
            </div>

            {/* Self-Check Gate */}
            <div className="p-4 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/25 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Self-Check Gate & Criteria
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-2 font-normal">
                <span className="font-semibold text-white">Done when: </span>
                {phase.done_when}
              </p>
              {phase.projects && phase.projects.length > 0 && (
                <div className="mt-2 pt-2 border-t border-indigo-500/20 text-xs text-slate-300">
                  <span className="font-semibold text-indigo-300">
                    Milestone Project:{" "}
                  </span>
                  {phase.projects[0]}
                </div>
              )}
            </div>
          </div>

          {/* GitHub Project Submission */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10 text-white flex items-center justify-center shrink-0 shadow-md">
                <Github className="w-5 h-5 text-slate-200" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  Phase GitHub Repository
                  {urlInput && isUrlValid && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Valid Link
                    </span>
                  )}
                </h5>
                <p className="text-xs text-slate-400">
                  Link your implementation repository to conquer this phase
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:max-w-md justify-end">
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="https://github.com/username/ai-project"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition border border-white/5"
                  title="Open GitHub repo in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={handleSaveUrl}
                disabled={isSavingUrl}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                {savedSuccess ? "Saved!" : isSavingUrl ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

