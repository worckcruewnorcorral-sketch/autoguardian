"use client";

import React, { useState } from "react";

const plans = [
  {
    name: "Free",
    key: "free",
    price: 0,
    period: "",
    description: "Get started with basic diagnostics",
    features: [
      "3 symptom analyses per month",
      "Unlimited OBD code lookups",
      "Unlimited quote checks",
      "Basic diagnostic reports",
      "Community support",
    ],
    limitations: [
      "Limited to 3 AI diagnoses/month",
    ],
    cta: "Current Plan",
    current: true,
    accent: "slate",
  },
  {
    name: "Pro",
    key: "pro",
    price: 9.99,
    period: "/month",
    description: "Unlimited diagnostics for serious car owners",
    features: [
      "Unlimited symptom analyses",
      "Unlimited OBD code lookups",
      "Unlimited quote checks",
      "Detailed diagnostic reports",
      "Priority AI processing",
      "Consultation history & export",
      "Email support",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    current: false,
    accent: "emerald",
    popular: true,
  },
  {
    name: "Shop",
    key: "shop",
    price: 29.99,
    period: "/month",
    description: "Built for mechanics and repair shops",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Customer-facing reports",
      "Bulk OBD lookups",
      "Quote comparison tools",
      "API access",
      "Priority support",
    ],
    limitations: [],
    cta: "Upgrade to Shop",
    current: false,
    accent: "blue",
  },
];

export default function PlansPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    if (planKey === "free") return;

    setLoading(planKey);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, annual }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("manage");
    setError(null);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to open billing portal. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Choose Your Plan
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Get AI-powered automotive diagnostics that save you time and money.
            Upgrade anytime — cancel anytime.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${!annual ? "text-white font-medium" : "text-slate-500"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-emerald-500" : "bg-slate-700"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? "left-7" : "left-1"}`}
              />
            </button>
            <span className={`text-sm ${annual ? "text-white font-medium" : "text-slate-500"}`}>
              Annual <span className="text-emerald-400 text-xs font-semibold ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const displayPrice = annual && plan.price > 0
              ? (plan.price * 0.8).toFixed(2)
              : plan.price.toFixed(2);

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.popular
                    ? "border-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/10 shadow-lg shadow-emerald-500/5"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price === 0 ? "Free" : `$${displayPrice}`}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-slate-500">{plan.period}</span>
                    )}
                  </div>
                  {annual && plan.price > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      ${(parseFloat(displayPrice) * 12).toFixed(2)}/year (save ${(plan.price * 12 * 0.2).toFixed(2)})
                    </p>
                  )}
                </div>

                <div className="flex-1 mb-6">
                  <div className="space-y-3">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.accent === "emerald" ? "bg-emerald-500/15 text-emerald-400"
                          : plan.accent === "blue" ? "bg-blue-500/15 text-blue-400"
                          : "bg-slate-500/15 text-slate-400"
                        }`}>
                          <span className="text-[10px]">✓</span>
                        </div>
                        <span className="text-sm text-slate-300">{f}</span>
                      </div>
                    ))}
                    {plan.limitations.map((l, i) => (
                      <div key={`lim-${i}`} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-slate-800 text-slate-600">
                          <span className="text-[10px]">—</span>
                        </div>
                        <span className="text-sm text-slate-500">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={plan.current || loading === plan.key}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    plan.current
                      ? "bg-slate-800 text-slate-500 cursor-default"
                      : plan.popular
                      ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {loading === plan.key ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Redirecting to checkout…
                    </span>
                  ) : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Manage Subscription */}
        <div className="mt-8 text-center">
          <button
            onClick={handleManageSubscription}
            disabled={loading === "manage"}
            className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
          >
            {loading === "manage" ? "Opening portal…" : "Manage existing subscription →"}
          </button>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription at any time. You'll keep Pro access until the end of your billing period." },
              { q: "What counts as a 'symptom analysis'?", a: "Each time you submit a vehicle symptom for AI diagnosis counts as one analysis. OBD lookups and quote checks are unlimited on all plans." },
              { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee. If you're not satisfied, contact us within 7 days of your upgrade for a full refund." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and Apple Pay through our secure payment processor, Stripe." },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h4 className="text-sm font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-12 pb-8">
          <p className="text-[11px] text-center text-slate-600">
            Prices are in USD. Payments processed securely by Stripe. All plans include access to our core AI diagnostic engine.
          </p>
        </footer>
      </main>
    </div>
  );
}
