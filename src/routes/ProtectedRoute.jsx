import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute() {
  const { session, loading, profile } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent shadow-lg shadow-purple-500/20"></div>
          <p className="text-gray-400 animate-pulse font-medium text-sm">Initializing MindMate...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // If the user hasn't selected their exam yet, redirect them to onboarding
  if (!profile?.exam && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  // If the user has completed onboarding, prevent them from accessing /onboarding
  if (profile?.exam && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
