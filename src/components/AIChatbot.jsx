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
      
      {/* 1. Circular Neo-Brutalist Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-primary-container brutalist-border brutalist-shadow brutalist-button flex items-center justify-center text-primary cursor-pointer relative group focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-on-primary-container" />
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
              <BrainCircuit className="h-6 w-6 text-primary" />
              <Sparkles className="h-3.5 w-3.5 text-primary absolute -top-1.5 -right-1.5 animate-bounce" />
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
            className="absolute bottom-18 right-0 w-[350px] sm:w-[400px] h-[520px] rounded-3xl border-4 border-on-background bg-white shadow-[8px_8px_0px_0px_#1b1b1b] overflow-hidden flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-4 border-b-2 border-on-background bg-secondary-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white brutalist-border">
                  <BrainCircuit className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-headline font-bold text-on-background leading-none">MindMate Companion</h4>
                  <span className="text-[9px] text-primary font-bold">Empathetic AI Companion</span>
                </div>
              </div>
              
              {/* New session launcher */}
              <button 
                onClick={handleNewSession}
                className="px-2.5 py-1 rounded-lg brutalist-border brutalist-shadow-sm bg-white text-on-background hover:bg-surface-container-high transition-all text-xs font-headline font-bold cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                title="Restart chat history"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Restart</span>
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs bg-surface-container-low max-h-[400px]">
              {messages.length === 0 && !companionTyping && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <MessageSquare className="h-10 w-10 text-[#626374]" />
                  <p className="text-on-background text-xs font-medium leading-relaxed">
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
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed brutalist-border brutalist-shadow-sm ${
                        isUser
                          ? 'bg-primary-container text-on-primary-container rounded-tr-none'
                          : 'bg-white text-on-background rounded-tl-none'
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
                  <div className="bg-white brutalist-border brutalist-shadow-sm text-on-background rounded-2xl rounded-tl-none px-3.5 py-3 flex items-center gap-1 min-w-[70px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSend}
              className="p-3 border-t-2 border-on-background bg-white flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={sending ? 'Thinking...' : 'Overwhelmed? Chat with companion...'}
                disabled={sending || companionTyping}
                className="flex-1 p-2.5 rounded-xl text-xs brutalist-border bg-white text-on-background focus:outline-none placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={sending || companionTyping || !inputText.trim()}
                className="p-2.5 rounded-xl bg-primary text-white brutalist-border brutalist-shadow-sm brutalist-button hover:bg-[#1a4f3e] cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
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
