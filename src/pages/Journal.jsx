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
import Button from '../components/Button'
import Card from '../components/Card'

const MOOD_TYPES = [
  { emoji: '😁', label: 'Happy', color: 'text-[#ba8d1a]' },
  { emoji: '🙂', label: 'Calm', color: 'text-primary' },
  { emoji: '😐', label: 'Neutral', color: 'text-secondary' },
  { emoji: '😟', label: 'Stressed', color: 'text-[#ba5a1a]' },
  { emoji: '😢', label: 'Sad', color: 'text-[#444655]' },
  { emoji: '😴', label: 'Exhausted', color: 'text-error' },
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
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 text-on-background font-sans">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b-2 border-on-background pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-background flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Reflect & Journal</span>
          </h1>
          <p className="text-secondary text-xs mt-1">Empty your mind, log study blockers, and recharge your focus.</p>
        </div>

        {/* Autosave status visual indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-secondary font-mono font-bold">
          {autosaveStatus === 'Saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Saving draft...</span>
            </>
          )}
          {autosaveStatus === 'Saved' && (
            <>
              <CheckCircle className="h-3 w-3 text-primary" />
              <span className="text-primary">Saved locally</span>
            </>
          )}
          {autosaveStatus === 'Idle' && journalText.length > 0 && (
            <span>Draft loaded</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Mood selection */}
        <Card variant="white" className="space-y-4">
          <label className="text-xs text-secondary font-headline font-bold flex items-center gap-1.5">
            <Smile className="h-4 w-4 text-primary" />
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
                  className={`p-3 rounded-xl brutalist-border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-primary-container brutalist-shadow-sm translate-x-[1px] translate-y-[1px] shadow-none font-bold'
                      : 'bg-white hover:bg-surface-container-low text-on-background'
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span className={`text-[9px] font-headline font-bold ${type.color}`}>{type.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* 2. Intensity Slider */}
        <Card variant="white" className="space-y-4">
          <div className="flex justify-between items-center text-xs font-headline font-bold text-secondary">
            <span className="flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-primary" />
              <span>Rate mood intensity</span>
            </span>
            <span className="text-on-background font-mono">{intensity}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-3 bg-white brutalist-border rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-secondary font-mono font-bold">
            <span>1 - Mild</span>
            <span>10 - Intense / Extreme</span>
          </div>
        </Card>

        {/* 3. Text Editor */}
        <Card variant="white" className="space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="journal-textarea" className="text-xs text-secondary font-headline font-bold">
              Write down your thoughts (Max 3000 characters) *
            </label>
            <span className={`text-[10px] font-mono font-bold ${journalText.length > 2800 ? 'text-error' : 'text-secondary'}`}>
              {journalText.length}/3000
            </span>
          </div>

          <textarea
            id="journal-textarea"
            rows="10"
            value={journalText}
            onChange={handleTextChange}
            placeholder="What's on your mind today? How are study schedules, syllabus preparation, sleep balance, or mock exams going? Dump everything here..."
            className="w-full p-4 rounded-xl brutalist-border bg-white text-on-background text-sm resize-none leading-relaxed placeholder-gray-500 focus:outline-none"
          />
        </Card>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {journalText.length > 0 && (
            <Button
              type="button"
              onClick={handleClearDraft}
              variant="danger-container"
              className="px-6 py-3.5 text-xs"
            >
              <Trash2 className="h-4 w-4" />
              <span>Discard Draft</span>
            </Button>
          )}

          <div className="flex-1 flex gap-3">
            <Button
              type="button"
              onClick={() => {
                saveDraft(journalText)
                toast.success('Draft explicitly saved locally.')
              }}
              variant="outline"
              className="flex-1 py-3.5 text-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Local Draft</span>
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              className="flex-1 py-3.5 text-xs"
              loading={submitting}
            >
              <Send className="h-4 w-4" />
              <span>Submit Entry</span>
            </Button>
          </div>
        </div>

      </form>
    </div>
  )
}
