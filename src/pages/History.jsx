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
import Button from '../components/Button'
import Card from '../components/Card'

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
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 text-on-background font-sans">
      
      {/* Title Header with Report button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-on-background pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-background flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <span>Mood & Journal History</span>
          </h1>
          <p className="text-secondary text-xs mt-1">Review your historical logs, study streaks, and wellness statistics over time.</p>
        </div>

        {logs.length > 0 && (
          <Button
            onClick={handleCompileWeeklyReport}
            variant="primary"
            className="text-xs shrink-0"
          >
            <Sparkles className="h-4 w-4 animate-float" />
            <span>Generate Weekly Report</span>
          </Button>
        )}
      </div>

      {/* Empty State */}
      {!loading && logs.length === 0 && (
        <Card variant="white" className="max-w-md mx-auto text-center border-dashed space-y-6">
          <div className="mx-auto p-4 bg-primary-container brutalist-border rounded-2xl w-fit text-primary">
            <BookOpenCheck className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-headline font-extrabold text-on-background">Your Wellness Log is Empty</h3>
            <p className="text-xs text-secondary font-medium leading-relaxed">
              No journal logs or moods were found in your record database. Create your very first wellness check-in now.
            </p>
          </div>
          <Button
            onClick={() => navigate('/journal')}
            variant="primary"
            className="w-full text-xs"
          >
            Start Your First Entry
          </Button>
        </Card>
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
                className="bg-white brutalist-border brutalist-shadow brutalist-card-hover p-6 rounded-2xl flex flex-col justify-between min-h-[190px] cursor-pointer group relative overflow-hidden text-on-background"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-secondary font-bold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                    <span 
                      title={`Mood Intensity: ${log.mood_intensity || 'N/A'}/10`}
                      className="text-xs bg-surface-container-low brutalist-border px-2 py-0.5 rounded-full text-on-background font-headline font-bold flex items-center gap-1"
                    >
                      <span>{MOOD_EMOJIS[log.mood] || '😐'}</span>
                      <span className="text-[9px] text-secondary font-medium">{log.mood}</span>
                    </span>
                  </div>

                  <p className="text-[#3f4944] text-xs font-medium leading-relaxed line-clamp-4 mt-2">
                    {log.journal}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-on-background flex justify-between items-center text-[10px] text-secondary font-headline font-bold">
                  <span>{log.journal.length} characters</span>
                  <span className="text-primary hover:text-[#1a4f3e] flex items-center gap-1 transition-colors">
                    <span>View details</span>
                    <Maximize2 className="h-2.5 w-2.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t-2 border-on-background pt-6 mt-8">
            <Button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              variant="outline"
              className="text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <span className="text-xs text-on-background font-headline font-bold">Page {page}</span>
            <Button
              onClick={handleNextPage}
              disabled={!hasMoreLogs || loading}
              variant="outline"
              className="text-xs"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
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
              className="absolute inset-0 bg-black/40"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-2xl bg-white border-4 border-on-background p-6 md:p-8 rounded-3xl shadow-[8px_8px_0px_0px_#1b1b1b] relative z-10 space-y-6 text-on-background"
            >
              <div className="flex justify-between items-start border-b-2 border-on-background pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-primary font-headline font-bold">
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
                  <h3 className="text-xl font-headline font-extrabold text-on-background">Journal Detail</h3>
                </div>

                <button
                  onClick={() => setActiveLog(null)}
                  className="p-1 rounded-lg brutalist-border bg-white text-on-background hover:bg-surface-container"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary-container brutalist-border text-on-primary-container font-headline font-bold text-xs shadow-sm">
                  <span className="text-xl">{MOOD_EMOJIS[activeLog.mood] || '😐'}</span>
                  <div>
                    <div className="text-secondary leading-none text-[9px]">Mood Status</div>
                    <div className="text-primary font-bold mt-0.5">{activeLog.mood}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-secondary-container brutalist-border text-on-secondary-container font-headline font-bold text-xs shadow-sm">
                  <Zap className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-secondary leading-none text-[9px]">Intensity Rating</div>
                    <div className="text-secondary font-bold mt-0.5">{activeLog.mood_intensity || 'N/A'}/10</div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low border-2 border-on-background rounded-2xl p-5 max-h-[300px] overflow-y-auto">
                <p className="text-on-background text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {activeLog.journal}
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-secondary font-mono font-bold border-t-2 border-on-background pt-4">
                <span>{activeLog.journal.length} characters</span>
                <Button
                  onClick={() => setActiveLog(null)}
                  variant="outline"
                  className="text-xs"
                >
                  Close View
                </Button>
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
              className="absolute inset-0 bg-black/40"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-2xl bg-white border-4 border-on-background p-6 md:p-8 rounded-3xl shadow-[8px_8px_0px_0px_#1b1b1b] relative z-10 max-h-[90vh] overflow-y-auto space-y-6 text-on-background"
            >
              <div className="flex justify-between items-start border-b-2 border-on-background pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary-container brutalist-border text-primary shrink-0">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-extrabold text-on-background">AI Weekly Wellness Report</h3>
                    <p className="text-[10px] text-secondary font-medium">Personalized compiler for {profile?.full_name}</p>
                  </div>
                </div>
                {!reportLoading && (
                  <button
                    onClick={() => setIsReportOpen(false)}
                    className="p-1 rounded-lg brutalist-border bg-white text-on-background hover:bg-surface-container"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {reportLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="space-y-1">
                    <h4 className="font-headline font-bold text-on-background text-sm">Compiling Weekly Data...</h4>
                    <p className="text-secondary text-xs font-medium">Gemini is analyzing stress peaks, chronotypes, and study fatigue.</p>
                  </div>
                </div>
              ) : (
                weeklyReport && (
                  <div className="space-y-6 text-xs leading-relaxed font-medium">
                    
                    {/* General Summary */}
                    <div className="space-y-2">
                      <h4 className="font-headline font-bold text-on-background text-sm flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>Executive Summary</span>
                      </h4>
                      <p className="bg-surface-container-low p-4 rounded-xl border-2 border-on-background text-[#3f4944]">
                        {weeklyReport.summary}
                      </p>
                    </div>

                    {/* Meta section grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Trend */}
                      <div className="bg-surface-container-low p-4 rounded-xl border-2 border-on-background space-y-1.5">
                        <h4 className="font-headline font-bold text-on-background flex items-center gap-1 text-[11px]">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          <span>Mood Trend</span>
                        </h4>
                        <p className="text-primary font-bold text-xs">{weeklyReport.moodTrend}</p>
                      </div>

                      {/* Triggers */}
                      <div className="bg-surface-container-low p-4 rounded-xl border-2 border-on-background space-y-1.5">
                        <h4 className="font-headline font-bold text-on-background flex items-center gap-1 text-[11px]">
                          <AlertCircle className="h-3.5 w-3.5 text-[#ba5a1a]" />
                          <span>Stress Triggers</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {weeklyReport.commonStressTriggers?.map((trig, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-tertiary-container brutalist-border text-on-tertiary-container text-[10px] font-headline font-bold">{trig}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Habits & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Positive habits */}
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-on-background flex items-center gap-1.5 text-[11px]">
                          <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          <span>Positive Habits Noticed</span>
                        </h4>
                        <ul className="space-y-1 list-disc list-inside pl-1 text-[11px] text-secondary">
                          {weeklyReport.positiveHabits?.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-on-background flex items-center gap-1.5 text-[11px]">
                          <Activity className="h-3.5 w-3.5 text-secondary" />
                          <span>Areas to Optimize</span>
                        </h4>
                        <ul className="space-y-1 list-disc list-inside pl-1 text-[11px] text-secondary">
                          {weeklyReport.areasToImprove?.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Encouragement banner */}
                    <div className="p-4 rounded-xl bg-primary-container brutalist-border text-center text-on-primary-container font-headline font-bold">
                      <p className="italic">
                        "{weeklyReport.overallEncouragement}"
                      </p>
                    </div>

                  </div>
                )
              )}

              {/* Close Button */}
              {!reportLoading && (
                <div className="flex justify-end border-t-2 border-on-background pt-4">
                  <Button
                    onClick={() => setIsReportOpen(false)}
                    variant="outline"
                    className="text-xs"
                  >
                    Close Report
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
