import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  console.warn(
    'VITE_GEMINI_API_KEY is missing. AI wellness suggestions will fallback to local rule-based mocks.'
  )
}

// Initialize the Gemini AI SDK client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Empathy system prompt constraints
const SYSTEM_PROMPT = `
You are MindMate AI.
You are an empathetic AI wellness companion helping students preparing for competitive examinations.
You never diagnose medical conditions.
You never create fear.
You always encourage healthy habits.
You respond calmly, positively, and practically.
Keep responses supportive, conversational, and concise.
Recommend healthy coping mechanisms.
If a user appears to be in distress, encourage them to reach out to trusted people or appropriate professional support without being alarmist.
`

/**
 * Parses and validates raw JSON output from Gemini to prevent markdown formatting issues.
 * @param {string} rawText - Raw response text.
 * @returns {Object} Parsed JSON.
 */
function safeJsonParse(rawText) {
  let cleaned = rawText.trim()
  
  // Strip potential markdown JSON code block indicators
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3)
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3)
  }
  
  cleaned = cleaned.trim()
  return JSON.parse(cleaned)
}

/**
 * Fallback generator when API Key is missing or rate limited.
 */
export function getFallbackAnalysis(journalText, mood) {
  const words = journalText.toLowerCase()
  const hasStress = words.includes('stress') || words.includes('anxious') || words.includes('tired') || words.includes('hard')
  
  return {
    emotion: mood || 'Neutral',
    stressLevel: hasStress ? 75 : 35,
    burnoutRisk: hasStress ? 'Moderate' : 'Low',
    confidence: 65,
    primaryTriggers: hasStress ? ['Exam workload', 'Fatigue'] : ['Routine study'],
    positiveObservations: ['Staying consistent with logs', 'Expressing feelings'],
    recommendations: hasStress 
      ? ['Take a 15-minute screen-free walk', 'Practice 4-7-8 breathing exercise', 'Shut off study desk at 9 PM today'] 
      : ['Maintain your current healthy study cycles', 'Review weekly progress'],
    motivation: 'You are doing fine. One step at a time, consistency overcomes pressure.'
  }
}

/**
 * Analyzes journal text and returns structured metrics.
 */
export async function analyzeJournal(journalText, mood, studyHours, examType) {
  if (!genAI) {
    return getFallbackAnalysis(journalText, mood)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `
      Analyze the following journal entry written by a student.
      
      Context:
      - Logged Mood: ${mood || 'Not Specified'}
      - Daily Study Target: ${studyHours || 'Not Specified'} hours
      - Focus Exam: ${examType || 'Competitive Exam'}
      
      Journal Entry Content:
      "${journalText}"

      Return ONLY a valid JSON object matching the schema below. Do NOT write markdown, summaries, or explanations outside the JSON format.
      
      Required Schema:
      {
        "emotion": "Emotion label (e.g. Calm, Happy, Anxious, Sad, Stressed, Exhausted, etc.)",
        "stressLevel": 0-100 integer representing stress scale percentage,
        "burnoutRisk": "Low" or "Moderate" or "High",
        "confidence": 0-100 integer representing confidence level percentage,
        "primaryTriggers": ["Trigger 1", "Trigger 2"],
        "positiveObservations": ["Observation 1", "Observation 2"],
        "recommendations": ["Exercise 1", "Exercise 2"],
        "motivation": "A brief, highly supportive, personalized sentence."
      }
    `

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const responseText = result.response.text()
    return safeJsonParse(responseText)
  } catch (error) {
    console.error('Gemini analyzeJournal error:', error)
    return getFallbackAnalysis(journalText, mood)
  }
}

/**
 * Compiles a weekly summary report based on last 7 logs.
 */
export async function generateWeeklySummary(last7Logs, exam, studyHours) {
  if (!genAI) {
    return {
      summary: 'Weekly summary (Fallback Mode): You logged multiple entries this week. You are maintaining study schedules, but remember to balance focus blocks with breaks.',
      moodTrend: 'Stable',
      commonStressTriggers: ['Exam preparation', 'Syllabus backlog'],
      positiveHabits: ['Regular journaling', 'Consistency'],
      areasToImprove: ['Take systematic breaks', 'Increase sleep hours'],
      overallEncouragement: 'Keep going! A balanced mind is key to mastering JEE, NEET, or UPSC.'
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `
      Analyze the student's daily check-in logs from the past 7 days to compile a progress report.
      
      Exam Target: ${exam || 'Competitive Exam'}
      Daily Study target: ${studyHours || 'Not Set'} hours
      
      Weekly logs context:
      ${JSON.stringify(last7Logs.map(l => ({ mood: l.mood, mood_intensity: l.mood_intensity, date: l.created_at, notes: l.journal })))}
      
      Analyze these entries and return ONLY a valid JSON object matching the schema below. No explanations.
      
      Required Schema:
      {
        "summary": "Detailed summary paragraph analyzing their mental wellness over the week.",
        "moodTrend": "Short statement summarizing mood changes (e.g. Improving, Fluctuating, Stable, Decline).",
        "commonStressTriggers": ["Trigger 1", "Trigger 2"],
        "positiveHabits": ["Positive habit 1", "Positive habit 2"],
        "areasToImprove": ["Area 1", "Area 2"],
        "overallEncouragement": "Empathetic final words of encouragement."
      }
    `

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    return safeJsonParse(result.response.text())
  } catch (error) {
    console.error('Gemini generateWeeklySummary error:', error)
    throw error
  }
}

/**
 * Generates daily motivational quote.
 */
export async function generateMotivation(name, exam, studyHours, studyType) {
  // Check localStorage cache to avoid redundant daily calls
  const todayStr = new Date().toDateString()
  const cachedDate = localStorage.getItem('mindmate_motivation_date')
  const cachedQuote = localStorage.getItem('mindmate_motivation_text')

  if (cachedDate === todayStr && cachedQuote) {
    return cachedQuote
  }

  const fallbackQuote = 'Progress is progress, no matter how small. Take a deep breath and focus on today.'

  if (!genAI) {
    return fallbackQuote
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `
      Generate a single daily motivational quote or thought for a student named ${name || 'Student'} preparing for the ${exam || 'competitive'} exam.
      They study ${studyHours || '6'} hours daily and identify as a ${studyType || 'Balanced'} learner.
      
      Keep it practical, highly empathetic, and concise (under 130 characters).
      Do NOT wrap in quote marks. Return only the plain sentence text.
    `

    const result = await model.generateContent(prompt)
    const quote = result.response.text().replace(/"/g, '').trim()
    
    // Cache result
    localStorage.setItem('mindmate_motivation_date', todayStr)
    localStorage.setItem('mindmate_motivation_text', quote)
    
    return quote
  } catch (error) {
    console.error('Gemini generateMotivation error:', error)
    return fallbackQuote
  }
}

/**
 * Chat bot execution incorporating system prompts, student metadata, and chat history.
 */
export async function chatWithCompanion(message, history, context) {
  if (!genAI) {
    // Return local rule-based mock matching the context
    await new Promise(r => setTimeout(r, 1000))
    const query = message.toLowerCase()
    let responseText = "I'm here as your MindMate. (AI Offline/API Key missing fallback). Tell me what's causing stress."
    if (query.includes('stress') || query.includes('overwhelmed') || query.includes('pressure')) {
      responseText = "Preparation pressure can get heavy. Remember to take a 5-minute breather. Let's do a deep breathing cycle together: inhale, hold, exhale. You are doing enough."
    } else if (query.includes('concentrate') || query.includes('focus') || query.includes('study')) {
      responseText = "If concentration is flagging, your brain might be tired. Try the Pomodoro technique: study for 25 mins, then take a 5 min tech-free break. Would that help?"
    }
    return { text: responseText, timestamp: new Date().toISOString() }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    // Construct rich context prompt
    const contextHeader = `
      ${SYSTEM_PROMPT}
      
      Current Student Context:
      - Full Name: ${context.full_name || 'Student'}
      - Preparing For: ${context.exam || 'Competitive Exam'}
      - Study target: ${context.study_hours || 'Not set'} hours/day
      - Chronotype: ${context.study_type || 'Balanced'}
      - Current Mood Check-in: ${context.current_mood || 'Not checked in today'}
      
      Past History Context:
      - Recent logs summary: ${JSON.stringify(context.recent_logs_preview || [])}
    `

    // Map history to standard Gemini chat role format
    const chatContents = [
      { role: 'user', parts: [{ text: contextHeader + "\n\nLet's begin the chat session. Introduce yourself if this is the start." }] },
    ]

    // Append history
    history.forEach(msg => {
      chatContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })
    })

    // Append new user message
    chatContents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    const result = await model.generateContent({
      contents: chatContents,
    })

    return {
      text: result.response.text().trim(),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Gemini chatWithCompanion error:', error)
    throw error
  }
}
