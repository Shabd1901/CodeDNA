"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Activity, Copy, Check, Printer, Sparkles, RefreshCw, FolderSearch } from "lucide-react";

interface PersistentInvestigationContextProps {
  sessionId: string | null;
  report: any;
  aiLoading: boolean;
  aiMode: "openai" | "gemini" | null;
  onRunAi: () => void;
  onNewInvestigation: () => void;
  onExportDossier?: () => void;
}

export function PersistentInvestigationContext({
  sessionId,
  report,
  aiLoading,
  aiMode,
  onRunAi,
  onNewInvestigation,
  onExportDossier,
}: PersistentInvestigationContextProps) {
  const [copied, setCopied] = useState(false);

  const authIntel = report?.deterministic_data?.authorship_intelligence;
  const categorical = authIntel?.categorical_signals;
  const reliability = categorical?.baseline_reliability || "Unknown";
  const overallConcern = categorical?.overall_investigation_concern || "Unknown";
  const aiProfile = authIntel?.ai_author_profile || "Standard Analysis";
  const confidenceScore = Math.round(authIntel?.evidence_confidence_score || 0);

  const copySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHighConcern = overallConcern.toLowerCase() === "high";
  const isModerateConcern = overallConcern.toLowerCase() === "moderate";

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 border border-slate-700/80 rounded-xl p-4 text-slate-100 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Case ID & Breadcrumb provenance */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 rounded-lg border border-zinc-700 shrink-0">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Forensic Case
              </span>
              {sessionId && (
                <button
                  onClick={copySessionId}
                  title="Click to copy Session Case ID"
                  className="flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                >
                  <span>{sessionId.slice(0, 8)}…</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                </button>
              )}
            </div>
            <p className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Student Authorship Investigation</span>
              <span className="text-zinc-500 font-normal">|</span>
              <span className="text-xs font-normal text-zinc-300">
                Profile: <strong className="text-white">{aiProfile}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Middle: Forensic Indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 border-t lg:border-t-0 pt-2 lg:pt-0 border-zinc-800">
          {/* Baseline Reliability Chip */}
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
            <span className="text-zinc-400 text-[11px]">Reliability:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                reliability === "High"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : reliability === "Moderate"
                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                  : "bg-red-950 text-red-300 border border-red-800"
              }`}
            >
              {reliability} ({confidenceScore}%)
            </span>
          </div>

          {/* Overall Concern Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
              isHighConcern
                ? "bg-red-950/80 border-red-700 text-red-200"
                : isModerateConcern
                ? "bg-amber-950/80 border-amber-700 text-amber-200"
                : "bg-emerald-950/80 border-emerald-700 text-emerald-200"
            }`}
          >
            {isHighConcern ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            <span className="tracking-wide uppercase">
              {overallConcern} CONCERN
            </span>
          </div>

          {/* AI Mode indicator */}
          {aiMode && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/60 border border-blue-800 text-blue-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{aiMode === "gemini" ? "Gemini Flash" : "OpenAI GPT-4o"}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-zinc-800 justify-end">
          <button
            onClick={onRunAi}
            disabled={!sessionId || aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{report?.forensic_report ? "Re-run AI" : "Run AI Analysis"}</span>
          </button>

          {onExportDossier && (
            <button
              onClick={onExportDossier}
              title="Print or Export Forensic Dossier"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            <FolderSearch className="w-3.5 h-3.5 text-zinc-400" />
            <span>New Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
