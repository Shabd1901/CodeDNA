"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Search, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle, 
  Activity, 
  FileCode2, 
  ChevronRight, 
  FileArchive, 
  User, 
  Sparkles,
  ArrowRight,
  Sliders,
  AlertTriangle,
  FolderGit2,
  Trash2,
  X
} from "lucide-react";

import { PipelineNav, PipelineStage } from "@/components/PipelineNav";
import { PersistentInvestigationContext } from "@/components/PersistentInvestigationContext";
import { RadarDeviationChart } from "@/components/RadarDeviationChart";
import { MetricComparisonGrid } from "@/components/MetricComparisonGrid";
import { EvidenceCodeInspector } from "@/components/EvidenceCodeInspector";
import { AIForensicPanel } from "@/components/AIForensicPanel";
import { ForensicDossierView } from "@/components/ForensicDossierView";
import { BaselineProfileView } from "@/components/BaselineProfileView";
import { MLIntelligenceView } from "@/components/MLIntelligenceView";
import { TemporalEvolutionView } from "@/components/TemporalEvolutionView";
import { BenchmarkSuiteView } from "@/components/BenchmarkSuiteView";
import { InfoHelper } from "@/components/InfoTooltipModal";
import { CodeDNALogo } from "@/components/CodeDNALogo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function Home() {
  const [appState, setAppState] = useState<"idle" | "analyzing" | "results" | "eval_lab">("idle");
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("overview");

  // Form State
  // Form State - Multiple GitHub Profiles with Real-Time Typo Validation
  const [githubLinks, setGithubLinks] = useState<string[]>([""]);

  const validateGithubUrl = (input: string): { isValid: boolean; warning?: string } => {
    const trimmed = input.trim();
    if (!trimmed) return { isValid: true };
    const lower = trimmed.toLowerCase();
    if (lower.includes("githuub") || lower.includes("gthub") || lower.includes("githhub") || lower.includes("githup") || lower.includes("githud")) {
      return { isValid: false, warning: "Typo in domain? Did you mean github.com?" };
    }
    if (lower.includes(" ")) {
      return { isValid: false, warning: "Username/URL must not contain spaces." };
    }
    if (lower.startsWith("http://") || lower.startsWith("https://")) {
      if (!lower.includes("github.com/")) {
        return { isValid: false, warning: "Expected github.com URL (e.g. https://github.com/username)." };
      }
      const afterDomain = trimmed.split(/github\.com\//i)[1]?.split("/").filter(Boolean);
      if (!afterDomain || afterDomain.length === 0) {
        return { isValid: false, warning: "Please include a GitHub username after github.com/" };
      }
    } else {
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return { isValid: false, warning: "Contains invalid characters for a GitHub handle." };
      }
    }
    return { isValid: true };
  };

  const handleAddGithubLink = () => {
    setGithubLinks((prev) => [...prev, ""]);
  };

  const handleUpdateGithubLink = (index: number, val: string) => {
    setGithubLinks((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveGithubLink = (index: number) => {
    setGithubLinks((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [""]));
  };

  const [repoFiles, setRepoFiles] = useState<FileList | null>(null);
  const [stagedBaselineList, setStagedBaselineList] = useState<File[]>([]);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [cohortFile, setCohortFile] = useState<File | null>(null);

  const handleAddBaselineFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const added = Array.from(newFiles);
    setStagedBaselineList((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filteredNew = added.filter((f) => !existingNames.has(f.name));
      return [...prev, ...filteredNew];
    });
  };

  const handleRemoveBaselineFile = (index: number) => {
    setStagedBaselineList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllBaselineFiles = () => {
    setStagedBaselineList([]);
    setRepoFiles(null);
  };
  const [cohortOrganization, setCohortOrganization] = useState("");
  const [cohortAssignmentPrefix, setCohortAssignmentPrefix] = useState("");
  // Selected baseline tab for UI
  const [selectedBaselineTab, setSelectedBaselineTab] = useState<number>(0); // 0: Single Student, 1: Master Class, 2: Course Starter Template

  // Results State
  const [report, setReport] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [errorNotice, setErrorNotice] = useState<{ title: string; detail: string; isRateLimit?: boolean } | null>(null);
  // Alternative baseline comparison for dashboard metrics when both baselines are available
  const [alternativeReport, setAlternativeReport] = useState<any>(null);
  const [dossierExportMode, setDossierExportMode] = useState<"simple" | "extended">("simple");

  // Progress tracking
  const [analysisStep, setAnalysisStep] = useState(0);
  const STEPS = [
    { label: "Starting session",        detail: "Initialising secure forensic session on server…" },
    { label: "Uploading baseline",      detail: "Transferring baseline repositories to analysis engine…" },
    { label: "Uploading submission",    detail: "Uploading new submission ZIP for comparison…" },
    { label: "Uploading template",      detail: "Processing starter code for template subtraction…" },
    { label: "Running comparison",      detail: "Calculating 10-vector deviation scores against baseline…" },
  ];

  // Browser History & Back-Button Navigation Sync
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.appState) {
        setAppState(e.state.appState);
        if (e.state.pipelineStage) {
          setPipelineStage(e.state.pipelineStage);
        }
      } else {
        setAppState("idle");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNewInvestigation = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/api/session/${sessionId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to clean up session on server:", err);
      }
    }
    setGithubLinks([""]);
    setRepoFiles(null);
    setSubmissionFile(null);
    setTemplateFile(null);
    setCohortFile(null);
    setCohortOrganization("");
    setCohortAssignmentPrefix("");
    setReport(null);
    setSessionId(null);
    setAiMode(null);
    setErrorNotice(null);
    setPipelineStage("overview");
    setResetKey((prev) => prev + 1);
    setAppState("idle");
  };

  const startAnalysis = async () => {
    if (!submissionFile) return;

    const baselineUploadList = stagedBaselineList.length > 0 ? stagedBaselineList : (repoFiles ? Array.from(repoFiles) : []);
    const validGithubLinks = githubLinks.filter((l) => l.trim().length > 0);
    const hasPersonalData = validGithubLinks.length > 0 || baselineUploadList.length > 0;
    const hasCohortData = (selectedBaselineTab === 1 && !!cohortFile) ||
                         (selectedBaselineTab === 2 && !!cohortOrganization && !!cohortAssignmentPrefix);

    // For cohort tabs, validate specific data is present; cohort can run without personal baselines
    if (selectedBaselineTab === 1 && !hasCohortData) return;
    if (selectedBaselineTab === 2 && !hasCohortData) return;
    if (selectedBaselineTab === 0 && !hasPersonalData) return;

    setAppState("analyzing");
    setReport(null);
    setAlternativeReport(null);
    setAiMode(null);
    setErrorNotice(null);
    setPipelineStage("overview");
    setAnalysisStep(0);

    try {
      // Build Atomic Unified Payload for Serverless Stability
      const formData = new FormData();
      formData.append("submission", submissionFile);
      formData.append("baseline_type", selectedBaselineTab === 0 ? "personal" : "cohort");

      if (templateFile) {
        formData.append("template_file", templateFile);
      }

      if (selectedBaselineTab === 0) {
        for (const file of baselineUploadList) {
          formData.append("baseline_files", file);
        }
        const usernames = validGithubLinks
          .map((link) => {
            let u = link.trim();
            if (u.includes("github.com/")) {
              const parts = u.split(/github\.com\//i)[1]?.split("/").filter(Boolean);
              if (parts && parts.length > 0) u = parts[0];
            }
            return u;
          })
          .filter(Boolean);
        if (usernames.length > 0) {
          formData.append("github_usernames", usernames.join(","));
        }
      } else if (selectedBaselineTab === 1) {
        if (!cohortFile) throw { title: "Missing Cohort File", detail: "Please select a cohort ZIP file." };
        formData.append("cohort_file", cohortFile);
      } else if (selectedBaselineTab === 2) {
        if (!cohortOrganization || !cohortAssignmentPrefix) {
          throw { title: "Missing GitHub Classroom Info", detail: "Please provide organization and assignment prefix." };
        }
        formData.append("cohort_org", cohortOrganization);
        formData.append("cohort_prefix", cohortAssignmentPrefix);
      }

      // Smooth forward step animation while request runs in flight (no cyclical looping)
      let currentStep = 0;
      setAnalysisStep(0);
      const stepInterval = setInterval(() => {
        if (currentStep < 3) {
          currentStep += 1;
          setAnalysisStep(currentStep);
        }
      }, 500);

      let res: Response;
      try {
        res = await fetch(`${API_BASE}/api/analyze/direct`, {
          method: "POST",
          body: formData,
        });
      } finally {
        clearInterval(stepInterval);
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Analysis failed." }));
        throw { title: "CodeDNA Comparison Error", detail: errData.detail || "Static metric comparison failed." };
      }

      const data = await res.json();
      setAnalysisStep(4);
      setSessionId(data.session_id);
      setReport(data);
      setAppState("results");
    } catch (error: any) {
      console.error("Analysis execution error:", error);
      setAppState("idle");
      setSessionId(null);
      setAnalysisStep(0);
      setAlternativeReport(null);
      if (error && error.title && error.detail) {
        setErrorNotice({ title: error.title, detail: error.detail, isRateLimit: error.isRateLimit });
      } else {
        setErrorNotice({
          title: "Analysis Failure",
          detail: error?.message || `Analysis failed. Please check that the backend is running at ${API_BASE}.`,
          isRateLimit: false
        });
      }
    }
  };

  const runAiAnalysis = async () => {
    if (!sessionId) return;
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      if (report && report.deterministic_data) {
        formData.append("deterministic_data", JSON.stringify(report.deterministic_data));
      }
      const res = await fetch(`${API_BASE}/api/analyze/ai-report`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errData.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setAiMode(data.ai_mode || "Google Gemini Flash");
      setReport((prev: any) => ({ ...prev, forensic_report: data.forensic_report }));
    } catch (error: any) {
      console.error("AI Analysis Execution Error:", error);
      const msg = error?.message || "";
      const isCutoff = msg.includes("10 October 2026") || msg.includes("no longer available") || msg.includes("403");
      const isPayloadSizeLimit = msg.includes("1024KB") || msg.includes("maximum size") || msg.includes("1,024 KB") || msg.includes("exceeded");
      
      if (isCutoff) {
        setErrorNotice({
          title: "AI Forensic Analysis Unavailable",
          detail: "AI-powered forensic analysis is no longer available for this demonstration deployment. Core CodeDNA analysis remains available."
        });
      } else if (isPayloadSizeLimit) {
        setErrorNotice({
          title: "Gemini API Payload Limit Exceeded (1024 KB)",
          detail: "The Google Gemini API enforces a strict single-part payload limit of 1,024 KB (1 MB). The analysis metrics for this submission exceeded 1 MB due to large codebase size or long code snippets. Core CodeDNA static analysis (AST metrics, 8-vector radar charts, CUSUM timeline, line inspector) operates locally and remains fully operational."
        });
      } else {
        setErrorNotice({
          title: "AI Forensic Reasoning Error",
          detail: msg || "Failed to generate AI forensic reasoning. Check console for full details."
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Extract multi-vector radar metrics from report
  const getRadarMetrics = () => {
    if (!report?.deterministic_data?.forensics) return [];
    const f = report.deterministic_data.forensics;
    return [
      { key: "structural", label: "Structural AST", value: Math.round(f.structural_deviation || 0), reason: f.deviation_reasons?.structural },
      { key: "naming", label: "Naming Style", value: Math.round(f.naming_deviation || 0), reason: f.deviation_reasons?.naming },
      { key: "formatting", label: "Indentation", value: Math.round(f.formatting_deviation || 0), reason: f.deviation_reasons?.formatting },
      { key: "complexity", label: "Complexity", value: Math.round(f.complexity_deviation || 0), reason: f.deviation_reasons?.complexity },
      { key: "architecture", label: "Paradigm", value: Math.round(f.architecture_deviation || 0), reason: f.deviation_reasons?.architecture },
      { key: "dependency", label: "Dependencies", value: Math.round(f.dependency_deviation || 0), reason: f.deviation_reasons?.dependency },
      { key: "abstraction", label: "Abstraction", value: Math.round(f.abstraction_deviation || 0), reason: f.deviation_reasons?.abstraction },
      { key: "error_handling", label: "Error Handling", value: Math.round(f.error_handling_deviation || 0), reason: "Shifts in try/catch and exception granularity" },
    ];
  };

  const openEvaluationLab = () => {
    setAppState("eval_lab");
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto text-zinc-900 print:p-0 print:m-0 print:max-w-none print:min-h-0 print:w-full">
      {/* Top Application Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-200 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <CodeDNALogo size={24} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950">CodeDNA Forensic Workstation</h1>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Multi-Vector Student Code Authorship Investigation &amp; Academic Integrity Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Engine Ready
          </span>
        </div>
      </header>

      {/* Error / Rate Limit Alert */}
      {errorNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl border flex items-start gap-4 shadow-sm ${
            errorNotice.isRateLimit
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${errorNotice.isRateLimit ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <h3 className="font-bold text-sm flex items-center justify-between">
              <span>{errorNotice.title}</span>
              {errorNotice.isRateLimit && (
                <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-semibold">
                  HTTP 429
                </span>
              )}
            </h3>
            <p className="mt-1 leading-relaxed opacity-90">{errorNotice.detail}</p>
          </div>
          <button
            onClick={() => setErrorNotice(null)}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-white hover:bg-zinc-50 border text-zinc-700 shadow-sm"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Primary State Controller */}
      <AnimatePresence mode="wait">
        {appState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Evaluation Lab Quick Access Banner */}
            <div className="bg-gradient-to-r from-emerald-50/90 via-slate-50 to-indigo-50/90 border border-emerald-200/90 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-zinc-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <span>Scientific Evaluation Lab &amp; Controlled Benchmarks</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      14 Ground-Truth Scenarios
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Scientifically verify detection performance (92.9% accuracy, 0% FPR) across 14 ground-truth test scenarios without executing a manual upload.
                  </p>
                </div>
              </div>

              <button
                onClick={openEvaluationLab}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Open Evaluation Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Evaluator Quick Guide Banner */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 px-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-zinc-700">
              <div className="flex items-center gap-2.5">
                <span className="p-1 px-1.5 rounded-md bg-zinc-200 text-zinc-800 font-mono font-bold text-[10px] shrink-0">EVALUATOR TIP</span>
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Pre-configured test datasets (<span className="font-mono text-zinc-900 font-semibold">1_clean</span>, <span className="font-mono text-zinc-900 font-semibold">2_sudden_ai</span>, <span className="font-mono text-zinc-900 font-semibold">3_consistent_ai</span>, <span className="font-mono text-zinc-900 font-semibold">8_template</span>) are ready in the <code className="px-1 py-0.5 rounded bg-zinc-200/70 font-mono text-zinc-800">test_data/</code> folder with instant drop-in <code className="px-1 py-0.5 rounded bg-zinc-200/70 font-mono text-zinc-800">baseline.zip</code> and <code className="px-1 py-0.5 rounded bg-zinc-200/70 font-mono text-zinc-800">submission.zip</code> files.
                </p>
              </div>
            </div>

            {/* Stacked Vertical Intake Layout — Full Width Cards (No Side-by-Side Width Competition) */}
            <div className="space-y-5">
              {/* Card 1: Historical Reference Baseline — Full Width */}
              <div className="clean-card p-6 bg-white shadow-sm border border-zinc-200 rounded-xl">
                <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <FolderGit2 className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                      1. Historical Reference Baseline
                    </h2>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">AST Signature Matrix</span>
                </div>

                {/* Tab Selector */}
                <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl mb-4 text-xs font-semibold max-w-md">
                  <button
                    onClick={() => setSelectedBaselineTab(0)}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      selectedBaselineTab === 0
                        ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Single Student
                  </button>
                  <button
                    onClick={() => setSelectedBaselineTab(1)}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      selectedBaselineTab === 1
                        ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Master LMS ZIP
                  </button>
                  <button
                    onClick={() => setSelectedBaselineTab(2)}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      selectedBaselineTab === 2
                        ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    GitHub Classroom
                  </button>
                </div>

                {/* Tab Body — Natural Height, Full Width */}
                <div>
                  {/* Tab 0: Single Student */}
                  {selectedBaselineTab === 0 && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-zinc-800">
                            GitHub Username(s) / Repository URL(s)
                          </label>
                          <span className="text-[10px] text-zinc-400">Optional live scanner</span>
                        </div>
                        <div className="space-y-2 max-w-lg">
                          {githubLinks.map((link, idx) => {
                            const valStatus = validateGithubUrl(link);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="relative flex-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                    <input
                                      type="text"
                                      value={link}
                                      onChange={(e) => handleUpdateGithubLink(idx, e.target.value)}
                                      placeholder="e.g. https://github.com/student-handle"
                                      className={`w-full bg-white border rounded-lg py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none ${
                                        valStatus.isValid ? "border-zinc-200 focus:border-zinc-800" : "border-amber-300 focus:border-amber-500 bg-amber-50/20"
                                      }`}
                                    />
                                  </div>
                                  {githubLinks.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGithubLink(idx)}
                                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md transition-colors shrink-0 cursor-pointer"
                                      title="Remove this profile"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                {!valStatus.isValid && valStatus.warning && (
                                  <p className="text-[10px] text-amber-700 font-medium pl-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    <span>{valStatus.warning}</span>
                                  </p>
                                )}
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={handleAddGithubLink}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-0.5"
                          >
                            <span>+ Add another GitHub profile</span>
                          </button>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-xl p-3 text-center bg-zinc-50/70 hover:bg-indigo-50/30 transition-all cursor-pointer relative">
                        <FileArchive className="w-4 h-4 text-zinc-400 mx-auto mb-0.5" />
                        <p className="text-xs font-semibold text-zinc-800">Drop Historical Baseline ZIPs</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Supports up to 20 baseline project archives</p>
                        <input
                          key={`repo-${resetKey}`}
                          type="file"
                          multiple
                          accept=".zip"
                          onChange={(e) => handleAddBaselineFiles(e.target.files)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Staged Baseline Files Manager with max 3-line scroll cap */}
                      <div className="bg-zinc-50/50 border border-zinc-100 rounded-lg p-2 min-h-[48px] max-h-[84px] overflow-y-auto scrollbar-thin">
                        {stagedBaselineList.length > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-mono font-semibold text-zinc-600">
                                Staged Projects ({stagedBaselineList.length})
                              </span>
                              <button
                                type="button"
                                onClick={handleClearAllBaselineFiles}
                                className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                <span>Clear All</span>
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {stagedBaselineList.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-zinc-200 text-xs shrink-0 max-w-[200px]"
                                >
                                  <FileArchive className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span className="font-mono text-[10px] font-semibold text-zinc-800 truncate" title={file.name}>
                                    {file.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBaselineFile(idx)}
                                    title="Remove this project"
                                    className="p-0.5 rounded text-zinc-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-1">
                            <p className="text-[10px] text-zinc-400 text-center font-mono">No baseline ZIPs staged yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 1: Master LMS ZIP */}
                  {selectedBaselineTab === 1 && (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500 leading-normal">
                        Upload a master LMS export ZIP (Canvas, Blackboard, Moodle) containing student submissions for cohort norm calibration.
                      </p>
                      <div className="border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-xl p-4 text-center bg-zinc-50/70 hover:bg-indigo-50/30 transition-all cursor-pointer relative">
                        <FileArchive className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-zinc-800">Drop Master Class / Cohort ZIP</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Parses class-wide code distributions for benchmarking</p>
                        <input
                          key={`cohort-${resetKey}`}
                          type="file"
                          accept=".zip"
                          onChange={(e) => setCohortFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Cohort Status */}
                      <div className="bg-zinc-50/50 border border-zinc-100 rounded-lg p-2.5 flex items-center justify-center min-h-[48px]">
                        {cohortFile ? (
                          <div className="inline-block bg-white border border-emerald-300 text-emerald-800 px-3 py-1 rounded-lg text-[11px] font-mono font-semibold shadow-xs">
                            ✓ {cohortFile.name}
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-400 text-center font-mono">No LMS cohort ZIP selected yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: GitHub Classroom */}
                  {selectedBaselineTab === 2 && (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500 leading-normal">
                        Fetch student submissions directly from your GitHub Classroom organization.
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 max-w-lg">
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Organization Name</label>
                          <input
                            type="text"
                            value={cohortOrganization}
                            onChange={(e) => setCohortOrganization(e.target.value)}
                            placeholder="e.g. cs101-fall2026"
                            className="w-full bg-white border border-zinc-200 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Assignment Prefix</label>
                          <input
                            type="text"
                            value={cohortAssignmentPrefix}
                            onChange={(e) => setCohortAssignmentPrefix(e.target.value)}
                            placeholder="e.g. assignment-2"
                            className="w-full bg-white border border-zinc-200 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-800"
                          />
                        </div>
                      </div>

                      {/* GitHub Classroom Status */}
                      <div className="bg-zinc-50/50 border border-zinc-100 rounded-lg p-2.5 flex items-center justify-center min-h-[48px]">
                        {cohortOrganization ? (
                          <div className="inline-block bg-white border border-indigo-300 text-indigo-800 px-3 py-1 rounded-lg text-[11px] font-mono font-semibold shadow-xs">
                            Org: {cohortOrganization} {cohortAssignmentPrefix ? `(${cohortAssignmentPrefix})` : ""}
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-400 text-center font-mono">Awaiting GitHub Classroom credentials</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Starter Template Subtraction Footer with Removal Option */}
                <div className="pt-3 mt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Instructor Starter Template (Optional)</span>
                      <InfoHelper termKey="instructor_starter_template" />
                    </label>
                    <span className="text-[10px] text-zinc-400">Subtracts boilerplate</span>
                  </div>
                  <div className="border border-dashed border-zinc-200 hover:border-zinc-300 rounded-lg p-2 text-center bg-zinc-50/50 hover:bg-zinc-100/60 transition-all cursor-pointer relative">
                    <input
                      key={`template-${resetKey}`}
                      type="file"
                      accept=".zip"
                      onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {templateFile ? (
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[11px] text-zinc-800 font-semibold font-mono truncate">
                          ✓ Starter: {templateFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateFile(null);
                          }}
                          title="Remove starter template"
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer z-10"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-600 font-medium truncate px-2">
                        + Attach skeleton starter code ZIP to eliminate false positives
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Investigated Submission — Standard Aligned Layout */}
              <div className="clean-card p-6 bg-white shadow-sm border border-zinc-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
                      <FileCode2 className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                      2. Investigated Submission
                    </h2>
                  </div>
                  <span className="text-[11px] text-rose-600 font-mono font-semibold">Target Archive</span>
                </div>

                {/* Drop Zone below title */}
                <div className="border-2 border-dashed border-rose-200/80 hover:border-rose-400 rounded-xl p-6 text-center bg-rose-50/20 hover:bg-rose-50/40 transition-all cursor-pointer relative">
                  <Upload className="w-7 h-7 text-rose-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-zinc-800">Drop Target Student Submission ZIP</p>
                  <p className="text-[11px] text-zinc-500 mt-1">The code archive under investigation to compare against baseline</p>
                  <input
                    key={`sub-${resetKey}`}
                    type="file"
                    accept=".zip"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {submissionFile ? (
                    <div className="mt-2.5 inline-block bg-white border border-rose-300 text-rose-900 px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
                      ✓ {submissionFile.name}
                    </div>
                  ) : (
                    <div className="mt-2.5 inline-block bg-white/80 border border-zinc-200 text-zinc-400 px-3 py-1 rounded text-[11px] font-mono">
                      No ZIP selected yet
                    </div>
                  )}
                </div>

                {/* Engine Guarantees */}
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-800 text-[10px] uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Forensic Engine Guarantees</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>8-Vector Anomaly Math</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Gemini Flash Reasoning</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Exact Line Pinpointing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100% Privacy-Preserving</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Action Bar (Full Width directly below dropzones) */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs text-zinc-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                      Forensic Audit Protocol
                    </span>
                    {!submissionFile || (!githubLinks.some((l) => l.trim().length > 0) && stagedBaselineList.length === 0 && (!repoFiles || repoFiles.length === 0) && !cohortFile && !cohortOrganization) ? (
                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-semibold">
                        Awaiting Inputs
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-semibold">
                        Ready to Execute
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600">
                    Executes deterministic 8-dimensional CodeDNA AST comparison, Siamese latent space scoring, and temporal change-point analysis.
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={startAnalysis}
                    disabled={!submissionFile || (!githubLinks.some((l) => l.trim().length > 0) && stagedBaselineList.length === 0 && (!repoFiles || repoFiles.length === 0) && !cohortFile && !cohortOrganization)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all disabled:bg-zinc-100 disabled:text-zinc-400 disabled:border disabled:border-zinc-200 disabled:shadow-none disabled:cursor-not-allowed group cursor-pointer"
                  >
                    <span>Initiate Forensic Investigation</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* State: Analyzing */}
        {appState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clean-card p-10 max-w-xl mx-auto w-full bg-white shadow-xl border border-zinc-200"
          >
            <div className="flex items-center gap-3.5 mb-8">
              <div className="relative w-10 h-10 shrink-0">
                <motion.div
                  className="absolute inset-0 border-2 border-zinc-900 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }}
                />
                <Activity className="absolute inset-0 m-auto w-4 h-4 text-zinc-900" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Executing Forensic Audit Pipeline</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold">
                    Est. Duration: ~{Math.max(4, Math.round((5 - analysisStep) * 2.5))}s
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    ({stagedBaselineList.length + githubLinks.filter((l) => l.trim().length > 0).length || 1} project archives)
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-1.5">
                <span>STAGE {analysisStep + 1} OF {STEPS.length}: {STEPS[analysisStep]?.label}</span>
                <span>{Math.round(((analysisStep) / (STEPS.length - 1)) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-zinc-900 rounded-full"
                  animate={{ width: `${((analysisStep) / (STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Step List */}
            <div className="space-y-2">
              {STEPS.map((step, i) => {
                const isDone = i < analysisStep;
                const isCurrent = i === analysisStep;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-xs transition-all ${
                      isDone
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                        : isCurrent
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                        : "bg-zinc-50 border-zinc-100 text-zinc-400"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-mono text-[10px] font-bold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-white text-zinc-900"
                        : "bg-zinc-200 text-zinc-500"
                    }`}>
                      {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className="flex-1 font-semibold">{step.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-zinc-400 animate-pulse">Running…</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* State: Results (Forensic Investigation Workstation) */}
        {appState === "results" && report && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 print:space-y-0"
          >
            {/* 1. Sticky Persistent Investigation Header Bar */}
            <PersistentInvestigationContext
              sessionId={sessionId}
              report={report}
              aiLoading={aiLoading}
              aiMode={aiMode}
              onRunAi={runAiAnalysis}
              onNewInvestigation={handleNewInvestigation}
              onExportDossier={(mode) => {
                setDossierExportMode(mode);
                setPipelineStage("dossier");
                setTimeout(() => window.print(), 150);
              }}
            />

            {/* 2. 6-Stage Investigation Pipeline Navigator */}
            <div className="print:hidden">
              <PipelineNav
                currentStage={pipelineStage}
                onSelectStage={setPipelineStage}
                hasAiReport={!!report.forensic_report}
                suspiciousCount={report.deterministic_data?.forensics?.exact_suspicious_regions_lines?.length || 0}
              />
            </div>

            {/* 3. Stage Content Views */}
            <div className="mt-6 print:mt-0">
              {/* STAGE: OVERVIEW */}
              {pipelineStage === "overview" && (
                <div className="space-y-6">
                  {/* Author Profile Diagnosis Banner */}
                  {report.deterministic_data?.authorship_intelligence?.ai_author_profile && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                      report.deterministic_data.authorship_intelligence.ai_author_profile === "Consistent AI Author"
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : report.deterministic_data.authorship_intelligence.ai_author_profile === "Sudden AI Introduction"
                        ? "bg-red-50 border-red-300 text-red-900"
                        : "bg-blue-50 border-blue-200 text-blue-900"
                    }`}>
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-500">
                            Diagnostic Finding:
                          </span>
                          <span className="font-mono text-xs px-2 py-0.5 bg-white rounded border font-bold">
                            {report.deterministic_data.authorship_intelligence.ai_author_profile}
                          </span>
                        </div>
                        <p className="mt-1 leading-relaxed opacity-95">
                          {report.deterministic_data.authorship_intelligence.concern_reason}
                        </p>
                      </div>
                    </div>
                  )}



                  {/* 8-Metric Grid Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="clean-card p-4 bg-white border-zinc-200 shadow-sm flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Baseline Reliability</p>
                      <p className="text-2xl font-black text-zinc-900 my-1">
                        {Math.round(report.deterministic_data?.authorship_intelligence?.evidence_confidence_score || 0)}
                        <span className="text-xs font-normal text-zinc-400">/100</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {report.deterministic_data?.forensics?.deviation_reasons?.baseline_reliability}
                      </p>
                    </div>

                    <div className="clean-card p-4 bg-white border-zinc-200 shadow-sm flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CodeDNA Consistency</p>
                      <p className="text-2xl font-black text-zinc-900 my-1">
                        {Math.round(report.deterministic_data?.authorship_intelligence?.historical_codedna_similarity || 0)}
                        <span className="text-xs font-normal text-zinc-400">/100</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        Aggregate multi-vector match score.
                      </p>
                    </div>

                    <div className="clean-card p-4 bg-white border-zinc-200 shadow-sm flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Structural Deviation</p>
                      <p className="text-2xl font-black text-zinc-900 my-1">
                        {Math.round(report.deterministic_data?.forensics?.structural_deviation || 0)}
                        <span className="text-xs font-normal text-zinc-400">/100</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {report.deterministic_data?.forensics?.deviation_reasons?.structural}
                      </p>
                    </div>

                    <div className="clean-card p-4 bg-white border-zinc-200 shadow-sm flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Style Deviation</p>
                      <p className="text-2xl font-black text-zinc-900 my-1">
                        {Math.round(((report.deterministic_data?.forensics?.formatting_deviation || 0) + (report.deterministic_data?.forensics?.naming_deviation || 0)) / 2)}
                        <span className="text-xs font-normal text-zinc-400">/100</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {report.deterministic_data?.forensics?.deviation_reasons?.naming}
                      </p>
                    </div>

                    <div className="clean-card p-4 bg-white border-zinc-200 shadow-sm flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Complexity Shift</p>
                      <p className="text-2xl font-black text-zinc-900 my-1">
                        {Math.round(report.deterministic_data?.forensics?.complexity_deviation || 0)}
                        <span className="text-xs font-normal text-zinc-400">/100</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {report.deterministic_data?.forensics?.deviation_reasons?.complexity}
                      </p>
                    </div>

                    <div className="clean-card p-4 bg-white border-zinc-200 shadow-sm flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Similarity Evidence</p>
                      <p className="text-2xl font-black text-zinc-900 my-1">
                        {Math.round(report.deterministic_data?.authorship_intelligence?.token_ast_similarity || 0)}
                        <span className="text-xs font-normal text-zinc-400">/100</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {report.deterministic_data?.forensics?.deviation_reasons?.similarity}
                      </p>
                    </div>

                    <div className={`clean-card p-4 shadow-sm flex flex-col justify-between border-l-4 ${
                      report.deterministic_data?.authorship_intelligence?.categorical_signals?.ai_associated_signals === 'High'
                        ? 'bg-red-50/70 border-red-500 text-red-900'
                        : 'bg-emerald-50/70 border-emerald-500 text-emerald-900'
                    }`}>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">AI Signals</p>
                      <p className="text-xl font-black my-1">
                        {report.deterministic_data?.authorship_intelligence?.categorical_signals?.ai_associated_signals?.toUpperCase() || 'LOW'}
                      </p>
                      <p className="text-[10px] opacity-80 leading-tight">
                        From novel deps &amp; regex patterns.
                      </p>
                    </div>

                    <div className={`clean-card p-4 shadow-sm flex flex-col justify-between border ${
                      report.deterministic_data?.authorship_intelligence?.categorical_signals?.overall_investigation_concern === 'High'
                        ? 'bg-red-900 text-white border-red-950'
                        : 'bg-zinc-900 text-white border-zinc-950'
                    }`}>
                      <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Investigation Status</p>
                      <p className="text-xl font-black my-1">
                        {report.deterministic_data?.authorship_intelligence?.categorical_signals?.overall_investigation_concern?.toUpperCase() || 'EVALUATING'}
                      </p>
                      <p className="text-[10px] text-zinc-300 opacity-90 leading-tight">
                        {report.deterministic_data?.authorship_intelligence?.ai_author_profile || "Deterministic metric"}
                      </p>
                    </div>
                  </div>

                  {/* Multi-Vector Radar Chart & Deviation Rankings */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7">
                      <RadarDeviationChart metrics={getRadarMetrics()} />
                    </div>

                    <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                          Deviation Vector Ranking
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400">10 Dimensions</span>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {report.deterministic_data?.forensics?.anomaly_ranking?.map(([key, val]: any, i: number) => {
                          const cleanName = key.replace(/_/g, " ").replace("deviation", "").trim();
                          const numVal = Math.round(val);
                          return (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs">
                              <span className="capitalize font-medium text-zinc-700">{cleanName}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${numVal > 50 ? "bg-red-500" : numVal > 25 ? "bg-amber-500" : "bg-emerald-500"}`}
                                    style={{ width: `${Math.min(100, numVal)}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold text-zinc-900 w-8 text-right">{numVal}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPipelineStage("evidence")}
                        className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <span>Inspect Traceable Code Evidence</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE: BASELINE PROFILE */}
              {pipelineStage === "baseline" && (
                <BaselineProfileView
                  baselineMetrics={report.deterministic_data?.baseline_metrics}
                  authIntel={report.deterministic_data?.authorship_intelligence}
                />
              )}

              {/* STAGE: COMPARISON */}
              {pipelineStage === "comparison" && (
                <div className="space-y-6">
                  <MetricComparisonGrid
                    baselineMetrics={report.deterministic_data?.baseline_metrics}
                    submissionMetrics={report.deterministic_data?.submission_metrics}
                    forensics={report.deterministic_data?.forensics}
                    crossLanguageIntel={report.deterministic_data?.cross_language_intelligence}
                  />
                  <div className="flex justify-center">
                    <RadarDeviationChart metrics={getRadarMetrics()} />
                  </div>
                </div>
              )}

              {/* STAGE: ML INTELLIGENCE & CALIBRATION */}
              {pipelineStage === "ml" && (
                <MLIntelligenceView
                  mlIntelligence={report.deterministic_data?.ml_intelligence}
                />
              )}

              {/* STAGE: TIMELINE & TEMPORAL EVOLUTION */}
              {pipelineStage === "timeline" && (
                <TemporalEvolutionView
                  temporalIntelligence={report.deterministic_data?.temporal_intelligence}
                />
              )}

              {/* STAGE: EVIDENCE & CODE INSPECTOR */}
              {pipelineStage === "evidence" && (
                <EvidenceCodeInspector
                  suspiciousRegions={report.deterministic_data?.forensics?.exact_suspicious_regions_lines || []}
                  fileAnomalies={report.deterministic_data?.forensics?.per_file_anomaly_scores || []}
                  unseenPatterns={report.deterministic_data?.forensics?.new_unseen_patterns || []}
                  consistencyScore={report.deterministic_data?.authorship_intelligence?.historical_codedna_similarity}
                />
              )}

              {/* STAGE: AI REASONING */}
              {pipelineStage === "ai" && (
                <AIForensicPanel
                  forensicReport={report.forensic_report}
                  aiLoading={aiLoading}
                  aiMode={aiMode}
                  sessionId={sessionId}
                  onRunAi={runAiAnalysis}
                />
              )}

              {/* STAGE: DOSSIER & VIVAGUARD */}
              {pipelineStage === "dossier" && (
                <ForensicDossierView
                  sessionId={sessionId}
                  report={report}
                  submissionFileName={submissionFile?.name || "student_submission.zip"}
                  initialMode={dossierExportMode}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* State: Scientific Evaluation Lab (Standalone Page View) */}
        {appState === "eval_lab" && (
          <motion.div
            key="eval_lab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <BenchmarkSuiteView onBackToSetup={() => setAppState(report ? "results" : "idle")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}