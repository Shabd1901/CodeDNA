"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Search, ShieldAlert, CheckCircle, Activity, FileCode2, ChevronRight, FileArchive, User, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Home() {
  const [appState, setAppState] = useState<"idle" | "analyzing" | "results">("idle");
  
  // Form State
  const [githubLink, setGithubLink] = useState("");
  const [repoFiles, setRepoFiles] = useState<FileList | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  // Results State
  const [report, setReport] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"openai" | "gemini" | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Progress tracking
  const [analysisStep, setAnalysisStep] = useState(0);
  const STEPS = [
    { label: "Starting session",        detail: "Initialising secure forensic session on server…" },
    { label: "Uploading baseline",      detail: "Transferring historical repositories to analysis engine…" },
    { label: "Uploading submission",    detail: "Uploading new submission ZIP for comparison…" },
    { label: "Extracting CodeDNA",      detail: "Parsing AST, computing complexity distribution, naming fingerprints…" },
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
    setReport(null);
    setSessionId(null);
    setAiMode(null);
    setResetKey((prev) => prev + 1);
    setAppState("idle");
  };

  const startAnalysis = async () => {
    if (!submissionFile) return;
    
    setAppState("analyzing");
    setReport(null);
    setAiMode(null);
    setAnalysisStep(0);
    
    try {
      // Step 0 — Start Session
      setAnalysisStep(0);
      const sessionRes = await fetch("http://localhost:8000/api/session/start", { method: "POST" });
      const sessionData = await sessionRes.json();
      const sessionId = sessionData.session_id as string;
      if (!sessionId) throw new Error("No session_id returned");
      setSessionId(sessionId);
      
      // Step 1 — Upload Baseline Repositories
      setAnalysisStep(1);
      const formData = new FormData();
      formData.append("session_id", sessionId);
      
      let targetUsername = githubLink.trim();
      if (targetUsername.includes('github.com/')) {
          const parts = targetUsername.split('github.com/')[1].split('/');
          if (parts.length > 0) {
              targetUsername = parts[0];
          }
      }
      
      if (targetUsername) {
        formData.append("username", targetUsername);
        await fetch("http://localhost:8000/api/repositories/github", {
          method: "POST",
          body: formData
        });
      }
      
      if (repoFiles && repoFiles.length > 0) {
        for (let i = 0; i < repoFiles.length; i++) {
            const repoData = new FormData();
            repoData.append("session_id", sessionId);
            repoData.append("file", repoFiles[i]);
            await fetch("http://localhost:8000/api/repositories/upload", {
                method: "POST",
                body: repoData
            });
        }
      }

      // Step 2 — Upload Submission
      setAnalysisStep(2);
      const subData = new FormData();
      subData.append("session_id", sessionId);
      subData.append("file", submissionFile);
      await fetch("http://localhost:8000/api/analyze/submission", {
        method: "POST",
        body: subData
      });

      // Step 3 — Extracting CodeDNA (just before the heaviest call)
      setAnalysisStep(3);
      await new Promise(r => setTimeout(r, 200)); // let UI render the step

      // Step 4 — Running comparison
      setAnalysisStep(4);
      const compareData = new FormData();
      compareData.append("session_id", sessionId);
      const res = await fetch("http://localhost:8000/api/analyze/compare", {
        method: "POST",
        body: compareData
      });
      
      if (!res.ok) throw new Error("Compare failed");
      const data = await res.json();
      setReport(data);
      setAppState("results");
      
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Ensure backend is running at :8000");
      setAppState("idle");
      setSessionId(null);
      setAnalysisStep(0);
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
      setAiMode(data.ai_mode === "gemini" ? "gemini" : "openai");
      setReport((prev: any) => ({ ...prev, forensic_report: data.forensic_report }));
    } catch (error: any) {
      console.error(error);
      alert(`AI analysis failed: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-7xl mx-auto text-zinc-900">
      <header className="flex items-center gap-4 mb-12 border-b border-zinc-200 pb-8">
        <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 shadow-sm">
          <Activity className="w-8 h-8 text-zinc-800" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">CodeDNA Platform</h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">Academic Integrity & Forensic Analysis System</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {appState === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Input Section */}
            <div className="space-y-6">
              <div className="clean-card p-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-zinc-800">
                  <span className="bg-zinc-100 p-2 rounded-md border border-zinc-200"><Search className="w-4 h-4 text-zinc-600"/></span>
                  Historical Baseline (CodeDNA)
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">GitHub Project Link <span className="text-xs font-normal text-zinc-500">(Optional - Scans user's public repos)</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="text" 
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        placeholder="e.g. https://github.com/torvalds/linux"
                        className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 pl-10 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-zinc-400 font-semibold">And / Or</span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center bg-zinc-50 hover:bg-zinc-100 transition-all group cursor-pointer relative">
                    <FileArchive className="w-8 h-8 text-zinc-400 mx-auto mb-3 group-hover:text-zinc-600 transition-colors" />
                    <p className="text-sm text-zinc-700 font-medium">Drop Reference Project ZIPs</p>
                    <p className="text-xs text-zinc-500 mt-1">Upload multiple historical repos for the baseline</p>
                    <input 
                      key={`repo-${resetKey}`}
                      type="file" 
                      multiple 
                      accept=".zip"
                      onChange={(e) => setRepoFiles(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {repoFiles && repoFiles.length > 0 && (
                      <div className="mt-4 inline-block bg-white border border-zinc-200 px-3 py-1 rounded-md text-xs font-medium text-zinc-700 shadow-sm">
                        {repoFiles.length} file(s) selected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="clean-card p-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-zinc-800">
                  <span className="bg-zinc-100 p-2 rounded-md border border-zinc-200"><FileCode2 className="w-4 h-4 text-zinc-600"/></span>
                  New Submission
                </h2>
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center bg-zinc-50 hover:bg-zinc-100 transition-all group cursor-pointer relative h-[calc(100%-4rem)] flex flex-col justify-center">
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3 group-hover:text-zinc-600 transition-colors" />
                  <p className="text-sm text-zinc-700 font-medium">Drop Submission ZIP</p>
                  <p className="text-xs text-zinc-500 mt-1">The student code to investigate</p>
                  <input 
                    key={`sub-${resetKey}`}
                    type="file" 
                    accept=".zip"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {submissionFile && (
                    <div className="mt-4 inline-block bg-white border border-zinc-200 px-3 py-1 rounded-md text-xs font-medium text-zinc-700 shadow-sm">
                      {submissionFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col justify-center items-center p-12 clean-card text-center">
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6 border border-zinc-200 shadow-sm">
                <ShieldAlert className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-zinc-900">Ready to Investigate</h3>
              <p className="text-zinc-500 mb-8 max-w-md leading-relaxed">
                CodeDNA will parse the AST of the historical baseline, establish a unique semantic signature, and run a deterministic comparison against the submission.
              </p>
              <button 
                onClick={startAnalysis}
                disabled={!submissionFile || (!githubLink && (!repoFiles || repoFiles.length === 0))}
                className="group flex items-center gap-2 px-8 py-3.5 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Begin Forensic Analysis
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {appState === "analyzing" && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clean-card p-12 max-w-2xl mx-auto w-full"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="relative w-12 h-12 shrink-0">
                <div className="absolute inset-0 border-3 border-zinc-100 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-3 border-zinc-900 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                />
                <Activity className="absolute inset-0 m-auto w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Forensic Analysis Running</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{STEPS[analysisStep]?.detail}</p>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(((analysisStep) / (STEPS.length - 1)) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-zinc-900 rounded-full"
                  animate={{ width: `${((analysisStep) / (STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const isDone    = i < analysisStep;
                const isCurrent = i === analysisStep;
                const isPending = i > analysisStep;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      isDone    ? "bg-emerald-50 border-emerald-200" :
                      isCurrent ? "bg-zinc-50 border-zinc-300 shadow-sm" :
                                  "bg-white border-zinc-100 opacity-40"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isDone    ? "bg-emerald-500 text-white" :
                      isCurrent ? "bg-zinc-900 text-white" :
                                  "bg-zinc-200 text-zinc-400"
                    }`}>
                      {isDone ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : isCurrent ? (
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                          {i + 1}
                        </motion.span>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${isDone ? "text-emerald-700" : isCurrent ? "text-zinc-900" : "text-zinc-400"}`}>
                        {step.label}
                      </p>
                    </div>
                    {isCurrent && (
                      <motion.div
                        className="w-20 h-1 bg-zinc-100 rounded-full overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-zinc-900 rounded-full"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        />
                      </motion.div>
                    )}
                    {isDone && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {appState === "results" && report && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Investigation Report</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-zinc-500 text-sm">Baseline Reliability:</span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${report.deterministic_data?.reliability === 'Reliable' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {report.deterministic_data?.reliability || "Unknown"}
                  </span>
                </div>
              </div>
              <button onClick={handleNewInvestigation} className="px-5 py-2.5 bg-white border border-zinc-200 shadow-sm rounded-lg text-sm font-medium hover:bg-zinc-50 text-zinc-700 transition-colors">
                New Investigation
              </button>
            </div>

            {/* Top Level Dashboards (Deterministic Phase 4) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="clean-card p-4 bg-zinc-50 border-zinc-200 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 tracking-wider">BASELINE RELIABILITY</p>
                <p className="text-2xl font-black text-zinc-900">{Math.round(report.deterministic_data?.authorship_intelligence?.evidence_confidence_score || 0)}<span className="text-sm font-medium text-zinc-400">/100</span></p>
                <p className="text-[10px] text-zinc-500 mt-2 leading-tight">{report.deterministic_data?.forensics?.deviation_reasons?.baseline_reliability}</p>
              </div>
              <div className="clean-card p-4 bg-zinc-50 border-zinc-200 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 tracking-wider">CODEDNA CONSISTENCY</p>
                <p className="text-2xl font-black text-zinc-900">{Math.round(report.deterministic_data?.authorship_intelligence?.historical_codedna_similarity || 0)}<span className="text-sm font-medium text-zinc-400">/100</span></p>
                <p className="text-[10px] text-zinc-500 mt-2 leading-tight">Aggregate score across 10 deterministic deviation vectors.</p>
              </div>
              <div className="clean-card p-4 bg-zinc-50 border-zinc-200 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 tracking-wider">STRUCTURAL DEVIATION</p>
                <p className="text-2xl font-black text-zinc-900">{Math.round(report.deterministic_data?.forensics?.structural_deviation || 0)}<span className="text-sm font-medium text-zinc-400">/100</span></p>
                <p className="text-[10px] text-zinc-500 mt-2 leading-tight">{report.deterministic_data?.forensics?.deviation_reasons?.structural}</p>
              </div>
              <div className="clean-card p-4 bg-zinc-50 border-zinc-200 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 tracking-wider">STYLE DEVIATION</p>
                <p className="text-2xl font-black text-zinc-900">{Math.round(((report.deterministic_data?.forensics?.formatting_deviation || 0) + (report.deterministic_data?.forensics?.naming_deviation || 0)) / 2)}<span className="text-sm font-medium text-zinc-400">/100</span></p>
                <p className="text-[10px] text-zinc-500 mt-2 leading-tight">{report.deterministic_data?.forensics?.deviation_reasons?.naming}</p>
              </div>
              <div className="clean-card p-4 bg-zinc-50 border-zinc-200 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 tracking-wider">COMPLEXITY DEVIATION</p>
                <p className="text-2xl font-black text-zinc-900">{Math.round(report.deterministic_data?.forensics?.complexity_deviation || 0)}<span className="text-sm font-medium text-zinc-400">/100</span></p>
                <p className="text-[10px] text-zinc-500 mt-2 leading-tight">{report.deterministic_data?.forensics?.deviation_reasons?.complexity}</p>
              </div>
              <div className="clean-card p-4 bg-zinc-50 border-zinc-200 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 tracking-wider">SIMILARITY EVIDENCE</p>
                <p className="text-2xl font-black text-zinc-900">{Math.round(report.deterministic_data?.authorship_intelligence?.token_ast_similarity || 0)}<span className="text-sm font-medium text-zinc-400">/100</span></p>
                <p className="text-[10px] text-zinc-500 mt-2 leading-tight">{report.deterministic_data?.forensics?.deviation_reasons?.similarity}</p>
              </div>
              
              <div className={`clean-card p-4 shadow-sm flex flex-col justify-center border-l-4 ${report.deterministic_data?.authorship_intelligence?.categorical_signals?.ai_associated_signals === 'High' ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'}`}>
                <p className="text-[10px] font-bold text-zinc-500 mb-1 tracking-wider">AI-ASSOCIATED SIGNALS</p>
                <p className={`text-xl font-black ${report.deterministic_data?.authorship_intelligence?.categorical_signals?.ai_associated_signals === 'High' ? 'text-red-700' : 'text-emerald-700'}`}>
                  {report.deterministic_data?.authorship_intelligence?.categorical_signals?.ai_associated_signals?.toUpperCase() || 'UNKNOWN'}
                </p>
                <p className="text-[10px] text-zinc-600 mt-2 leading-tight">Derived from sudden sophistication, novel deps, and regex fingerprints.</p>
              </div>

              <div className={`clean-card p-4 shadow-sm flex flex-col justify-center items-center text-center border ${report.deterministic_data?.authorship_intelligence?.categorical_signals?.overall_investigation_concern === 'High' ? 'bg-red-600 border-red-700 text-white' : 'bg-zinc-900 border-zinc-950 text-white'}`}>
                <p className="text-[10px] font-bold text-zinc-200 mb-1 tracking-wider">INVESTIGATION STATUS</p>
                <p className="text-xl font-black">
                  {report.deterministic_data?.authorship_intelligence?.categorical_signals?.overall_investigation_concern?.toUpperCase() || 'UNKNOWN'} CONCERN
                </p>
                <p className="text-[10px] text-zinc-300 mt-2 leading-tight text-center px-2">
                  {report.deterministic_data?.authorship_intelligence?.ai_author_profile || "Offline metric"}
                </p>
              </div>
            </div>

            {/* AI Author Profile Banner (Explanation for False Positives) */}
            {report.deterministic_data?.authorship_intelligence?.ai_author_profile && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                report.deterministic_data.authorship_intelligence.ai_author_profile === "Consistent AI Author"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : report.deterministic_data.authorship_intelligence.ai_author_profile === "Sudden AI Introduction"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              }`}>
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Author Profile Diagnosis:</span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-white/80 rounded border font-semibold">
                      {report.deterministic_data.authorship_intelligence.ai_author_profile}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {report.deterministic_data.authorship_intelligence.concern_reason}
                  </p>
                </div>
              </div>
            )}

            {/* Local anomalies (always available, no API cost) */}
            <div className="clean-card p-8">
              <h3 className="text-lg font-bold mb-4 text-zinc-900 border-b border-zinc-100 pb-2">Deterministic Anomalies (Instant & Free)</h3>
              
              {/* Unseen Patterns */}
              {report.deterministic_data?.forensics?.new_unseen_patterns?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Unseen Behavioral Patterns</h4>
                  <ul className="space-y-2">
                    {report.deterministic_data.forensics.new_unseen_patterns.map((p: string, i: number) => (
                      <li key={i} className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md border border-red-100">{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Function Anomalies */}
              {report.deterministic_data?.forensics?.per_function_anomaly_scores?.length > 0 ? (
                <div>
                  <h4 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-2 flex items-center gap-2"><FileCode2 className="w-4 h-4"/> Suspicious Code Regions</h4>
                  <ul className="space-y-3">
                    {report.deterministic_data.forensics.exact_suspicious_regions_lines?.map((anomaly: any, i: number) => (
                      <li key={i} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">{anomaly.file} (Line {anomaly.line})</p>
                        <p className="text-sm text-zinc-800 font-medium">{anomaly.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No strict mathematical anomalies detected against the baseline.</p>
              )}
            </div>

            {/* AI — explicit step */}
            <div className="clean-card p-8 border-l-4 border-l-blue-500">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    AI Forensic Reasoning
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">Triggers GPT-4o to analyze the deterministic metrics above and produce an evidence-weighted narrative.</p>
                </div>
                <div className="flex items-center gap-2">
                  {aiMode && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {aiMode === "gemini" ? "Gemini Flash" : "OpenAI GPT-4o"}
                    </span>
                  )}
                  <button
                    onClick={runAiAnalysis}
                    disabled={!sessionId || aiLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? "Running…" : report.forensic_report ? "Re-run AI Analysis" : "Run AI Analysis"}
                  </button>
                </div>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-3 text-zinc-500 py-8 justify-center border-t border-zinc-100 mt-4">
                  <Activity className="w-5 h-5 animate-spin" />
                  <p className="text-sm font-medium">Generating forensic reasoning…</p>
                </div>
              )}
              
              {!aiLoading && !report.forensic_report && (
                <div className="py-6 border-t border-zinc-100 mt-4">
                   <p className="text-[15px] leading-relaxed text-zinc-600">
                    AI forensic reasoning has not been run. Click 'Run AI Analysis' for deep investigation logic.
                  </p>
                </div>
              )}

              {!aiLoading && report.forensic_report && (
                <div className="mt-8 space-y-8 border-t border-zinc-100 pt-8">
                  {/* Executive Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Executive Summary</h4>
                    <p className="text-[15px] leading-relaxed text-zinc-800 font-medium bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                      {report.forensic_report.executive_forensic_summary}
                    </p>
                  </div>

                  {/* Findings */}
                  <div>
                     <h4 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wide">Forensic Findings</h4>
                     <div className="space-y-4">
                      {report.forensic_report.findings?.map((finding: any, i: number) => (
                        <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <h5 className="font-bold text-zinc-900 text-lg">{finding.finding}</h5>
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wide border ${
                              finding.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 
                              finding.severity === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {finding.severity} Risk
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Evidence</p>
                              <p className="text-sm text-zinc-700">{finding.evidence}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Why it matters</p>
                               <p className="text-sm text-zinc-700">{finding.why_deviation_matters}</p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 mb-6 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                             <div>
                              <p className="text-xs font-bold text-zinc-500 uppercase mb-1">False Positives</p>
                              <p className="text-sm text-zinc-600">{finding.false_positive_considerations}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Contradictory Evidence</p>
                               <p className="text-sm text-zinc-600">{finding.contradictory_evidence}</p>
                            </div>
                          </div>

                          {finding.exact_suspicious_regions_lines?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Affected Lines</p>
                              <div className="flex flex-wrap gap-2">
                                {finding.exact_suspicious_regions_lines.map((line: string, j: number) => (
                                  <span key={j} className="text-xs font-mono bg-zinc-900 text-zinc-100 px-2 py-1 rounded">{line}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="border-t border-zinc-100 pt-4 mt-2">
                             <p className="text-sm text-blue-700 font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4"/> {finding.recommended_evaluator_action}</p>
                          </div>
                        </div>
                      ))}
                     </div>
                  </div>

                  {/* VivaGuard */}
                  {report.forensic_report.optional_vivaguard_questions?.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                      <h4 className="text-sm font-bold text-indigo-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <User className="w-4 h-4"/> VivaGuard Interview Strategy
                      </h4>
                      <ul className="space-y-3">
                        {report.forensic_report.optional_vivaguard_questions.map((q: string, i: number) => (
                          <li key={i} className="text-sm text-indigo-800 flex items-start gap-3">
                            <span className="font-bold mt-0.5">{i+1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
