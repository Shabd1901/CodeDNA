"use client";

import React from "react";
import { Printer, ShieldAlert, CheckCircle, FileText, Activity } from "lucide-react";

interface ForensicDossierViewProps {
  sessionId: string | null;
  report: any;
}

export function ForensicDossierView({ sessionId, report }: ForensicDossierViewProps) {
  const dData = report?.deterministic_data;
  const authIntel = dData?.authorship_intelligence;
  const categorical = authIntel?.categorical_signals;
  const forensicReport = report?.forensic_report;
  const deviations = dData?.forensics || {};

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl p-4 shadow-sm print:hidden">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Official Forensic Case Dossier</h3>
          <p className="text-xs text-zinc-500">Formally documented case summary ready for academic board review.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Case Dossier Container */}
      <div className="bg-white border border-zinc-200 rounded-xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="border-b-2 border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
                CodeDNA Forensic Investigation Dossier
              </span>
            </div>
            <h1 className="text-2xl font-black text-zinc-950">Student Code Authorship Audit Report</h1>
            <p className="text-xs text-zinc-500 mt-1 font-mono">Case ID: {sessionId || "N/A"}</p>
          </div>
          <div className="sm:text-right font-mono text-xs text-zinc-600">
            <p><strong>Generated:</strong> {currentDate}</p>
            <p><strong>Engine:</strong> CodeDNA (Hybrid Forensic)</p>
            <p className="mt-1">
              <strong>Status:</strong>{" "}
              <span className="uppercase font-bold text-zinc-900">
                {categorical?.overall_investigation_concern || "EVALUATED"}
              </span>
            </p>
          </div>
        </div>

        {/* Executive Forensic Summary */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">1. Executive Forensic Synthesis</h2>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-xs leading-relaxed text-zinc-800 font-medium">
            {forensicReport?.executive_forensic_summary || (
              dData?.authorship_intelligence?.concern_reason || 
              "Deterministic analysis completed. Behavioral signatures and syntactic AST features were cross-referenced against historical baseline repositories."
            )}
          </div>
        </div>

        {/* Core Case Metrics Matrix */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">2. Authorship Intelligence Matrix</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Baseline Reliability</p>
              <p className="text-lg font-bold text-zinc-900 mt-0.5">
                {Math.round(authIntel?.evidence_confidence_score || 0)}%
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">{categorical?.baseline_reliability} Confidence</p>
            </div>

            <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">CodeDNA Consistency</p>
              <p className="text-lg font-bold text-zinc-900 mt-0.5">
                {Math.round(authIntel?.historical_codedna_similarity || 0)}%
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">Multi-vector match</p>
            </div>

            <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Structural Deviation</p>
              <p className="text-lg font-bold text-zinc-900 mt-0.5">
                {Math.round(deviations?.structural_deviation || 0)}%
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">AST node disparity</p>
            </div>

            <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">AI Author Profile</p>
              <p className="text-sm font-bold text-zinc-900 mt-1 truncate">
                {authIntel?.ai_author_profile || "Standard"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">Profile Diagnosis</p>
            </div>
          </div>
        </div>

        {/* 10-Vector Mathematical Deviation Ranking */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">3. Deviation Vector Breakdown</h2>
          <table className="w-full text-left text-xs border border-zinc-200 rounded-lg overflow-hidden">
            <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3">Vector Dimension</th>
                <th className="py-2.5 px-3">Deviation Score</th>
                <th className="py-2.5 px-3">Observed Shift Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-2 px-3 font-medium text-zinc-900">Structural AST Shift</td>
                <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.structural_deviation || 0)}%</td>
                <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.structural || "AST pattern divergence"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-zinc-900">Stylistic & Naming</td>
                <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.naming_deviation || 0)}%</td>
                <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.naming || "Identifier convention drift"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-zinc-900">Cyclomatic Complexity</td>
                <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.complexity_deviation || 0)}%</td>
                <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.complexity || "Branch & nesting complexity shift"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-zinc-900">Dependency Discontinuity</td>
                <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.dependency_deviation || 0)}%</td>
                <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.dependency || "Novel library imports"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-zinc-900">Architectural Paradigm</td>
                <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.architecture_deviation || 0)}%</td>
                <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.architecture || "Paradigm shift"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Flagged Suspicious Regions */}
        {deviations.exact_suspicious_regions_lines && deviations.exact_suspicious_regions_lines.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">4. Specific Suspicious Code Regions</h2>
            <div className="space-y-2 text-xs">
              {deviations.exact_suspicious_regions_lines.map((reg: any, i: number) => (
                <div key={i} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-zinc-900">{reg.file}</span>
                    <span className="text-zinc-500 font-mono ml-2">(Line {reg.line})</span>
                    <p className="text-zinc-700 mt-1">{reg.reason}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-semibold shrink-0">
                    AST Outlier
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VivaGuard Recommended Inquiries */}
        {forensicReport?.optional_vivaguard_questions && forensicReport.optional_vivaguard_questions.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">5. VivaGuard Oral Examination Script</h2>
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 text-xs">
              {forensicReport.optional_vivaguard_questions.map((q: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-zinc-800">
                  <span className="font-mono font-bold text-zinc-600">{i + 1}.</span>
                  <p>{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign-off footer */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400 font-mono gap-4">
          <p>Confidential Academic Integrity Dossier</p>
          <div className="flex gap-8">
            <span className="border-t border-zinc-300 pt-1">Evaluator Signature</span>
            <span className="border-t border-zinc-300 pt-1">Date Reviewed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
