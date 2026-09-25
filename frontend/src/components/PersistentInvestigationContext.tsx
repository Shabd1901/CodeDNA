"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Activity, Printer, Sparkles, RefreshCw, FolderSearch } from "lucide-react";

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
  const authIntel = report?.deterministic_data?.authorship_intelligence;
  const categorical = authIntel?.categorical_signals;
  const reliability = categorical?.baseline_reliability || "Unknown";
  const overallConcern = categorical?.overall_investigation_concern || "Unknown";
  const aiProfile = authIntel?.ai_author_profile || "Standard Analysis";
  const confidenceScore = Math.round(authIntel?.evidence_confidence_score || 0);

  const isHighConcern = overallConcern.toLowerCase() === "high";
  const isModerateConcern = overallConcern.toLowerCase() === "moderate";

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-zinc-900 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Case Title & Author Profile */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 rounded-lg border border-zinc-200 shrink-0">
            <Activity className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Forensic Case Audit
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-900 flex items-center gap-2 mt-0.5">
              <span>Student Authorship Investigation</span>
              <span className="text-zinc-300 font-normal">|</span>
              <span className="text-xs font-normal text-zinc-600">
                Profile: <strong className="text-zinc-900">{aiProfile}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Middle: Forensic Indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t lg:border-t-0 pt-2 lg:pt-0 border-zinc-100">
          {/* Baseline Reliability Chip */}
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs">
            <span className="text-zinc-500 text-[11px] font-medium">Reliability:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                reliability === "High"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : reliability === "Moderate"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {reliability} ({confidenceScore}%)
            </span>
          </div>

          {/* Overall Concern Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
              isHighConcern
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : isModerateConcern
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {isHighConcern ? <ShieldAlert className="w-4 h-4 text-rose-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
            <span className="tracking-wide uppercase text-[11px]">
              {overallConcern} CONCERN
            </span>
          </div>

          {/* AI Mode indicator */}
          {aiMode && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{aiMode === "gemini" ? "Gemini Flash" : "OpenAI GPT-4o"}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-zinc-100 justify-end">
          <button
            onClick={onRunAi}
            disabled={!sessionId || aiLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {aiLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{report?.forensic_report ? "Re-run AI" : "Run AI Analysis"}</span>
          </button>

          {onExportDossier && (
            <button
              onClick={onExportDossier}
              title="Print or Export Forensic Dossier"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <FolderSearch className="w-3.5 h-3.5 text-zinc-500" />
            <span>New Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
