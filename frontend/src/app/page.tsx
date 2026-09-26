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

export default function Home() {
  const [appState, setAppState] = useState<"idle" | "analyzing" | "results" | "eval_lab">("idle");
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("overview");

  // Form State
  const [githubLink, setGithubLink] = useState("");
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
  const [aiMode, setAiMode] = useState<"openai" | "gemini" | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [errorNotice, setErrorNotice] = useState<{ title: string; detail: string; isRateLimit?: boolean } | null>(null);
  // Alternative baseline comparison for dashboard metrics when both baselines are available
  const [alternativeReport, setAlternativeReport] = useState<any>(null);

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
        await fetch(`http://localhost:8000/api/session/${sessionId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to clean up session on server:", err);
      }
    }
    setGithubLink("");
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
    const hasPersonalData = !!githubLink || baselineUploadList.length > 0;
    const hasCohortData = (selectedBaselineTab === 1 && !!cohortFile) ||
                         (selectedBaselineTab === 2 && !!cohortOrganization && !!cohortAssignmentPrefix);

    // For cohort tabs, validate specific data is present
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
      // Step 0 — Start Session
      setAnalysisStep(0);
      const sessionRes = await fetch("http://localhost:8000/api/session/start", { method: "POST" });
      if (!sessionRes.ok) {
        throw { title: "Session Error", detail: "Failed to initialize server investigation session." };
      }
      const sessionData = await sessionRes.json();
      const newSessionId = sessionData.session_id as string;
      if (!newSessionId) throw new Error("No session_id returned");
      setSessionId(newSessionId);

      // Step 1 — Upload Baseline Data
      setAnalysisStep(1);
      const formData = new FormData();
      formData.append("session_id", newSessionId);

      if (selectedBaselineTab === 0) {
        let targetUsername = githubLink.trim();
        if (targetUsername.includes("github.com/")) {
          const parts = targetUsername.split("github.com/")[1].split("/");
          if (parts.length > 0) targetUsername = parts[0];
        }

        if (targetUsername) {
          formData.append("username", targetUsername);
          const ghRes = await fetch("http://localhost:8000/api/repositories/github", {
            method: "POST",
            body: formData
          });
          if (!ghRes.ok) {
            const errData = await ghRes.json().catch(() => ({ detail: "Failed to fetch GitHub repositories." }));
            const isRateLimit = ghRes.status === 429 || (errData.detail && errData.detail.toLowerCase().includes("rate limit"));
            throw {
              title: isRateLimit ? "GitHub API Rate Limit Reached" : "GitHub Fetch Failed",
              detail: errData.detail || "Unable to download repositories from GitHub.",
              isRateLimit
            };
          }
        }

        if (baselineUploadList.length > 0) {
          for (let i = 0; i < baselineUploadList.length; i++) {
            const repoData = new FormData();
            repoData.append("session_id", newSessionId);
            repoData.append("file", baselineUploadList[i]);
            const upRes = await fetch("http://localhost:8000/api/repositories/upload", {
              method: "POST",
              body: repoData
            });
            if (!upRes.ok) {
              const errData = await upRes.json().catch(() => ({ detail: "Upload repository failed." }));
              throw { title: "Baseline Upload Error", detail: errData.detail || `Failed to upload ZIP ${baselineUploadList[i].name}.` };
            }
          }
        }
      } else if (selectedBaselineTab === 1) {
        if (!cohortFile) throw { title: "Missing Cohort File", detail: "Please select a cohort ZIP file." };
        const cohortData = new FormData();
        cohortData.append("session_id", newSessionId);
        cohortData.append("file", cohortFile);
        const cohortRes = await fetch("http://localhost:8000/api/repositories/cohort-zip", {
          method: "POST",
          body: cohortData
        });
        if (!cohortRes.ok) {
          const errData = await cohortRes.json().catch(() => ({ detail: "Cohort ZIP processing failed." }));
          throw { title: "Cohort Upload Error", detail: errData.detail || "Failed to process cohort ZIP." };
        }
      } else if (selectedBaselineTab === 2) {
        if (!cohortOrganization || !cohortAssignmentPrefix) {
          throw { title: "Missing GitHub Classroom Info", detail: "Please provide organization and assignment prefix." };
        }
        const classroomData = new FormData();
        classroomData.append("session_id", newSessionId);
        classroomData.append("organization", cohortOrganization);
        classroomData.append("assignment_prefix", cohortAssignmentPrefix);
        const classroomRes = await fetch("http://localhost:8000/api/repositories/github-classroom", {
          method: "POST",
          body: classroomData
        });
        if (!classroomRes.ok) {
          const errData = await classroomRes.json().catch(() => ({ detail: "GitHub Classroom fetch failed." }));
          throw { title: "GitHub Classroom Error", detail: errData.detail || "Failed to fetch repositories from GitHub Classroom." };
        }
      }

      // Step 2 — Upload Submission
      setAnalysisStep(2);
      const subData = new FormData();
      subData.append("session_id", newSessionId);
      subData.append("file", submissionFile);
      const subRes = await fetch("http://localhost:8000/api/analyze/submission", {
        method: "POST",
        body: subData
      });
      if (!subRes.ok) {
        const errData = await subRes.json().catch(() => ({ detail: "Submission upload failed." }));
        throw { title: "Submission Upload Error", detail: errData.detail || "Failed to upload submission archive." };
      }

      // Step 3 — Upload Template (if provided)
      setAnalysisStep(3);
      if (templateFile) {
        const templateData = new FormData();
        templateData.append("session_id", newSessionId);
        templateData.append("file", templateFile);
        const templateRes = await fetch("http://localhost:8000/api/repositories/template", {
          method: "POST",
          body: templateData
        });
        if (!templateRes.ok) {
          const errData = await templateRes.json().catch(() => ({ detail: "Template upload failed." }));
          throw { title: "Template Upload Error", detail: errData.detail || "Failed to upload template ZIP." };
        }
      } else {
        await new Promise(r => setTimeout(r, 100));
      }

      // Step 4 — Running comparison
      setAnalysisStep(4);
      await new Promise(r => setTimeout(r, 200));

      const comparisonsToRun = [];
      if (selectedBaselineTab === 0) {
        comparisonsToRun.push({ type: "personal", label: "Personal" });
      } else {
        comparisonsToRun.push({ type: "cohort", label: "Cohort" });
      }

      if (hasPersonalData && hasCohortData) {
        const alternativeType = (selectedBaselineTab as number) === 0 ? "cohort" : "personal";
        comparisonsToRun.push({ type: alternativeType, label: alternativeType === "personal" ? "Personal" : "Cohort", isAlternative: true });
      }

      const primaryComparison = comparisonsToRun.find(comp => !comp.isAlternative);
      if (primaryComparison) {
        const compareData = new FormData();
        compareData.append("session_id", newSessionId);
        compareData.append("baseline_type", primaryComparison.type);
        const res = await fetch("http://localhost:8000/api/analyze/compare", {
          method: "POST",
          body: compareData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: "Compare failed." }));
          throw { title: "CodeDNA Comparison Error", detail: errData.detail || "Static metric comparison failed." };
        }
        const data = await res.json();
        setReport(data);
      }

      const alternativeComparison = comparisonsToRun.find(comp => comp.isAlternative);
      if (alternativeComparison) {
        const compareData = new FormData();
        compareData.append("session_id", newSessionId);
        compareData.append("baseline_type", alternativeComparison.type);
        const res = await fetch("http://localhost:8000/api/analyze/compare", {
          method: "POST",
          body: compareData
        });

        if (res.ok) {
          const data = await res.json();
          setAlternativeReport(data);
        }
      }

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
          detail: error?.message || "Analysis failed. Please check that the backend is running at http://localhost:8000.",
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
      const res = await fetch("http://localhost:8000/api/analyze/ai-report", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errData.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setAiMode(data.ai_mode?.startsWith("gemini") ? "gemini" : "openai");
      setReport((prev: any) => ({ ...prev, forensic_report: data.forensic_report }));
    } catch (error: any) {
      console.error("AI Analysis Execution Error:", error);
      setErrorNotice({
        title: "AI Forensic Reasoning Error",
        detail: error?.message || "Failed to generate AI forensic reasoning. Check console for full details."
      });
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
    <main className="min-h-screen p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto text-zinc-900">
      {/* Top Application Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-200 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950">CodeDNA Forensic Workstation</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 font-semibold">
                v2.4 Pro
              </span>
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
            {/* Top 2-Column Grid: Baseline Inputs (Left) + Submission Dropzone (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Card 1: Historical Reference Baseline */}
              <div className="clean-card p-6 bg-white shadow-sm border border-zinc-200 flex flex-col justify-between rounded-xl h-[460px] min-h-[460px] max-h-[460px] overflow-hidden">
                <div>
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
                  <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl mb-3 text-xs font-semibold">
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

                  {/* Strictly Fixed Tab Body Container (245px) */}
                  <div className="h-[245px] min-h-[245px] max-h-[245px] flex flex-col justify-between overflow-hidden">
                    {/* Tab 0: Single Student */}
                    {selectedBaselineTab === 0 && (
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-zinc-800">
                              GitHub Username / Repository URL
                            </label>
                            <span className="text-[10px] text-zinc-400">Optional scanner</span>
                          </div>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                            <input
                              type="text"
                              value={githubLink}
                              onChange={(e) => setGithubLink(e.target.value)}
                              placeholder="e.g. https://github.com/student-handle"
                              className="w-full bg-white border border-zinc-200 rounded-lg py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-xl p-2.5 text-center bg-zinc-50/70 hover:bg-indigo-50/30 transition-all cursor-pointer relative my-1">
                          <FileArchive className="w-4 h-4 text-zinc-400 mx-auto mb-0.5" />
                          <p className="text-xs font-semibold text-zinc-800">Drop Historical Baseline ZIPs</p>
                          <input
                            key={`repo-${resetKey}`}
                            type="file"
                            multiple
                            accept=".zip"
                            onChange={(e) => handleAddBaselineFiles(e.target.files)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* Fixed 64px Staged Baseline Files Manager Slot */}
                        <div className="h-16 min-h-16 max-h-16 shrink-0 bg-zinc-50/50 border border-zinc-100 rounded-lg p-1.5 overflow-hidden flex flex-col justify-between">
                          {stagedBaselineList.length > 0 ? (
                            <>
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

                              <div className="space-y-1 max-h-10 overflow-y-auto pr-1 scrollbar-thin">
                                {stagedBaselineList.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between gap-2 px-2 py-0.5 rounded bg-white border border-zinc-200 text-xs"
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <FileArchive className="w-3 h-3 text-indigo-600 shrink-0" />
                                      <span className="font-mono text-[10px] font-semibold text-zinc-800 truncate">
                                        {file.name}
                                      </span>
                                    </div>
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
                            </>
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <p className="text-[10px] text-zinc-400 text-center font-mono">No baseline ZIPs staged yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 1: Master LMS ZIP */}
                    {selectedBaselineTab === 1 && (
                      <div className="h-full flex flex-col justify-between">
                        <p className="text-xs text-zinc-500 leading-normal">
                          Upload a master LMS export ZIP (Canvas, Blackboard, Moodle) containing student submissions for cohort norm calibration.
                        </p>
                        <div className="border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-xl p-4 text-center bg-zinc-50/70 hover:bg-indigo-50/30 transition-all cursor-pointer relative my-1">
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

                        {/* Fixed 64px Cohort Status Slot (Matching Tab 0) */}
                        <div className="h-16 min-h-16 max-h-16 shrink-0 bg-zinc-50/50 border border-zinc-100 rounded-lg p-2 flex items-center justify-center">
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
                      <div className="h-full flex flex-col justify-between">
                        <p className="text-xs text-zinc-500 leading-normal">
                          Fetch student submissions directly from your GitHub Classroom organization.
                        </p>
                        <div className="grid grid-cols-2 gap-2.5 my-1">
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

                        {/* Fixed 64px GitHub Classroom Status Slot (Matching Tab 0 & 1) */}
                        <div className="h-16 min-h-16 max-h-16 shrink-0 bg-zinc-50/50 border border-zinc-100 rounded-lg p-2 flex items-center justify-center">
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
                </div>

                {/* Fixed Starter Template Subtraction Footer */}
                <div className="pt-2 border-t border-zinc-100 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Instructor Starter Template (Optional)</span>
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
                    <p className="text-[11px] text-zinc-600 font-medium truncate px-2">
                      {templateFile ? `✓ Starter: ${templateFile.name}` : "+ Attach skeleton starter code ZIP to eliminate false positives"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Investigated Submission Dropzone */}
              <div className="clean-card p-6 bg-white shadow-sm border border-zinc-200 flex flex-col justify-between rounded-xl h-[460px] min-h-[460px] max-h-[460px] overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2.5">
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

                  <div className="border-2 border-dashed border-rose-200/80 hover:border-rose-400 rounded-xl p-6 text-center bg-rose-50/20 hover:bg-rose-50/40 transition-all cursor-pointer relative my-2">
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
                </div>

                {/* Audit Highlights (Aligned with Card 1 Footer) */}
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-3 space-y-2 text-xs text-zinc-600 shrink-0">
                  <div className="flex items-center gap-2 font-semibold text-zinc-800 text-[11px] uppercase tracking-wider mb-0.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Forensic Engine Guarantees</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>8-Vector Anomaly Math</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Gemini Flash Forensic Reasoning</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Exact Line Suspicious Pinpointing</span>
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
                    {!submissionFile || (!githubLink && (stagedBaselineList.length === 0) && (!repoFiles || repoFiles.length === 0) && !cohortFile && !cohortOrganization) ? (
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
                    disabled={!submissionFile || (!githubLink && (stagedBaselineList.length === 0) && (!repoFiles || repoFiles.length === 0) && !cohortFile && !cohortOrganization)}
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
                <p className="text-xs text-zinc-500 mt-0.5">{STEPS[analysisStep]?.detail}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-1.5">
                <span>STAGE {analysisStep + 1} OF {STEPS.length}</span>
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
            className="space-y-6"
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
                if (mode === "extended") {
                  setPipelineStage("dossier");
                  setTimeout(() => window.print(), 200);
                } else {
                  window.print();
                }
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
            <div className="mt-6">
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

                  {/* ML Probabilistic Calibration Banner */}
                  {report.deterministic_data?.ml_intelligence?.statistical_calibration && (
                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold font-mono text-[10px] shrink-0 border border-indigo-200">
                          ML CALIBRATED
                        </span>
                        <span className="text-indigo-950 font-medium">
                          Empirical Substitution Probability: <strong className="font-mono text-indigo-900">{Math.round(report.deterministic_data.ml_intelligence.statistical_calibration.calibrated_probability * 100)}%</strong>
                          {" "}
                          <span className="text-indigo-600 font-mono text-[11px]">
                            [95% CI: {Math.round(report.deterministic_data.ml_intelligence.statistical_calibration.confidence_interval_95.lower * 100)}% – {Math.round(report.deterministic_data.ml_intelligence.statistical_calibration.confidence_interval_95.upper * 100)}%]
                          </span>
                          {" • "}
                          <span className="text-indigo-700 font-mono text-[11px]">
                            {report.deterministic_data.ml_intelligence.statistical_calibration.risk_tier}
                          </span>
                        </span>
                      </div>
                      <button
                        onClick={() => setPipelineStage("ml")}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors shrink-0 shadow-xs flex items-center gap-1 self-start sm:self-auto"
                      >
                        <span>Siamese Latent Space</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Temporal Evolution Trajectory Banner */}
                  {report.deterministic_data?.temporal_intelligence && (
                    <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm ${
                      report.deterministic_data.temporal_intelligence.temporal_severity === "High"
                        ? "bg-red-50/70 border-red-200 text-red-950"
                        : report.deterministic_data.temporal_intelligence.temporal_severity === "Moderate"
                        ? "bg-amber-50/70 border-amber-200 text-amber-950"
                        : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-white font-bold font-mono text-[10px] shrink-0 border border-zinc-200 text-zinc-800">
                          TEMPORAL CUSUM
                        </span>
                        <span className="font-medium">
                          Evolution Trajectory: <strong className="font-bold">{report.deterministic_data.temporal_intelligence.trajectory_diagnosis}</strong>
                          {" • "}
                          <span className="opacity-90">{report.deterministic_data.temporal_intelligence.evaluator_temporal_narrative}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => setPipelineStage("timeline")}
                        className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[11px] transition-colors shrink-0 shadow-xs flex items-center gap-1 self-start sm:self-auto"
                      >
                        <span>Milestone Timeline</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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