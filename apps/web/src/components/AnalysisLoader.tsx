"use client";

import React, { useState, useEffect } from "react";

const diagnosticMessages = [
  "Analyzing reported symptoms…",
  "Cross-referencing vehicle database…",
  "Evaluating potential causes…",
  "Checking known TSBs and recalls…",
  "Estimating repair complexity…",
  "Generating diagnostic report…",
];

export default function AnalysisLoader() {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % diagnosticMessages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-emerald-400 font-mono" key={messageIdx}>
          {diagnosticMessages[messageIdx]}
        </p>
        <p className="text-xs text-slate-500">This usually takes 5-10 seconds</p>
      </div>
      <div className="w-64 h-1 rounded-full overflow-hidden bg-slate-800">
        <div className="h-full rounded-full bg-emerald-500" style={{ animation: "indeterminate 2s ease-in-out infinite" }} />
      </div>
      <style jsx>{`
        @keyframes indeterminate {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
