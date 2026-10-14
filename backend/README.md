# AI Roadmap v3 Backend

FastAPI service powering the AI Roadmap v3 Hub and Certification Watchdog.

## Features
- Firebase Authentication verification via Firebase Admin SDK.
- `/api/chat`: Strictly scoped AI Tutor using `gemini-2.5-flash` via `google-genai`.
- `/api/certifications/verify`: Real-time certification watchdog using `gemini-2.5-flash` with Google Search grounding (`tools=[{"google_search": {}}]`), writing alert documents to Firestore `notifications`.
- `/api/roadmap` & `/api/progress`: Roadmap content and user progress persistence.
