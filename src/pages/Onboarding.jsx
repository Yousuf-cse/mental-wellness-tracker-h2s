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
import Button from '../components/Button'

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
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  }

  return (
    <div className="relative min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* Main card */}
      <div className="w-full max-w-2xl bg-white brutalist-border brutalist-shadow-lg rounded-3xl p-8 md:p-12 z-10 relative min-h-[520px] flex flex-col justify-between">
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-3 brutalist-border rounded-none transition-all duration-300 ${
                  s === step 
                    ? 'w-10 bg-primary-container' 
                    : s < step 
                      ? 'w-6 bg-primary' 
                      : 'w-6 bg-white'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-secondary font-headline font-bold">Step {step} of 5</span>
        </div>

        {/* Form Screens */}
        <div className="flex-grow flex flex-col justify-center my-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-primary-container brutalist-border brutalist-shadow-sm flex items-center justify-center text-primary mb-6">
                  <Sparkles className="h-8 w-8 text-primary animate-float" />
                </div>
                <h2 className="text-3xl font-headline font-extrabold text-on-background tracking-tight">
                  Welcome, {profile?.full_name || 'Student'} 👋
                </h2>
                <p className="text-secondary text-sm max-w-md mx-auto leading-relaxed">
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
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-headline font-bold text-on-background flex items-center justify-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span>Which exam are you preparing for?</span>
                  </h3>
                  <p className="text-secondary text-xs mt-1">This helps us adjust academic triggers for your specific timeline.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {EXAM_OPTIONS.map((opt) => {
                    const isSelected = exam === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExam(opt.id)}
                        className={`p-3.5 rounded-xl brutalist-border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary-container brutalist-shadow-sm translate-x-[1px] translate-y-[1px] shadow-none font-bold'
                            : 'bg-white hover:bg-surface-container-low text-on-background'
                        }`}
                      >
                        <div className="font-headline font-bold text-sm text-on-background">{opt.label}</div>
                        <div className="text-[10px] text-secondary font-medium mt-0.5">{opt.desc}</div>
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
                transition={{ duration: 0.2 }}
                className="space-y-6 text-center"
              >
                <div>
                  <h3 className="text-2xl font-headline font-bold text-on-background flex items-center justify-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <span>How many hours do you study daily?</span>
                  </h3>
                  <p className="text-secondary text-xs mt-1">Be honest! We use this to analyze potential burnout factors.</p>
                </div>

                <div className="py-8 space-y-6 max-w-md mx-auto">
                  <div className="text-5xl font-headline font-extrabold text-primary">
                    {studyHours} <span className="text-lg font-bold text-secondary">hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseInt(e.target.value))}
                    className="w-full h-3 bg-white brutalist-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-secondary font-mono font-bold">
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
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-headline font-bold text-on-background">How would you describe yourself?</h3>
                  <p className="text-secondary text-xs mt-1">This defines your circadian preference (chronotype).</p>
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
                        className={`w-full flex items-start gap-4 p-4 rounded-xl brutalist-border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary-container brutalist-shadow-sm translate-x-[1px] translate-y-[1px] shadow-none'
                            : 'bg-white hover:bg-surface-container-low text-on-background'
                        }`}
                      >
                        <div className={`p-2 rounded-lg brutalist-border shrink-0 mt-0.5 ${
                          isSelected 
                            ? 'bg-white text-primary' 
                            : 'bg-surface-container-low text-secondary'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-headline font-bold text-sm text-on-background">{persona.label}</div>
                          <div className="text-xs text-secondary font-medium mt-0.5 leading-relaxed">{persona.desc}</div>
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
                transition={{ duration: 0.2 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-primary-container brutalist-border flex items-center justify-center text-primary mb-6">
                  <CheckCircle2 className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-3xl font-headline font-extrabold text-on-background tracking-tight">
                  You are all set!
                </h2>
                <p className="text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                  MindMate has constructed your student profile. You are ready to log moods, write journals, and protect your study-life balance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t-2 border-on-background flex gap-4">
          {step > 1 && (
            <Button
              onClick={prevStep}
              disabled={saving}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}

          {step < 5 ? (
            <Button
              onClick={nextStep}
              variant="primary"
              className="flex-1"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={saving}
              variant="primary-container"
              className="flex-1"
            >
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <>
                  <span>Unlock Companion Dashboard</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}
