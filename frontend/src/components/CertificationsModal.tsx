"use client";

import React, { useState } from "react";
import { X, ExternalLink, Award, CheckCircle2, AlertTriangle, Search, RefreshCw } from "lucide-react";
import { Certification } from "../lib/types";

interface CertificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  certifications: Certification[];
  onTriggerWatchdog: () => Promise<void>;
  isAuditing: boolean;
}

export const CertificationsModal: React.FC<CertificationsModalProps> = ({
  isOpen,
  onClose,
  certifications,
  onTriggerWatchdog,
  isAuditing,
}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredCerts = certifications.filter((cert) => {
    const matchesFilter =
      filter === "ALL" ||
      (filter === "FREE" && cert.status === "ACTIVE_FREE") ||
      (filter === "PAID_EXAM" && cert.status === "TRAINING_FREE_EXAM_PAID") ||
      (filter === "AID" && cert.status === "FINANCIAL_AID_REQUIRED");

    const matchesSearch =
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.provider.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE_FREE":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> 100% Free
          </span>
        );
      case "TRAINING_FREE_EXAM_PAID":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Training Free / Exam Paid
          </span>
        );
      case "FINANCIAL_AID_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Aid Application Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Certification Directory ({certifications.length} Tracked)
              </h2>
              <p className="text-xs text-slate-400">
                Audited against live web changes via Gemini Google Search grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerWatchdog}
              disabled={isAuditing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              {isAuditing ? "Auditing Web..." : "Run Watchdog"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by cert or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "ALL", label: "All" },
              { id: "FREE", label: "100% Free" },
              { id: "PAID_EXAM", label: "Free Training / Paid Exam" },
              { id: "AID", label: "Financial Aid" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  filter === btn.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Certifications */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredCerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No certifications matched your filter.
            </div>
          ) : (
            filteredCerts.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{cert.name}</h3>
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div>{getStatusBadge(cert.status)}</div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-300">Provider:</span>{" "}
                    {cert.provider} |{" "}
                    <span className="font-semibold text-slate-300">Model:</span>{" "}
                    {cert.cost_model}
                  </p>
                  <p className="text-slate-300 leading-relaxed">{cert.notes}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
