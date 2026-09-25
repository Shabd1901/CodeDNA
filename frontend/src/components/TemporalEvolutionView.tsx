"use client";

import React, { useState } from "react";
import { GitCommit, TrendingUp, AlertTriangle, CheckCircle2, Milestone, ArrowRight, Activity, Calendar } from "lucide-react";

interface MilestoneData {
  id: string;
  label: string;
  type: "historical" | "submission";
  complexity_mean: number;
  complexity_p90: number;
  loc_mean: number;
  type_hint_ratio: number;
  snake_case_ratio: number;
  usable_files: number;
}

interface TemporalIntelligence {
  milestones: MilestoneData[];
  change_point_analysis: {
    complexity_cusum: any;
    naming_cusum: any;
    change_point_detected: boolean;
    primary_divergent_metric: string;
  };
  trajectory_diagnosis: string;
  temporal_severity: string;
  evaluator_temporal_narrative: string;
}

interface TemporalEvolutionViewProps {
  temporalIntelligence: TemporalIntelligence | null;
}

type MetricKey = "complexity_p90" | "loc_mean" | "snake_case_ratio" | "type_hint_ratio";

export function TemporalEvolutionView({ temporalIntelligence }: TemporalEvolutionViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("complexity_p90");

  if (!temporalIntelligence || !temporalIntelligence.milestones) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-500 shadow-sm">
        <Milestone className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <p className="font-semibold text-zinc-800">Temporal Analysis Pending</p>
        <p className="text-xs text-zinc-500 mt-1">Timeline milestones and CUSUM change-point evaluation will be rendered here.</p>
      </div>
    );
  }

  const milestones = temporalIntelligence.milestones;
  const isChangePoint = temporalIntelligence.change_point_analysis.change_point_detected;
  const diagnosis = temporalIntelligence.trajectory_diagnosis;
  const severity = temporalIntelligence.temporal_severity;

  const METRIC_CONFIG: Record<MetricKey, { label: string; unit: string; format: (v: number) => string }> = {
    complexity_p90: { label: "Complexity P90", unit: "cyclomatic", format: (v) => `${v.toFixed(1)}` },
    loc_mean: { label: "Lines of Code (Mean)", unit: "LOC", format: (v) => `${Math.round(v)}` },
    snake_case_ratio: { label: "Snake_case Ratio", unit: "%", format: (v) => `${Math.round(v)}%` },
    type_hint_ratio: { label: "Type Hint Coverage", unit: "%", format: (v) => `${Math.round(v)}%` },
  };

  const metricVals = milestones.map(m => m[selectedMetric]);
  const minVal = Math.min(...metricVals);
  const maxVal = Math.max(...metricVals);
  const range = (maxVal - minVal) || 1.0;

  // SVG Chart Geometry
  const chartWidth = 620;
  const chartHeight = 220;
  const paddingX = 60;
  const paddingY = 40;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index / Math.max(1, milestones.length - 1)) * (chartWidth - paddingX * 2);
    const normalizedY = (val - minVal) / range;
    const y = (chartHeight - paddingY) - normalizedY * (chartHeight - paddingY * 2);
    return { x, y };
  };

  // Historical path vs Submission segment
  const historicalMilestones = milestones.filter(m => m.type === "historical");
  const submissionMilestone = milestones.find(m => m.type === "submission");

  const points = milestones.map((m, i) => getCoordinates(i, m[selectedMetric]));
  const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Top Banner: Trajectory Diagnosis */}
      <div className={`p-6 rounded-xl border shadow-sm ${
        severity === "High"
          ? "bg-red-50 border-red-300 text-red-950"
          : severity === "Moderate"
          ? "bg-amber-50 border-amber-300 text-amber-950"
          : "bg-emerald-50 border-emerald-300 text-emerald-950"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg mt-0.5 ${
              severity === "High" ? "bg-red-100 text-red-700" : severity === "Moderate" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {isChangePoint ? <AlertTriangle className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-75">
                  Temporal Trajectory Diagnosis:
                </span>
                <span className="font-bold text-base">{diagnosis}</span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90 max-w-2xl">
                {temporalIntelligence.evaluator_temporal_narrative}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`inline-block px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${
              isChangePoint
                ? "bg-red-200 border-red-300 text-red-900"
                : "bg-emerald-200 border-emerald-300 text-emerald-900"
            }`}>
              {isChangePoint ? "CUSUM Discontinuity Flagged" : "Smooth Evolution Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Trendline Chart Card */}
      <div className="bg-zinc-950 text-white border border-zinc-800 rounded-xl p-6 shadow-md space-y-4">
        {/* Metric Selector Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Chronological Trendline Trajectory
            </h4>
          </div>

          {/* Metric Switcher Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900 rounded-lg text-xs font-mono">
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((mKey) => (
              <button
                key={mKey}
                onClick={() => setSelectedMetric(mKey)}
                className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                  selectedMetric === mKey
                    ? "bg-zinc-800 text-white font-bold shadow-xs border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {METRIC_CONFIG[mKey].label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chronological Plot */}
        <div className="relative w-full overflow-x-auto flex justify-center py-2">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible select-none">
            {/* Horizontal Grid lines */}
            {[0.0, 0.5, 1.0].map((frac, idx) => {
              const y = (chartHeight - paddingY) - frac * (chartHeight - paddingY * 2);
              const val = minVal + frac * range;
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="rgba(255, 255, 255, 0.4)"
                    fontFamily="monospace"
                  >
                    {METRIC_CONFIG[selectedMetric].format(val)}
                  </text>
                </g>
              );
            })}

            {/* Connecting Trend Polyline */}
            <polyline
              points={polylineStr}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Change-point segment highlight (last line leading to submission) */}
            {points.length >= 2 && (
              <line
                x1={points[points.length - 2].x}
                y1={points[points.length - 2].y}
                x2={points[points.length - 1].x}
                y2={points[points.length - 1].y}
                stroke={isChangePoint ? "#ef4444" : "#10b981"}
                strokeWidth="3.5"
                strokeDasharray={isChangePoint ? "4,4" : "none"}
              />
            )}

            {/* Milestone Interactive Points */}
            {points.map((p, idx) => {
              const m = milestones[idx];
              const isSub = m.type === "submission";
              const pointColor = isSub ? (isChangePoint ? "#ef4444" : "#10b981") : "#818cf8";

              return (
                <g key={idx}>
                  {/* Outer circle halo for submission */}
                  {isSub && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="10"
                      fill={pointColor}
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSub ? 6 : 4.5}
                    fill={pointColor}
                    stroke="#09090b"
                    strokeWidth="2"
                  />
                  {/* Point Value Tooltip */}
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={isSub ? (isChangePoint ? "#f87171" : "#34d399") : "#e4e4e7"}
                    fontFamily="monospace"
                  >
                    {METRIC_CONFIG[selectedMetric].format(m[selectedMetric])}
                  </text>
                  {/* X Axis Milestone Label */}
                  <text
                    x={p.x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isSub ? "#ffffff" : "#a1a1aa"}
                    fontFamily="sans-serif"
                    fontWeight={isSub ? "bold" : "normal"}
                  >
                    {isSub ? "Target Submission" : `t${idx + 1}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-zinc-800 pt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> Historical Evolution (t₁…tₖ)
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${isChangePoint ? "bg-red-500" : "bg-emerald-500"}`} /> Target Submission
            </span>
          </div>
          <span>
            Primary Divergent Metric: <strong>{temporalIntelligence.change_point_analysis.primary_divergent_metric}</strong>
          </span>
        </div>
      </div>

      {/* Milestone Snapshots Table */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-zinc-700" />
          <span>Milestone Snapshots &amp; Trajectory Progression</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3">Milestone Epoch</th>
                <th className="py-2.5 px-3">Files</th>
                <th className="py-2.5 px-3">Complexity (P90)</th>
                <th className="py-2.5 px-3">Mean LOC</th>
                <th className="py-2.5 px-3">Snake_case</th>
                <th className="py-2.5 px-3">Type Hints</th>
                <th className="py-2.5 px-3">Trajectory Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {milestones.map((m, idx) => {
                const isSub = m.type === "submission";
                return (
                  <tr key={idx} className={isSub ? "bg-indigo-50/60 font-bold border-l-4 border-indigo-500" : "hover:bg-zinc-50"}>
                    <td className="py-2.5 px-3 text-zinc-900 font-sans">
                      <span className="flex items-center gap-1.5">
                        <GitCommit className={`w-3.5 h-3.5 ${isSub ? "text-indigo-600 font-bold" : "text-zinc-400"}`} />
                        <span className={isSub ? "font-bold text-indigo-950" : "font-medium text-zinc-800"}>{m.label}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600">{m.usable_files}</td>
                    <td className="py-2.5 px-3 text-zinc-800">{m.complexity_p90}</td>
                    <td className="py-2.5 px-3 text-zinc-800">{m.loc_mean}</td>
                    <td className="py-2.5 px-3 text-zinc-800">{m.snake_case_ratio}%</td>
                    <td className="py-2.5 px-3 text-zinc-800">{m.type_hint_ratio}%</td>
                    <td className="py-2.5 px-3 font-sans">
                      {isSub ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isChangePoint ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {isChangePoint ? "Abrupt Step-Change" : "Normal Continuation"}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Historical Baseline Anchor</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
