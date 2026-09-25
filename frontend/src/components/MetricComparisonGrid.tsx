"use client";

import React from "react";
import { GitCompare, Box, Layers, Cpu, ArrowUpRight, Check, AlertCircle } from "lucide-react";

interface MetricComparisonGridProps {
  baselineMetrics: any;
  submissionMetrics: any;
  forensics: any;
}

export function MetricComparisonGrid({
  baselineMetrics,
  submissionMetrics,
  forensics,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Naming Convention Comparator */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span>Naming Conventions Breakdown</span>
            </h4>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              Dev: {Math.round(forensics?.naming_deviation || 0)}%
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
              Dev: {Math.round(forensics?.complexity_deviation || 0)}%
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
            </h4>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              Dev: {Math.round(forensics?.dependency_deviation || 0)}%
            </span>
          </div>

          <div className="text-xs space-y-3">
            <div>
              <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1.5">
                New External Libraries Introduced ({newDeps.length})
              </p>
              {newDeps.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
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
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {bDeps.slice(0, 15).map((dep: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]">
                    {dep}
                  </span>
                ))}
                {bDeps.length > 15 && <span className="text-[10px] text-zinc-400">+{bDeps.length - 15} more</span>}
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
              Dev: {Math.round(forensics?.architecture_deviation || 0)}%
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
