import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWellnessStore } from '../store/wellnessStore'
import { generateInsights } from '../services/ai'
import { generateMotivation } from '../services/ai/gemini'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts'
import { 
  Smile, 
  BookOpen, 
  History, 
  User, 
  Flame, 
  BookOpenCheck, 
  Plus, 
  Calendar, 
  Activity, 
  Zap, 
  AlertCircle,
  HelpCircle,
  X,
  Loader2,
  Sparkles
} from 'lucide-react'

const MOOD_TYPES = [
  { emoji: '😁', label: 'Happy', value: 10, color: 'text-yellow-400' },
  { emoji: '🙂', label: 'Calm', value: 8, color: 'text-emerald-400' },
  { emoji: '😐', label: 'Neutral', value: 6, color: 'text-blue-400' },
  { emoji: '😟', label: 'Stressed', value: 4, color: 'text-orange-400' },
  { emoji: '😢', label: 'Sad', value: 3, color: 'text-indigo-400' },
  { emoji: '😴', label: 'Exhausted', value: 2, color: 'text-red-400' },
]

export default function Dashboard() {
  const { profile } = useAuthStore()
  const { 
    logs, 
    fetchLogs, 
    addLog, 
    preferences, 
    fetchPreferences,
    todayAnalysis,
    fetchTodayAnalysis
  } = useWellnessStore()
  const navigate = useNavigate()

  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [moodIntensity, setMoodIntensity] = useState(5)
  const [quickNotes, setQuickNotes] = useState('')
  const [submittingMood, setSubmittingMood] = useState(false)
  const [aiInsights, setAiInsights] = useState([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [motivationText, setMotivationText] = useState('')

  useEffect(() => {
    fetchPreferences()
    fetchLogs(1, 10)
    fetchTodayAnalysis()
  }, [fetchPreferences, fetchLogs, fetchTodayAnalysis])

  // Fetch daily motivation quote
  useEffect(() => {
    const loadMotivation = async () => {
      try {
        const name = profile?.full_name || 'Student'
        const exam = profile?.exam || 'Other'
        const hours = preferences?.study_hours || 6
        const chronotype = preferences?.study_type || 'Balanced'
        
        const quote = await generateMotivation(name, exam, hours, chronotype)
        setMotivationText(quote)
      } catch (err) {
        console.error(err)
      }
    }
    if (profile) {
      loadMotivation()
    }
  }, [profile, preferences])

  // Fetch mock AI insights based on the loaded logs
  useEffect(() => {
    const loadInsights = async () => {
      setInsightsLoading(true)
      try {
        const data = await generateInsights(logs)
        setAiInsights(data)
      } catch (err) {
        console.error(err)
      } finally {
        setInsightsLoading(false)
      }
    }
    if (logs.length >= 0) {
      loadInsights()
    }
  }, [logs])

  // 1. Calculate study streak
  const calculateStreak = () => {
    if (!logs || logs.length === 0) return 0
    
    const logDates = logs.map(log => new Date(log.created_at).toDateString())
    const uniqueDates = [...new Set(logDates)].map(d => new Date(d))

    let streak = 0
    let checkDate = new Date()

    const hasLogToday = uniqueDates.some(d => d.toDateString() === checkDate.toDateString())
    
    if (!hasLogToday) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      const logExists = uniqueDates.some(d => d.toDateString() === checkDate.toDateString())
      if (logExists) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  // Identify today's log status
  const todayDateString = new Date().toDateString()
  const todayLog = logs.find(log => new Date(log.created_at).toDateString() === todayDateString)

  // 3. Prepare mood chart data (last 7 days of logs)
  const getChartData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toDateString()
      
      const logsOnDay = logs.filter(log => new Date(log.created_at).toDateString() === dateStr)
      
      let avgIntensity = 5
      if (logsOnDay.length > 0) {
        const sum = logsOnDay.reduce((acc, log) => acc + (log.mood_intensity || 5), 0)
        avgIntensity = Math.round(sum / logsOnDay.length)
      }

      data.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        intensity: avgIntensity,
      })
    }
    return data
  }

  const chartData = getChartData()

  const handleMoodSubmit = async () => {
    if (!selectedMood) {
      toast.error('Please select an emoji.')
      return
    }

    setSubmittingMood(true)
    try {
      await addLog({
        mood: selectedMood.label,
        mood_intensity: moodIntensity,
        journal: quickNotes.trim() || `(Quick Check-in: feeling ${selectedMood.label})`
      })
      toast.success('Mood logged successfully!')
      setIsMoodModalOpen(false)
      setSelectedMood(null)
      setMoodIntensity(5)
      setQuickNotes('')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to log mood. Please try again.')
    } finally {
      setSubmittingMood(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/20 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{profile?.full_name || 'Student'}</span> 👋
          </h1>
          <p className="text-gray-400 text-xs mt-1 max-w-md font-light leading-relaxed">
            Keep study pressure in check. Spend 5 minutes tracking your thoughts to secure your cognitive focus.
          </p>
        </div>

        {/* Streak & Target stats */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-initial flex items-center gap-3 bg-gray-900/40 border border-white/5 px-5 py-3.5 rounded-2xl shadow-inner min-w-[130px]">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-light">Study Streak</div>
              <div className="text-base font-bold text-white leading-tight">{streak} {streak === 1 ? 'day' : 'days'}</div>
            </div>
          </div>

          <div className="flex-1 md:flex-initial flex items-center gap-3 bg-gray-900/40 border border-white/5 px-5 py-3.5 rounded-2xl shadow-inner min-w-[130px]">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-light">Target Exam</div>
              <div className="text-base font-bold text-white leading-tight">{profile?.exam || 'None'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Motivation banner */}
      {motivationText && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 rounded-3xl border border-purple-500/10 bg-gradient-to-r from-purple-950/10 to-emerald-950/5 relative overflow-hidden shadow-md"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Sparkles className="h-4.5 w-4.5 animate-float" />
            </div>
            <div>
              <div className="text-[9px] text-purple-400 font-bold tracking-wider uppercase font-sans">Daily Mindset Boost</div>
              <p className="text-xs text-gray-300 font-light italic mt-0.5 leading-relaxed">
                "{motivationText}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/journal')}
          className="flex items-center justify-between p-4 rounded-2xl bg-purple-950/10 hover:bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/40 text-left transition-all duration-300 shadow-md group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-sm">New Journal</h4>
            <p className="text-[10px] text-gray-400 font-light">Log study thoughts</p>
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:rotate-12 transition-transform duration-300 text-purple-400">
            <Plus className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => setIsMoodModalOpen(true)}
          className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-500/40 text-left transition-all duration-300 shadow-md group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-sm">Mood Check-in</h4>
            <p className="text-[10px] text-gray-400 font-light">How are you feeling?</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300 text-emerald-400">
            <Smile className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/history')}
          className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/30 hover:bg-gray-900/50 border border-white/5 hover:border-white/10 text-left transition-all duration-300 shadow-md group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-sm">Previous Entries</h4>
            <p className="text-[10px] text-gray-400 font-light">Browse log archive</p>
          </div>
          <div className="p-2 rounded-xl bg-gray-900/40 border border-white/10 text-gray-400">
            <History className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/30 hover:bg-gray-900/50 border border-white/5 hover:border-white/10 text-left transition-all duration-300 shadow-md group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-sm">Profile Details</h4>
            <p className="text-[10px] text-gray-400 font-light">Edit preferences</p>
          </div>
          <div className="p-2 rounded-xl bg-gray-900/40 border border-white/10 text-gray-400">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Today's Status & Weekly Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Mood Status Card with AI Analysis */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Smile className="h-4 w-4 text-purple-400" />
                <span>Today's Mood Status</span>
              </h3>
              <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-purple-300 font-medium">Daily</span>
            </div>

            {todayLog ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-950/40 border border-white/5 p-4 rounded-xl">
                  <span className="text-4xl">{
                    MOOD_TYPES.find(m => m.label === todayLog.mood)?.emoji || '😐'
                  }</span>
                  <div>
                    <h4 className="font-bold text-white text-base">{todayLog.mood}</h4>
                    <div className="text-[10px] text-gray-500 font-light mt-0.5">
                      Logged at {new Date(todayLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                {/* AI Analysis metrics */}
                {todayAnalysis ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-3 bg-gray-950/50 p-4 rounded-xl border border-white/5 text-xs space-y-0.5"
                  >
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <div className="text-gray-500 text-[10px] uppercase font-sans tracking-wide">Stress Level</div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <div className="w-24 bg-gray-800 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div 
                            className="bg-purple-500 h-full transition-all duration-500" 
                            style={{ width: `${todayAnalysis.stress_level}%` }}
                          ></div>
                        </div>
                        <span className="font-mono">{todayAnalysis.stress_level}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-gray-500 text-[10px] uppercase font-sans tracking-wide">Burnout Risk</div>
                      <div className={`font-bold ${
                        todayAnalysis.burnout_risk === 'High' ? 'text-red-400 animate-pulse' :
                        todayAnalysis.burnout_risk === 'Moderate' ? 'text-orange-400' : 'text-emerald-400'
                      }`}>
                        {todayAnalysis.burnout_risk} Risk
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-gray-500 text-[10px] uppercase font-sans tracking-wide">Confidence Index</div>
                      <div className="font-semibold text-white font-mono">{todayAnalysis.confidence}%</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-gray-500 text-[10px] uppercase font-sans tracking-wide">Primary Triggers</div>
                      <div className="font-medium text-purple-300 truncate" title={todayAnalysis.triggers?.join(', ')}>
                        {todayAnalysis.triggers && todayAnalysis.triggers.length > 0 
                          ? todayAnalysis.triggers.join(', ') 
                          : 'None identified'}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/5 p-3.5 rounded-xl border border-purple-500/10 animate-pulse font-light">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gemini AI is analyzing your thoughts...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-gray-400 text-xs font-light leading-relaxed">
                  You haven't logged your mental wellness mood today yet. A check-in takes only 5 seconds.
                </p>
                <button
                  onClick={() => setIsMoodModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 transition-all duration-300 shadow-md cursor-pointer"
                >
                  Log Today's Mood
                </button>
              </div>
            )}
          </div>

          {/* Weekly Mood Chart */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Weekly Wellness Progress</span>
              </h3>
              <span className="text-[10px] text-gray-500 font-light">Mood Intensity Curve</span>
            </div>
            
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tickCount={6}
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorIntensity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Column 2: Latest Journal & AI Recommendations */}
        <div className="space-y-6">
          
          {/* Journal Preview Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <span>Latest Journal Entry</span>
                </h3>
                <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-purple-300 font-medium">Logs</span>
              </div>

              {logs.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-300 text-xs font-light leading-relaxed line-clamp-4">
                    {logs[0].journal}
                  </p>
                  <div className="text-[10px] text-gray-500 flex justify-between items-center font-mono">
                    <span>{logs[0].journal.length} chars</span>
                    <span>{new Date(logs[0].created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="p-3 rounded-full bg-purple-500/5 border border-purple-500/10 w-fit mx-auto">
                    <AlertCircle className="h-6 w-6 text-purple-400/50" />
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed">
                    No journals recorded. Writing down thoughts helps discharge academic anxieties.
                  </p>
                  <button
                    onClick={() => navigate('/journal')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white border border-white/10 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                  >
                    Write First Entry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendations Checklist Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>AI Coping Recommendations</span>
              </h3>
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-medium">Empathetic AI</span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {todayAnalysis && todayAnalysis.recommendations && todayAnalysis.recommendations.length > 0 ? (
                todayAnalysis.recommendations.map((rec, idx) => (
                  <label 
                    key={idx} 
                    className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none font-light group"
                  >
                    <input 
                      type="checkbox" 
                      className="mt-0.5 accent-purple-500 rounded border-white/10" 
                      onChange={(e) => {
                        if (e.target.checked) toast.success(`Task completed: "${rec}"`)
                      }}
                    />
                    <span className="group-hover:text-white transition-colors leading-relaxed">{rec}</span>
                  </label>
                ))
              ) : (
                <div className="space-y-3">
                  {/* Fallback mock insights if today is not logged */}
                  {insightsLoading ? (
                    <div className="space-y-2 py-2">
                      <div className="h-3 w-full bg-white/5 animate-pulse rounded"></div>
                      <div className="h-3 w-[80%] bg-white/5 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    aiInsights.map((insight, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed font-light">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></div>
                        <p>{insight}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Mood Check-In Popup Modal */}
      <AnimatePresence>
        {isMoodModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoodModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-lg bg-gray-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Mood Check-in</h3>
                  <p className="text-gray-400 text-xs font-light mt-1">How are you feeling study-wise today?</p>
                </div>
                <button
                  onClick={() => setIsMoodModalOpen(false)}
                  className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MOOD_TYPES.map((mood) => {
                  const isSelected = selectedMood?.label === mood.label
                  return (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => setSelectedMood(mood)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-950/20 border-purple-500/80 shadow-md' 
                          : 'bg-gray-950/30 border-white/5 hover:border-white/10 hover:bg-gray-950/60'
                      }`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className={`text-[10px] font-semibold ${mood.color}`}>{mood.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-purple-400" />
                    <span>Mood Intensity</span>
                  </span>
                  <span className="text-white font-mono">{moodIntensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodIntensity}
                  onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-light font-mono">
                  <span>1 - Mild</span>
                  <span>10 - Extreme</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                  <span>Any specific reasons? (Optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="E.g., completed mock test, feeling behind on syllabus, tired..."
                  className="w-full p-3 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMoodModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-medium cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMoodSubmit}
                  disabled={submittingMood || !selectedMood}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-semibold text-xs transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                >
                  {submittingMood ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <span>Save Check-in</span>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
