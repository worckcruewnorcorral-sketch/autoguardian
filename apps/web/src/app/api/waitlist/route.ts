'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('You\'re on the list! We\'ll notify you when we launch.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Now in Early Access
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center leading-tight mb-6">
            Is Your Mechanic
            <span className="block text-emerald-400">Being Honest?</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-400 text-center max-w-3xl mx-auto mb-12">
            Get an AI second opinion on any repair quote in 30 seconds. 
            Stop overpaying. Start saving.
          </p>

          {/* Email Signup */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg shadow-emerald-500/25"
              >
                {status === 'loading' ? 'Joining...' : 'Get Early Access'}
              </button>
            </div>
            {message && (
              <p className={`mt-4 text-center ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </form>

          {/* Social proof */}
          <p className="text-slate-500 text-center mt-6">
            Join 500+ car owners already on the waitlist
          </p>
        </div>
      </section>

      {/* Problem Stats Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            The Problem is <span className="text-red-400">Massive</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="text-5xl md:text-6xl font-bold text-red-400 mb-4">78%</div>
              <p className="text-slate-400 text-lg">of drivers don&apos;t trust their mechanic</p>
            </div>
            <div className="text-center p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="text-5xl md:text-6xl font-bold text-red-400 mb-4">$12B</div>
              <p className="text-slate-400 text-lg">overpaid on car repairs every year</p>
            </div>
            <div className="text-center p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="text-5xl md:text-6xl font-bold text-red-400 mb-4">60%</div>
              <p className="text-slate-400 text-lg">of repairs include unnecessary work</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 text-center mb-16 text-lg">
            Get peace of mind in three simple steps
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="pt-8 p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50 h-full">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-3">Describe or Upload</h3>
                <p className="text-slate-400">
                  Tell us your car&apos;s symptoms or upload a photo of your repair quote
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="pt-8 p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50 h-full">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
                <p className="text-slate-400">
                  Our AI analyzes against millions of repair data points instantly
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="pt-8 p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50 h-full">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-3">Get Your Verdict</h3>
                <p className="text-slate-400">
                  Know if the price is fair, high, or if the repair is even necessary
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-400 text-center mb-16 text-lg">
            Your complete car repair confidence toolkit
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Symptom Analyzer</h3>
              <p className="text-slate-400 text-sm">
                Describe what&apos;s wrong, get likely causes and cost estimates
              </p>
            </div>

            <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Quote Checker</h3>
              <p className="text-slate-400 text-sm">
                Upload any quote and know if it&apos;s fair or overpriced
              </p>
            </div>

            <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="text-3xl mb-4">🚨</div>
              <h3 className="text-lg font-semibold mb-2">OBD Code Lookup</h3>
              <p className="text-slate-400 text-sm">
                Enter any check engine code, get plain English explanations
              </p>
            </div>

            <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold mb-2">Recall Alerts</h3>
              <p className="text-slate-400 text-sm">
                Never miss a safety recall for your specific vehicle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Simple, Fair Pricing
          </h2>
          <p className="text-slate-400 text-center mb-16 text-lg">
            Save hundreds on your first repair consultation
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-400 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> 3 consultations per month
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Basic symptom analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> OBD code lookup
                </li>
              </ul>
              <button className="w-full py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors">
                Coming Soon
              </button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-slate-800/30 rounded-2xl border border-emerald-500/30 relative">
              <div className="absolute -top-3 right-8 px-3 py-1 bg-emerald-500 text-sm font-semibold rounded-full">
                Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-4">$9.99<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-400 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Unlimited consultations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Quote photo analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Detailed repair reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Priority support
                </li>
              </ul>
              <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Stop Overpaying?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join the waitlist and be the first to know when we launch.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold rounded-xl transition-all"
              >
                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              <span className="text-xl font-bold">AutoGuardian AI</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 AutoGuardian AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email: email.toLowerCase().trim(), source: 'landing' }])
      .select()
      .single();

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You\'re already on the waitlist!' },
          { status: 409 }
        );
      }
      
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully joined waitlist!', data },
      { status: 201 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}