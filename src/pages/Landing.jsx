import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from 'sonner'
import { BrainCircuit, Sparkles, ShieldCheck, Zap } from 'lucide-react'

export default function Landing() {
  const { login, session, profile } = useAuthStore()
  const navigate = useNavigate()
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (session) {
      if (profile?.exam) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    }
  }, [session, profile, navigate])

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    try {
      await login()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Authentication failed. Please try again.')
      setAuthLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-950 flex flex-col justify-between overflow-hidden px-4 md:px-8">
      {/* Background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full ambient-glow-purple pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full ambient-glow-emerald pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Header / Logo */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-purple-400 animate-float" />
          </div>
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 font-sans">
            MindMate AI
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-12 md:py-20 z-10">
        {/* Floating badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-medium mb-6 animate-bounce">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Phase 1 Sandbox Launching</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Keep Your Mind Sharp. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 animate-gradient-text">
            Ace Your Exams.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed font-light">
          MindMate AI is a dedicated mental wellness tracker crafted for students preparing for high-stakes exams. Manage stress, track your moods, and unlock peak productivity.
        </p>

        {/* Auth Action */}
        <div className="w-full max-w-sm mb-16">
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium text-white transition-all duration-300 glass-card border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/20 cursor-pointer shadow-lg hover:shadow-purple-500/10 disabled:opacity-50 active:scale-95 group"
          >
            {authLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <svg className="h-5 w-5 transition-transform group-hover:rotate-12 duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="glass-card glass-card-hover p-6 rounded-2xl text-left flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg text-white">Focus Optimization</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Track cognitive patterns and attention spans during long prep hours for JEE, NEET, or UPSC.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl text-left flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <BrainCircuit className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg text-white">Stress Tracking</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Monitor pressure level peaks, detect burnout trends early, and establish a balanced routine.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl text-left flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg text-white">Strict Privacy</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              All logs and personal check-ins are fully secured via Supabase Row Level Security.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto border-t border-white/5 py-8 text-center text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div>&copy; {new Date().getFullYear()} MindMate AI. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Student Helpdesk</a>
        </div>
      </footer>
    </div>
  )
}
