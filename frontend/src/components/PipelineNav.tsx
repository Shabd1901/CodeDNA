"use client";

import React, { useEffect } from "react";
import { 
  LayoutDashboard, 
  GitBranch, 
  GitCompare, 
  BrainCircuit,
  Milestone,
  FileSearch, 
  Sparkles, 
  ClipboardCheck,
  ShieldCheck
} from "lucide-react";

export type PipelineStage = "overview" | "baseline" | "comparison" | "ml" | "timeline" | "evidence" | "ai" | "dossier";

interface PipelineNavProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  hasAiReport: boolean;
  suspiciousCount: number;
}

export function PipelineNav({
  currentStage,
  onSelectStage,
  hasAiReport,
  suspiciousCount,
}: PipelineNavProps) {
  const STAGES: { id: PipelineStage; label: string; icon: any; hotkey: string; badge?: string | number; badgeColor?: string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, hotkey: "1" },
    { id: "baseline", label: "Baseline DNA", icon: GitBranch, hotkey: "2" },
    { id: "comparison", label: "Comparison", icon: GitCompare, hotkey: "3" },
    { 
      id: "ml", 
      label: "ML & Calibration", 
      icon: BrainCircuit, 
      hotkey: "4", 
      badge: "Siamese", 
      badgeColor: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
    },
    { 
      id: "timeline", 
      label: "Timeline Evolution", 
      icon: Milestone, 
      hotkey: "5", 
      badge: "CUSUM", 
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
    },
    { 
      id: "evidence", 
      label: "Traceable Evidence", 
      icon: FileSearch, 
      hotkey: "6", 
      badge: suspiciousCount > 0 ? suspiciousCount : undefined, 
      badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
    },
    { 
      id: "ai", 
      label: "AI Reasoning", 
      icon: Sparkles, 
      hotkey: "7", 
      badge: hasAiReport ? "Ready" : undefined, 
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
    },
    { id: "dossier", label: "Dossier & VivaGuard", icon: ClipboardCheck, hotkey: "8" }
  ];

  // Keyboard navigation listener (1-6 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const match = STAGES.find(s => s.hotkey === e.key);
      if (match) {
        onSelectStage(match.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectStage, STAGES]);

  return (
    <nav className="w-full bg-white border border-zinc-200 rounded-xl p-1.5 shadow-sm overflow-x-auto">
      <div className="flex items-center min-w-max gap-1">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isActive = currentStage === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onSelectStage(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
              <span>{s.label}</span>

              {s.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${s.badgeColor || "bg-zinc-200 text-zinc-700"}`}>
                  {s.badge}
                </span>
              )}

              <span className={`hidden md:inline-block text-[10px] font-mono px-1 rounded ${
                isActive ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-400"
              }`}>
                {s.hotkey}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
