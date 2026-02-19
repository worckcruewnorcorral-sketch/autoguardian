"use client";

import React, { useState } from "react";
import type { DiagnosisResult as DiagnosisResultType } from "@/lib/types";

/* ─── Severity helpers ─── */
const severityConfig = {
  urgent: {
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    bar: "bg-red-500",
    label: "Urgent",
    icon: "⚠",
  },
  soon: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    bar: "bg-yellow-500",
    label: "Needs Attention",
    icon: "⏰",
  },
  monitor: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    bar: "bg-emerald-500",
    label: "Monitor",
    icon: "👁",
  },
};

const difficultyConfig = {
  easy: { color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Easy" },
  moderate: { color: "text-yellow-400", bg: "bg-yellow-500/15", label: "Moderate" },
  advanced: { color: "text-red-400", bg: "bg-red-500/15", label: "Advanced" },
};

/* ─── Sub-components ─── */

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="text-lg">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </h3>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

function ConfidenceBar({ confidence, severity }: { confidence: number; severity: string }) {
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.monitor;
  const pct = Math.round(confidence * 100);

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-900">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${config.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-semibold ${config.color} min-w-[3rem] text-right`}>
        {pct}%
      </span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.monitor;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color} ${config.bg} ${config.border}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-5 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Main Component ─── */

export default function DiagnosisResultCard({ data }: { data: DiagnosisResultType }) {
  const [expandedCause, setExpandedCause] = useState<number | null>(0);
  const [showDiy, setShowDiy] = useState(false);

  const urgencyConfig = severityConfig[data.urgency.level] || severityConfig.monitor;

  return (
    <div className="space-y-6">
      {/* ─── Summary Banner ─── */}
      <div
        className={`rounded-xl border p-6 relative overflow-hidden ${
          data.urgency.level === "urgent"
            ? "border-red-500/20 bg-gradient-to-br from-slate-900 to-red-950/20"
            : data.urgency.level === "soon"
            ? "border-yellow-500/20 bg-gradient-to-br from-slate-900 to-yellow-950/20"
            : "border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/20"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${urgencyConfig.bar} animate-pulse`} />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Diagnostic Summary
              </span>
            </div>
            <p className="text-lg leading-relaxed text-slate-100">
              {data.summary}
            </p>
          </div>
          <SeverityBadge severity={data.urgency.level} />
        </div>
      </div>

      {/* ─── Quick Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Safe to drive */}
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                data.safeToDrive.verdict
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {data.safeToDrive.verdict ? "✓" : "✕"}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-0.5">
                Safe to Drive?
              </div>
              <div
                className={`text-sm font-semibold ${
                  data.safeToDrive.verdict ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {data.safeToDrive.verdict ? "Yes, with caution" : "Not recommended"}
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed mt-2 text-slate-400">
            {data.safeToDrive.explanation}
          </p>
        </Card>

        {/* Estimated cost */}
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-emerald-500/15 text-emerald-400">
              $
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-0.5">
                Estimated Cost
              </div>
              <div className="text-sm font-semibold font-mono text-slate-100">
                ${data.estimatedCost.low.toLocaleString()} — ${data.estimatedCost.high.toLocaleString()}
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed mt-2 text-slate-400">
            {data.estimatedCost.note}
          </p>
        </Card>

        {/* Timeframe */}
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${urgencyConfig.bg} ${urgencyConfig.color}`}
            >
              ⏱
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-0.5">
                Timeframe
              </div>
              <div className={`text-sm font-semibold ${urgencyConfig.color}`}>
                {data.urgency.timeframe}
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed mt-2 text-slate-400">
            {data.urgency.explanation}
          </p>
        </Card>
      </div>

      {/* ─── Likely Causes ─── */}
      <Card>
        <SectionHeader icon="🔍" title="Likely Causes" />
        <div className="space-y-3">
          {data.likelyCauses.map((cause, i) => (
            <button
              key={i}
              onClick={() => setExpandedCause(expandedCause === i ? null : i)}
              className={`w-full text-left rounded-lg border p-4 transition-all duration-200 ${
                expandedCause === i
                  ? "border-emerald-500/40 bg-slate-800/60"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    #{i + 1}
                  </span>
                  <span className="font-medium text-slate-100">
                    {cause.cause}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={cause.severity} />
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 text-slate-500 ${
                      expandedCause === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <ConfidenceBar confidence={cause.confidence} severity={cause.severity} />
              {expandedCause === i && (
                <div className="mt-3 pt-3 text-sm leading-relaxed text-slate-400 border-t border-slate-800">
                  {cause.explanation}
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* ─── Questions for Mechanic ─── */}
      <Card>
        <SectionHeader icon="🗣" title="Questions for Your Mechanic" />
        <div className="space-y-2.5">
          {data.questionsForMechanic.map((q, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg p-3 bg-slate-950/60">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-400">{q}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── DIY Section ─── */}
      {data.diyPossible.feasible && (
        <Card>
          <button
            onClick={() => setShowDiy(!showDiy)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔧</span>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                DIY Repair Guide
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  difficultyConfig[data.diyPossible.difficulty].color
                } ${difficultyConfig[data.diyPossible.difficulty].bg}`}
              >
                {difficultyConfig[data.diyPossible.difficulty].label}
              </span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 text-slate-500 ${showDiy ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDiy && (
            <div className="mt-4 space-y-4">
              {/* Warnings */}
              {data.diyPossible.warnings.length > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/[0.08] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400 text-sm">⚠</span>
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                      Safety Warnings
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {data.diyPossible.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-red-300/80 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-red-500">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tools needed */}
              {data.diyPossible.tools.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Tools Needed
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.diyPossible.tools.map((tool, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-950 text-slate-400 border border-slate-800">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-2">
                {data.diyPossible.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold font-mono bg-emerald-500/15 text-emerald-400">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-400">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ─── Additional Notes ─── */}
      {data.additionalNotes && (
        <Card>
          <SectionHeader icon="📝" title="Additional Notes" />
          <p className="text-sm leading-relaxed text-slate-400">
            {data.additionalNotes}
          </p>
        </Card>
      )}
    </div>
  );
}
