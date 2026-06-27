# MindMate AI – Complete Production Build (Phases 1 to 4)

MindMate AI is a dedicated mental wellness tracker crafted for students preparing for high-stakes competitive examinations (JEE, NEET, UPSC, etc.). It acts as an intelligent, active wellness companion helping students mitigate stress, track cognitive focus, log moods, write journals, and get personalized recommendations and motivational thoughts powered by Google Gemini AI.

---

## Technical Stack
* **Framework**: React 19 + Vite
* **Styling**: Tailwind CSS v4 (with custom ambient neon and glassmorphism styling)
* **Animations**: Framer Motion (for smooth micro-animations and page transitions)
* **Visualizations**: Recharts (for weekly mood intensity curves)
* **AI Model Integration**: Google Gemini API SDK (`@google/generative-ai`)
* **Routing**: React Router DOM (protected layout guarding and nested subroutes)
* **Database**: Supabase (PostgreSQL tables, triggers, and Row Level Security)
* **State Management**: Zustand (modular auth, wellness, and chat store states)
* **Form & Validation**: React Hook Form + Zod resolvers
* **Icons**: Lucide React
* **Notifications**: Sonner (Toast notifications)

---

## 🤖 How the AI Features Work

### 1. Dynamic Journal Analysis
Whenever a student submits a journal entry in `/journal`:
* The entry text, selected mood, study hours, and exam target are sent to the Gemini API (`gemini-1.5-flash`).
* Gemini analyzes the log using a structured schema and returns valid JSON mapping:
  * **Coping Recommendations**: checkable wellness items.
  * **Stress Level**: percentage rating.
  * **Burnout Risk**: Low, Moderate, or High indicator.
  * **Confidence Index**: academic confidence rating.
  * **Primary Triggers**: issues contributing to study strain.
* The analysis is saved automatically to the `ai_analysis` database table in Supabase.
* Fallback logic resolves gracefully if API limits or offline modes occur.

### 2. Floating AI Wellness Companion Chat
A floating chatbot button resides in the bottom right corner of the dashboard layout:
* Integrates with a sliding chat panel drawer.
* Maintains session context (storing chat sessions and message lists in Supabase).
* Feeds context updates (today's mood, target exam, daily hours, chronotype, and snapshots of the last 3 journals) directly to Gemini so conversations are highly tailored and empathetic.
* Built-in typing indicators and auto-scrolling interfaces.

### 3. Weekly Report Compiler
* Accessible via the **Generate Weekly Report** button on the History page.
* Sends the last 7 daily journals to Gemini to outline progress metrics: Executive Summary, Mood Trend, Stress Triggers, Positive Habits, Areas to Optimize, and overall encouragement.
* Shows results in a dedicated glassmorphism overlay dialog.

### 4. Daily Cached Motivation
* Renders a **Daily Mindset Boost** quote at the top of the dashboard.
* Gemini generates a brief, practical sentence based on the student's name, exam, and study chronotype.
* The response is cached in `localStorage` by date, preventing unnecessary API queries on page reload.

---

## 🔑 How to Obtain & Setup Your Gemini API Key

1. Go to the [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click the **Get API Key** button in the sidebar.
4. Click **Create API Key** and select your project or create a new key.
5. Copy the generated API Key.
6. Open your `.env` file in the project root.
7. Append or edit the variable:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
   ```
8. Restart your local Vite dev server (`pnpm run dev`) to load the new environmental configuration.

---

## ⚠️ API Limitations & Fallback Architecture
To ensure the app remains fully operational even under constraints, the following mechanisms are implemented:
* **Missing API Key / Invalid Key**: The client console logs a warning and routes all AI tasks to a local **Rule-based Fallback Service** (`getFallbackAnalysis`). This populates the dashboard layout and chat bubbles dynamically with smart mocked data, avoiding application crashes.
* **Rate Limits**: If Gemini returns a `429 Too Many Requests` status, the application handles the request by serving mock responses and prompting the user with a Toast notification.
* **JSON Validation**: In addition to enabling Gemini's `responseMimeType: "application/json"` config, the JSON parse wrapper strips potential markdown block wrappers (e.g. ` ```json `) to verify parsing safety before save.

---

## 📂 Complete Folder Structure
```
src/
├── assets/         # Public static assets & images
├── components/     # Reusable components (AIChatbot, DashboardLayout)
├── pages/          # Full page containers (Landing, Onboarding, Dashboard, Journal, History, Profile)
├── hooks/          # Custom utility hooks
├── lib/            # Initialization configurations (supabase.js)
├── store/          # Zustand global states (authStore, wellnessStore, chatStore)
├── routes/         # Router declarations & Protected route guards
├── services/       # Network & AI API helpers (ai/gemini.js)
├── utils/          # General helper functions
```

---

## 💻 Running the App Locally

1. Create tables by running `supabase_schema.sql` in your Supabase SQL Editor.
2. Install packages:
   ```bash
   pnpm install
   ```
3. Run the development environment:
   ```bash
   pnpm run dev
   ```
4. Build for production:
   ```bash
   pnpm run build
   ```
