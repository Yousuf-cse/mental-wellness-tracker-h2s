import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'

import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import JournalHistory from './pages/History'
import Profile from './pages/Profile'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'

function App() {
  const { refreshSession, setAuth } = useAuthStore()

  useEffect(() => {
    // 1. Check initial session state
    const initializeAuth = async () => {
      try {
        await refreshSession()
      } catch (error) {
        console.error('Failed to restore initial auth session:', error)
      }
    }

    initializeAuth()

    // 2. Setup active auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        try {
          await refreshSession()
        } catch (error) {
          console.error('Error during SIGNED_IN sync:', error)
        }
      } else if (event === 'SIGNED_OUT') {
        setAuth(null, null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshSession, setAuth])

  return (
    <BrowserRouter>
      {/* Toast popup notifications */}
      <Toaster 
        position="top-right" 
        theme="dark" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f3f4f6',
          }
        }}
      />
      
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={<Landing />} />

        {/* Protected Routing Guard */}
        <Route element={<ProtectedRoute />}>
          {/* Standalone questionnaire without sidebar */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Shared Sidebar layout shell */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/history" element={<JournalHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
