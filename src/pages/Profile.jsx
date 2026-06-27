import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../store/authStore'
import { useWellnessStore } from '../store/wellnessStore'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  GraduationCap, 
  Save, 
  Clock, 
  Sun
} from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'

const EXAM_OPTIONS = [
  { id: 'JEE', label: 'JEE (Engineering)' },
  { id: 'NEET', label: 'NEET (Medical)' },
  { id: 'UPSC', label: 'UPSC (Civil Services)' },
  { id: 'CAT', label: 'CAT (Management)' },
  { id: 'GATE', label: 'GATE (Engineering)' },
  { id: 'CUET', label: 'CUET (Universities)' },
  { id: 'Other', label: 'Other Exam' },
]

const STUDY_PERSONAS = [
  { id: 'Morning Learner', label: 'Morning Learner' },
  { id: 'Night Owl', label: 'Night Owl' },
  { id: 'Balanced', label: 'Balanced' },
]

// Zod validation schema
const profileSchema = z.object({
  full_name: z.string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' }),
  exam: z.enum(['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid exam option.' }),
  }),
  study_hours: z.number().min(1).max(14),
  study_type: z.enum(['Morning Learner', 'Night Owl', 'Balanced'], {
    errorMap: () => ({ message: 'Please select a valid study style.' }),
  }),
})

export default function Profile() {
  const { profile, updateProfile } = useAuthStore()
  const { preferences, fetchPreferences, savePreferences } = useWellnessStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      exam: profile?.exam || 'Other',
      study_hours: preferences?.study_hours || 6,
      study_type: preferences?.study_type || 'Balanced',
    },
  })

  // Watch fields for reactive rendering
  const watchedHours = watch('study_hours')

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  // Sync loaded values into form
  useEffect(() => {
    if (profile || preferences) {
      reset({
        full_name: profile?.full_name || '',
        exam: profile?.exam || 'Other',
        study_hours: preferences?.study_hours || 6,
        study_type: preferences?.study_type || 'Balanced',
      })
    }
  }, [profile, preferences, reset])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // 1. Save profile details (full_name, exam)
      await updateProfile({
        full_name: data.full_name,
        exam: data.exam,
      })

      // 2. Save study preferences (study_hours, study_type)
      await savePreferences({
        study_hours: data.study_hours,
        study_type: data.study_type,
      })

      toast.success('Profile and preferences updated successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to update profile settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 text-on-background font-sans">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b-2 border-on-background pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-background flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <span>Profile & Study Settings</span>
          </h1>
          <p className="text-secondary text-xs mt-1">Manage your student details, exam targets, and learning habits.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-headline font-bold text-primary hover:text-[#1a4f3e] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* User Card Showcase */}
        <Card variant="white" className="flex flex-col items-center text-center space-y-4 lg:col-span-1">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-24 w-24 rounded-full border-2 border-on-background object-cover shadow-sm"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/bottts/svg' }}
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary-container brutalist-border flex items-center justify-center text-primary text-3xl font-headline font-extrabold shadow-sm">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
          )}
          
          <div className="space-y-1 overflow-hidden w-full">
            <h3 className="text-lg font-headline font-bold text-on-background truncate">{profile?.full_name || 'Student'}</h3>
            <p className="text-xs text-primary font-headline font-bold">{profile?.exam} Target</p>
            <p className="text-[10px] text-secondary truncate">{profile?.email}</p>
          </div>
        </Card>

        {/* Edit Configuration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:col-span-2">
          
          {/* Linked Account Details */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-headline font-bold text-on-background text-sm flex items-center gap-2 border-b-2 border-on-background pb-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Linked Account Details</span>
            </h3>
            
            <div className="space-y-2 text-left">
              <label className="text-xs text-secondary font-headline font-bold">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={profile?.email || 'Unavailable'}
                className="w-full p-3 rounded-xl brutalist-border bg-surface-container-low text-secondary text-xs cursor-not-allowed select-none focus:outline-none"
              />
            </div>
          </Card>

          {/* Personalization Details */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-headline font-bold text-on-background text-sm flex items-center gap-2 border-b-2 border-on-background pb-2">
              <User className="h-4 w-4 text-primary" />
              <span>Student Customizations</span>
            </h3>

            {/* Name */}
            <div className="space-y-2 text-left">
              <label htmlFor="profile-fullname" className="text-xs text-secondary font-headline font-bold">Full Name</label>
              <input
                id="profile-fullname"
                type="text"
                {...register('full_name')}
                placeholder="E.g., Yousuf Mallik"
                className="w-full p-3 rounded-xl brutalist-border bg-white text-on-background text-xs focus:outline-none focus:bg-surface-container-low"
              />
              {errors.full_name && (
                <p className="text-error text-[10px] font-headline font-bold">{errors.full_name.message}</p>
              )}
            </div>

            {/* Target Exam */}
            <div className="space-y-2 text-left">
              <label htmlFor="profile-exam" className="text-xs text-secondary font-headline font-bold flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>Target Examination</span>
              </label>
              <div className="relative">
                <select
                  id="profile-exam"
                  {...register('exam')}
                  className="w-full p-3 rounded-xl brutalist-border bg-white text-on-background text-xs appearance-none cursor-pointer focus:outline-none focus:bg-surface-container-low"
                >
                  {EXAM_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-white text-on-background">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-background">
                  <span className="text-xs font-bold font-sans">▼</span>
                </div>
              </div>
              {errors.exam && (
                <p className="text-error text-[10px] font-headline font-bold">{errors.exam.message}</p>
              )}
            </div>
          </Card>

          {/* Study Preferences details */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-headline font-bold text-on-background text-sm flex items-center gap-2 border-b-2 border-on-background pb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Study Habits</span>
            </h3>

            {/* Daily Study Hours */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center text-xs font-headline font-bold text-secondary">
                <span>Daily study hours</span>
                <span className="text-primary font-mono">{watchedHours} hrs</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                {...register('study_hours', { valueAsNumber: true })}
                className="w-full h-3 bg-white brutalist-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-secondary font-mono font-bold">
                <span>1 hour</span>
                <span>14 hours</span>
              </div>
              {errors.study_hours && (
                <p className="text-error text-[10px] font-headline font-bold">{errors.study_hours.message}</p>
              )}
            </div>

            {/* Study Chronotype */}
            <div className="space-y-2 text-left">
              <label htmlFor="profile-study-type" className="text-xs text-secondary font-headline font-bold flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-primary" />
                <span>Learning Persona</span>
              </label>
              <div className="relative">
                <select
                  id="profile-study-type"
                  {...register('study_type')}
                  className="w-full p-3 rounded-xl brutalist-border bg-white text-on-background text-xs appearance-none cursor-pointer focus:outline-none focus:bg-surface-container-low"
                >
                  {STUDY_PERSONAS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-white text-on-background">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-background">
                  <span className="text-xs font-bold font-sans">▼</span>
                </div>
              </div>
              {errors.study_type && (
                <p className="text-error text-[10px] font-headline font-bold">{errors.study_type.message}</p>
              )}
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              className="flex-1"
              loading={saving}
            >
              <Save className="h-4 w-4" />
              <span>Save Profile</span>
            </Button>
          </div>

        </form>
      </div>

    </div>
  )
}
