import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { useWellnessStore } from '../store/wellnessStore'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  BrainCircuit, 
  Send, 
  X, 
  MessageSquare, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react'

export default function AIChatbot() {
  const { profile } = useAuthStore()
  const { preferences, logs } = useWellnessStore()
  const { 
    messages, 
    sendMessage, 
    companionTyping, 
    fetchSessions, 
    activeSession,
    startSession 
  } = useChatStore()

  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef(null)

  // Initialize and load chat sessions when open is triggered
  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen, fetchSessions])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, companionTyping])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const textToSend = inputText.trim()
    setInputText('')
    setSending(true)

    // Assemble student context for personalized responses
    const todayStr = new Date().toDateString()
    const todayLog = logs.find(log => new Date(log.created_at).toDateString() === todayStr)

    const context = {
      full_name: profile?.full_name || 'Student',
      exam: profile?.exam || 'Competitive Exam',
      study_hours: preferences?.study_hours || 6,
      study_type: preferences?.study_type || 'Balanced',
      current_mood: todayLog?.mood || 'Not logged today',
      recent_logs_preview: logs.slice(0, 3).map(l => ({
        mood: l.mood,
        notes_snippet: l.journal ? l.journal.substring(0, 80) + '...' : ''
      }))
    }

    try {
      await sendMessage(textToSend, context)
    } catch (err) {
      console.error(err)
      toast.error('Failed to receive response. Please check your Gemini API configuration.')
    } finally {
      setSending(false)
    }
  }

  const handleNewSession = async () => {
    try {
      await startSession(`Companion ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      toast.success('Started a fresh companion chat session.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create new conversation.')
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      
      {/* 1. Floating Pulse Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-500 shadow-xl flex items-center justify-center text-white cursor-pointer relative group focus:outline-none"
      >
        <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping group-hover:animate-none -z-10"></span>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center relative"
            >
              <BrainCircuit className="h-6 w-6 text-white" />
              <Sparkles className="h-3 w-3 text-emerald-300 absolute -top-1.5 -right-1.5 animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 2. Chat Overlay Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[520px] rounded-3xl border border-white/10 bg-gray-950/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gray-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-600/10 border border-purple-500/30">
                  <BrainCircuit className="h-4.5 w-4.5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">MindMate Companion</h4>
                  <span className="text-[9px] text-emerald-400 font-medium">Empathetic AI Online</span>
                </div>
              </div>
              
              {/* New session launcher */}
              <button 
                onClick={handleNewSession}
                className="p-1.5 rounded-lg border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer flex items-center gap-1 font-sans"
                title="Restart chat history"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Restart</span>
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs max-h-[400px]">
              {messages.length === 0 && !companionTyping && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <MessageSquare className="h-10 w-10 text-purple-400/40" />
                  <p className="text-gray-400 text-xs font-light leading-relaxed">
                    Hello, I'm your wellness companion. Preparing for {profile?.exam || 'exams'} takes work. Tell me how you're feeling today, or ask me for study-break routines!
                  </p>
                </div>
              )}

              {/* Bubbles */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed font-light ${
                        isUser
                          ? 'bg-gradient-to-tr from-purple-600 to-purple-800 text-white rounded-tr-none'
                          : 'bg-gray-900 border border-white/5 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}

              {/* Gemini Loading Typing indicator */}
              {companionTyping && (
                <div className="flex justify-start w-full">
                  <div className="bg-gray-900 border border-white/5 text-gray-200 rounded-2xl rounded-tl-none px-3.5 py-3 flex items-center gap-1 min-w-[70px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSend}
              className="p-3 border-t border-white/5 bg-gray-950 flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={sending ? 'Thinking...' : 'Overwhelmed? Chat with companion...'}
                disabled={sending || companionTyping}
                className="flex-1 p-2.5 rounded-xl text-xs glass-input focus:outline-none placeholder-gray-600 focus:border-purple-500/50"
              />
              <button
                type="submit"
                disabled={sending || companionTyping || !inputText.trim()}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-colors shrink-0 disabled:opacity-30 disabled:pointer-events-none"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  )
}
