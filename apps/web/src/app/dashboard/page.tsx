import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl">🔧</div>
            <span className="text-xl font-bold text-white">AutoGuardian AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/plans" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
              Upgrade to Pro
            </Link>
            <span className="text-slate-400 text-sm">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to AutoGuardian!</h1>
          <p className="text-slate-400 text-lg mb-8">Your AI-powered automotive assistant. Choose a tool below.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link href="/dashboard/analyze" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
            <div className="text-3xl mb-3">🔬</div>
            <h3 className="text-lg font-semibold text-white mb-2">Symptom Analyzer</h3>
            <p className="text-slate-400 text-sm">Describe your car problem and get an AI diagnosis</p>
            <p className="text-emerald-500 text-sm font-medium mt-3">Open Analyzer →</p>
          </Link>
          <Link href="/dashboard/quote" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold text-white mb-2">Quote Checker</h3>
            <p className="text-slate-400 text-sm">Upload a repair quote and find out if it is fair</p>
            <p className="text-emerald-500 text-sm font-medium mt-3">Check Quote →</p>
          </Link>
          <Link href="/dashboard/obd" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-white mb-2">OBD Code Lookup</h3>
            <p className="text-slate-400 text-sm">Enter your check engine code and understand what it means</p>
            <p className="text-emerald-500 text-sm font-medium mt-3">Open Lookup →</p>
          </Link>
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Free plan — 3 AI diagnoses/month
            <Link href="/dashboard/plans" className="text-emerald-400 font-medium hover:text-emerald-300 ml-1">
              Upgrade →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
