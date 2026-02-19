"use client";

import React, { useState, useCallback } from "react";
import DiagnosisResultCard from "@/components/DiagnosisResult";
import AnalysisLoader from "@/components/AnalysisLoader";
import type {
  Vehicle,
  DiagnosisResult as DiagnosisResultType,
  AnalyzeResponse,
  SavedVehicle,
} from "@/lib/types";

/* ─── Demo saved vehicles ─── */
const SAVED_VEHICLES: SavedVehicle[] = [
  { id: "v1", year: 2019, make: "Toyota", model: "Camry", mileage: 62000, nickname: "Daily Driver" },
  { id: "v2", year: 2021, make: "Honda", model: "CR-V", mileage: 34000, nickname: "Family SUV" },
];

const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
  "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus",
  "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla",
  "Toyota", "Volkswagen", "Volvo",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR + 1 - i);

export default function AnalyzePage() {
  const [vehicles] = useState<SavedVehicle[]>(SAVED_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [newYear, setNewYear] = useState<number>(CURRENT_YEAR);
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newMileage, setNewMileage] = useState("");

  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const getActiveVehicle = useCallback((): Vehicle | null => {
    if (showAddVehicle) {
      if (!newMake || !newModel || !newMileage) return null;
      return { year: newYear, make: newMake, model: newModel, mileage: parseInt(newMileage) };
    }
    const v = vehicles.find((v) => v.id === selectedVehicleId);
    return v ? { year: v.year, make: v.make, model: v.model, mileage: v.mileage } : null;
  }, [showAddVehicle, newYear, newMake, newModel, newMileage, selectedVehicleId, vehicles]);

  const canSubmit = !!getActiveVehicle() && description.trim().length >= 10 && !isLoading;

  const handleAnalyze = async () => {
    const vehicle = getActiveVehicle();
    if (!vehicle || !description.trim()) return;

    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const res = await fetch("/api/analyze/symptom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle, description: description.trim() }),
      });

      const data: AnalyzeResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.diagnosis) setDiagnosis(data.diagnosis);
      if (data.remainingConsultations !== undefined) setRemaining(data.remainingConsultations);
    } catch {
      setError("Unable to reach the diagnostic server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 transition-colors outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 placeholder:text-slate-600";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10">
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-emerald-400"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-100">
              Auto<span className="text-emerald-400">Guardian</span>
            </h1>
          </div>
          {remaining !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {remaining} free {remaining === 1 ? "analysis" : "analyses"} left
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Symptom Analyzer
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Describe what your vehicle is doing and our AI diagnostic engine will identify likely
            causes, urgency, estimated costs, and next steps.
          </p>
        </div>

        {/* Vehicle Selection */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🚗</span>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Vehicle
              </h3>
            </div>
            <button
              onClick={() => {
                setShowAddVehicle(!showAddVehicle);
                setSelectedVehicleId("");
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-emerald-400 transition-colors hover:border-emerald-500/40"
            >
              {showAddVehicle ? "← Select saved" : "+ Add vehicle"}
            </button>
          </div>

          {!showAddVehicle ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 text-left ${
                    selectedVehicleId === v.id
                      ? "border-emerald-500/40 bg-slate-800/60 shadow-[0_0_12px_rgba(34,197,94,0.08)]"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                      selectedVehicleId === v.id ? "bg-emerald-500/15" : "bg-slate-800"
                    }`}
                  >
                    {selectedVehicleId === v.id ? "✓" : "🚗"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate text-slate-100">
                      {v.nickname || `${v.year} ${v.make} ${v.model}`}
                    </div>
                    <div className="text-xs text-slate-500">
                      {v.year} {v.make} {v.model} · {v.mileage.toLocaleString()} mi
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Year
                </label>
                <select value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} className={inputClasses}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Make
                </label>
                <select value={newMake} onChange={(e) => setNewMake(e.target.value)} className={inputClasses}>
                  <option value="">Select…</option>
                  {POPULAR_MAKES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Model
                </label>
                <input
                  type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. Civic" className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mileage
                </label>
                <input
                  type="number" value={newMileage} onChange={(e) => setNewMileage(e.target.value)}
                  placeholder="e.g. 55000" className={inputClasses}
                />
              </div>
            </div>
          )}
        </section>

        {/* Symptom Description */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Describe the Symptoms
            </h3>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Describe what's happening with your vehicle in detail. For example:\n\n"My car makes a grinding noise when I brake, especially at low speeds. It started about a week ago and seems to be getting worse. I also noticed a slight vibration in the steering wheel when braking from highway speed."`}
            rows={6}
            className={`${inputClasses} resize-none leading-relaxed`}
          />

          <span className="text-xs text-slate-500">
            {description.length < 10
              ? `At least 10 characters needed (${description.length}/10)`
              : "The more detail you provide, the better the diagnosis"}
          </span>
        </section>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
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
              Analyzing…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Analyze Symptoms
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4 flex items-start gap-3">
            <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-red-400">Analysis Failed</p>
              <p className="text-xs text-red-300/70 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && <AnalysisLoader />}

        {/* Results */}
        {diagnosis && !isLoading && (
          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-slate-100">
                Diagnostic Results
              </h2>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <DiagnosisResultCard data={diagnosis} />
          </section>
        )}

        {/* Disclaimer */}
        <footer className="pb-8">
          <p className="text-[11px] text-center leading-relaxed text-slate-600">
            AutoGuardian provides AI-generated estimates — not professional mechanical advice.
            Always consult a certified mechanic for safety-critical issues. Costs are US national
            averages and may vary by location.
          </p>
        </footer>
      </main>
    </div>
  );
}
