# PROJECT_OVERVIEW.md
Project Name: Untitled Project (Study App)

## 1. Project summary
Untitled Project is a study-focused app that helps learners plan, practice, and retain knowledge using evidence-based techniques (e.g., spaced repetition, active recall). It combines content creation (notes/flashcards), scheduled study sessions, and progress analytics to make study time more effective and trackable.

Source: user input "i want to make a study app"

## 2. Core value proposition
Help learners spend less time forgetting and more time learning by converting raw study materials into repeatable, measurable study sessions that reinforce long-term retention. The app should make it simple to create/import study items, schedule and complete short focused sessions, and see measurable improvement over time.

Examples:
- Turn lecture notes into spaced-repetition flashcards in 2 clicks.
- Receive short daily sessions that fit a user's calendar and improve retention measured by recall accuracy.

## 3. Target users
- High school and college students preparing for classes and exams (e.g., midterms, finals).
- Professional learners preparing for certifications (e.g., medical, IT, finance).
- Lifelong learners studying topics for personal development (languages, hobbies).
- Instructors or tutors who create and share study material with students.

User archetype examples:
- "College Clara": 20–24, needs to memorize facts and exam formulas, uses mobile for short study bursts.
- "Certifying Carl": 28–35, preparing for a professional exam, needs trackable progress and practice tests.
- "Tutor Tara": creates shared decks and monitors multiple students' progress.

## 4. Key features
- Content creation and import
  - Create flashcards, notes, and question banks.
  - Import from CSV, Anki decks, PDF highlights, or Markdown files.
  - Example: Upload a CSV with columns "front","back","tags" to bulk-create cards.
- Spaced repetition engine
  - Adjustable scheduling algorithm (default: SM-2 or a tuned variant).
  - Manual override for individual items.
- Focused study sessions
  - Short, timed sessions (e.g., 10–25 minutes) with configurable session length and break reminders.
  - Session modes: review (SRS), practice test, mixed.
- Progress analytics and goals
  - Daily/weekly study time, retention estimates, streaks, items due, accuracy over time.
  - Goal setting: set minutes/day or items reviewed/day; track completion.
- Reminders and scheduling
  - Push notifications, email reminders, calendar sync (optional).
  - Smart scheduling: suggest optimal times based on past activity.
- Offline support and sync
  - Local caching for offline study with background sync when online.
- Social & sharing features
  - Share decks/public libraries, follow creators, class-level access for teachers.
- Onboarding and content templates
  - Guided card creation, template decks for common subjects (languages, anatomy, law).
- Privacy and export
  - Export decks, full data export (CSV/JSON), privacy controls for shared content.
- Monetization hooks (configurable)
  - Freemium limits (e.g., deck count, cloud sync), premium for advanced analytics and offline sync. (Monetization strategy = UNKNOWN — see Constraints & Assumptions)

## 5. Success metrics
Define and measure the following to evaluate product success:
- Activation and engagement
  - Day-1 retention rate (percentage of new users who return the next day) — target: >= 40% (initial benchmark).
  - 7-day retention — target: >= 20%.
  - Daily Active Users / Monthly Active Users (DAU/MAU) ratio — target: >= 20%.
- Study behavior
  - Average study minutes per active user per day — target: >= 15 minutes.
  - Average session length — target: 10–25 minutes.
  - Completed sessions per user per week — target: >= 4.
- Learning outcomes
  - Improvement in recall accuracy over time (e.g., +15 percentage points within 30 days for engaged users).
  - Percentage of users meeting their weekly goals — target: >= 50%.
- Growth & retention
  - 30-day retention — target: >= 15%.
  - Net Promoter Score (NPS) — target: >= 30.
- Monetization (if applicable)
  - Conversion rate from free to paid users — target: 3–5% (adjustable).
  - ARPU (average revenue per user) — UNKNOWN (requires business model).

Note: Targets are initial benchmarks and should be adjusted after user research and early testing.

## 6. Constraints and assumptions
Explicit constraints and assumptions to validate early in planning:

Platform & release
- Assumption: Primary target platform = mobile-first (iOS + Android), with a responsive web app for creation and analytics. (Platform priority = UNKNOWN — confirm).
- Constraint: Minimum viable product (MVP) scope should focus on core SRS-based flashcards, basic import/export, and analytics.

Technical
- Constraint: Support offline study with local storage and sync when online.
- Constraint: Storage and sync must be secure (encrypt sensitive user data at rest and in transit).
- Assumption: Use existing open formats (Anki/CSV/Markdown) for import/export to lower friction.

Content & UX
- Constraint: Card creation should be simple and not require advanced formatting knowledge.
- Assumption: Users value short, frequent sessions and simple daily goals over long study marathons.

Legal & privacy
- Constraint: Comply with major privacy regulations where users are targeted (e.g., GDPR, COPPA if targeting minors).
- Assumption: Personal data collection will be minimized; parental consent requirements may apply if users under 16/13 are targeted (CONFIRM regional requirement).

Business & monetization
- Assumption: Freemium model is the initial monetization strategy (limits on cloud sync or analytics). Monetization strategy = UNKNOWN — confirm pricing and premium features.
- Constraint: If offering paid tiers, need secure payment processing and subscription management.

Team & timeline
- Assumption: Small cross-functional team for MVP (1–2 mobile engineers, 1 backend, 1 designer, 1 product manager).
- Constraint: Time-to-MVP target = UNKNOWN — define target timeline (e.g., 3–6 months).

Data & metrics
- Assumption: Analytics will be instrumented from day one (events for sessions, study minutes, item performance).
- Constraint: Clear definitions for metrics (e.g., what counts as a “completed session”) must be established before launch.

Follow-ups / Items marked UNKNOWN
- Platform priority (mobile-first vs. web-first) — UNKNOWN
- Monetization/pricing strategy and ARPU targets — UNKNOWN
- Target launch timeline and team capacity — UNKNOWN
- Age demographics and compliance specifics for targeted regions (COPPA/GDPR thresholds) — UNKNOWN

---

If you want, I can:
- Convert this into a lightweight MRD/PRD with prioritized MVP scope.
- Produce a minimal set of user stories and acceptance criteria for the MVP.
- Draft initial analytics events and a tracking plan.