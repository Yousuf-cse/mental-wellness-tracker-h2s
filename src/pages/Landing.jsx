import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from 'sonner'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Landing() {
  const { login, session, profile } = useAuthStore()
  const navigate = useNavigate()
  const [authLoading, setAuthLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)

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

  const moodRecommendations = {
    energetic: "⚡ You've got high energy right now! Excellent time to dive into high-focus topics, practice mock questions, or solve complex problems.",
    calm: "🌊 A calm mind is a learning machine. Perfect for reading conceptual explanations, organizing notes, or planning your weekly syllabus progress.",
    tired: "☁️ Fatigue blocks learning retention. Time for a quick break! Take a 20-minute power nap or go for a brisk walk to reset.",
    stressed: "💥 Stress drains memory. Pause your study timer. Do 5 deep breaths, make a simple to-do list, or do a quick journal dump to release pressure.",
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 bg-surface border-b-2 border-on-background flex items-center justify-between px-6 md:px-12 shadow-[4px_4px_0px_0px_#1b1b1b]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            psychology
          </span>
          <h1 className="font-headline font-extrabold text-xl md:text-2xl text-primary tracking-tight">MindMate AI</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="font-headline font-bold text-sm text-on-background hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150" href="#features">Focus</a>
          <a className="font-headline font-bold text-sm text-on-background hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150" href="#privacy">Privacy</a>
          <a className="font-headline font-bold text-sm text-on-background hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150" href="#moods">Moods</a>
          <Button 
            variant="primary-container"
            onClick={handleGoogleLogin}
            disabled={authLoading}
          >
            Get Started
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto w-full space-y-24">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 items-start text-left">
            <h2 className="font-headline font-extrabold text-4xl md:text-6xl text-on-background leading-tight">
              Your Mental Well-being, <span className="bg-primary-container brutalist-border px-2 inline-block -rotate-1">Decoded</span>.
            </h2>
            <p className="font-sans text-lg md:text-xl text-[#3f4944] leading-relaxed max-w-lg">
              Experience wellness that isn't a straight line. MindMate AI helps you track stress, optimize focus, and stay vibrant with playful, data-driven insights.
            </p>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white brutalist-border brutalist-shadow-lg brutalist-button px-8 py-4 font-headline font-bold text-lg hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1b1b1b] border-t-transparent"></div>
                ) : (
                  <>
                    <img 
                      alt="Google Logo" 
                      className="w-6 h-6 shrink-0" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCugNXCfxCTzKvH59Rd5N-7eiALXEMk9ykq_TjwCF4rKtjNTG5XEfmDTEuehsqxHWJl00_f2RcYvkoHIluk6oTZTsnjdAL_9rwCAMoYtbNg-oX2AOSQsA-lge-qU21t-nx4DfUxh0LT6MWNhL7sgLebt_oU7zg_tPC4nUSzNrGa-j_fFtY2yrTIK7JWf64eDqLdS3ztFCoL6Yona0Iy-DVP3BzbIQGqU9zwK2uvisO5XYhxzt1nZnSKJTGiGSa2DQ5nIOm0-CusmsE"
                    />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center">
            <div className="brutalist-border brutalist-shadow-lg bg-tertiary-fixed p-4 rotate-3 w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full brutalist-border bg-white flex items-center justify-center">
                <img 
                  className="w-full h-full object-cover" 
                  alt="A playful and vibrant neo-brutalist digital illustration featuring abstract floating shapes like eyes, lightning bolts, and stars. The color palette uses mint green, lavender, and soft peach on a clean white background. The composition is dynamic and asymmetrical with bold black outlines and flat colors, reflecting a modern, optimistic mental health tech aesthetic." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuA7H2as__NX2A8v05waMuTGNTAplGNki9zzodOZ_94rrLSEeZrGJyFrYQ4weMszEqtAFrwUN7_OtUxPs68uc13Yo817KPoD9e1ZoDHcHR8V9nFlu58zxtuJu27_XD7v-SG1vfER4z0u0TIPcC4vIXD3cnf7bKY99DX_FdoFNC5J4W1aqGku6a2ECPvhcWlPzcMS1t6IRlQkT52jI3zMLfSneU2y1lkkAj68wh3yCsd1VI1CkudCcEScJGOlypSxjkbO8jLGxeF9M"
                />
              </div>
            </div>
            {/* Decorative Stickers */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-fixed brutalist-border rounded-full flex items-center justify-center -rotate-12 brutalist-shadow">
              <span className="material-symbols-outlined text-on-primary-fixed text-4xl">favorite</span>
            </div>
            <div className="absolute -bottom-4 -left-10 bg-secondary-container brutalist-border px-4 py-2 rotate-6 brutalist-shadow">
              <span className="font-headline font-bold text-sm text-on-secondary-container">100% Private</span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Focus Optimization */}
          <Card variant="white" hoverable className="flex flex-col gap-4 text-left">
            <div className="w-16 h-16 bg-primary-container brutalist-border flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-4xl">bolt</span>
            </div>
            <h3 className="font-headline font-extrabold text-xl">Focus Optimization</h3>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              Identify your peak performance windows and eliminate digital distractions with AI-powered focus sessions.
            </p>
          </Card>
          
          {/* Stress Tracking */}
          <Card variant="secondary-container" hoverable className="flex flex-col gap-4 text-left">
            <div className="w-16 h-16 bg-white brutalist-border flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary text-4xl">monitoring</span>
            </div>
            <h3 className="font-headline font-extrabold text-xl">Stress Tracking</h3>
            <p className="font-sans text-sm text-on-secondary-container leading-relaxed">
              Real-time biometric analysis helps you catch burnout before it starts. Stay ahead of the curve.
            </p>
          </Card>

          {/* Strict Privacy */}
          <Card variant="tertiary-container" hoverable className="flex flex-col gap-4 text-left" id="privacy">
            <div className="w-16 h-16 bg-white brutalist-border flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary text-4xl">shield_person</span>
            </div>
            <h3 className="font-headline font-extrabold text-xl">Strict Privacy</h3>
            <p className="font-sans text-sm text-on-tertiary-container leading-relaxed">
              Your mind is your own. All data is encrypted locally. We never see your logs, and we never sell your data.
            </p>
          </Card>
        </section>

        {/* AI Testimonial Section */}
        <section className="flex flex-col items-center">
          <div className="speech-bubble max-w-3xl w-full mb-12">
            <div className="speech-bubble-inner p-6 md:p-8 rounded-2xl brutalist-shadow-lg">
              <div className="flex items-start gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-primary brutalist-border shrink-0 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>
                <div>
                  <p className="font-headline font-bold text-lg md:text-xl italic mb-4 text-on-secondary-container">
                    "Hey! You've been crushing it today. I noticed your focus peaks around 11 AM. Want to schedule your deep-work block then tomorrow?"
                  </p>
                  <p className="font-headline font-bold text-sm text-[#444655]">MindMate AI • Your Wellness Partner</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="brutalist-border bg-white p-1">
              <img 
                className="w-16 h-16 object-cover brutalist-border" 
                alt="A portrait of a smiling young professional in a creative studio, shot with natural warm lighting. The style is modern and clean, with a shallow depth of field. This image represents a real user finding balance through technology." 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0jZzucfK-ZCrPaKrDF_8rva2Vt7GggqUqc-fF0hHJ_u7BSqqvrWIlZS9PlT2Yz31nOhoku7Lp6oDz5IcgtuRft4oxb9tRleyy5hpEEYui_AE9qwwObV3bnDsUJ9A4-UMF6-Mcbg0rZyjaYf4p-kO3JdZ2SScSRwXZcUGJjMV5lVkFpy05cHWkn-vb7_bmR73Dji1VRpFLTN7rITgNpe135sH_PuIBpMusmf3vP4dd0Thhz1CJYYgVItwkLRaQgIISWPEYIyph4Es"
              />
            </div>
            <p className="font-headline font-bold text-sm">Joined by 10k+ vibrant minds this month.</p>
          </div>
        </section>

        {/* Mood Check-in Section */}
        <section id="moods" className="bg-primary-fixed brutalist-border brutalist-shadow-lg p-6 md:p-12 text-center rounded-2xl">
          <h2 className="font-headline font-extrabold text-2xl md:text-3xl mb-8">How are we feeling right now?</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { id: 'energetic', emoji: '⚡', label: 'Energetic' },
              { id: 'calm', emoji: '🌊', label: 'Calm' },
              { id: 'tired', emoji: '☁️', label: 'Tired' },
              { id: 'stressed', emoji: '💥', label: 'Stressed' }
            ].map((mood) => {
              const isActive = selectedMood === mood.id
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(isActive ? null : mood.id)}
                  className={`brutalist-border brutalist-shadow bg-white brutalist-button px-6 py-4 flex flex-col items-center gap-2 group transition-all select-none cursor-pointer rounded-xl ${
                    isActive ? 'bg-primary-container translate-x-[2px] translate-y-[2px] shadow-none' : ''
                  }`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{mood.emoji}</span>
                  <span className="font-headline font-bold text-base">{mood.label}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-8 min-h-[4rem] flex items-center justify-center">
            {selectedMood ? (
              <div className="bg-white brutalist-border brutalist-shadow-sm px-6 py-4 rounded-xl max-w-xl text-left animate-float">
                <p className="font-sans text-sm font-bold text-on-background">{moodRecommendations[selectedMood]}</p>
              </div>
            ) : (
              <p className="font-sans text-sm font-bold text-on-primary-fixed opacity-70">Pick a mood to see personalized recommendations.</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-surface-container border-t-2 border-on-background flex flex-col items-center gap-4 px-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            psychology
          </span>
          <span className="font-headline font-extrabold text-lg text-primary">MindMate AI</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-2">
          <a className="font-sans text-sm font-bold text-secondary hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="font-sans text-sm font-bold text-secondary hover:text-primary transition-colors" href="#">Terms</a>
          <a className="font-sans text-sm font-bold text-secondary hover:text-primary transition-colors" href="#">Support</a>
          <a className="font-sans text-sm font-bold text-secondary hover:text-primary transition-colors" href="#">Contact</a>
        </div>
        <p className="font-sans text-xs text-secondary">© {new Date().getFullYear()} MindMate AI. Stay vibrant.</p>
      </footer>
    </div>
  )
}

