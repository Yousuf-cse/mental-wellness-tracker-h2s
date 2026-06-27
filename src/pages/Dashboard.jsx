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
import Button from '../components/Button'

const MOOD_TYPES = [
  { emoji: '😁', label: 'Happy', value: 10, color: 'text-[#ba8d1a]' },
  { emoji: '🙂', label: 'Calm', value: 8, color: 'text-primary' },
  { emoji: '😐', label: 'Neutral', value: 6, color: 'text-secondary' },
  { emoji: '😟', label: 'Stressed', value: 4, color: 'text-[#ba5a1a]' },
  { emoji: '😢', label: 'Sad', value: 3, color: 'text-[#444655]' },
  { emoji: '😴', label: 'Exhausted', value: 2, color: 'text-error' },
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-on-background">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white brutalist-border brutalist-shadow p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-primary font-headline font-bold mb-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-background tracking-tight">
            Welcome, <span className="bg-primary-container brutalist-border px-2 inline-block -rotate-1 text-primary">{profile?.full_name || 'Student'}</span> 👋
          </h1>
          <p className="text-secondary text-xs mt-2 max-w-md font-medium leading-relaxed">
            Keep study pressure in check. Spend 5 minutes tracking your thoughts to secure your cognitive focus.
          </p>
        </div>

        {/* Streak & Target stats */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-initial flex items-center gap-3 bg-white brutalist-border brutalist-shadow-sm px-5 py-3.5 rounded-2xl min-w-[130px]">
            <div className="p-2 rounded-xl bg-tertiary-container brutalist-border text-tertiary shrink-0">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-secondary font-headline font-bold">Study Streak</div>
              <div className="text-base font-headline font-extrabold text-on-background leading-tight">{streak} {streak === 1 ? 'day' : 'days'}</div>
            </div>
          </div>

          <div className="flex-1 md:flex-initial flex items-center gap-3 bg-white brutalist-border brutalist-shadow-sm px-5 py-3.5 rounded-2xl min-w-[130px]">
            <div className="p-2 rounded-xl bg-primary-container brutalist-border text-primary shrink-0">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-secondary font-headline font-bold">Target Exam</div>
              <div className="text-base font-headline font-extrabold text-on-background leading-tight">{profile?.exam || 'None'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Motivation banner */}
      {motivationText && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary-container text-on-secondary-container p-5 rounded-3xl brutalist-border brutalist-shadow relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white brutalist-border text-secondary shrink-0">
              <Sparkles className="h-4.5 w-4.5 animate-float" />
            </div>
            <div>
              <div className="text-[10px] text-on-secondary-container font-headline font-extrabold tracking-wider uppercase">Daily Mindset Boost</div>
              <p className="text-sm text-on-secondary-container font-medium italic mt-0.5 leading-relaxed">
                "{motivationText}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/journal')}
          className="flex items-center justify-between p-4 rounded-2xl bg-primary-container brutalist-border brutalist-shadow brutalist-button hover:bg-[#91dec0] text-left transition-all group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-headline font-bold text-on-primary-container text-sm">New Journal</h4>
            <p className="text-[10px] text-on-primary-container font-medium opacity-80">Log study thoughts</p>
          </div>
          <div className="p-2 rounded-xl bg-white brutalist-border group-hover:rotate-12 transition-transform duration-300 text-primary">
            <Plus className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => setIsMoodModalOpen(true)}
          className="flex items-center justify-between p-4 rounded-2xl bg-secondary-container brutalist-border brutalist-shadow brutalist-button hover:bg-[#ced0eb] text-left transition-all group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-headline font-bold text-on-secondary-container text-sm">Mood Check-in</h4>
            <p className="text-[10px] text-on-secondary-container font-medium opacity-80">How are you feeling?</p>
          </div>
          <div className="p-2 rounded-xl bg-white brutalist-border group-hover:scale-110 transition-transform duration-300 text-secondary">
            <Smile className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/history')}
          className="flex items-center justify-between p-4 rounded-2xl bg-tertiary-container brutalist-border brutalist-shadow brutalist-button hover:bg-[#f6cdab] text-left transition-all group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-headline font-bold text-on-tertiary-container text-sm">Previous Entries</h4>
            <p className="text-[10px] text-on-tertiary-container font-medium opacity-80">Browse log archive</p>
          </div>
          <div className="p-2 rounded-xl bg-white brutalist-border text-tertiary">
            <History className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center justify-between p-4 rounded-2xl bg-white brutalist-border brutalist-shadow brutalist-button hover:bg-surface-container text-left transition-all group cursor-pointer"
        >
          <div className="space-y-1">
            <h4 className="font-headline font-bold text-on-background text-sm">Profile Details</h4>
            <p className="text-[10px] text-secondary font-medium">Edit preferences</p>
          </div>
          <div className="p-2 rounded-xl bg-surface-container-low brutalist-border text-on-background">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Today's Status & Weekly Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Mood Status Card with AI Analysis */}
          <div className="bg-white brutalist-border brutalist-shadow p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-on-background text-sm flex items-center gap-2">
                <Smile className="h-4 w-4 text-primary" />
                <span>Today's Mood Status</span>
              </h3>
              <span className="text-[9px] bg-primary-container brutalist-border px-2 py-0.5 rounded-full text-on-primary-container font-headline font-bold">Daily</span>
            </div>

            {todayLog ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-surface-container-low brutalist-border p-4 rounded-xl">
                  <span className="text-4xl">{
                    MOOD_TYPES.find(m => m.label === todayLog.mood)?.emoji || '😐'
                  }</span>
                  <div>
                    <h4 className="font-headline font-bold text-on-background text-base">{todayLog.mood}</h4>
                    <div className="text-[10px] text-secondary font-medium mt-0.5">
                      Logged at {new Date(todayLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                {/* AI Analysis metrics */}
                {todayAnalysis ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl brutalist-border text-xs"
                  >
                    <div className="space-y-1">
                      <div className="text-secondary text-[10px] font-headline font-bold uppercase tracking-wide">Stress Level</div>
                      <div className="font-bold text-on-background flex items-center gap-2">
                        <div className="w-24 bg-white h-2.5 brutalist-border rounded-full overflow-hidden shrink-0">
                          <div 
                            className="bg-primary h-full transition-all duration-500" 
                            style={{ width: `${todayAnalysis.stress_level}%` }}
                          ></div>
                        </div>
                        <span className="font-mono">{todayAnalysis.stress_level}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-secondary text-[10px] font-headline font-bold uppercase tracking-wide">Burnout Risk</div>
                      <div className={`font-headline font-bold ${
                        todayAnalysis.burnout_risk === 'High' ? 'text-error animate-pulse' :
                        todayAnalysis.burnout_risk === 'Moderate' ? 'text-[#ba5a1a]' : 'text-primary'
                      }`}>
                        {todayAnalysis.burnout_risk} Risk
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-secondary text-[10px] font-headline font-bold uppercase tracking-wide">Confidence Index</div>
                      <div className="font-bold text-on-background font-mono">{todayAnalysis.confidence}%</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-secondary text-[10px] font-headline font-bold uppercase tracking-wide">Primary Triggers</div>
                      <div className="font-bold text-primary truncate" title={todayAnalysis.triggers?.join(', ')}>
                        {todayAnalysis.triggers && todayAnalysis.triggers.length > 0 
                          ? todayAnalysis.triggers.join(', ') 
                          : 'None identified'}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-primary bg-primary-container p-3.5 rounded-xl brutalist-border font-medium">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gemini AI is analyzing your thoughts...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-secondary text-xs font-medium leading-relaxed">
                  You haven't logged your mental wellness mood today yet. A check-in takes only 5 seconds.
                </p>
                <Button
                  onClick={() => setIsMoodModalOpen(true)}
                  variant="primary"
                  className="text-xs"
                >
                  Log Today's Mood
                </Button>
              </div>
            )}
          </div>

          {/* Weekly Mood Chart */}
          <div className="bg-white brutalist-border brutalist-shadow p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-on-background text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>Weekly Wellness Progress</span>
              </h3>
              <span className="text-[10px] text-secondary font-headline font-bold">Mood Intensity Curve</span>
            </div>
            
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#246a52" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#aaf0d1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    stroke="#1b1b1b" 
                    tick={{ fill: '#1b1b1b', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tickCount={6}
                    stroke="#1b1b1b" 
                    tick={{ fill: '#1b1b1b', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#ffffff', 
                      borderColor: '#1b1b1b',
                      borderWidth: '2px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#1b1b1b',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#246a52" 
                    strokeWidth={3}
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
          <div className="bg-white brutalist-border brutalist-shadow p-6 rounded-2xl flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline font-bold text-on-background text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Latest Journal Entry</span>
                </h3>
                <span className="text-[9px] bg-primary-container brutalist-border px-2 py-0.5 rounded-full text-on-primary-container font-headline font-bold">Logs</span>
              </div>

              {logs.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-secondary text-xs font-medium leading-relaxed line-clamp-4">
                    {logs[0].journal}
                  </p>
                  <div className="text-[10px] text-secondary flex justify-between items-center font-mono font-bold">
                    <span>{logs[0].journal.length} chars</span>
                    <span>{new Date(logs[0].created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="p-3 rounded-full bg-surface-container-low brutalist-border w-fit mx-auto text-secondary">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <p className="text-secondary text-xs font-medium leading-relaxed">
                    No journals recorded. Writing down thoughts helps discharge academic anxieties.
                  </p>
                  <Button
                    onClick={() => navigate('/journal')}
                    variant="outline"
                    className="text-xs w-full"
                  >
                    Write First Entry
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendations Checklist Card */}
          <div className="bg-tertiary-container text-on-tertiary-container brutalist-border brutalist-shadow p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-on-tertiary-container text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-tertiary animate-pulse" />
                <span>AI Coping Recommendations</span>
              </h3>
              <span className="text-[9px] bg-white brutalist-border px-2 py-0.5 rounded-full text-on-tertiary-container font-headline font-bold">Empathetic AI</span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {todayAnalysis && todayAnalysis.recommendations && todayAnalysis.recommendations.length > 0 ? (
                todayAnalysis.recommendations.map((rec, idx) => (
                  <label 
                    key={idx} 
                    className="flex items-start gap-2.5 text-xs font-medium cursor-pointer select-none text-on-tertiary-container leading-relaxed"
                  >
                    <input 
                      type="checkbox" 
                      className="mt-0.5 accent-primary brutalist-border bg-white rounded cursor-pointer" 
                      onChange={(e) => {
                        if (e.target.checked) toast.success(`Task completed: "${rec}"`)
                      }}
                    />
                    <span>{rec}</span>
                  </label>
                ))
              ) : (
                <div className="space-y-3">
                  {/* Fallback mock insights if today is not logged */}
                  {insightsLoading ? (
                    <div className="space-y-2 py-2">
                      <div className="h-3 w-full bg-white/40 animate-pulse rounded"></div>
                      <div className="h-3 w-[80%] bg-white/40 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    aiInsights.map((insight, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs text-on-tertiary-container font-medium leading-relaxed">
                        <div className="h-2 w-2 rounded-full bg-tertiary shrink-0 mt-1.5"></div>
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
              className="absolute inset-0 bg-black/40"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-lg bg-white border-4 border-on-background p-6 md:p-8 rounded-3xl shadow-[8px_8px_0px_0px_#1b1b1b] relative z-10 space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-headline font-extrabold text-on-background">Mood Check-in</h3>
                  <p className="text-secondary text-xs font-medium mt-1">How are you feeling study-wise today?</p>
                </div>
                <button
                  onClick={() => setIsMoodModalOpen(false)}
                  className="p-1 rounded-lg brutalist-border bg-white text-on-background hover:bg-surface-container"
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
                      className={`p-3 rounded-xl brutalist-border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                        isSelected 
                          ? 'bg-primary-container brutalist-shadow-sm translate-x-[1px] translate-y-[1px] shadow-none font-bold' 
                          : 'bg-white hover:bg-surface-container-low text-on-background'
                      }`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className={`text-[10px] font-headline font-bold ${mood.color}`}>{mood.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-headline font-bold text-secondary">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span>Mood Intensity</span>
                  </span>
                  <span className="text-on-background font-mono">{moodIntensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodIntensity}
                  onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                  className="w-full h-3 bg-white brutalist-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-secondary font-mono font-bold">
                  <span>1 - Mild</span>
                  <span>10 - Extreme</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-headline font-bold text-secondary flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  <span>Any specific reasons? (Optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="E.g., completed mock test, feeling behind on syllabus, tired..."
                  className="w-full p-3 rounded-xl brutalist-border bg-white text-on-background focus:outline-none focus:bg-surface-container-low text-xs resize-none placeholder-gray-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  onClick={() => setIsMoodModalOpen(false)}
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMoodSubmit}
                  disabled={submittingMood || !selectedMood}
                  variant="primary"
                  className="flex-1 text-xs"
                  loading={submittingMood}
                >
                  Save Check-in
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
