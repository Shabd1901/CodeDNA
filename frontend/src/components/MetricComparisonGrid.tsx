"use client";

import React from "react";
import { GitCompare, Box, Layers, Cpu, ArrowUpRight, Check, AlertCircle } from "lucide-react";

import { InfoHelper } from "@/components/InfoTooltipModal";

interface MetricComparisonGridProps {
  baselineMetrics: any;
  submissionMetrics: any;
  forensics: any;
  crossLanguageIntel?: any;
}

export function MetricComparisonGrid({
  baselineMetrics,
  submissionMetrics,
  forensics,
  crossLanguageIntel,
}: MetricComparisonGridProps) {
  const bNaming = baselineMetrics?.naming_convention_distribution || {};
  const sNaming = submissionMetrics?.naming_convention_distribution || {};

  const bComp = baselineMetrics?.complexity_distribution || { mean: 0, p90: 0 };
  const sComp = submissionMetrics?.complexity_distribution || { mean: 0, p90: 0 };

  const bLoc = baselineMetrics?.loc_distribution || { mean: 0, p90: 0 };
  const sLoc = submissionMetrics?.loc_distribution || { mean: 0, p90: 0 };

  const bArch = baselineMetrics?.architecture_fingerprint || [];
  const sArch = submissionMetrics?.architecture_fingerprint || [];

  const bDeps = baselineMetrics?.dependency_library_fingerprint?.all || [];
  const sDeps = submissionMetrics?.dependency_library_fingerprint?.all || [];
  const newDeps = sDeps.filter((d: string) => !bDeps.includes(d));

  const isCross = crossLanguageIntel?.is_cross_language;

  return (
    <div className="space-y-6">
      {/* Cross-Language AST Normalization Parity Banner */}
      {isCross && (
        <div className="p-5 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50 border border-sky-200/80 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                <GitCompare className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                    Cross-Language AST Parity Normalization
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-900 font-bold">
                    {crossLanguageIntel.primary_baseline_language?.toUpperCase()} → {crossLanguageIntel.primary_submission_language?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-sky-800">
                  AST constructs normalized into language-agnostic CodeDNA semantic vectors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-sky-600 font-semibold block">Semantic Parity</span>
                <span className="text-base font-black text-sky-950">
                  {crossLanguageIntel.semantic_parity_score}%
                </span>
              </div>
              <span className="px-2 py-1 bg-white/90 border border-sky-200 text-sky-800 text-[11px] font-mono font-bold rounded-lg shadow-2xs">
                -{Math.round((crossLanguageIntel.cross_language_penalty_discount || 0) * 100)}% Discount Applied
              </span>
            </div>
          </div>

          {/* Invariant Cognitive Grid */}
          {crossLanguageIntel.language_invariant_metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 bg-white/80 border border-sky-100 rounded-lg">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Complexity Density</span>
                <span className="text-xs font-mono font-bold text-zinc-900">
                  Δ {crossLanguageIntel.language_invariant_metrics.complexity_density_drift}%
                </span>
              </div>
              <div className="p-2.5 bg-white/80 border border-sky-100 rounded-lg">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Nesting Profile</span>
                <span className="text-xs font-mono font-bold text-zinc-900">
                  Δ {crossLanguageIntel.language_invariant_metrics.nesting_profile_drift}%
                </span>
              </div>
              <div className="p-2.5 bg-white/80 border border-sky-100 rounded-lg">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Identifier Cadence</span>
                <span className="text-xs font-mono font-bold text-zinc-900">
                  Δ {crossLanguageIntel.language_invariant_metrics.identifier_cadence_drift}%
                </span>
              </div>
              <div className="p-2.5 bg-white/80 border border-sky-100 rounded-lg">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Comment Cadence</span>
                <span className="text-xs font-mono font-bold text-zinc-900">
                  Δ {crossLanguageIntel.language_invariant_metrics.comment_hygiene_drift}%
                </span>
              </div>
            </div>
          )}

          {/* Idiomatic Adaptations */}
          {crossLanguageIntel.idiomatic_adaptations?.length > 0 && (
            <div className="space-y-1">
              {crossLanguageIntel.idiomatic_adaptations.map((note: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-sky-900">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Naming Convention Comparator */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span>Naming Conventions Breakdown</span>
            </h4>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              Deviation: {Math.round(forensics?.naming_deviation || 0)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-2">Historical Baseline</p>
              {Object.keys(bNaming).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(bNaming).map(([style, count]: any) => (
                    <div key={style} className="flex justify-between font-mono">
                      <span className="text-zinc-600">{style}:</span>
                      <strong className="text-zinc-900">{count}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 italic">No naming distribution</p>
              )}
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-2">Submission</p>
              {Object.keys(sNaming).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(sNaming).map(([style, count]: any) => (
                    <div key={style} className="flex justify-between font-mono">
                      <span className="text-zinc-600">{style}:</span>
                      <strong className="text-zinc-900">{count}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 italic">No naming distribution</p>
              )}
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3 pt-2 border-t border-zinc-100">
            {forensics?.deviation_reasons?.naming || "Calculated from AST identifiers & function definitions."}
          </p>
        </div>

        {/* Complexity & Distribution Shifts */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600" />
              <span>Complexity & Distribution Shifts</span>
            </h4>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              Deviation: {Math.round(forensics?.complexity_deviation || 0)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-2">Cyclomatic Complexity</p>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mean:</span>
                  <span className="text-zinc-800">{Number(bComp.mean || 0).toFixed(1)} → <strong>{Number(sComp.mean || 0).toFixed(1)}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">P90:</span>
                  <span className="text-zinc-800">{Number(bComp.p90 || 0).toFixed(1)} → <strong className={sComp.p90 > bComp.p90 * 1.5 ? "text-red-600" : ""}>{Number(sComp.p90 || 0).toFixed(1)}</strong></span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-2">LOC Distribution</p>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mean:</span>
                  <span className="text-zinc-800">{Number(bLoc.mean || 0).toFixed(0)} → <strong>{Number(sLoc.mean || 0).toFixed(0)}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">P90:</span>
                  <span className="text-zinc-800">{Number(bLoc.p90 || 0).toFixed(0)} → <strong>{Number(sLoc.p90 || 0).toFixed(0)}</strong></span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3 pt-2 border-t border-zinc-100">
            {forensics?.deviation_reasons?.complexity || "Assesses shifts in nesting, conditional branches, and function lengths."}
          </p>
        </div>

        {/* Dependency & Library Footprint */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Dependency Discontinuity</span>
              <InfoHelper termKey="dependency_discontinuity" />
            </h4>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              DevDeviation: {Math.round(forensics?.dependency_deviation || 0)}%
            </span>
          </div>

          <div className="text-xs space-y-3 max-h-52 overflow-y-auto pr-1.5 scrollbar-thin">
            <div>
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1.5">
                New External Libraries Introduced ({newDeps.length})
              </p>
              {newDeps.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {newDeps.map((dep: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono text-[11px] font-semibold">
                      +{dep}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-700 font-medium flex items-center gap-1.5 text-xs">
                  <Check className="w-3.5 h-3.5" /> No novel external libraries introduced.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1">
                Baseline Historical Dependencies ({bDeps.length})
              </p>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {bDeps.map((dep: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]">
                    {dep}
                  </span>
                ))}
                {bDeps.length === 0 && <span className="text-[10px] text-zinc-400">None detected</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Architecture & Paradigm Shifts */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-purple-600" />
              <span>Architectural Paradigm Shift</span>
            </h4>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              Deviation: {Math.round(forensics?.architecture_deviation || 0)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1.5">Baseline Paradigm</p>
              <div className="space-y-1">
                {bArch.length > 0 ? (
                  bArch.map((arch: string, i: number) => (
                    <span key={i} className="inline-block px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-800 text-[11px] font-mono mr-1 mb-1">
                      {arch}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-500 italic">Procedural / Standard</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1.5">Submission Paradigm</p>
              <div className="space-y-1">
                {sArch.length > 0 ? (
                  sArch.map((arch: string, i: number) => (
                    <span key={i} className="inline-block px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-800 text-[11px] font-mono mr-1 mb-1">
                      {arch}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-500 italic">Procedural / Standard</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3 pt-2 border-t border-zinc-100">
            {forensics?.deviation_reasons?.architecture || "Jaccard distance across discovered paradigms (OOP, Functional, Scripting)."}
          </p>
        </div>
      </div>
    </div>
  );
}
