"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Search, ShieldAlert, CheckCircle, Activity, FileCode2, ChevronRight, FileArchive, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Home() {
  const [appState, setAppState] = useState<"idle" | "analyzing" | "results">("idle");
  
  // Form State
  const [githubLink, setGithubLink] = useState("");
  const [repoFiles, setRepoFiles] = useState<FileList | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  // Results State
  const [report, setReport] = useState<any>(null);

  const startAnalysis = async () => {
    if (!submissionFile) return;
    
    setAppState("analyzing");
    
    try {
      const sessionId = crypto.randomUUID();
      
      // 1. Start Session
      await fetch("http://localhost:8000/api/session/start", { method: "POST" });
      
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
      
      const data = await res.json();
      setReport(data);
      setAppState("results");
      
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Ensure backend is running at :8000");
      setAppState("idle");
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-7xl mx-auto">
      <header className="flex items-center gap-3 mb-16">
        <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
          <Activity className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">CodeDNA</h1>
          <p className="text-zinc-400 text-sm">AI Forensic Code Investigation</p>
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
              <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-zinc-800 p-1.5 rounded-md"><Search className="w-5 h-5 text-zinc-300"/></span>
                  Historical Baseline (CodeDNA)
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">GitHub Project Link <span className="text-xs text-zinc-500">(Optional - Scans user's public repos)</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input 
                        type="text" 
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        placeholder="e.g. https://github.com/torvalds/linux"
                        className="w-full bg-black/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#141416] px-2 text-zinc-500 font-medium">And / Or</span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center bg-black/20 hover:bg-black/40 transition-all group">
                    <FileArchive className="w-10 h-10 text-zinc-600 mx-auto mb-4 group-hover:text-green-500 transition-colors" />
                    <p className="text-sm text-zinc-300 font-medium">Drop Reference Project ZIPs</p>
                    <p className="text-xs text-zinc-500 mt-1">Upload multiple historical repos</p>
                    <input 
                      type="file" 
                      multiple 
                      accept=".zip"
                      onChange={(e) => setRepoFiles(e.target.files)}
                      className="mt-4 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-zinc-800 p-1.5 rounded-md"><FileCode2 className="w-5 h-5 text-zinc-300"/></span>
                  New Submission
                </h2>
                <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center bg-black/20 hover:bg-black/40 transition-all group">
                  <Upload className="w-10 h-10 text-zinc-600 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-zinc-300 font-medium">Drop submission ZIP here</p>
                  <p className="text-xs text-zinc-500 mt-1">The code to investigate</p>
                  <input 
                    type="file" 
                    accept=".zip"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    className="mt-4 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col justify-center items-center p-12 glass-panel rounded-2xl text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-8 border border-white/10">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Ready to Investigate</h3>
              <p className="text-zinc-400 mb-8 max-w-sm">
                CodeDNA will parse the AST of the provided historical code, establish a unique baseline signature, and run a deterministic comparison backed by GPT-4o reasoning.
              </p>
              <button 
                onClick={startAnalysis}
                disabled={!submissionFile || (!githubLink && (!repoFiles || repoFiles.length === 0))}
                className="group relative px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="flex items-center gap-2 relative z-10">
                  Begin Forensic Analysis
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {appState === "analyzing" && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[50vh] glass-panel rounded-2xl"
          >
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
              <motion.div 
                className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <Activity className="absolute inset-0 m-auto w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Extracting CodeDNA...</h2>
            <p className="text-zinc-400">Parsing AST, analyzing dependencies, and generating forensic report.</p>
          </motion.div>
        )}

        {appState === "results" && report && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Investigation Report</h2>
                <p className="text-zinc-400 mt-1">
                  Baseline Reliability: 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-md ${report.deterministic_data?.reliability === 'Reliable' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {report.deterministic_data?.reliability || "Unknown"}
                  </span>
                </p>
              </div>
              <button onClick={() => setAppState("idle")} className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
                New Investigation
              </button>
            </div>

            {/* AI Summary */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-blue-500">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-500" />
                AI Conclusion
              </h3>
              <p className="text-lg leading-relaxed text-zinc-300">
                {report.forensic_report?.summary || "No summary provided."}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Findings */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-bold">Forensic Findings</h3>
                {report.forensic_report?.findings?.map((finding: any, i: number) => (
                  <div key={i} className="glass-panel p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">{finding.reason}</h4>
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wide ${
                        finding.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                        finding.severity === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {finding.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{finding.evidence}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {finding.affected_files?.slice(0, 3).map((f: string, j: number) => (
                        <span key={j} className="text-xs bg-black/50 px-2 py-1 rounded text-zinc-300 border border-zinc-800">
                          {f}
                        </span>
                      ))}
                      {finding.affected_files?.length > 3 && (
                        <span className="text-xs text-zinc-500 px-2 py-1">+{finding.affected_files.length - 3} more</span>
                      )}
                    </div>
                    
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <p className="text-xs text-zinc-300"><span className="text-zinc-500">Recommendation:</span> {finding.recommended_action}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CodeDNA Metrics */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold">CodeDNA Profile</h3>
                
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Complexity Signature</h4>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { metric: 'Avg Lines', baseline: report.deterministic_data?.baseline_metrics?.total_lines / (report.deterministic_data?.baseline_metrics?.total_files || 1), sub: report.deterministic_data?.submission_metrics?.total_lines / (report.deterministic_data?.submission_metrics?.total_files || 1) },
                        { metric: 'Avg Complexity', baseline: report.deterministic_data?.baseline_metrics?.total_complexity / (report.deterministic_data?.baseline_metrics?.total_files || 1) * 10, sub: report.deterministic_data?.submission_metrics?.total_complexity / (report.deterministic_data?.submission_metrics?.total_files || 1) * 10 },
                        { metric: 'Avg Functions', baseline: report.deterministic_data?.baseline_metrics?.total_functions / (report.deterministic_data?.baseline_metrics?.total_files || 1) * 5, sub: report.deterministic_data?.submission_metrics?.total_functions / (report.deterministic_data?.submission_metrics?.total_files || 1) * 5 },
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <Radar name="Baseline" dataKey="baseline" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Radar name="Submission" dataKey="sub" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Language Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(report.deterministic_data?.submission_metrics?.languages || {}).map(([lang, count]: [string, any]) => (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300 capitalize">{lang}</span>
                        <span className="text-sm font-medium">{count} files</span>
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
