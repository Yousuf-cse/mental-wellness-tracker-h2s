import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWellnessStore } from '../store/wellnessStore'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Sun, 
  Moon, 
  Compass, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react'

const EXAM_OPTIONS = [
  { id: 'JEE', label: 'JEE (Engineering)', desc: 'Joint Entrance Examination' },
  { id: 'NEET', label: 'NEET (Medical)', desc: 'National Eligibility cum Entrance Test' },
  { id: 'UPSC', label: 'UPSC (Civil Services)', desc: 'Union Public Service Commission' },
  { id: 'CAT', label: 'CAT (Management)', desc: 'Common Admission Test' },
  { id: 'GATE', label: 'GATE (Engineering)', desc: 'Graduate Aptitude Test' },
  { id: 'CUET', label: 'CUET (Universities)', desc: 'Common University Entrance Test' },
  { id: 'Other', label: 'Other Exam', desc: 'Other competitive exams' },
]

const STUDY_PERSONAS = [
  { id: 'Morning Learner', label: 'Morning Learner', icon: Sun, desc: 'Energized at sunrise. Retain information best during morning blocks.' },
  { id: 'Night Owl', label: 'Night Owl', icon: Moon, desc: 'Quiet hours. High productivity and extreme focus late into the night.' },
  { id: 'Balanced', label: 'Balanced', icon: Compass, desc: 'Steady focus. Maintain a consistent routine scattered throughout the day.' },
]

export default function Onboarding() {
  const { profile, updateProfile } = useAuthStore()
  const { savePreferences } = useWellnessStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [exam, setExam] = useState(profile?.exam || 'Other')
  const [studyHours, setStudyHours] = useState(6)
  const [studyType, setStudyType] = useState('Balanced')
  const [saving, setSaving] = useState(false)

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)

  const handleFinish = async () => {
    setSaving(true)
    try {
      // 1. Save exam selection to profiles table
      await updateProfile({ exam })

      // 2. Save study hours and chronotype to user_preferences table
      await savePreferences({
        study_hours: studyHours,
        study_type: studyType,
      })

      toast.success('Onboarding completed! Welcome to your dashboard.')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to save onboarding details. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Framer Motion variant values for slides
  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  return (
    <div className="relative min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background visual neon flows */}
      <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full ambient-glow-purple pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[45%] h-[45%] rounded-full ambient-glow-emerald pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }}></div>

      {/* Main card */}
      <div className="w-full max-w-2xl glass-card rounded-3xl p-8 md:p-12 z-10 border border-white/10 shadow-2xl relative min-h-[500px] flex flex-col justify-between">
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step 
                    ? 'w-8 bg-purple-500' 
                    : s < step 
                      ? 'w-4 bg-emerald-500' 
                      : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">Step {step} of 5</span>
        </div>

        {/* Form Screens */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6">
                  <Sparkles className="h-8 w-8 text-white animate-float" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Welcome, {profile?.full_name || 'Student'} 👋
                </h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed font-light">
                  Let's personalize your wellness companion. Setting up your academic focus and daily habits allows MindMate to build a stress-resilient routine for you.
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <GraduationCap className="h-6 w-6 text-purple-400" />
                    <span>Which exam are you preparing for?</span>
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">This helps us adjust academic triggers for your specific timeline.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {EXAM_OPTIONS.map((opt) => {
                    const isSelected = exam === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExam(opt.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-purple-950/20 border-purple-500/80 shadow-md shadow-purple-500/10'
                            : 'bg-gray-900/30 border-white/5 hover:border-white/20 hover:bg-gray-900/50'
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">{opt.label}</div>
                        <div className="text-[10px] text-gray-500 font-light mt-0.5">{opt.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Clock className="h-6 w-6 text-emerald-400" />
                    <span>How many hours do you study daily?</span>
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">Be honest! We use this to analyze potential burnout factors.</p>
                </div>

                <div className="py-8 space-y-6 max-w-md mx-auto">
                  <div className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                    {studyHours} <span className="text-lg font-light text-gray-500">hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>1 hour</span>
                    <span>14 hours</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">How would you describe yourself?</h3>
                  <p className="text-gray-400 text-xs mt-1">This defines your circadian preference (chronotype).</p>
                </div>

                <div className="space-y-3">
                  {STUDY_PERSONAS.map((persona) => {
                    const Icon = persona.icon
                    const isSelected = studyType === persona.id
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => setStudyType(persona.id)}
                        className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-purple-950/20 border-purple-500/80 shadow-md shadow-purple-500/10'
                            : 'bg-gray-900/30 border-white/5 hover:border-white/20 hover:bg-gray-900/50'
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg border shrink-0 mt-0.5 ${
                          isSelected 
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                            : 'bg-gray-950/40 border-white/5 text-gray-500'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{persona.label}</div>
                          <div className="text-xs text-gray-500 font-light mt-0.5 leading-relaxed">{persona.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                  <CheckCircle2 className="h-10 w-10 animate-pulse" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  You are all set!
                </h2>
                <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed font-light">
                  MindMate has constructed your student profile. You are ready to log moods, write journals, and protect your study-life balance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={nextStep}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 active:scale-98 disabled:opacity-50"
            >
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Unlock Companion Dashboard</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
