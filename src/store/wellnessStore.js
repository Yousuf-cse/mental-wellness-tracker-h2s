import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import { analyzeJournal, getFallbackAnalysis } from '../services/ai/gemini'

export const useWellnessStore = create((set, get) => ({
  preferences: null,
  logs: [],
  hasMoreLogs: true,
  journalDraft: localStorage.getItem('mindmate_journal_draft') || '',
  todayAnalysis: null,
  weeklyReport: null,
  loading: false,
  error: null,

  fetchPreferences: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return null

    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      set({ preferences: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('Error fetching preferences:', err)
      return null
    }
  },

  savePreferences: async (prefData) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) throw new Error('Unauthenticated user session.')

    set({ loading: true, error: null })
    try {
      // Upsert preferences using user_id
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          study_hours: prefData.study_hours,
          study_type: prefData.study_type,
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) throw error
      set({ preferences: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('Error saving preferences:', err)
      throw err
    }
  },

  fetchLogs: async (page = 1, limit = 10, append = false) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return []

    set({ loading: true, error: null })
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      set((state) => ({
        logs: append ? [...state.logs, ...data] : data,
        hasMoreLogs: data.length === limit,
        loading: false,
      }))
      
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('Error fetching daily logs:', err)
      return []
    }
  },

  fetchTodayAnalysis: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return null

    try {
      const todayStr = new Date().toDateString()
      
      // 1. Fetch recent logs to locate today's log
      const { data: recentLogs, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (logsError) throw logsError

      const todayLog = recentLogs.find(
        (log) => new Date(log.created_at).toDateString() === todayStr
      )

      if (!todayLog) {
        set({ todayAnalysis: null })
        return null
      }

      // 2. Fetch the corresponding AI analysis
      const { data: analysis, error: analysisError } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('journal_id', todayLog.id)
        .maybeSingle()

      if (analysisError) throw analysisError

      set({ todayAnalysis: analysis })
      return analysis
    } catch (err) {
      console.error('Error fetching today AI analysis:', err)
      return null
    }
  },

  addLog: async ({ mood, mood_intensity, journal }) => {
    const userId = useAuthStore.getState().user?.id
    const userProfile = useAuthStore.getState().profile
    if (!userId) throw new Error('Unauthenticated user session.')

    set({ loading: true, error: null })
    try {
      // 1. Insert daily log in Supabase
      const { data: logData, error } = await supabase
        .from('daily_logs')
        .insert({
          user_id: userId,
          mood,
          mood_intensity: mood_intensity || null,
          journal,
        })
        .select()
        .single()

      if (error) throw error

      // Update local logs state
      set((state) => ({
        logs: [logData, ...state.logs],
      }))

      // 2. Run Gemini AI analysis dynamically
      let analysisData = null
      try {
        const studyHours = get().preferences?.study_hours || 6
        const examType = userProfile?.exam || 'Other'

        const analysis = await analyzeJournal(journal, mood, studyHours, examType)

        // 3. Save AI analysis in Supabase
        const { data: savedAnalysis, error: analysisError } = await supabase
          .from('ai_analysis')
          .insert({
            user_id: userId,
            journal_id: logData.id,
            emotion: analysis.emotion || mood || 'Neutral',
            stress_level: analysis.stressLevel || 50,
            burnout_risk: analysis.burnoutRisk || 'Low',
            confidence: analysis.confidence || 50,
            triggers: analysis.primaryTriggers || [],
            recommendations: analysis.recommendations || [],
            motivation: analysis.motivation || 'You are doing great! Keep going.',
          })
          .select()
          .single()

        if (analysisError) throw analysisError
        analysisData = savedAnalysis
      } catch (aiErr) {
        console.error('Gemini API analysis failed, saving local rules fallback:', aiErr)
        
        // Fallback save to guarantee database record and layout display
        const fallback = getFallbackAnalysis(journal, mood)
        try {
          const { data: fallbackData } = await supabase
            .from('ai_analysis')
            .insert({
              user_id: userId,
              journal_id: logData.id,
              emotion: fallback.emotion,
              stress_level: fallback.stressLevel,
              burnout_risk: fallback.burnoutRisk,
              confidence: fallback.confidence,
              triggers: fallback.primaryTriggers,
              recommendations: fallback.recommendations,
              motivation: fallback.motivation,
            })
            .select()
            .single()
            
          analysisData = fallbackData
        } catch (dbErr) {
          console.error('Fallback DB write failed:', dbErr)
        }
      }

      set({ todayAnalysis: analysisData, loading: false })

      // Clear draft on successful submit
      get().clearDraft()
      return logData
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('Error saving daily log:', err)
      throw err
    }
  },

  saveDraft: (text) => {
    localStorage.setItem('mindmate_journal_draft', text)
    set({ journalDraft: text })
  },

  clearDraft: () => {
    localStorage.removeItem('mindmate_journal_draft')
    set({ journalDraft: '' })
  },

  saveWeeklyReport: (report) => {
    set({ weeklyReport: report })
  },

  clearWellnessState: () => {
    set({
      preferences: null,
      logs: [],
      hasMoreLogs: true,
      journalDraft: '',
      todayAnalysis: null,
      weeklyReport: null,
      error: null,
      loading: false,
    })
  },
}))
