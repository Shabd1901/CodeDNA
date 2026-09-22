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
  const [aiMode, setAiMode] = useState<"mock" | "openai" | null>(null);

  const startAnalysis = async () => {
    if (!submissionFile) return;
    
    setAppState("analyzing");
    setReport(null);
    setAiMode(null);
    
    try {
      // 1. Start Session — use the server-issued id for all later calls
      const sessionRes = await fetch("http://localhost:8000/api/session/start", { method: "POST" });
      const sessionData = await sessionRes.json();
      const sessionId = sessionData.session_id as string;
      if (!sessionId) throw new Error("No session_id returned");
      setSessionId(sessionId);
      
      // 2. Upload Repositories / Fetch GitHub
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
        // Upload all selected reference ZIPs
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

      // 3. Upload Submission
      const subData = new FormData();
      subData.append("session_id", sessionId);
      subData.append("file", submissionFile);
      await fetch("http://localhost:8000/api/analyze/submission", {
        method: "POST",
        body: subData
      });

      // 4. Compare and Analyze
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
      if (!res.ok) throw new Error("AI report failed");
      const data = await res.json();
      setAiMode(data.ai_mode === "openai" ? "openai" : "mock");
      setReport((prev: any) => ({ ...prev, forensic_report: data.forensic_report }));
    } catch (error) {
      console.error(error);
      alert("AI analysis failed. Ensure the backend is running and comparison completed.");
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[50vh] clean-card p-12 text-center"
          >
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
              <motion.div 
                className="absolute inset-0 border-4 border-zinc-900 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <Activity className="absolute inset-0 m-auto w-8 h-8 text-zinc-900" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-900">Extracting CodeDNA...</h2>
            <p className="text-zinc-500">Parsing AST, analyzing dependencies, and running a local CodeDNA comparison.</p>
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
              <button onClick={() => { setAppState("idle"); setReport(null); setSessionId(null); setAiMode(null); }} className="px-5 py-2.5 bg-white border border-zinc-200 shadow-sm rounded-lg text-sm font-medium hover:bg-zinc-50 text-zinc-700 transition-colors">
                New Investigation
              </button>
            </div>

            {/* Local anomalies (always available, no API cost) */}
            <div className="clean-card p-8">
              <h3 className="text-lg font-bold mb-4 text-zinc-900">Local Comparison Anomalies</h3>
              {report.deterministic_data?.anomalies?.length ? (
                <ul className="space-y-3">
                  {report.deterministic_data.anomalies.map((anomaly: any, i: number) => (
                    <li key={i} className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">{String(anomaly.type || "anomaly").replace(/_/g, " ")}</p>
                      <p className="text-sm text-zinc-700">{anomaly.message}</p>
                      {Array.isArray(anomaly.details) && anomaly.details.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {anomaly.details.map((d: string, j: number) => (
                            <span key={j} className="text-xs bg-white px-2 py-1 rounded text-zinc-600 border border-zinc-200 font-mono">{d}</span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No local anomalies detected against the baseline.</p>
              )}
            </div>

            {/* AI — explicit step */}
            <div className="clean-card p-8 border-l-4 border-l-blue-500">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  AI Forensic Reasoning
                </h3>
                <div className="flex items-center gap-2">
                  {aiMode && (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${aiMode === "openai" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                      {aiMode === "openai" ? "OpenAI" : "Mock AI"}
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
                <p className="text-sm text-zinc-500">Generating forensic reasoning…</p>
              )}
              {!aiLoading && !report.forensic_report && (
                <p className="text-[15px] leading-relaxed text-zinc-600">
                  AI forensic reasoning has not been run. Local CodeDNA comparison is complete; click Run AI Analysis for an investigation summary.
                </p>
              )}
              {!aiLoading && report.forensic_report && (
                <p className="text-[15px] leading-relaxed text-zinc-600">
                  {report.forensic_report.summary || "No summary provided."}
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Findings */}
              <div className="lg:col-span-2 space-y-5">
                <h3 className="text-lg font-bold text-zinc-900">Forensic Findings</h3>
                {!report.forensic_report?.findings?.length && (
                  <p className="text-sm text-zinc-500">Findings appear after you run AI analysis.</p>
                )}
                {report.forensic_report?.findings?.map((finding: any, i: number) => (
                  <div key={i} className="clean-card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[15px] text-zinc-900">{finding.reason}</h4>
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wide border ${
                        finding.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 
                        finding.severity === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {finding.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-5 leading-relaxed">{finding.evidence}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-5">
                      {finding.affected_files?.slice(0, 3).map((f: string, j: number) => (
                        <span key={j} className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600 border border-zinc-200 font-mono">
                          {f}
                        </span>
                      ))}
                      {finding.affected_files?.length > 3 && (
                        <span className="text-xs text-zinc-400 px-2 py-1">+{finding.affected_files.length - 3} more</span>
                      )}
                    </div>
                    
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                      <p className="text-sm text-zinc-700"><span className="font-medium text-zinc-900 mr-1">Recommendation:</span> {finding.recommended_action}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CodeDNA Metrics */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-zinc-900">CodeDNA Profile</h3>
                
                <div className="clean-card p-6">
                  <h4 className="text-xs font-bold text-zinc-400 mb-6 uppercase tracking-wider">Complexity Signature</h4>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { metric: 'Avg Lines', baseline: report.deterministic_data?.baseline_metrics?.total_lines / (report.deterministic_data?.baseline_metrics?.total_files || 1), sub: report.deterministic_data?.submission_metrics?.total_lines / (report.deterministic_data?.submission_metrics?.total_files || 1) },
                        { metric: 'Avg Complexity', baseline: report.deterministic_data?.baseline_metrics?.total_complexity / (report.deterministic_data?.baseline_metrics?.total_files || 1) * 10, sub: report.deterministic_data?.submission_metrics?.total_complexity / (report.deterministic_data?.submission_metrics?.total_files || 1) * 10 },
                        { metric: 'Avg Functions', baseline: report.deterministic_data?.baseline_metrics?.total_functions / (report.deterministic_data?.baseline_metrics?.total_files || 1) * 5, sub: report.deterministic_data?.submission_metrics?.total_functions / (report.deterministic_data?.submission_metrics?.total_files || 1) * 5 },
                      ]}>
                        <PolarGrid stroke="#e4e4e7" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 11 }} />
                        <Radar name="Baseline" dataKey="baseline" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                        <Radar name="Submission" dataKey="sub" stroke="#18181b" fill="#18181b" fillOpacity={0.2} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="clean-card p-6">
                  <h4 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider">Language Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(report.deterministic_data?.submission_metrics?.languages || {}).map(([lang, count]: [string, any]) => (
                      <div key={lang} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-zinc-600 capitalize">{lang}</span>
                        <span className="text-sm font-semibold text-zinc-900">{count} files</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
