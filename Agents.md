# Project: AI Roadmap v3 Hub & Certification Watchdog

## Tech Stack & Architecture
- **Monorepo Structure:**
  - `/frontend`: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Firebase JS SDK (`firebase/auth`, `firebase/firestore`).
  - `/backend`: Python 3.11+, FastAPI, managed with `uv`, `firebase-admin`, and `google-genai` SDK.
- **Authentication:** Firebase Authentication using Google Sign-In (`GoogleAuthProvider`). FastAPI routes must verify the Firebase ID Token via `firebase_admin.auth.verify_id_token`.
- **Database:** Cloud Firestore with three collections:
  1. `roadmap_phases`: Seeded from `roadmap_v3.json` (Phases 0 to 11, Core vs Reference resources, From-Scratch tasks, Self-Check Gates).
  2. `user_progress`: Document per `uid` tracking completed topics, checkboxes, and GitHub project URLs per phase.
  3. `notifications`: In-app notification documents (`title`, `message`, `status_type` ['NEW_CERT', 'DISBANDED', 'VERIFIED'], `read`, `created_at`).
- **AI Chatbot (`/api/chat`):**
  - Powered by `google-genai` (`gemini-2.5-flash`).
  - Strict system guardrail: Only answer questions about the AI Roadmap, AI/ML, Data Science, Coding, Software Development, and Computer Science. Politely refuse all other topics.
- **Certification Watchdog (`/api/certifications/verify`):**
  - Uses `gemini-2.5-flash` with `tools=[{"google_search": {}}]` to check all certifications in the roadmap for disbanded/paywalled status and search for new 100% free AI/CS certifications.
  - Writes any changes or new discoveries directly to the Firestore `notifications` collection for the in-app notification bell.
- **No Extra Bloat:** Do NOT add email alerts, external webhooks, or Pomodoro/streak timers. Keep the UI ultra-clean and focused.