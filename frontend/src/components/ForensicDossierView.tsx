"use client";

import React, { useState } from "react";
import { Printer, ShieldAlert, CheckCircle, FileText, FileCheck, Layers, Terminal } from "lucide-react";

interface ForensicDossierViewProps {
  sessionId: string | null;
  report: any;
  submissionFileName?: string;
  initialMode?: "simple" | "extended";
}

export function ForensicDossierView({ 
  sessionId, 
  report, 
  submissionFileName = "Target Submission Archive",
  initialMode = "simple"
}: ForensicDossierViewProps) {
  const [mode, setMode] = useState<"simple" | "extended">(initialMode);
  
  const dData = report?.deterministic_data;
  const authIntel = dData?.authorship_intelligence;
  const categorical = authIntel?.categorical_signals;
  const forensicReport = report?.forensic_report;
  const deviations = dData?.forensics || {};
  const baselineMetrics = dData?.baseline_metrics;
  const mlIntel = dData?.ml_intelligence;

  const handlePrint = (printMode?: "simple" | "extended") => {
    if (printMode && printMode !== mode) {
      setMode(printMode);
      setTimeout(() => window.print(), 100);
    } else {
      window.print();
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Top Action & Mode Selector Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm print:hidden">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Official Forensic Case Dossier</h3>
          <p className="text-xs text-zinc-500">
            {mode === "simple" 
              ? "Compact Executive Brief designed for initial board review." 
              : "Full Extended Investigation Report containing all vector metrics, AST traces & AI findings."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex p-0.5 bg-zinc-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("simple")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === "simple"
                  ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Simple Summary
            </button>
            <button
              type="button"
              onClick={() => setMode("extended")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === "extended"
                  ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Extended Dossier
            </button>
          </div>

          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Case Dossier Container (A4 Proportioned Document Canvas) */}
      <div className="max-w-[210mm] mx-auto min-h-[297mm] bg-white border border-zinc-200 rounded-xl p-8 sm:p-[20mm] shadow-md space-y-8 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-0 print:rounded-none">
        {/* Header */}
        <div className="border-b-2 border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
                CodeDNA Forensic Investigation Dossier • {mode === "simple" ? "Executive Summary" : "Full Extended Audit"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-zinc-950">Student Code Authorship Audit Report</h1>
            <div className="mt-2 space-y-0.5 text-xs text-zinc-600 font-mono">
              <p><strong>Evaluated Archive:</strong> <span className="text-zinc-900 font-bold">{submissionFileName}</span></p>
              <p><strong>Case ID:</strong> {sessionId || "N/A"}</p>
            </div>
          </div>
          <div className="sm:text-right font-mono text-xs text-zinc-600">
            <p><strong>Generated:</strong> {currentDate}</p>
            <p className="mt-1">
              <strong>Status:</strong>{" "}
              <span className="uppercase font-bold text-zinc-900">
                {categorical?.overall_investigation_concern || "EVALUATED"}
              </span>
            </p>
          </div>
        </div>

        {/* 1. Executive Forensic Synthesis */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">1. Executive Forensic Synthesis</h2>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-xs leading-relaxed text-zinc-800 font-medium">
            {forensicReport?.executive_forensic_summary || (
              dData?.authorship_intelligence?.concern_reason || 
              "Deterministic analysis completed. Behavioral signatures and syntactic AST features were cross-referenced against historical baseline repositories."
            )}
          </div>
        </div>

        {/* 2. Core Case Metrics Matrix */}
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

        {/* 3. EXTENDED SECTION: Baseline DNA & Corpus Profile (Points & Subpoints) */}
        {mode === "extended" && (
          <div className="print-break-inside-avoid space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Baseline DNA Profile &amp; Corpus Metrics
            </h2>

            {/* 3.1 Corpus Metrics */}
            <div className="bg-zinc-50/80 border border-zinc-200 rounded-lg p-3.5 space-y-2 text-xs">
              <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                <span className="font-mono text-zinc-400">3.1</span>
                <span>Corpus Metrics &amp; Dataset Quality</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Usable Files Analyzed</span>
                  <span className="text-sm font-bold text-zinc-900">{baselineMetrics?.usable_files_count || baselineMetrics?.repo_count_usable_files_languages?.usable_files || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Reference LOC</span>
                  <span className="text-sm font-bold text-zinc-900">{baselineMetrics?.total_loc || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Baseline Reliability</span>
                  <span className="text-sm font-bold text-zinc-900">{Math.round(authIntel?.evidence_confidence_score || 0)}% ({categorical?.baseline_reliability})</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Contamination Risk</span>
                  <span className="text-sm font-bold text-zinc-900">{authIntel?.baseline_contamination_risk || "Low"}</span>
                </div>
              </div>
            </div>

            {/* 3.2 Historical Complexity & Distribution */}
            <div className="bg-zinc-50/80 border border-zinc-200 rounded-lg p-3.5 space-y-2 text-xs">
              <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                <span className="font-mono text-zinc-400">3.2</span>
                <span>Historical Complexity &amp; Scale Invariants</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Cyclomatic (Mean)</span>
                  <span className="text-sm font-bold text-zinc-900 font-mono">{Number(baselineMetrics?.complexity_distribution?.mean || 0).toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Cyclomatic (P90)</span>
                  <span className="text-sm font-bold text-zinc-900 font-mono">{Number(baselineMetrics?.complexity_distribution?.p90 || 0).toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">LOC per File (Mean)</span>
                  <span className="text-sm font-bold text-zinc-900 font-mono">{Number(baselineMetrics?.loc_distribution?.mean || 0).toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">LOC per File (P90)</span>
                  <span className="text-sm font-bold text-zinc-900 font-mono">{Number(baselineMetrics?.loc_distribution?.p90 || 0).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* 3.3 Lexical & Architecture Preferences */}
            <div className="bg-zinc-50/80 border border-zinc-200 rounded-lg p-3.5 space-y-2 text-xs">
              <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                <span className="font-mono text-zinc-400">3.3</span>
                <span>Lexical Habits &amp; Architectural Paradigms</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">Dominant Architecture</span>
                  <span className="text-xs font-semibold text-zinc-800">
                    {baselineMetrics?.architecture_fingerprint?.join(", ") || "Standard Monolith / Procedural"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">Dominant Naming Conventions</span>
                  <span className="text-xs font-semibold text-zinc-800">
                    {baselineMetrics?.dominant_naming || "Consistent style"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Deviation Vector Breakdown Table */}
        <div className="print-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            {mode === "extended" ? "4. Metric Comparison & 10-Vector Deviation Analysis" : "3. Deviation Vector Summary"}
          </h2>
          <table className="w-full text-left text-xs border border-zinc-200 rounded-lg overflow-hidden">
            <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2 px-3">Vector Dimension</th>
                <th className="py-2 px-3">Deviation Score</th>
                <th className="py-2 px-3">Observed Shift Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-2 px-3 font-medium text-zinc-900">Structural AST Shift</td>
                <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.structural_deviation || 0)}%</td>
                <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.structural || "AST pattern divergence"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-zinc-900">Stylistic &amp; Naming</td>
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
              {mode === "extended" && (
                <>
                  <tr>
                    <td className="py-2 px-3 font-medium text-zinc-900">Formatting Hygiene</td>
                    <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.formatting_deviation || 0)}%</td>
                    <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.formatting || "Whitespace and indentation consistency"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-zinc-900">Abstraction Level</td>
                    <td className="py-2 px-3 font-mono font-bold text-zinc-800">{Math.round(deviations.abstraction_deviation || 0)}%</td>
                    <td className="py-2 px-3 text-zinc-600">{deviations.deviation_reasons?.abstraction || "Type hints and OOP abstraction shifts"}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. EXTENDED SECTION: File-Level Anomaly Breakdown */}
        {mode === "extended" && deviations.per_file_anomaly_scores && deviations.per_file_anomaly_scores.length > 0 && (
          <div className="print-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">5. File-Level Composite Anomaly Scores</h2>
            <div className="border border-zinc-200 rounded-lg overflow-hidden text-xs">
              <div className="divide-y divide-zinc-200 bg-zinc-50/50">
                {deviations.per_file_anomaly_scores.slice(0, 10).map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <span className="font-mono text-zinc-800 font-medium break-all">{item.file}</span>
                    <span className="font-mono font-bold text-zinc-900 ml-4 shrink-0">Anomaly Score: {item.anomaly_score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. Specific Suspicious Regions */}
        {deviations.exact_suspicious_regions_lines && deviations.exact_suspicious_regions_lines.length > 0 && (
          <div className="print-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              {mode === "extended" ? "6. Traceable Code Evidence & Specific Flagged Regions" : "4. Specific Suspicious Code Regions"}
            </h2>
            <div className="space-y-2 text-xs">
              {deviations.exact_suspicious_regions_lines.slice(0, mode === "simple" ? 3 : 8).map((reg: any, i: number) => (
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

        {/* 7. EXTENDED SECTION: ML Probabilistic Calibration */}
        {mode === "extended" && mlIntel?.statistical_calibration && (
          <div className="print-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              7. Machine Learning &amp; Probabilistic Calibration
            </h2>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Substitution Probability</span>
                <span className="text-base font-bold text-indigo-950 font-mono">
                  {Math.round(mlIntel.statistical_calibration.calibrated_probability * 100)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">95% Confidence Interval</span>
                <span className="text-xs font-mono font-semibold text-zinc-800">
                  [{Math.round(mlIntel.statistical_calibration.confidence_interval_95.lower * 100)}% – {Math.round(mlIntel.statistical_calibration.confidence_interval_95.upper * 100)}%]
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Calibrated Risk Tier</span>
                <span className="text-xs font-bold uppercase text-zinc-900">
                  {mlIntel.statistical_calibration.risk_tier}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Siamese Latent Distance</span>
                <span className="text-sm font-mono font-bold text-zinc-900">
                  {Number(mlIntel.latent_embedding?.cosine_distance || 0).toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 8. EXTENDED SECTION: Temporal Evolution & Change-Point Trajectory */}
        {mode === "extended" && dData?.temporal_intelligence && (
          <div className="print-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              8. Temporal Evolution &amp; Change-Point Trajectory
            </h2>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-bold">
                  {dData.temporal_intelligence.trajectory_diagnosis}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  Severity: {dData.temporal_intelligence.temporal_severity}
                </span>
              </div>
              <p className="text-zinc-700 leading-relaxed">
                {dData.temporal_intelligence.evaluator_temporal_narrative}
              </p>
            </div>
          </div>
        )}

        {/* 9. AI Forensic Reasoning Findings & VivaGuard Script */}
        {mode === "extended" && forensicReport && (
          <div className="print-break-inside-avoid space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              9. AI Forensic Reasoning Findings &amp; VivaGuard Script
            </h2>

            {/* 9.1 Forensic Findings */}
            {forensicReport.findings && forensicReport.findings.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                  <span className="font-mono text-zinc-400">9.1</span>
                  <span>Forensic Finding Evidentiary Breakdown</span>
                </h3>
                {forensicReport.findings.map((f: any, idx: number) => (
                  <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">{f.finding}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        f.severity === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {f.severity} severity
                      </span>
                    </div>
                    <p className="text-zinc-700"><strong>Evidence:</strong> {f.evidence}</p>
                    {f.contradictory_evidence && (
                      <p className="text-zinc-600"><strong>Contradictory Evidence:</strong> {f.contradictory_evidence}</p>
                    )}
                    {f.false_positive_considerations && (
                      <p className="text-zinc-500 italic"><strong>False-Positive Checks:</strong> {f.false_positive_considerations}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 9.2 VivaGuard Oral Defense Script */}
            {forensicReport.optional_vivaguard_questions && forensicReport.optional_vivaguard_questions.length > 0 && (
              <div className="space-y-2 pt-1">
                <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                  <span className="font-mono text-zinc-400">9.2</span>
                  <span>VivaGuard Oral Examination Script</span>
                </h3>
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5 text-xs">
                  {forensicReport.optional_vivaguard_questions.map((q: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-zinc-800">
                      <span className="font-mono font-bold text-zinc-600">{i + 1}.</span>
                      <p>{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. AI Forensic Reasoning (Pending State in Extended Mode) */}
        {mode === "extended" && !forensicReport && (
          <div className="print-break-inside-avoid space-y-2 p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              9. AI Forensic Reasoning Findings &amp; VivaGuard Script
            </h2>
            <p className="text-zinc-600 leading-relaxed">
              Quantitative deterministic AST deviations and Siamese neural distances have been compiled above. To append qualitative Gemini Flash findings, counter-evidence reasoning, and the VivaGuard oral defense script, trigger <strong>Run AI Analysis</strong> in the workstation navigation bar.
            </p>
          </div>
        )}

        {/* Simple Mode VivaGuard (if in simple mode) */}
        {mode === "simple" && forensicReport?.optional_vivaguard_questions && forensicReport.optional_vivaguard_questions.length > 0 && (
          <div className="print-break-inside-avoid">
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

        {/* 10. Case Verification Sign-Off & Footer (Appended naturally to end of content, blank lines for signing) */}
        <div className="print-break-inside-avoid pt-8 border-t-2 border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-zinc-600 font-mono gap-6">
          <div>
            <p className="font-bold text-zinc-900">CONFIDENTIAL ACADEMIC INTEGRITY AUDIT DOSSIER</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">CodeDNA Cryptographic Integrity Verification Protocol</p>
          </div>
          <div className="flex gap-10 sm:text-right">
            <div>
              <div className="w-44 border-b border-zinc-400 h-8 mb-1"></div>
              <span className="text-[10px] text-zinc-400 block text-center font-sans uppercase tracking-wider">
                Evaluator Signature
              </span>
            </div>
            <div>
              <div className="w-36 border-b border-zinc-400 h-8 mb-1"></div>
              <span className="text-[10px] text-zinc-400 block text-center font-sans uppercase tracking-wider">
                Date Reviewed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
