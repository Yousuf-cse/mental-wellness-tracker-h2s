import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWellnessStore } from '../store/wellnessStore'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import AIChatbot from './AIChatbot'
import { 
  BrainCircuit, 
  LayoutDashboard, 
  BookOpen, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'

const NAVIGATION_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/history', label: 'Mood History', icon: History },
  { path: '/profile', label: 'Profile', icon: User },
]

export default function DashboardLayout() {
  const { logout, profile } = useAuthStore()
  const { clearWellnessState } = useWellnessStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      clearWellnessState()
      toast.success('Logged out successfully. See you soon!')
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Logout failed. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-6 text-on-background">
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="p-2 rounded-xl bg-primary-container brutalist-border flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-headline font-extrabold tracking-tight text-primary">
            MindMate AI
          </span>
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-3 p-3 bg-white brutalist-border brutalist-shadow-sm rounded-xl">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name} 
              className="h-10 w-10 rounded-full object-cover brutalist-border shrink-0"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/bottts/svg' }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-fixed brutalist-border flex items-center justify-center text-on-primary-fixed font-bold shrink-0">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-xs font-headline font-bold text-on-background truncate">{profile?.full_name || 'Student'}</h4>
            <p className="text-[10px] text-secondary truncate">{profile?.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-headline font-semibold transition-all group cursor-pointer
                  ${isActive 
                    ? 'text-on-primary-container bg-primary-container brutalist-border brutalist-shadow-sm' 
                    : 'text-on-background hover:bg-surface-container-high border border-transparent'
                  }
                `}
              >
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 duration-300 ${isActive ? 'text-primary' : 'text-secondary'}`} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Logout Option */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-headline font-semibold text-on-error-container bg-error-container hover:bg-error hover:text-white brutalist-border brutalist-shadow-sm transition-all group cursor-pointer disabled:opacity-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      >
        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 duration-300" />
        <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row relative">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 border-r-2 border-on-background bg-surface-container-low shrink-0 z-10">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header Navigation */}
      <header className="md:hidden flex items-center justify-between px-6 h-16 border-b-2 border-on-background bg-surface-container-low z-20 shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <span className="text-base font-headline font-extrabold tracking-tight text-primary">
            MindMate AI
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 rounded-lg brutalist-border bg-white text-on-background hover:bg-surface-container-high"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Drawer Slide-over Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            {/* Slide-out Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-surface-container-low border-r-2 border-on-background z-50 md:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg brutalist-border bg-white text-on-background hover:bg-surface-container-high"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Content Panel */}
      <main className="flex-1 overflow-y-auto max-h-screen z-10 relative bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full h-full min-h-screen"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <AIChatbot />
    </div>
  )
}
