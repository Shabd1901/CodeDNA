"use client";

import React from "react";
import { GitBranch, FileCode, CheckCircle2, ShieldAlert, Cpu, Box, Layers } from "lucide-react";
import { InfoHelper } from "@/components/InfoTooltipModal";

interface BaselineProfileViewProps {
  baselineMetrics: any;
  authIntel: any;
}

export function BaselineProfileView({ baselineMetrics, authIntel }: BaselineProfileViewProps) {
  const counts = baselineMetrics?.repo_count_usable_files_languages || {};
  const usableFiles = counts?.usable_files || 0;
  const rawLangs = counts?.languages || {};
  const languageList: string[] = Array.isArray(rawLangs)
    ? rawLangs
    : (rawLangs && typeof rawLangs === "object")
    ? Object.entries(rawLangs).map(([lang, count]) => `${lang} (${count})`)
    : [];
  const compDist = baselineMetrics?.complexity_distribution || { mean: 0, p90: 0 };
  const locDist = baselineMetrics?.loc_distribution || { mean: 0, p90: 0 };
  const astPatterns = baselineMetrics?.ast_structural_patterns || {};
  const naming = baselineMetrics?.naming_convention_distribution || {};
  const deps = baselineMetrics?.dependency_library_fingerprint?.all || [];
  const arch = baselineMetrics?.architecture_fingerprint || [];

  const reliability = authIntel?.categorical_signals?.baseline_reliability || "Moderate";
  const confidenceScore = Math.round(authIntel?.evidence_confidence_score || 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Baseline Integrity Assessment */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
              <GitBranch className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-zinc-900">Historical CodeDNA Baseline Profile</h3>
          </div>
          <p className="text-xs text-zinc-500">
            Synthesized identity footprint extracted across student reference repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Reliability Index</p>
            <p className="text-base font-bold text-zinc-900">{confidenceScore}% ({reliability})</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-800 bg-zinc-50">
            {usableFiles}
            <span className="text-[9px] text-zinc-400 ml-0.5">files</span>
          </div>
        </div>
      </div>

      {/* Grid of Baseline Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Languages & Corpus Size */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-zinc-700" />
              <span>Corpus Metrics</span>
            </div>
            <InfoHelper termKey="corpus_metrics" />
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Usable Code Files:</span>
              <strong className="font-mono text-zinc-900">{usableFiles}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Detected Languages:</span>
              <span className="font-mono text-zinc-900 font-semibold text-right">
                {languageList.length > 0 ? languageList.join(", ") : "Python"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Contamination Risk:</span>
              <span className="font-semibold text-zinc-800 font-mono">
                {authIntel?.baseline_contamination_risk || "Low"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">AI Pattern Markers:</span>
              <span className="font-mono text-zinc-800">
                {baselineMetrics?.code_quality_error_patterns?.ai_patterns || 0} hits
              </span>
            </div>
          </div>
        </div>

        {/* Complexity & Length Baselines */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            <span>Historical Complexity</span>
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Complexity (Mean):</span>
              <strong className="text-zinc-900">{Number(compDist.mean || 0).toFixed(1)}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Complexity (P90):</span>
              <strong className="text-zinc-900">{Number(compDist.p90 || 0).toFixed(1)}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Lines of Code (Mean):</span>
              <strong className="text-zinc-900">{Number(locDist.mean || 0).toFixed(0)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Lines of Code (P90):</span>
              <strong className="text-zinc-900">{Number(locDist.p90 || 0).toFixed(0)}</strong>
            </div>
          </div>
        </div>

        {/* Conventions & Architecture */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-indigo-600" />
            <span>Style & Paradigm</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="py-1 border-b border-zinc-100">
              <span className="text-zinc-500 block mb-1">Naming Style Preferences:</span>
              <div className="flex flex-wrap gap-1">
                {Object.keys(naming).length > 0 ? (
                  Object.entries(naming).map(([k, v]: any) => (
                    <span key={k} className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[10px] text-zinc-700">
                      {k}: {v}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 italic">None</span>
                )}
              </div>
            </div>
            <div className="py-1">
              <span className="text-zinc-500 block mb-1">Architecture Paradigms:</span>
              <div className="flex flex-wrap gap-1">
                {arch.length > 0 ? (
                  arch.map((a: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[10px] text-zinc-700">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 italic">Standard Procedural</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AST Structural Node Distribution */}
      {Object.keys(astPatterns).length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-700" />
              <span>AST Node Structural Fingerprint Frequencies</span>
            </div>
            <InfoHelper termKey="ast_fingerprint" />
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Object.entries(astPatterns).slice(0, 18).map(([node, count]: any) => (
              <div key={node} className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs">
                <span className="font-mono text-zinc-500 text-[10px] truncate block">{node}</span>
                <span className="font-mono font-bold text-zinc-900 text-sm mt-0.5 block">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependency Ecosystem */}
      {deps.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Historical External Library Ecosystem ({deps.length})
          </h4>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {deps.map((dep: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 font-mono text-xs">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
