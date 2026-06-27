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
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <User className="h-6 w-6 text-purple-400" />
            <span>Profile & Study Settings</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">Manage your student details, exam targets, and learning habits.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* User Card Showcase */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-4 lg:col-span-1">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-24 w-24 rounded-full border border-purple-500/30 object-cover shadow-lg shadow-purple-500/10"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/bottts/svg' }}
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl font-bold shadow-lg">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
          )}
          
          <div className="space-y-1 overflow-hidden w-full">
            <h3 className="text-lg font-bold text-white truncate">{profile?.full_name || 'Student'}</h3>
            <p className="text-xs text-purple-400 font-medium">{profile?.exam} Target</p>
            <p className="text-[10px] text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>

        {/* Edit Configuration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:col-span-2">
          
          {/* Linked Account Details */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Mail className="h-4 w-4 text-purple-400" />
              <span>Linked Account Details</span>
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={profile?.email || 'Unavailable'}
                className="w-full p-3 rounded-xl bg-gray-900/50 border border-white/5 text-gray-500 text-xs cursor-not-allowed select-none focus:outline-none animate-pulse-none"
              />
            </div>
          </div>

          {/* Personalization Details */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <User className="h-4 w-4 text-purple-400" />
              <span>Student Customizations</span>
            </h3>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="profile-fullname" className="text-xs text-gray-400 font-medium">Full Name</label>
              <input
                id="profile-fullname"
                type="text"
                {...register('full_name')}
                placeholder="E.g., Yousuf Mallik"
                className="w-full p-3 rounded-xl glass-input text-xs"
              />
              {errors.full_name && (
                <p className="text-red-400 text-[10px] font-medium">{errors.full_name.message}</p>
              )}
            </div>

            {/* Target Exam */}
            <div className="space-y-2">
              <label htmlFor="profile-exam" className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-purple-400" />
                <span>Target Examination</span>
              </label>
              <select
                id="profile-exam"
                {...register('exam')}
                className="w-full p-3 rounded-xl glass-input text-xs appearance-none cursor-pointer bg-gray-950"
              >
                {EXAM_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-gray-950 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.exam && (
                <p className="text-red-400 text-[10px] font-medium">{errors.exam.message}</p>
              )}
            </div>
          </div>

          {/* Study Preferences details */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Study Habits</span>
            </h3>

            {/* Daily Study Hours */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                <span>Daily study hours</span>
                <span className="text-white font-mono">{watchedHours} hrs</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                {...register('study_hours', { valueAsNumber: true })}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>1 hour</span>
                <span>14 hours</span>
              </div>
              {errors.study_hours && (
                <p className="text-red-400 text-[10px] font-medium">{errors.study_hours.message}</p>
              )}
            </div>

            {/* Study Chronotype */}
            <div className="space-y-2">
              <label htmlFor="profile-study-type" className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-emerald-400" />
                <span>Learning Persona</span>
              </label>
              <select
                id="profile-study-type"
                {...register('study_type')}
                className="w-full p-3 rounded-xl glass-input text-xs appearance-none cursor-pointer bg-gray-950"
              >
                {STUDY_PERSONAS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-gray-950 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.study_type && (
                <p className="text-red-400 text-[10px] font-medium">{errors.study_type.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}
