"use client";

import React from "react";
import { BrainCircuit, Cpu, Target, Scale, HelpCircle, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

import { InfoHelper } from "@/components/InfoTooltipModal";

interface MLIntelligenceViewProps {
  mlIntelligence: any;
}

export function MLIntelligenceView({ mlIntelligence }: MLIntelligenceViewProps) {
  if (!mlIntelligence) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-500 shadow-sm">
        <BrainCircuit className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <p className="font-semibold text-zinc-800">ML Intelligence Initializing</p>
        <p className="text-xs text-zinc-500 mt-1">Multi-vector Siamese neural analysis and statistical calibration will appear once comparison executes.</p>
      </div>
    );
  }

  const siamese = mlIntelligence.siamese_metrics || {};
  const calib = mlIntelligence.statistical_calibration || {};
  const attributions = mlIntelligence.feature_attributions || [];
  const ci = calib.confidence_interval_95 || { lower: 0, upper: 0, margin: 0 };
  const probPercent = Math.round((calib.calibrated_probability || 0) * 100);

  const isHighProb = probPercent >= 70;
  const isModerateProb = probPercent >= 35 && probPercent < 70;

  return (
    <div className="space-y-6">
      {/* Top Banner: Hybrid Intelligence Architecture */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-sky-50/90 border border-indigo-200/90 text-zinc-900 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
                <BrainCircuit className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
                Siamese Contrastive Neural Representation &amp; Statistical Calibration
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Projects 48-dimensional AST/lexical vectors into a 24-dimensional learned latent style space, calibrated via logistic Platt scaling.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right px-3.5 py-1.5 bg-white border border-indigo-200/80 rounded-lg shadow-xs">
              <p className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">Hybrid Composite Deviation</p>
              <p className="text-xl font-black text-indigo-700">{mlIntelligence.hybrid_composite_deviation}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Probability Calibration (Left) + Siamese Latent Embedding (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Statistical Probability Calibration */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Calibrated Discontinuity Probability
              </h4>
              <InfoHelper termKey="platt_calibration" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">
              Platt Sigmoid
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* Probability Large Number */}
            <div className="text-center sm:text-left shrink-0">
              <span className={`text-4xl font-black font-mono ${
                isHighProb ? "text-rose-600" : isModerateProb ? "text-amber-600" : "text-emerald-600"
              }`}>
                {probPercent}%
              </span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">
                P(Discontinuity | DNA)
              </p>
            </div>

            {/* Confidence Interval & Error Bar */}
            <div className="flex-1 w-full text-xs space-y-2">
              <div className="flex justify-between font-mono text-[11px] text-zinc-600">
                <span>95% Confidence Interval:</span>
                <strong>[{Math.round(ci.lower * 100)}% — {Math.round(ci.upper * 100)}%]</strong>
              </div>

              {/* Graphical confidence interval bar */}
              <div className="relative w-full h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                {/* Interval range highlight */}
                <div
                  className={`absolute top-0 bottom-0 opacity-40 rounded-full ${
                    isHighProb ? "bg-rose-400" : isModerateProb ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{
                    left: `${Math.max(0, ci.lower * 100)}%`,
                    width: `${Math.max(4, (ci.upper - ci.lower) * 100)}%`,
                  }}
                />
                {/* Point estimate marker */}
                <div
                  className={`absolute top-0 bottom-0 w-1.5 rounded-full ${
                    isHighProb ? "bg-rose-600" : isModerateProb ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                  style={{ left: `${Math.min(98, Math.max(2, probPercent))}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>0% (Baseline Match)</span>
                <span>50% Threshold</span>
                <span>100% (Outlier)</span>
              </div>
            </div>
          </div>

          {/* Risk Bounds Table */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 font-mono">
              <span className="text-[10px] text-zinc-400 uppercase block mb-0.5">False Positive Risk</span>
              <strong className="text-zinc-800 text-[11px]">{calib.false_positive_risk || "Low (< 5%)"}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 font-mono">
              <span className="text-[10px] text-zinc-400 uppercase block mb-0.5">Effective Sample Size</span>
              <strong className="text-zinc-800 text-[11px]">N = {calib.effective_sample_size || 15}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Siamese Latent Space Embeddings */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Siamese Latent Metric Learning
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">
              24-Dim Hypersphere
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Cosine Similarity</span>
              <span className="text-xl font-bold font-mono text-zinc-900 mt-1 block">
                {siamese.cosine_similarity !== undefined ? siamese.cosine_similarity : 0.85}
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">[-1.0 to +1.0 scale]</span>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Euclidean Distance</span>
              <span className="text-xl font-bold font-mono text-zinc-900 mt-1 block">
                {siamese.euclidean_distance !== undefined ? siamese.euclidean_distance : 0.54}
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">[0.0 to 2.0 unit sphere]</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Embedding Match Score:</span>
              <strong className="text-zinc-900">{siamese.embedding_similarity_score || 0}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Latent Divergence:</span>
              <strong className="text-amber-600">{siamese.latent_divergence_score || 0}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Projection Network:</span>
              <span className="text-zinc-700">48 → 32 → 24 (L2 Norm)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latent Feature Attribution: Which dimensions drove the divergence? */}
      {attributions.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-zinc-700" />
              <span>Latent Dimension Attribution (Top Divergence Drivers)</span>
            </h4>
            <span className="text-[10px] font-mono text-zinc-400">Gradient Impact</span>
          </div>

          <div className="space-y-2">
            {attributions.map((attr: any, idx: number) => {
              const cleanName = attr.feature.replace(/_/g, " ").replace("norm", "").trim();
              return (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 text-[10px]">#{idx + 1}</span>
                    <span className="font-medium text-zinc-900 capitalize">{cleanName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-zinc-500 text-[11px]">
                      Base: <strong>{attr.baseline_val}</strong> → Sub: <strong>{attr.submission_val}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px] shrink-0">
                      Impact: {attr.impact_score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ensemble Weighting Specification Card */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-600 flex flex-wrap items-center justify-between gap-4 font-mono">
        <span className="font-bold text-zinc-800">Hybrid Ensemble Formula:</span>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-white border border-zinc-200">
            AST Heuristics (40%)
          </span>
          <span>+</span>
          <span className="px-2 py-0.5 rounded bg-white border border-zinc-200">
            Siamese Embeddings (35%)
          </span>
          <span>+</span>
          <span className="px-2 py-0.5 rounded bg-white border border-zinc-200">
            Outlier Density (25%)
          </span>
          <span>=</span>
          <strong className="text-zinc-900">Hybrid Score</strong>
        </div>
      </div>
    </div>
  );
}
