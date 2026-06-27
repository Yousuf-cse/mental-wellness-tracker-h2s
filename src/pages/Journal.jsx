import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWellnessStore } from '../store/wellnessStore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { 
  Smile, 
  BookOpen, 
  Save, 
  Send, 
  Loader2, 
  CheckCircle, 
  Trash2,
  Sliders
} from 'lucide-react'

const MOOD_TYPES = [
  { emoji: '😁', label: 'Happy', color: 'text-yellow-400' },
  { emoji: '🙂', label: 'Calm', color: 'text-emerald-400' },
  { emoji: '😐', label: 'Neutral', color: 'text-blue-400' },
  { emoji: '😟', label: 'Stressed', color: 'text-orange-400' },
  { emoji: '😢', label: 'Sad', color: 'text-indigo-400' },
  { emoji: '😴', label: 'Exhausted', color: 'text-red-400' },
]

// Zod validation schema
const journalSchema = z.object({
  mood: z.string({ required_error: 'Mood selection is required.' }).min(1, 'Please select a mood.'),
  mood_intensity: z.number().min(1).max(10),
  journal: z.string()
    .min(10, 'Journal entry must be at least 10 characters long.')
    .max(3000, 'Journal entry cannot exceed 3000 characters.')
})

export default function Journal() {
  const { journalDraft, saveDraft, clearDraft, addLog } = useWellnessStore()
  const navigate = useNavigate()

  const [mood, setMood] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [journalText, setJournalText] = useState(journalDraft)
  const [submitting, setSubmitting] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState('Idle') // Idle, Saving, Saved

  const autosaveTimer = useRef(null)

  // Real-time autosave handler as user types
  const handleTextChange = (e) => {
    const text = e.target.value
    if (text.length > 3000) return // Respect limit
    
    setJournalText(text)
    saveDraft(text)
    
    setAutosaveStatus('Saving')
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    
    autosaveTimer.current = setTimeout(() => {
      setAutosaveStatus('Saved')
    }, 800)
  }

  // Clear draft confirmation
  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to discard your draft?')) {
      setJournalText('')
      clearDraft()
      toast.info('Draft cleared.')
    }
  }

  // Submit the log to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate using Zod
    const validation = journalSchema.safeParse({
      mood,
      mood_intensity: intensity,
      journal: journalText
    })

    if (!validation.success) {
      const errorMsg = validation.error.issues[0].message
      toast.error(errorMsg)
      return
    }

    setSubmitting(true)
    try {
      await addLog({
        mood,
        mood_intensity: intensity,
        journal: journalText
      })
      toast.success('Journal entry submitted successfully!')
      setJournalText('')
      setMood('')
      setIntensity(5)
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit journal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-400" />
            <span>Reflect & Journal</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">Empty your mind, log study blockers, and recharge your focus.</p>
        </div>

        {/* Autosave status visual indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
          {autosaveStatus === 'Saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
              <span>Saving draft...</span>
            </>
          )}
          {autosaveStatus === 'Saved' && (
            <>
              <CheckCircle className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Saved locally</span>
            </>
          )}
          {autosaveStatus === 'Idle' && journalText.length > 0 && (
            <span>Draft loaded</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Mood selection */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <label className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
            <Smile className="h-4 w-4 text-purple-400" />
            <span>Select current mood *</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {MOOD_TYPES.map((type) => {
              const isSelected = mood === type.label
              return (
                <button
                  key={type.label}
                  type="button"
                  onClick={() => setMood(type.label)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/20 border-purple-500/80 shadow-md'
                      : 'bg-gray-900/30 border-white/5 hover:border-white/10 hover:bg-gray-900/60'
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span className={`text-[9px] font-semibold ${type.color}`}>{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Intensity Slider */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-purple-400" />
              <span>Rate mood intensity</span>
            </span>
            <span className="text-white font-mono">{intensity}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>1 - Mild</span>
            <span>10 - Intense / Extreme</span>
          </div>
        </div>

        {/* 3. Text Editor */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="journal-textarea" className="text-xs text-gray-400 font-semibold">
              Write down your thoughts (Max 3000 characters) *
            </label>
            <span className={`text-[10px] font-mono ${journalText.length > 2800 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
              {journalText.length}/3000
            </span>
          </div>

          <textarea
            id="journal-textarea"
            rows="10"
            value={journalText}
            onChange={handleTextChange}
            placeholder="What's on your mind today? How are study schedules, syllabus preparation, sleep balance, or mock exams going? Dump everything here..."
            className="w-full p-4 rounded-xl glass-input text-sm resize-none leading-relaxed placeholder-gray-600 focus:outline-none"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {journalText.length > 0 && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="px-6 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>Discard Draft</span>
            </button>
          )}

          <div className="flex-1 flex gap-3">
            <button
              type="button"
              onClick={() => {
                saveDraft(journalText)
                toast.success('Draft explicitly saved locally.')
              }}
              className="flex-1 py-3.5 px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Local Draft</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-semibold text-xs transition-all duration-300 shadow-md hover:shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Entry</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
