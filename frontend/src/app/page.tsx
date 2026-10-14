"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { PhaseCard } from "../components/PhaseCard";
import { AITutorDrawer } from "../components/AITutorDrawer";
import { CertificationsModal } from "../components/CertificationsModal";
import { Phase, Certification, UserProgress } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import {
  fetchRoadmap,
  fetchUserProgress,
  saveUserProgress,
  triggerCertWatchdog,
} from "../lib/api";
import {
  Sparkles,
  Compass,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import bundledRoadmap from "../data/roadmap_v3.json";

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const [phases, setPhases] = useState<Phase[]>((bundledRoadmap.phases as unknown as Phase[]) || []);
  const [certifications, setCertifications] = useState<Certification[]>((bundledRoadmap.certifications as unknown as Certification[]) || []);
  const [metadata, setMetadata] = useState<any>(bundledRoadmap.metadata || {});
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [githubUrls, setGithubUrls] = useState<Record<string, string>>({});
  const [selectedPhaseCategory, setSelectedPhaseCategory] = useState<string>("ALL");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [activeTutorPhase, setActiveTutorPhase] = useState<string>("");
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load Roadmap Content
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchRoadmap();
        setPhases(data.phases || []);
        setCertifications(data.certifications || []);
        setMetadata(data.metadata || {});
      } catch (err) {
        console.warn("Could not fetch roadmap from backend, loading fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tutor") === "open") setTutorOpen(true);
      if (params.get("certs") === "open") setCertModalOpen(true);
    }
  }, []);

  // Load User Progress on Auth change
  useEffect(() => {
    async function loadProgress() {
      if (!user) {
        // Load guest progress from localStorage
        const local = localStorage.getItem("ai_roadmap_progress");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setCompletedTopics(parsed.completed_topics || []);
            setGithubUrls(parsed.github_urls || {});
          } catch {}
        }
        return;
      }

      try {
        const token = await getToken();
        if (token) {
          const progress: UserProgress = await fetchUserProgress(token);
          if (progress) {
            setCompletedTopics(progress.completed_topics || []);
            setGithubUrls(progress.github_urls || {});
          }
        }
      } catch (err) {
        console.warn("Could not load user progress:", err);
      }
    }

    loadProgress();
  }, [user]);

  // Handle toggling topics
  const handleToggleTopic = async (topicKey: string) => {
    const updated = completedTopics.includes(topicKey)
      ? completedTopics.filter((t) => t !== topicKey)
      : [...completedTopics, topicKey];

    setCompletedTopics(updated);

    // Persist to local storage
    localStorage.setItem(
      "ai_roadmap_progress",
      JSON.stringify({ completed_topics: updated, github_urls: githubUrls })
    );

    // Persist to Firestore if signed in
    if (user) {
      try {
        const token = await getToken();
        if (token) {
          await saveUserProgress(token, {
            completed_topics: updated,
            github_urls: githubUrls,
          });
        }
      } catch (e) {
        console.error("Error saving progress:", e);
      }
    }
  };

  // Handle saving GitHub URLs
  const handleSaveGithubUrl = async (phaseId: string, url: string) => {
    const updatedUrls = { ...githubUrls, [phaseId]: url };
    setGithubUrls(updatedUrls);

    localStorage.setItem(
      "ai_roadmap_progress",
      JSON.stringify({ completed_topics: completedTopics, github_urls: updatedUrls })
    );

    if (user) {
      try {
        const token = await getToken();
        if (token) {
          await saveUserProgress(token, {
            completed_topics: completedTopics,
            github_urls: updatedUrls,
          });
        }
      } catch (e) {
        console.error("Error saving GitHub URL:", e);
      }
    }
  };

  const handleOpenTutorForPhase = (phaseTitle: string) => {
    setActiveTutorPhase(phaseTitle);
    setTutorOpen(true);
  };

  const handleTriggerWatchdog = async () => {
    setIsAuditing(true);
    try {
      const token = await getToken();
      if (token) {
        await triggerCertWatchdog(token);
      }
    } catch (err) {
      console.error("Watchdog trigger failed:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFirst30Days, setShowFirst30Days] = useState(false);

  // Overall metric calculation
  const totalTopics = phases.reduce((acc, p) => acc + (p.topics?.length || 0), 0);
  const overallProgress =
    totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;

  // Filter phases by category and search query
  const filteredPhases = phases.filter((phase) => {
    // Category filter
    let matchesCategory = true;
    if (selectedPhaseCategory === "FOUNDATIONS") matchesCategory = phase.phase_number <= 3;
    if (selectedPhaseCategory === "DEEP_LEARNING")
      matchesCategory = phase.phase_number >= 4 && phase.phase_number <= 7;
    if (selectedPhaseCategory === "ADVANCED") matchesCategory = phase.phase_number >= 8;

    // Search query filter
    const matchesSearch =
      !searchQuery.trim() ||
      phase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phase.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      phase.from_scratch_exercise.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const first30Days = bundledRoadmap.first_30_days || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        overallProgress={overallProgress}
        onOpenTutor={() => {
          setActiveTutorPhase("");
          setTutorOpen(true);
        }}
        onOpenCertModal={() => setCertModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-white/[0.08] p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Ambient colorful background orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            {/* Top pill badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-500/30 text-xs font-bold text-cyan-300 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Roadmap v3.0 • Verified Zero-to-Advanced</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Free Resources & Certifications</span>
              </div>
            </div>

            {/* Main Hero Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Master Modern AI & Machine Learning{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                from Scratch
              </span>
            </h1>

            {/* Philosophy quote */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-4 py-1 bg-slate-950/30 rounded-r-xl">
              &quot;{metadata.core_philosophy ||
                "Do not rush the math and the build it from scratch steps. They are what separate people who use AI from people who understand it."}&quot;
            </p>

            {/* Multi-Color Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Progress Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/25 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Overall Progress</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{overallProgress}%</span>
                  <span className="text-xs text-slate-400">completed</span>
                </div>
              </div>

              {/* Conquered Topics */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/25 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Topics Mastered</span>
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-400">{completedTopics.length}</span>
                  <span className="text-xs text-slate-400">of {totalTopics}</span>
                </div>
              </div>

              {/* Structured Phases */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/25 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Curriculum</span>
                  <Compass className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-purple-400">12</span>
                  <span className="text-xs text-slate-400">Phases (0 to 11)</span>
                </div>
              </div>

              {/* Study Timeline */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/25 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Pace</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-amber-300 block">
                    {metadata.timeline || "14–20 months"}
                  </span>
                  <span className="text-[11px] text-slate-400">10–15 hrs/week</span>
                </div>
              </div>
            </div>

            {/* Quick Action Bar: First 30 Days & Certifications */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setShowFirst30Days(!showFirst30Days)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition active:scale-95 shadow-sm"
              >
                <span>{showFirst30Days ? "Hide" : "Explore"} First 30 Days Quick-Start</span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showFirst30Days ? "rotate-90" : ""}`} />
              </button>

              <button
                onClick={() => setCertModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition active:scale-95 shadow-sm"
              >
                <span>17 Free Certifications Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* First 30 Days Expandable Guide */}
        {showFirst30Days && first30Days.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> First 30 Days Fast-Track Roadmap
                </h3>
                <p className="text-xs text-slate-400">
                  Build momentum immediately with the foundational 4-week orientation
                </p>
              </div>
              <button
                onClick={() => setShowFirst30Days(false)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {first30Days.map((step: any, idx: number) => {
                const weekGradients = [
                  "border-cyan-500/30 bg-cyan-950/20 text-cyan-300",
                  "border-emerald-500/30 bg-emerald-950/20 text-emerald-300",
                  "border-purple-500/30 bg-purple-950/20 text-purple-300",
                  "border-amber-500/30 bg-amber-950/20 text-amber-300",
                ];
                const cardStyle = weekGradients[idx % weekGradients.length];
                return (
                  <div key={idx} className={`p-4 rounded-2xl border ${cardStyle} flex flex-col justify-between`}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                        Week {step.week}
                      </span>
                      <p className="text-xs text-slate-200 mt-2.5 leading-relaxed font-normal">
                        {step.tasks}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter & Live Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "ALL", label: "All Phases (0 to 11)", activeClass: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30" },
              { id: "FOUNDATIONS", label: "Phases 0–3: Foundations & ML", activeClass: "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30" },
              { id: "DEEP_LEARNING", label: "Phases 4–7: Deep Learning & LLMs", activeClass: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30" },
              { id: "ADVANCED", label: "Phases 8–11: RL & MLOps", activeClass: "bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-amber-600/30" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPhaseCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedPhaseCategory === tab.id
                    ? tab.activeClass
                    : "bg-slate-900/90 text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search topics (e.g., PyTorch, NumPy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
              <span>{filteredPhases.length} of {phases.length} Phases</span>
            </div>
          </div>
        </div>

        {/* Phases Cards List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredPhases.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <Compass className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No phases match your search query</h4>
            <p className="text-xs text-slate-400">
              Try searching for &quot;NumPy&quot;, &quot;PyTorch&quot;, &quot;Transformer&quot;, or &quot;Math&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPhaseCategory("ALL");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPhases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                completedTopics={completedTopics}
                githubUrl={githubUrls[phase.id] || ""}
                onToggleTopic={handleToggleTopic}
                onSaveGithubUrl={handleSaveGithubUrl}
                onOpenTutorForPhase={handleOpenTutorForPhase}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-slate-950/90 py-8 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">
          AI Roadmap v3 Hub • 100% Free Resources & Certifications
        </p>
        <p className="text-[11px] text-slate-400">
          Powered by Next.js, Tailwind CSS, Google Gemini 2.5 Flash, and Cloud Firestore. Deployed on Vercel at $0 cost.
        </p>
      </footer>

      {/* Slide-out AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        activePhaseTitle={activeTutorPhase}
      />

      {/* Certifications Modal */}
      <CertificationsModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certifications={certifications}
        onTriggerWatchdog={handleTriggerWatchdog}
        isAuditing={isAuditing}
      />
    </div>
  );
}
