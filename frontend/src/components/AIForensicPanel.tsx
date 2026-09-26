"use client";

import React, { useState } from "react";
import { Sparkles, ShieldAlert, CheckCircle2, Copy, Check, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

interface Finding {
  finding: string;
  severity: "high" | "medium" | "low" | string;
  evidence: string;
  why_deviation_matters: string;
  false_positive_considerations?: string;
  contradictory_evidence?: string;
  exact_suspicious_regions_lines?: string[];
  recommended_evaluator_action: string;
}

interface ForensicReport {
  executive_forensic_summary?: string;
  findings?: Finding[];
  optional_vivaguard_questions?: string[];
}

interface AIForensicPanelProps {
  forensicReport: ForensicReport | null;
  aiLoading: boolean;
  aiMode: string | null;
  sessionId: string | null;
  onRunAi: () => void;
}

export function AIForensicPanel({
  forensicReport,
  aiLoading,
  aiMode,
  sessionId,
  onRunAi,
}: AIForensicPanelProps) {
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  const copyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Google Gemini Flash Forensic Intelligence</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Generates evidence-weighted reasoning, evaluates counter-evidence & false positives, and crafts viva questions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {aiMode && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
              {aiMode.toLowerCase().includes("gemini") ? "Google Gemini Flash" : aiMode}
            </span>
          )}
          <button
            onClick={onRunAi}
            disabled={!sessionId || aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Forensic Matrix…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{forensicReport ? "Re-run AI Analysis" : "Generate Forensic Reasoning"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {aiLoading && (
        <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full border-3 border-zinc-200 border-t-zinc-900 animate-spin mx-auto mb-4" />
          <h4 className="text-base font-bold text-zinc-900">Performing Multi-Vector AI Forensic Synthesis</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Gemini Flash is synthesizing AST metrics, style vectors, and false-positive guardrails into a structured diagnostic narrative…
          </p>
        </div>
      )}

      {!aiLoading && !forensicReport && (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl p-10 text-center">
          <Sparkles className="w-9 h-9 text-zinc-400 mx-auto mb-2.5" />
          <h4 className="text-sm font-bold text-zinc-800 flex items-center justify-center gap-1.5">
            <span>AI Forensic Reasoning Engine</span>
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Deterministic AST and ML deviation analysis is complete. Click below to execute Google Gemini Flash multi-vector forensic reasoning.
          </p>
          <div className="mt-4">
            <button
              onClick={onRunAi}
              disabled={!sessionId || aiLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generate Gemini Flash Reasoning</span>
            </button>
          </div>
        </div>
      )}

      {!aiLoading && forensicReport && (
        <div className="space-y-6">
          {/* Executive Forensic Summary */}
          {forensicReport.executive_forensic_summary && (
            <div className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-sky-50/90 border border-indigo-200/90 rounded-xl p-6 shadow-xs text-zinc-900">
              <div className="flex items-center gap-2 mb-2 text-indigo-800 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Executive Investigation Brief</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-800 font-medium">
                {forensicReport.executive_forensic_summary}
              </p>
            </div>
          )}

          {/* Forensic Findings */}
          {Array.isArray(forensicReport.findings) && forensicReport.findings.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Corroborated Forensic Findings ({forensicReport.findings.length})
              </h4>

              <div className="space-y-4">
                {forensicReport.findings.map((finding, idx) => {
                  const isHigh = finding.severity?.toLowerCase() === "high";
                  const isMedium = finding.severity?.toLowerCase() === "medium";

                  return (
                    <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isHigh ? "bg-red-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`} />
                          <h5 className="font-bold text-zinc-900 text-base">{finding.finding}</h5>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md tracking-wider border ${
                            isHigh
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isMedium
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {finding.severity} Severity
                        </span>
                      </div>

                      {/* Evidence & Why it matters */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-xs">
                        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                          <p className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider mb-1">Concrete Evidence</p>
                          <p className="text-zinc-700 leading-relaxed">{finding.evidence}</p>
                        </div>
                        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                          <p className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider mb-1">Why Deviation Matters</p>
                          <p className="text-zinc-700 leading-relaxed">{finding.why_deviation_matters}</p>
                        </div>
                      </div>

                      {/* Counter-Evidence & False-Positive Guardrails */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-xs">
                        <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80">
                          <p className="font-bold text-amber-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>False-Positive Considerations</span>
                          </p>
                          <p className="text-amber-900/90 leading-relaxed">
                            {finding.false_positive_considerations || "Standard framework variance considered."}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/80">
                          <p className="font-bold text-blue-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Contradictory Evidence</span>
                          </p>
                          <p className="text-blue-900/90 leading-relaxed">
                            {finding.contradictory_evidence || "No strong contradictory signals observed."}
                          </p>
                        </div>
                      </div>

                      {/* Affected Lines */}
                      {finding.exact_suspicious_regions_lines && finding.exact_suspicious_regions_lines.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Affected File / Line References</p>
                          <div className="flex flex-wrap gap-1.5">
                            {finding.exact_suspicious_regions_lines.map((line, lIdx) => (
                              <span key={lIdx} className="text-xs font-mono bg-zinc-900 text-zinc-100 px-2 py-0.5 rounded border border-zinc-800">
                                {line}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action */}
                      <div className="pt-3 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-indigo-700">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Action: {finding.recommended_evaluator_action}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VivaGuard Strategy */}
          {forensicReport.optional_vivaguard_questions && forensicReport.optional_vivaguard_questions.length > 0 && (
            <div className="bg-indigo-950 text-white border border-indigo-900 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold tracking-wide uppercase">VivaGuard Interview Strategy Protocol</h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-800">
                  {forensicReport.optional_vivaguard_questions.length} Probing Inquiries
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mb-4 leading-relaxed">
                Objective viva questions tailored to test the student&apos;s conceptual authorship regarding the specific anomalous code constructs flagged.
              </p>

              <div className="space-y-2.5">
                {forensicReport.optional_vivaguard_questions.map((q, qIdx) => (
                  <div key={qIdx} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-indigo-900/60 border border-indigo-800 text-xs text-indigo-100">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono font-bold text-indigo-300 mt-0.5">{qIdx + 1}.</span>
                      <p className="leading-relaxed">{q}</p>
                    </div>
                    <button
                      onClick={() => copyQuestion(q, qIdx)}
                      className="p-1.5 rounded hover:bg-indigo-800 text-indigo-300 hover:text-white transition-colors shrink-0"
                      title="Copy question text"
                    >
                      {copiedQuestionIndex === qIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
