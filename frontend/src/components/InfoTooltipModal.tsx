"use client";

import React, { useState } from "react";
import { Info, X } from "lucide-react";

export interface TechnicalTermDef {
  term: string;
  simpleMeaning: string;
  category?: string;
}

export const TECHNICAL_TERMS: Record<string, TechnicalTermDef> = {
  codedna: {
    term: "CodeDNA Fingerprint",
    simpleMeaning: "A unique AST-grounded behavioral signature generated from an author's coding habits (naming, indentation, function complexity, control flow).",
    category: "Core Fingerprint"
  },
  baseline_reliability: {
    term: "Baseline Reliability",
    simpleMeaning: "Measures how trustworthy the historical reference baseline is based on total lines of code and file sample size.",
    category: "Baseline Quality"
  },
  structural_deviation: {
    term: "AST Structural Deviation",
    simpleMeaning: "Measures how much the abstract syntax tree (loops, list comprehensions, classes, control flows) differs from baseline habits.",
    category: "AST Topology"
  },
  naming_deviation: {
    term: "Lexical Naming Deviation",
    simpleMeaning: "Tracks shifts in variable/function naming styles (e.g., snake_case vs camelCase vs PascalCase).",
    category: "Naming Convention"
  },
  formatting_deviation: {
    term: "Formatting & Indentation Fingerprint",
    simpleMeaning: "Tracks whitespace geometry, tab vs space usage, trailing spaces, and quote preferences.",
    category: "Formatting Hygiene"
  },
  complexity_deviation: {
    term: "Cyclomatic Complexity Shift",
    simpleMeaning: "Measures changes in decision logic, nested branches, and P90 function complexity compared to historical baseline.",
    category: "Code Logic"
  },
  architecture_deviation: {
    term: "Architectural Paradigm Shift",
    simpleMeaning: "Detects changes in high-level design structure (e.g., switching from procedural CLI scripts to OOP or web framework monoliths).",
    category: "Architecture"
  },
  dependency_discontinuity: {
    term: "Dependency Discontinuity",
    simpleMeaning: "Flags brand-new third-party packages or imports introduced in the submission that were never present in historical work.",
    category: "Libraries"
  },
  siamese_latent: {
    term: "Siamese Neural Latent Space",
    simpleMeaning: "Projects 48 style features into a 24-dimensional learned space to calculate structural similarity independently of superficial renaming.",
    category: "Machine Learning"
  },
  platt_calibration: {
    term: "Platt Sigmoid Calibration",
    simpleMeaning: "Maps raw anomaly metrics to calibrated probability scores with dynamic 95% confidence bounds.",
    category: "Statistical Calibration"
  },
  cusum_change_point: {
    term: "CUSUM Change-Point Detection",
    simpleMeaning: "Tracks chronological growth trajectories across project milestones to separate steady skill growth from abrupt anomalies.",
    category: "Temporal Trajectory"
  },
  vivaguard: {
    term: "VivaGuard Questioning Script",
    simpleMeaning: "Generates targeted oral defense interview questions based on exact code anomalies for evaluators to ask the student.",
    category: "Oral Verification"
  },
  consistent_ai: {
    term: "Consistent AI Author Profile",
    simpleMeaning: "Indicates the author used AI in both baseline and submission. Low substitution concern — focus on AI policy compliance.",
    category: "Author Profile"
  },
  sudden_ai: {
    term: "Sudden AI Introduction",
    simpleMeaning: "Baseline is clean, but submission suddenly introduces AI-associated syntax or leaps in sophistication.",
    category: "Author Profile"
  }
};

interface InfoHelperProps {
  termKey: string;
  title?: string;
  className?: string;
}

export function InfoHelper({ termKey, title, className = "" }: InfoHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const def = TECHNICAL_TERMS[termKey] || {
    term: title || termKey,
    simpleMeaning: "Technical metric evaluating behavioral consistency between historical baseline and current submission."
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={`Click for technical explanation of ${def.term}`}
        className={`inline-flex items-center justify-center p-0.5 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none ${className}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 max-w-md w-full shadow-xl space-y-3 relative">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Info className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">{def.term}</h4>
                  {def.category && <p className="text-[10px] font-mono text-zinc-400">{def.category}</p>}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-xs text-zinc-700 leading-relaxed font-normal">
              {def.simpleMeaning}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
