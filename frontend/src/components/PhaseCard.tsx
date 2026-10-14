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

  // Compute completion stats for this phase
  const totalTopics = phase.topics.length;
  const completedInPhase = phase.topics.filter((t) =>
    completedTopics.includes(`${phase.id}:${t}`)
  ).length;
  const percentCompleted = totalTopics > 0 ? Math.round((completedInPhase / totalTopics) * 100) : 0;
  const isPhaseCompleted = percentCompleted === 100 && !!githubUrl;

  const handleSaveUrl = async () => {
    setIsSavingUrl(true);
    await onSaveGithubUrl(phase.id, urlInput);
    setIsSavingUrl(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isPhaseCompleted
          ? "border-emerald-500/30 bg-slate-900/90 shadow-lg shadow-emerald-950/20"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700/80"
      }`}
    >
      {/* Header Bar */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-md ${
              isPhaseCompleted
                ? "bg-emerald-600 text-white"
                : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
            }`}
          >
            <span className="text-[10px] uppercase font-semibold text-slate-400">PHASE</span>
            <span className="text-lg leading-none">{phase.phase_number}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {phase.title}
              </h3>
              {isPhaseCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">
                {phase.duration}
              </span>
              {phase.parallel_with && (
                <span className="text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Parallel: {phase.parallel_with}
                </span>
              )}
              <span>
                {completedInPhase} of {totalTopics} topics finished
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Progress Bar */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
          {/* Progress Bar */}
          <div className="flex-1 md:w-36 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                percentCompleted === 100 ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-300 w-10 text-right">
            {percentCompleted}%
          </span>

          <button
            onClick={() => onOpenTutorForPhase(`Phase ${phase.phase_number}: ${phase.title}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition"
            title="Ask AI Tutor about this phase"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Ask</span> Tutor
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            aria-label="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 space-y-6 animate-in fade-in duration-150">
          {/* Topics Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Topics & Checkpoints
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {phase.topics.map((topic, idx) => {
                const topicKey = `${phase.id}:${topic}`;
                const isChecked = completedTopics.includes(topicKey);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                      isChecked
                        ? "bg-slate-800/40 border-emerald-500/30 text-slate-300"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleTopic(topicKey)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
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
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Core Resources (100% Free)
              </h4>
              <ul className="space-y-2.5">
                {phase.core_resources.map((res, idx) => (
                  <li key={idx} className="text-sm">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium hover:underline"
                    >
                      <span>{res.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    {res.note && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-normal">{res.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reference Resources */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" /> Supplemental References
              </h4>
              <ul className="space-y-2.5">
                {phase.reference_resources.map((res, idx) => (
                  <li key={idx} className="text-sm">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-medium hover:underline"
                    >
                      <span>{res.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    </a>
                    {res.note && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-normal">{res.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* From Scratch Exercise & Self-Check Gate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-900/30">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                <Code2 className="w-4 h-4" /> Build From Scratch Task
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {phase.from_scratch_exercise}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-900/30">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                <ShieldCheck className="w-4 h-4" /> Self-Check Gate & Criteria
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-2">
                <span className="font-semibold text-white">Done when: </span>
                {phase.done_when}
              </p>
              {phase.projects && phase.projects.length > 0 && (
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Required Project: </span>
                  {phase.projects[0]}
                </p>
              )}
            </div>
          </div>

          {/* GitHub Project Submission */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">Phase GitHub Project</h5>
                <p className="text-xs text-slate-400">Link your repository or implementation code</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-96">
              <input
                type="url"
                placeholder="https://github.com/username/project-repo"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveUrl}
                disabled={isSavingUrl}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-700 shrink-0"
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
