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

  // Overall metric calculation
  const totalTopics = phases.reduce((acc, p) => acc + (p.topics?.length || 0), 0);
  const overallProgress =
    totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;

  // Filter phases by category
  const filteredPhases = phases.filter((phase) => {
    if (selectedPhaseCategory === "FOUNDATIONS") return phase.phase_number <= 3;
    if (selectedPhaseCategory === "DEEP_LEARNING")
      return phase.phase_number >= 4 && phase.phase_number <= 7;
    if (selectedPhaseCategory === "ADVANCED") return phase.phase_number >= 8;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Compass className="w-3.5 h-3.5" />
              <span>AI Roadmap v3.0 • Verified Zero-to-Advanced</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Master Modern AI & Machine Learning from Scratch
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-0.5">
              &quot;{metadata.core_philosophy ||
                "Do not rush the math and the build it from scratch steps. They are what separate people who use AI from people who understand it."}&quot;
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Timeline: {metadata.timeline || "14 to 20 months (10-15 hrs/wk)"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>12 Structured Phases (0 to 11)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                <span>{completedTopics.length} of {totalTopics} Topics Conquered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {[
              { id: "ALL", label: "All Phases (0 to 11)" },
              { id: "FOUNDATIONS", label: "Phases 0–3: Foundations & ML" },
              { id: "DEEP_LEARNING", label: "Phases 4–7: Deep Learning & LLMs" },
              { id: "ADVANCED", label: "Phases 8–11: RL, MLOps & Research" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPhaseCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                  selectedPhaseCategory === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Showing {filteredPhases.length} of {phases.length} Phases</span>
          </div>
        </div>

        {/* Phases Cards List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
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
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <p>AI Roadmap v3 Hub • Built with Next.js, Tailwind CSS, FastAPI, and Cloud Firestore.</p>
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
