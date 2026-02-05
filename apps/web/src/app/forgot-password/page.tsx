'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
              🔧
            </div>
            <span className="text-2xl font-bold text-white">AutoGuardian AI</span>
          </Link>
          <p className="text-slate-400 mt-3">Reset your password</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email!</h2>
              <p className="text-slate-400 mb-6">
                We sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <Link
                href="/login"
                className="inline-block py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <p className="text-slate-400 text-sm">
                Enter the email you signed up with and we&apos;ll send you a reset link.
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="noe@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition duration-200"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-400 mt-6">
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}