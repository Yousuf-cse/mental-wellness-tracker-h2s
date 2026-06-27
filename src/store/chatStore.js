import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import { chatWithCompanion } from '../services/ai/gemini'

export const useChatStore = create((set, get) => ({
  sessions: [],
  activeSession: null,
  messages: [],
  loading: false,
  companionTyping: false,
  error: null,

  fetchSessions: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return []

    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ sessions: data, loading: false })

      // Auto-load latest session or create one if none exist
      if (data.length > 0) {
        get().selectSession(data[0])
      } else {
        await get().startSession('MindMate Companion')
      }

      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('Error fetching chat sessions:', err)
      return []
    }
  },

  startSession: async (title = 'MindMate Companion') => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) throw new Error('Unauthenticated user session.')

    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
        })
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        sessions: [data, ...state.sessions],
        activeSession: data,
        messages: [],
        loading: false,
      }))

      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('Error starting new chat session:', err)
      throw err
    }
  },

  selectSession: async (session) => {
    set({ activeSession: session, messages: [] })
    if (session) {
      await get().fetchMessages(session.id)
    }
  },

  fetchMessages: async (sessionId) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return []

    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error

      set({ messages: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('Error fetching messages:', err)
      return []
    }
  },

  sendMessage: async (content, context = {}) => {
    const userId = useAuthStore.getState().user?.id
    const { activeSession, messages } = get()

    if (!userId) throw new Error('Unauthenticated user.')
    if (!activeSession) throw new Error('No active chat session.')
    if (!content || content.trim().length === 0) return

    set({ error: null })

    try {
      // 1. Insert user message in Supabase
      const { data: userMsg, error: userError } = await supabase
        .from('messages')
        .insert({
          session_id: activeSession.id,
          user_id: userId,
          role: 'user',
          content: content.trim(),
        })
        .select()
        .single()

      if (userError) throw userError

      // Prepend/append message locally for instant UI update
      set((state) => ({
        messages: [...state.messages, userMsg],
        companionTyping: true,
      }))

      // 2. Format chat history for Gemini API
      // Take last 12 messages for token containment
      const historyContext = messages.slice(-12).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // 3. Request model response from Gemini AI
      const botResponse = await chatWithCompanion(content.trim(), historyContext, context)

      // 4. Save model response in Supabase
      const { data: modelMsg, error: modelError } = await supabase
        .from('messages')
        .insert({
          session_id: activeSession.id,
          user_id: userId,
          role: 'model',
          content: botResponse.text,
        })
        .select()
        .single()

      if (modelError) throw modelError

      // Append bot message locally
      set((state) => ({
        messages: [...state.messages, modelMsg],
        companionTyping: false,
      }))
    } catch (err) {
      set({ error: err.message, companionTyping: false })
      console.error('Error sending message:', err)
      throw err
    }
  },

  clearChatState: () => {
    set({
      sessions: [],
      activeSession: null,
      messages: [],
      error: null,
      loading: false,
      companionTyping: false,
    })
  },
}))
