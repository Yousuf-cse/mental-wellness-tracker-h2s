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
    <div className="flex flex-col h-full justify-between p-6 text-gray-300">
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="p-2 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 font-sans">
            MindMate AI
          </span>
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900/30 border border-white/5 shadow-inner">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name} 
              className="h-10 w-10 rounded-full object-cover border border-purple-500/20"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/bottts/svg' }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{profile?.full_name || 'Student'}</h4>
            <p className="text-[10px] text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group cursor-pointer
                  ${isActive 
                    ? 'text-white bg-purple-950/20 border border-purple-500/30 shadow-md shadow-purple-500/5' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl bg-purple-500/5 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 duration-300 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
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
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent transition-all duration-300 group cursor-pointer disabled:opacity-50"
      >
        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1 duration-300" />
        <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row relative overflow-hidden">
      {/* Background neon visual ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full ambient-glow-emerald pointer-events-none z-0"></div>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 border-r border-white/5 bg-gray-950/40 backdrop-blur-xl shrink-0 z-10">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header Navigation */}
      <header className="md:hidden flex items-center justify-between px-6 h-16 border-b border-white/5 bg-gray-950/60 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-400" />
          <span className="text-sm font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
            MindMate AI
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Slide-out Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-gray-950 border-r border-white/10 z-50 md:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white"
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
      <main className="flex-1 overflow-y-auto max-h-screen z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
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
