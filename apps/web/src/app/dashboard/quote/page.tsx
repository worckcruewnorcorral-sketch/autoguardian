"use client";

import React, { useState, useRef } from "react";

interface LineItemAnalysis {
  item: string;
  quotedPrice: number;
  fairPriceLow: number;
  fairPriceHigh: number;
  verdict: "fair" | "high" | "low" | "unclear";
  explanation: string;
}

interface QuoteResult {
  summary: string;
  overallVerdict: "fair" | "overpriced" | "underpriced" | "mixed";
  totalQuoted: number;
  fairTotalLow: number;
  fairTotalHigh: number;
  lineItems: LineItemAnalysis[];
  redFlags: string[];
  greenFlags: string[];
  negotiationTips: string[];
  questionsToAsk: string[];
  additionalNotes: string;
}

const verdictConfig = {
  fair: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", label: "Fair Price", icon: "✓" },
  overpriced: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", label: "Overpriced", icon: "↑" },
  underpriced: { color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", label: "Suspiciously Low", icon: "↓" },
  mixed: { color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", label: "Mixed", icon: "~" },
};

const itemVerdictConfig = {
  fair: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Fair" },
  high: { color: "text-red-400", bg: "bg-red-500/10", label: "High" },
  low: { color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Low" },
  unclear: { color: "text-slate-400", bg: "bg-slate-500/10", label: "Unclear" },
};

export default function QuoteCheckerPage() {
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const [quoteText, setQuoteText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR + 1 - i);
  const MAKES = [
    "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
    "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus",
    "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla",
    "Toyota", "Volkswagen", "Volvo",
  ];

  const canSubmit =
    ((inputMode === "text" && quoteText.trim().length >= 10) ||
      (inputMode === "image" && imageFile !== null)) &&
    make &&
    model &&
    !isLoading;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }

    setImageFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCheck = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let body: string;

      if (inputMode === "image" && imageFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = () => reject(new Error("Failed to read image"));
          reader.readAsDataURL(imageFile);
        });

        body = JSON.stringify({
          type: "image",
          image: base64,
          mimeType: imageFile.type,
          vehicle: { year, make, model },
        });
      } else {
        body = JSON.stringify({
          type: "text",
          quoteText: quoteText.trim(),
          vehicle: { year, make, model },
        });
      }

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
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

  const inputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 transition-colors outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 placeholder:text-slate-600";

  const overallV = result ? verdictConfig[result.overallVerdict] : null;

  return (
    <div className="min-h-screen bg-slate-950">
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
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Quote Checker</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Upload a photo of your repair quote or type in the line items, and our AI will tell you
            if the prices are fair, flag any concerns, and give you negotiation tips.
          </p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
          <button
            onClick={() => setInputMode("text")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inputMode === "text"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            ✏️ Type it in
          </button>
          <button
            onClick={() => setInputMode("image")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inputMode === "image"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            📷 Upload photo
          </button>
        </div>

        {/* Quote Input */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Repair Quote
            </h3>
          </div>

          {inputMode === "text" ? (
            <>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder={`Paste or type your repair quote here. Include line items and prices. For example:\n\nBrake pad replacement (front) - $350\nBrake rotor replacement (front pair) - $420\nBrake fluid flush - $120\nLabor (2.5 hours @ $150/hr) - $375\nShop supplies & disposal - $45\nTotal: $1,310`}
                rows={8}
                className={`${inputClasses} resize-none leading-relaxed font-mono text-xs`}
              />
              <p className="text-xs text-slate-500">
                Include as much detail as possible — parts, labor rates, fees, and totals.
              </p>
            </>
          ) : (
            <div>
              {!imagePreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center gap-3 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
                    📷
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-300">Click to upload a photo of your quote</p>
                    <p className="text-xs text-slate-600 mt-1">JPG, PNG — max 10MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Quote preview"
                    className="w-full rounded-xl border border-slate-800 max-h-96 object-contain bg-slate-950"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
        </section>

        {/* Vehicle */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🚗</span>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Your Vehicle</h3>
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

        {/* Check Button */}
        <button
          onClick={handleCheck}
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
              Analyzing quote…
            </>
          ) : (
            <>
              <span>💰</span>
              Check Quote
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4 flex items-start gap-3">
            <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-red-400">Check Failed</p>
              <p className="text-xs text-red-300/70 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-emerald-400 font-mono">Analyzing your quote…</p>
              <p className="text-xs text-slate-500">Comparing prices against national averages</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-slate-100">Quote Analysis</h2>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Overall Verdict Banner */}
            <div className={`rounded-xl border p-6 ${
              result.overallVerdict === "fair"
                ? "border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/20"
                : result.overallVerdict === "overpriced"
                ? "border-red-500/20 bg-gradient-to-br from-slate-900 to-red-950/20"
                : "border-yellow-500/20 bg-gradient-to-br from-slate-900 to-yellow-950/20"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${overallV?.bg === "bg-emerald-500/15" ? "bg-emerald-500" : overallV?.bg === "bg-red-500/15" ? "bg-red-500" : "bg-yellow-500"} animate-pulse`} />
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Overall Verdict</span>
                  </div>
                  <p className="text-lg leading-relaxed text-slate-100">{result.summary}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${overallV?.color} ${overallV?.bg} ${overallV?.border}`}>
                  {overallV?.icon} {overallV?.label}
                </span>
              </div>

              {/* Price comparison bar */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Fair range: ${result.fairTotalLow.toLocaleString()} — ${result.fairTotalHigh.toLocaleString()}</span>
                  <span className="font-mono font-semibold text-slate-100">Quoted: ${result.totalQuoted.toLocaleString()}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 relative overflow-hidden">
                  {/* Fair range indicator */}
                  <div
                    className="absolute h-full bg-emerald-500/20 rounded-full"
                    style={{
                      left: `${Math.max(0, (result.fairTotalLow / (result.fairTotalHigh * 1.5)) * 100)}%`,
                      width: `${((result.fairTotalHigh - result.fairTotalLow) / (result.fairTotalHigh * 1.5)) * 100}%`,
                    }}
                  />
                  {/* Quoted price marker */}
                  <div
                    className={`absolute top-0 w-1 h-full rounded-full ${
                      result.overallVerdict === "fair" ? "bg-emerald-400" : result.overallVerdict === "overpriced" ? "bg-red-400" : "bg-yellow-400"
                    }`}
                    style={{
                      left: `${Math.min(95, Math.max(5, (result.totalQuoted / (result.fairTotalHigh * 1.5)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-lg">📝</span>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Line Item Breakdown</h3>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="space-y-3">
                {result.lineItems.map((item, i) => {
                  const iv = itemVerdictConfig[item.verdict];
                  return (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-100">{item.item}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-semibold text-slate-100">${item.quotedPrice.toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${iv.color} ${iv.bg}`}>
                            {iv.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500">Fair range:</span>
                        <span className="text-xs font-mono text-slate-400">
                          ${item.fairPriceLow.toLocaleString()} — ${item.fairPriceHigh.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Red Flags & Green Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.redFlags.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span>🚩</span>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-red-400">Red Flags</h3>
                  </div>
                  <div className="space-y-2">
                    {result.redFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5 text-xs">✕</span>
                        <p className="text-xs text-red-300/80 leading-relaxed">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.greenFlags.length > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span>✅</span>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Good Signs</h3>
                  </div>
                  <div className="space-y-2">
                    {result.greenFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5 text-xs">✓</span>
                        <p className="text-xs text-emerald-300/80 leading-relaxed">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Negotiation Tips */}
            {result.negotiationTips.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-lg">💬</span>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Negotiation Tips</h3>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="space-y-2.5">
                  {result.negotiationTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg p-3 bg-slate-950/60">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-400">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions to Ask */}
            {result.questionsToAsk.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-lg">🗣</span>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Questions to Ask the Shop</h3>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="space-y-2.5">
                  {result.questionsToAsk.map((q, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg p-3 bg-slate-950/60">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-400">{q}</p>
                    </div>
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
            AutoGuardian provides AI-generated estimates — not professional financial advice.
            Prices are US national averages and may vary by location, shop, and parts quality.
          </p>
        </footer>
      </main>
    </div>
  );
}
