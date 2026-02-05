'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl">🔧</div>
            <span className="text-2xl font-bold text-white">AutoGuardian AI</span>
          </div>
          <p className="text-slate-400">Sign in to your account.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        </div>
        <p className="text-center text-slate-400 mt-6">Don&apos;t have an account?{' '}<Link href="/signup" className="text-emerald-400 hover:text-emerald-300">Sign up free</Link></p>
      </div>
    </div>
  )
}
