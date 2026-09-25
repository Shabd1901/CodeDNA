"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Search, 
  ShieldAlert, 
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
  FolderGit2
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

export default function Home() {
  const [appState, setAppState] = useState<"idle" | "analyzing" | "results">("idle");
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("overview");

  // Form State
  const [githubLink, setGithubLink] = useState("");
  const [repoFiles, setRepoFiles] = useState<FileList | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  // Fields for template and cohort data
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [cohortFile, setCohortFile] = useState<File | null>(null);
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

    // Validate that we have at least one type of baseline data
    const hasPersonalData = !!githubLink || (repoFiles && repoFiles.length > 0);
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

        if (repoFiles && repoFiles.length > 0) {
          for (let i = 0; i < repoFiles.length; i++) {
            const repoData = new FormData();
            repoData.append("session_id", newSessionId);
            repoData.append("file", repoFiles[i]);
            const upRes = await fetch("http://localhost:8000/api/repositories/upload", {
              method: "POST",
              body: repoData
            });
            if (!upRes.ok) {
              const errData = await upRes.json().catch(() => ({ detail: "Upload repository failed." }));
              throw { title: "Baseline Upload Error", detail: errData.detail || `Failed to upload ZIP ${repoFiles[i].name}.` };
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
      console.error(error);
      alert(`AI analysis failed: ${error.message}`);
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

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Deterministic Engine Ready
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Gemini Flash
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
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* Input Intake Panel (Left 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="clean-card p-6 bg-white shadow-sm border border-zinc-200">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200">
                      <FolderGit2 className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                      1. Historical Reference Baseline
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">AST Signature Matrix</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg mb-5 text-xs font-semibold">
                  <button
                    onClick={() => setSelectedBaselineTab(0)}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
                      selectedBaselineTab === 0
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Single Student
                  </button>
                  <button
                    onClick={() => setSelectedBaselineTab(1)}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
                      selectedBaselineTab === 1
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Master LMS ZIP
                  </button>
                  <button
                    onClick={() => setSelectedBaselineTab(2)}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
                      selectedBaselineTab === 2
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    GitHub Classroom
                  </button>
                </div>

                {/* Tab 0: Single Student */}
                {selectedBaselineTab === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                        GitHub Profile / Repo URL <span className="text-zinc-400 font-normal">(Optional public scanner)</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={githubLink}
                          onChange={(e) => setGithubLink(e.target.value)}
                          placeholder="e.g. https://github.com/student-handle"
                          className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-zinc-200 w-full" />
                      <span className="bg-white px-2 text-[10px] uppercase font-bold text-zinc-400 absolute">
                        And / Or Reference ZIPs
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-6 text-center bg-zinc-50 hover:bg-zinc-100/70 transition-all cursor-pointer relative">
                      <FileArchive className="w-7 h-7 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-zinc-800">Drop Historical Project ZIPs</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Upload one or multiple past student submissions</p>
                      <input
                        key={`repo-${resetKey}`}
                        type="file"
                        multiple
                        accept=".zip"
                        onChange={(e) => setRepoFiles(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {repoFiles && repoFiles.length > 0 && (
                        <div className="mt-2 inline-block bg-white border border-zinc-200 px-2.5 py-0.5 rounded text-[11px] font-mono text-zinc-800 shadow-sm">
                          {repoFiles.length} baseline archive(s) staged
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 1: Master LMS ZIP */}
                {selectedBaselineTab === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-500">
                      Upload an LMS cohort export (Canvas, Blackboard, Moodle) containing all student submissions for cohort norm normalization.
                    </p>
                    <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-6 text-center bg-zinc-50 hover:bg-zinc-100/70 transition-all cursor-pointer relative">
                      <FileArchive className="w-7 h-7 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-zinc-800">Drop Master Class / Cohort ZIP</p>
                      <input
                        key={`cohort-${resetKey}`}
                        type="file"
                        accept=".zip"
                        onChange={(e) => setCohortFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {cohortFile && (
                        <div className="mt-2 inline-block bg-white border border-zinc-200 px-2.5 py-0.5 rounded text-[11px] font-mono text-zinc-800 shadow-sm">
                          {cohortFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: GitHub Classroom */}
                {selectedBaselineTab === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Organization Name</label>
                      <input
                        type="text"
                        value={cohortOrganization}
                        onChange={(e) => setCohortOrganization(e.target.value)}
                        placeholder="e.g. cs101-fall2026"
                        className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Assignment Prefix</label>
                      <input
                        type="text"
                        value={cohortAssignmentPrefix}
                        onChange={(e) => setCohortAssignmentPrefix(e.target.value)}
                        placeholder="e.g. assignment-2"
                        className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-800"
                      />
                    </div>
                  </div>
                )}

                {/* Optional Starter Template Subtraction */}
                <div className="mt-5 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Instructor Starter Template Subtraction</span>
                    </label>
                    <span className="text-[10px] text-zinc-400">Eliminates false positives</span>
                  </div>
                  <div className="border border-dashed border-zinc-200 rounded-lg p-3 text-center bg-zinc-50 hover:bg-zinc-100 transition-all cursor-pointer relative">
                    <input
                      key={`template-${resetKey}`}
                      type="file"
                      accept=".zip"
                      onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-zinc-600 font-medium">
                      {templateFile ? templateFile.name : "+ Attach instructor boilerplate / starter ZIP (optional)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission ZIP Dropzone */}
              <div className="clean-card p-6 bg-white shadow-sm border border-zinc-200">
                <div className="flex items-center gap-2 mb-3 border-b border-zinc-100 pb-3">
                  <span className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <FileCode2 className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                    2. Investigated Code Submission
                  </h2>
                </div>

                <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-8 text-center bg-zinc-50 hover:bg-zinc-100/70 transition-all cursor-pointer relative">
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-800">Drop Submission ZIP Under Investigation</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">The target student archive to benchmark against baseline</p>
                  <input
                    key={`sub-${resetKey}`}
                    type="file"
                    accept=".zip"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {submissionFile && (
                    <div className="mt-3 inline-block bg-white border border-zinc-200 px-3 py-1 rounded text-xs font-mono font-bold text-zinc-900 shadow-sm">
                      {submissionFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Launch & Audit Info Panel (Right 5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between clean-card p-8 bg-zinc-950 text-white shadow-xl border border-zinc-800 rounded-xl">
              <div>
                <div className="flex items-center gap-2 mb-6 text-zinc-400 text-xs font-mono">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>FORENSIC PROTOCOL SPECIFICATION</span>
                </div>

                <h3 className="text-xl font-black text-white leading-tight mb-3">
                  Multi-Vector CodeDNA Authenticity Investigation
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  CodeDNA constructs an AST-grounded behavioral signature from past repos, cross-referencing cyclomatic complexity, indentation fingerprints, lexical naming, and dependency imports.
                </p>

                <div className="space-y-3 border-t border-zinc-800 pt-6 text-xs text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>8-Vector Deterministic Anomaly Detection (Instant &amp; Free)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Baseline Contamination &amp; Consistent AI Author Diagnosis</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Traceable Line &amp; Function Suspicious Region Pinpointing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Google Gemini Flash Forensic Synthesis &amp; VivaGuard Script</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-800 mt-8">
                <button
                  onClick={startAnalysis}
                  disabled={!submissionFile || (!githubLink && (!repoFiles || repoFiles.length === 0) && !cohortFile && !cohortOrganization)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-lg text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
                >
                  <span>Initiate Forensic Investigation</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-zinc-500 text-center mt-2.5 font-mono">
                  Offline privacy-preserving AST parsing • No training on student code
                </p>
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
              onExportDossier={() => setPipelineStage("dossier")}
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
      </AnimatePresence>
    </main>
  );
}