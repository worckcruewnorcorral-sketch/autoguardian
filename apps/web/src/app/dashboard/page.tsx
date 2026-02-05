import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl">
              🔧
            </div>
            <span className="text-xl font-bold text-white">AutoGuardian AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to AutoGuardian! 🎉
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Your dashboard is coming soon. For now, you&apos;re logged in as <strong className="text-emerald-400">{user.email}</strong>
          </p>

          {/* Quick Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left">
              <div className="text-3xl mb-3">🩺</div>
              <h3 className="text-lg font-semibold text-white mb-2">Symptom Analyzer</h3>
              <p className="text-slate-400 text-sm">Describe your car problem and get an AI diagnosis</p>
              <p className="text-emerald-500 text-sm font-medium mt-3">Coming Week 2 →</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">Quote Checker</h3>
              <p className="text-slate-400 text-sm">Upload a repair quote and find out if it&apos;s fair</p>
              <p className="text-emerald-500 text-sm font-medium mt-3">Coming Week 2 →</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">OBD Code Lookup</h3>
              <p className="text-slate-400 text-sm">Enter your check engine code and understand what it means</p>
              <p className="text-emerald-500 text-sm font-medium mt-3">Coming Week 2 →</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}