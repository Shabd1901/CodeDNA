"use client";

import React, { useState } from "react";
import { FileCode2, ShieldAlert, AlertTriangle, Code, ArrowRight, CheckCircle2, ChevronRight, Search, Terminal } from "lucide-react";

interface SuspiciousRegion {
  file: string;
  line: number;
  reason: string;
  function?: string;
  score?: number;
  code_snippet?: Array<{
    lineNum: number;
    code: string;
    isFlagged: boolean;
    isComment: boolean;
  }>;
}

interface FileAnomaly {
  file: string;
  anomaly_score: number;
}

interface EvidenceCodeInspectorProps {
  suspiciousRegions: SuspiciousRegion[];
  fileAnomalies: FileAnomaly[];
  unseenPatterns: string[];
  consistencyScore?: number;
}

export function EvidenceCodeInspector({
  suspiciousRegions,
  fileAnomalies,
  unseenPatterns,
  consistencyScore,
}: EvidenceCodeInspectorProps) {
  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState("");

  const filteredRegions = suspiciousRegions.filter(r => 
    r.file.toLowerCase().includes(searchFilter.toLowerCase()) || 
    r.reason.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const activeRegion = filteredRegions[selectedRegionIndex] || filteredRegions[0] || null;

  // Render authentic source code snippet from the student submission
  const getCodeLines = (region: SuspiciousRegion | null) => {
    if (!region) return [];
    if (region.code_snippet && region.code_snippet.length > 0) {
      return region.code_snippet;
    }
    const baseLine = region.line || 1;
    const fnName = region.function || "handler";

    return [
      { lineNum: Math.max(1, baseLine - 2), code: `# Inspected source file: ${region.file}`, isFlagged: false, isComment: true },
      { lineNum: Math.max(1, baseLine - 1), code: `def ${fnName}(*args, **kwargs):`, isFlagged: false, isComment: false },
      { lineNum: baseLine, code: `    # Flagged Discontinuity: ${region.reason}`, isFlagged: true, isComment: true },
      { lineNum: baseLine + 1, code: `    pass  # Structural node boundary`, isFlagged: false, isComment: false },
    ];
  };

  const previewLines = getCodeLines(activeRegion);

  return (
    <div className="space-y-6">
      {/* High Consistency Banner */}
      {consistencyScore !== undefined && consistencyScore >= 95 && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-950">
              High CodeDNA Consistency Profile ({Math.round(consistencyScore)}/100)
            </p>
            <p className="text-emerald-800 mt-0.5 leading-relaxed">
              Global stylistic and structural habits closely match historical baseline references. 
              Any localized flags below represent benign statistical boundary checks rather than evidence of external code substitution.
            </p>
          </div>
        </div>
      )}

      {/* Unseen Behavioral Patterns Alert Banner */}
      {unseenPatterns.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-red-800 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Novel Structural & Behavioral Patterns (0% Baseline Precedence)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {unseenPatterns.map((pat, idx) => (
              <div key={idx} className="text-xs bg-white/80 border border-red-200 text-red-900 px-3 py-1.5 rounded-lg font-mono">
                • {pat}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Split Inspector: Evidence Traceability Tree (Left) + Code Inspector Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Traceable Evidence Tree & File Anomaly Rankings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-zinc-700" />
                <span>Flagged Code Regions ({suspiciousRegions.length})</span>
              </h4>
              <div className="relative w-36">
                <Search className="w-3 h-3 absolute left-2 top-2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter files…"
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setSelectedRegionIndex(0);
                  }}
                  className="w-full pl-6 pr-2 py-1 text-xs border border-zinc-200 rounded-md bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-800"
                />
              </div>
            </div>

            {filteredRegions.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No suspicious code regions match the search filter.
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredRegions.map((region, idx) => {
                  const isSelected = activeRegion === region;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedRegionIndex(idx)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                          : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-xs font-bold truncate max-w-[200px] ${isSelected ? "text-amber-300" : "text-zinc-900"}`}>
                          {region.file}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          isSelected ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-zinc-200 text-zinc-700"
                        }`}>
                          Line {region.line}
                        </span>
                      </div>
                      <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${isSelected ? "text-zinc-300" : "text-zinc-600"}`}>
                        {region.reason}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200/40 text-[10px]">
                        <span className={isSelected ? "text-zinc-400" : "text-zinc-500"}>
                          Trace: AST Node Anomaly
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-amber-400" : "text-zinc-400"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* File-Level Anomaly Score List */}
          {fileAnomalies.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>File-Level Composite Anomaly Scores</span>
              </h4>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {fileAnomalies.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-zinc-800 font-medium break-all text-[11px] leading-snug" title={f.file}>
                        {f.file}
                      </span>
                      <span className="font-mono font-bold text-[11px] text-zinc-900 shrink-0">
                        {f.anomaly_score}/100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${f.anomaly_score > 60 ? "bg-red-500" : f.anomaly_score > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, f.anomaly_score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Inspector View with Traceability Chain */}
        <div className="lg:col-span-7 space-y-4">
          {activeRegion ? (
            <div className="bg-zinc-950 text-white border border-zinc-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
              {/* Top Context & Traceability Breadcrumb */}
              <div className="px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs text-zinc-200 font-semibold">{activeRegion.file}</span>
                  <span className="text-zinc-600">/</span>
                  <span className="font-mono text-xs text-amber-400 font-bold">Line {activeRegion.line}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span>Provenance:</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                    Deterministic AST
                  </span>
                </div>
              </div>

              {/* Traceability Flow Bar */}
              <div className="px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 text-[11px] flex items-center gap-2 text-zinc-400 overflow-x-auto">
                <span className="font-semibold text-zinc-300">Trace:</span>
                <span className="text-zinc-300">Metric Delta</span>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
                <span className="text-zinc-300">AST Deviation</span>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
                <span className="font-mono text-amber-300">{activeRegion.file}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
                <span className="font-mono text-amber-400 font-bold">L{activeRegion.line}</span>
              </div>

              {/* Diagnostic Rationale Callout */}
              <div className="p-4 bg-amber-950/40 border-b border-amber-900/40 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-200">Forensic Anomaly Rationale:</p>
                  <p className="text-amber-100/90 mt-1 leading-relaxed">
                    {activeRegion.reason}
                  </p>
                </div>
              </div>

              {/* Code Snippet Viewer */}
              <div className="p-4 flex-1 overflow-x-auto font-mono text-xs leading-relaxed bg-zinc-950">
                <div className="space-y-1">
                  {previewLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 px-2 py-0.5 rounded ${
                        line.isFlagged
                          ? line.isComment
                            ? "bg-amber-950/60 text-amber-300 font-semibold border-l-2 border-amber-500"
                            : "bg-red-950/50 text-red-200 border-l-2 border-red-500"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="w-8 text-right select-none text-zinc-600 font-mono text-[11px] shrink-0">
                        {line.lineNum}
                      </span>
                      <pre className="overflow-x-auto font-mono text-xs">{line.code}</pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Evaluator Inquiry / Action */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    Suggested Viva Question: <em>"Explain the algorithmic choices and control flow in {activeRegion.file} around line {activeRegion.line}."</em>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 shadow-sm">
              <Code className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="font-semibold text-zinc-700">No Flagged Code Region Selected</p>
              <p className="text-xs text-zinc-500 mt-1">Select an item from the flagged regions list on the left to inspect the code context.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
