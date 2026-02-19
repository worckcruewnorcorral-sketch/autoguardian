"use client";

import React, { useState } from "react";

interface OBDResult {
  code: string;
  title: string;
  system: string;
  description: string;
  severity: "urgent" | "soon" | "monitor";
  commonCauses: {
    cause: string;
    likelihood: "high" | "medium" | "low";
    explanation: string;
  }[];
  symptoms: string[];
  estimatedCost: {
    low: number;
    high: number;
    note: string;
  };
  safeToDrive: {
    verdict: boolean;
    explanation: string;
  };
  diagnosticSteps: string[];
  diyFeasibility: {
    feasible: boolean;
    difficulty: "easy" | "moderate" | "advanced";
    note: string;
  };
  relatedCodes: string[];
  additionalNotes: string;
}

const severityConfig = {
  urgent: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", dot: "bg-red-500", label: "Urgent" },
  soon: { color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", dot: "bg-yellow-500", label: "Needs Attention" },
  monitor: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-500", label: "Monitor" },
};

const likelihoodConfig = {
  high: { color: "text-red-400", bg: "bg-red-500/15", label: "High" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/15", label: "Medium" },
  low: { color: "text-slate-400", bg: "bg-slate-500/15", label: "Low" },
};

const COMMON_CODES = [
  { code: "P0300", label: "Random Misfire" },
  { code: "P0420", label: "Catalyst Efficiency" },
  { code: "P0171", label: "System Too Lean" },
  { code: "P0455", label: "EVAP Large Leak" },
  { code: "P0128", label: "Coolant Thermostat" },
  { code: "P0442", label: "EVAP Small Leak" },
  { code: "P0301", label: "Cylinder 1 Misfire" },
  { code: "P0016", label: "Cam/Crank Correlation" },
];

export default function OBDLookupPage() {
  const [code, setCode] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OBDResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR + 1 - i);
  const MAKES = [
    "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
    "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus",
    "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla",
    "Toyota", "Volkswagen", "Volvo",
  ];

  const isValidCode = /^[PpBbCcUu][0-9]{4}$/.test(code.trim());
  const canSubmit = isValidCode && make && model && !isLoading;

  const handleLookup = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/obd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          vehicle: { year, make, model },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setResult(data.result);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectCode = (c: string) => {
    setCode(c);
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 transition-colors outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 placeholder:text-slate-600";

  const sev = result ? severityConfig[result.severity] : null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-100">
              Auto<span className="text-emerald-400">Guardian</span>
            </h1>
          </div>
          <a href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            OBD Code Lookup
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Enter your check engine code and get a detailed breakdown of what it means,
            how urgent it is, common causes, and estimated repair costs for your specific vehicle.
          </p>
        </div>

        {/* Code Input */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Diagnostic Code
            </h3>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. P0420"
                maxLength={5}
                className={`${inputClasses} text-2xl font-mono font-bold tracking-widest text-center py-4 ${
                  code.length === 5 && !isValidCode ? "border-red-500/50" : ""
                }`}
              />
              {code.length > 0 && !isValidCode && code.length === 5 && (
                <p className="text-xs text-red-400 mt-1.5 text-center">
                  Enter a valid OBD-II code (e.g. P0420, B0100, C0035, U0100)
                </p>
              )}
              {code.length === 0 && (
                <p className="text-xs text-slate-600 mt-1.5 text-center">
                  Format: 1 letter (P/B/C/U) + 4 digits
                </p>
              )}
            </div>
          </div>

          {/* Common codes */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Common codes:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_CODES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => selectCode(c.code)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                    code === c.code
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                  }`}
                >
                  {c.code} <span className="font-sans text-slate-600 ml-1">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle (optional context) */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🚗</span>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Your Vehicle
            </h3>
            <span className="text-[10px] text-slate-600 ml-1">(for vehicle-specific results)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClasses}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Make</label>
              <select value={make} onChange={(e) => setMake(e.target.value)} className={inputClasses}>
                <option value="">Select…</option>
                {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Camry" className={inputClasses} />
            </div>
          </div>
        </section>

        {/* Lookup Button */}
        <button
          onClick={handleLookup}
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
            canSubmit
              ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Looking up code…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Look Up Code
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4 flex items-start gap-3">
            <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-red-400">Lookup Failed</p>
              <p className="text-xs text-red-300/70 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-emerald-400 font-mono">Decoding {code}…</p>
              <p className="text-xs text-slate-500">Analyzing code for your vehicle</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-slate-100">Results</h2>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Code Header */}
            <div className={`rounded-xl border p-6 ${
              result.severity === "urgent"
                ? "border-red-500/20 bg-gradient-to-br from-slate-900 to-red-950/20"
                : result.severity === "soon"
                ? "border-yellow-500/20 bg-gradient-to-br from-slate-900 to-yellow-950/20"
                : "border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/20"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-mono font-bold text-white">{result.code}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${sev?.color} ${sev?.bg} ${sev?.border}`}>
                      {sev?.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">{result.title}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{result.system}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sev?.bg}`}>
                  <div className={`w-3 h-3 rounded-full ${sev?.dot} animate-pulse`} />
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{result.description}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                    result.safeToDrive.verdict ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    {result.safeToDrive.verdict ? "✓" : "✕"}
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Safe to Drive?</div>
                    <div className={`text-sm font-semibold ${result.safeToDrive.verdict ? "text-emerald-400" : "text-red-400"}`}>
                      {result.safeToDrive.verdict ? "Yes, with caution" : "Not recommended"}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{result.safeToDrive.explanation}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-emerald-500/15 text-emerald-400">$</div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Estimated Cost</div>
                    <div className="text-sm font-semibold font-mono text-slate-100">
                      ${result.estimatedCost.low.toLocaleString()} — ${result.estimatedCost.high.toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{result.estimatedCost.note}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                    result.diyFeasibility.feasible ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"
                  }`}>🔧</div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-500">DIY Repair?</div>
                    <div className={`text-sm font-semibold ${result.diyFeasibility.feasible ? "text-emerald-400" : "text-slate-400"}`}>
                      {result.diyFeasibility.feasible ? result.diyFeasibility.difficulty.charAt(0).toUpperCase() + result.diyFeasibility.difficulty.slice(1) : "Not recommended"}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{result.diyFeasibility.note}</p>
              </div>
            </div>

            {/* Common Causes */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-lg">⚡</span>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Common Causes</h3>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="space-y-3">
                {result.commonCauses.map((cause, i) => {
                  const lk = likelihoodConfig[cause.likelihood];
                  return (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-sm text-slate-100">{cause.cause}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${lk.color} ${lk.bg}`}>
                          {lk.label} likelihood
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{cause.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Symptoms */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-lg">🩺</span>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Symptoms You May Notice</h3>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.symptoms.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Steps */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-lg">🔧</span>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Diagnostic Steps</h3>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="space-y-2.5">
                {result.diagnosticSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg p-3 bg-slate-950/60">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold font-mono bg-emerald-500/15 text-emerald-400">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-400">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Codes */}
            {result.relatedCodes.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-lg">🔗</span>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Related Codes</h3>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.relatedCodes.map((rc, i) => (
                    <button
                      key={i}
                      onClick={() => { setCode(rc); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-800 bg-slate-950 text-emerald-400 hover:border-emerald-500/40 transition-colors"
                    >
                      {rc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {result.additionalNotes && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-lg">📝</span>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Additional Notes</h3>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <p className="text-sm leading-relaxed text-slate-400">{result.additionalNotes}</p>
              </div>
            )}
          </div>
        )}

        <footer className="pb-8">
          <p className="text-[11px] text-center leading-relaxed text-slate-600">
            AutoGuardian provides AI-generated information — not professional mechanical advice.
            Always consult a certified mechanic for safety-critical issues.
          </p>
        </footer>
      </main>
    </div>
  );
}
