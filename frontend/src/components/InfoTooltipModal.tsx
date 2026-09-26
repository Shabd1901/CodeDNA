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
  },
  corpus_metrics: {
    term: "Corpus Metrics",
    simpleMeaning: "Historical baseline statistics tracking total usable code files, language breakdown, AST node counts, and contamination risk.",
    category: "Baseline Corpus"
  },
  ast_fingerprint: {
    term: "AST Node Structural Fingerprint Frequencies",
    simpleMeaning: "Statistical distribution of specific Abstract Syntax Tree constructs (loops, comprehensions, classes, try blocks) across reference code.",
    category: "AST Topology"
  },
  siamese_metric: {
    term: "Siamese Latent Metric Learning",
    simpleMeaning: "Contrastive neural network projecting 48 style features onto a 24-dimensional L2-normalized unit sphere to measure deep structural identity.",
    category: "Neural Embeddings"
  },
  latent_attribution: {
    term: "Latent Dimension Attribution",
    simpleMeaning: "Calculates the top gradient features driving structural divergence between historical baseline and current submission.",
    category: "Explainable AI"
  },
  empirical_confusion_matrix: {
    term: "Empirical Confusion Matrix",
    simpleMeaning: "Evaluates True Positives, False Positives (0% target), True Negatives, and False Negatives across 12 controlled benchmark scenarios.",
    category: "Validation Matrix"
  },
  adversarial_resilience: {
    term: "Adversarial Evasion Resistance",
    simpleMeaning: "Measures system robustness against active obfuscation, dead code injection, variable renaming, whitespace churn, and comment flooding.",
    category: "Adversarial Defense"
  },
  roc_curve: {
    term: "Receiver Operating Characteristic (ROC)",
    simpleMeaning: "Plots True Positive Rate vs False Positive Rate across varying operating decision thresholds (AUC ~ 0.985).",
    category: "Model Evaluation"
  },
  pr_curve: {
    term: "Precision-Recall Curve (PR)",
    simpleMeaning: "Visualizes Precision vs Recall tradeoffs to verify high-confidence forensic detection without false accusations.",
    category: "Model Evaluation"
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
    <div className="relative inline-flex items-center group">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        title={`Click for technical explanation of ${def.term}`}
        aria-label={`Technical explanation of ${def.term}`}
        className={`inline-flex items-center justify-center p-0.5 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none cursor-pointer ${className}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div 
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3 bg-white border border-zinc-200/90 rounded-xl shadow-lg text-left text-zinc-800 animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-1.5">
            <span className="text-[11px] font-bold text-zinc-900 tracking-wide uppercase">{def.term}</span>
            {def.category && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-semibold">{def.category}</span>}
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed font-normal">
            {def.simpleMeaning}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-200" />
        </div>
      )}
    </div>
  );
}
