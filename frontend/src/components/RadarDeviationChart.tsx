"use client";

import React, { useState } from "react";

interface RadarMetric {
  key: string;
  label: string;
  value: number; // 0 to 100
  reason?: string;
}

interface RadarDeviationChartProps {
  metrics: RadarMetric[];
  size?: number;
}

export function RadarDeviationChart({ metrics, size = 380 }: RadarDeviationChartProps) {
  const [activePoint, setActivePoint] = useState<RadarMetric | null>(null);

  const total = metrics.length;
  if (total < 3) return null;

  const center = size / 2;
  const radius = (size / 2) - 50;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valRatio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const x = center + radius * valRatio * Math.cos(angle);
    const y = center + radius * valRatio * Math.sin(angle);
    return { x, y };
  };

  // Build polygon path for submission deviation
  const submissionPoints = metrics.map((m, i) => {
    const ratio = Math.max(0.05, Math.min(1.0, m.value / 100));
    const { x, y } = getCoordinates(i, ratio);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  // Baseline reference polygon (normal threshold ~ 25%)
  const baselineReferencePoints = metrics.map((_, i) => {
    const { x, y } = getCoordinates(i, 0.25);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const avgDev = metrics.reduce((acc, m) => acc + m.value, 0) / total;
  const isHighRisk = avgDev >= 50;
  const isModerateRisk = avgDev >= 30 && avgDev < 50;

  const polygonFill = isHighRisk 
    ? "rgba(239, 68, 68, 0.18)" 
    : isModerateRisk 
    ? "rgba(245, 158, 11, 0.18)" 
    : "rgba(16, 185, 129, 0.18)";

  const strokeColor = isHighRisk 
    ? "#dc2626" 
    : isModerateRisk 
    ? "#d97706" 
    : "#059669";

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-zinc-950 text-white rounded-xl border border-zinc-800 shadow-inner">
      <div className="w-full flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
            Multi-Vector Deviation Signature
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          Avg Deviation: <strong className={isHighRisk ? "text-red-400" : isModerateRisk ? "text-amber-400" : "text-emerald-400"}>{Math.round(avgDev)}%</strong>
        </span>
      </div>

      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background Concentric Grid Polygons */}
        {levels.map((lvl, lIdx) => {
          const gridPoints = metrics.map((_, i) => {
            const { x, y } = getCoordinates(i, lvl);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ");

          return (
            <g key={lIdx}>
              <polygon
                points={gridPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
                strokeDasharray={lvl === 1.0 ? "none" : "3,3"}
              />
              <text
                x={center}
                y={center - radius * lvl - 4}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255, 255, 255, 0.3)"
                fontFamily="monospace"
              >
                {Math.round(lvl * 100)}%
              </text>
            </g>
          );
        })}

        {/* Axis Spokes from center to edge */}
        {metrics.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Baseline Normal Zone Polygon */}
        <polygon
          points={baselineReferencePoints}
          fill="rgba(255, 255, 255, 0.03)"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.2"
          strokeDasharray="4,4"
        />

        {/* Submission Deviation Polygon */}
        <polygon
          points={submissionPoints}
          fill={polygonFill}
          stroke={strokeColor}
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertex interactive points */}
        {metrics.map((m, i) => {
          const ratio = Math.max(0.05, Math.min(1.0, m.value / 100));
          const { x, y } = getCoordinates(i, ratio);
          const isSelected = activePoint?.key === m.key;

          return (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setActivePoint(m)}
              onMouseLeave={() => setActivePoint(null)}
            >
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 6 : 4}
                fill={strokeColor}
                stroke="#09090b"
                strokeWidth="2"
                className="transition-transform group-hover:scale-125"
              />
            </g>
          );
        })}

        {/* Metric Outer Labels */}
        {metrics.map((m, i) => {
          const { x, y } = getCoordinates(i, 1.18);
          const isSelected = activePoint?.key === m.key;

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isSelected ? "11" : "10"}
              fontWeight={isSelected ? "700" : "500"}
              fill={isSelected ? "#ffffff" : "#a1a1aa"}
              className="cursor-pointer transition-colors"
              onMouseEnter={() => setActivePoint(m)}
              onMouseLeave={() => setActivePoint(null)}
            >
              {m.label} ({Math.round(m.value)}%)
            </text>
          );
        })}
      </svg>

      {/* Floating Info / Tooltip Box */}
      <div className="w-full mt-3 min-h-[44px] bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-300 flex items-center justify-between">
        {activePoint ? (
          <div>
            <span className="font-semibold text-white">{activePoint.label}:</span>{" "}
            <span className="font-mono text-amber-400 font-bold">{Math.round(activePoint.value)}% deviation</span>
            {activePoint.reason && (
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{activePoint.reason}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span className="w-2 h-2 rounded-full border border-dashed border-zinc-500" />
            <span>Hover over any axis point to inspect forensic deviation rationale</span>
          </div>
        )}
        <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Submission
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm border border-dashed border-zinc-400 inline-block" /> Historical Baseline
          </span>
        </div>
      </div>
    </div>
  );
}
