import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,

  login: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, session: null, profile: null, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  refreshSession: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session) {
        set({ user: null, session: null, profile: null, loading: false })
        return { session: null, profile: null }
      }

      const user = session.user
      
      // Fetch user profile from profiles table
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle() // Use maybeSingle to avoid throw on empty row

      // If profile does not exist, create it (first login)
      if (!profile) {
        const metadata = user.user_metadata || {}
        const newProfile = {
          id: user.id,
          full_name: metadata.full_name || metadata.name || '',
          email: user.email || '',
          avatar_url: metadata.avatar_url || metadata.picture || '',
          exam: null,
        }

        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (insertError) throw insertError
        profile = insertedProfile
      }

      set({ user, session, profile, loading: false })
      return { session, profile }
    } catch (err) {
      console.error('Error refreshing session/profile:', err)
      set({ error: err.message, loading: false })
      throw err
    }
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) throw new Error('Cannot update profile: No authenticated user session.')

    set({ loading: true, error: null })
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      set({ profile: updatedProfile, loading: false })
      return updatedProfile
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  setAuth: (session, profile) => {
    set({
      session,
      user: session?.user || null,
      profile: profile || null,
      loading: false,
    })
  },
}))
