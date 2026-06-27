import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWellnessStore } from '../store/wellnessStore'
import { useAuthStore } from '../store/authStore'
import { generateWeeklySummary } from '../services/ai/gemini'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  History, 
  Calendar, 
  Smile, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  BookOpenCheck,
  Zap,
  Maximize2,
  Sparkles,
  Loader2,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const MOOD_EMOJIS = {
  'Happy': '😁',
  'Calm': '🙂',
  'Neutral': '😐',
  'Stressed': '😟',
  'Sad': '😢',
  'Exhausted': '😴',
}

const ITEMS_PER_PAGE = 6

export default function JournalHistory() {
  const { profile } = useAuthStore()
  const { logs, fetchLogs, hasMoreLogs, loading, preferences } = useWellnessStore()
  const navigate = useNavigate()
  
  const [page, setPage] = useState(1)
  const [activeLog, setActiveLog] = useState(null)
  
  // Weekly report states
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [weeklyReport, setWeeklyReport] = useState(null)

  useEffect(() => {
    fetchLogs(page, ITEMS_PER_PAGE, false)
  }, [page, fetchLogs])

  const handleNextPage = () => {
    if (hasMoreLogs) setPage((p) => p + 1)
  }

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1)
  }

  // Trigger Gemini weekly compiler
  const handleCompileWeeklyReport = async () => {
    if (!logs || logs.length === 0) {
      toast.warning('Write some journals first before generating a weekly summary report.')
      return
    }

    setReportLoading(true)
    setIsReportOpen(true)
    
    // Take up to last 7 logs for compilation
    const last7Logs = logs.slice(0, 7)

    try {
      const exam = profile?.exam || 'Other'
      const hours = preferences?.study_hours || 6
      const report = await generateWeeklySummary(last7Logs, exam, hours)
      setWeeklyReport(report)
      toast.success('AI Weekly Report compiled successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to compile report. Please check your Gemini API key.')
      setIsReportOpen(false)
    } finally {
      setReportLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      
      {/* Title Header with Report button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="h-6 w-6 text-purple-400" />
            <span>Mood & Journal History</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">Review your historical logs, study streaks, and wellness statistics over time.</p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={handleCompileWeeklyReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="h-4 w-4 animate-float" />
            <span>Generate Weekly Report</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {!loading && logs.length === 0 && (
        <div className="glass-card max-w-md mx-auto text-center p-8 rounded-3xl border border-dashed border-white/10 space-y-6">
          <div className="mx-auto p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl w-fit">
            <BookOpenCheck className="h-8 w-8 text-purple-400/60 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Your Wellness Log is Empty</h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              No journal logs or moods were found in your record database. Create your very first wellness check-in now.
            </p>
          </div>
          <button
            onClick={() => navigate('/journal')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-semibold text-xs transition-all duration-300 shadow-md cursor-pointer active:scale-98"
          >
            Start Your First Entry
          </button>
        </div>
      )}

      {/* Logs Grid */}
      {logs.length > 0 && (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {logs.map((log) => (
              <motion.div
                key={log.id}
                variants={itemVariants}
                onClick={() => setActiveLog(log)}
                className="glass-card glass-card-hover p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[190px] cursor-pointer group relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-purple-400/70" />
                      <span>{new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                    <span 
                      title={`Mood Intensity: ${log.mood_intensity || 'N/A'}/10`}
                      className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white font-semibold flex items-center gap-1 font-sans"
                    >
                      <span>{MOOD_EMOJIS[log.mood] || '😐'}</span>
                      <span className="text-[9px] text-gray-400 font-light">{log.mood}</span>
                    </span>
                  </div>

                  <p className="text-gray-300 text-xs font-light leading-relaxed line-clamp-4 mt-2">
                    {log.journal}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-medium font-sans">
                  <span>{log.journal.length} characters</span>
                  <span className="text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                    <span>View details</span>
                    <Maximize2 className="h-2.5 w-2.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs text-gray-500 font-medium">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasMoreLogs || loading}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Expanded Modal Box */}
      <AnimatePresence>
        {activeLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLog(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-2xl bg-gray-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(activeLog.created_at).toLocaleDateString([], { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })} at {new Date(activeLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Journal Detail</h3>
                </div>

                <button
                  onClick={() => setActiveLog(null)}
                  className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
                  <span className="text-xl">{MOOD_EMOJIS[activeLog.mood] || '😐'}</span>
                  <div className="text-[10px]">
                    <div className="text-gray-500 leading-none">Mood Status</div>
                    <div className="text-purple-300 font-bold mt-0.5">{activeLog.mood}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <div className="text-[10px]">
                    <div className="text-gray-500 leading-none">Intensity Rating</div>
                    <div className="text-emerald-300 font-bold mt-0.5">{activeLog.mood_intensity || 'N/A'}/10</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-950/40 border border-white/5 rounded-2xl p-5 max-h-[300px] overflow-y-auto">
                <p className="text-gray-200 text-sm font-light leading-relaxed whitespace-pre-wrap">
                  {activeLog.journal}
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>{activeLog.journal.length} characters</span>
                <button
                  onClick={() => setActiveLog(null)}
                  className="px-4 py-2 rounded-xl bg-gray-900 border border-white/10 text-white font-semibold text-xs cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Weekly Summary Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!reportLoading) setIsReportOpen(false) }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-2xl bg-gray-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Weekly Wellness Report</h3>
                    <p className="text-[10px] text-gray-400">Personalized compiler for {profile?.full_name}</p>
                  </div>
                </div>
                {!reportLoading && (
                  <button
                    onClick={() => setIsReportOpen(false)}
                    className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {reportLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">Compiling Weekly Data...</h4>
                    <p className="text-[10px] text-gray-500">Gemini is analyzing stress peaks, chronotypes, and study fatigue.</p>
                  </div>
                </div>
              ) : (
                weeklyReport && (
                  <div className="space-y-6 text-xs text-gray-300 leading-relaxed font-light font-sans">
                    
                    {/* General Summary */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-purple-400" />
                        <span>Executive Summary</span>
                      </h4>
                      <p className="bg-gray-950/40 p-4 rounded-xl border border-white/5 font-light text-gray-300">
                        {weeklyReport.summary}
                      </p>
                    </div>

                    {/* Meta section grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Trend */}
                      <div className="bg-gray-950/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                        <h4 className="font-semibold text-white flex items-center gap-1 text-[11px]">
                          <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                          <span>Mood Trend</span>
                        </h4>
                        <p className="text-gray-300 font-bold">{weeklyReport.moodTrend}</p>
                      </div>

                      {/* Triggers */}
                      <div className="bg-gray-950/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                        <h4 className="font-semibold text-white flex items-center gap-1 text-[11px]">
                          <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                          <span>Stress Triggers</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {weeklyReport.commonStressTriggers?.map((trig, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-medium">{trig}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Habits & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Positive habits */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Positive Habits Noticed</span>
                        </h4>
                        <ul className="space-y-1 list-disc list-inside pl-1 text-[11px]">
                          {weeklyReport.positiveHabits?.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                          <Activity className="h-3.5 w-3.5 text-purple-400" />
                          <span>Areas to Optimize</span>
                        </h4>
                        <ul className="space-y-1 list-disc list-inside pl-1 text-[11px]">
                          {weeklyReport.areasToImprove?.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Encouragement banner */}
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-center">
                      <p className="text-gray-300 italic">
                        "{weeklyReport.overallEncouragement}"
                      </p>
                    </div>

                  </div>
                )
              )}

              {/* Close Button */}
              {!reportLoading && (
                <div className="flex justify-end border-t border-white/5 pt-4">
                  <button
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-900 border border-white/10 text-white font-semibold text-xs cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    Close Report
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
