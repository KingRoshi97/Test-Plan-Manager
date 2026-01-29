# RPBS: Untitled Project

Project idea source: user-provided brief "i want to make a study app"

## 1. Product Vision
Help learners efficiently retain and apply knowledge by making study creation, scheduling, and practice simple, measurable, and repeatable. The app focuses on short, structured study sessions (flashcards, quizzes, timed sessions) with clear progress signals so users form effective study habits.

## 2. User Personas
- Student (Primary)
  - Profile: High-school or university student studying multiple subjects.
  - Goals: Quickly create or import study material (flashcards, notes); schedule review sessions; improve exam readiness; track progress by subject.
  - Example: "Maria, 20, creates a 200-card flashcard deck for organic chemistry and wants to study 30 minutes daily with spaced reviews."

- Lifelong Learner / Professional Upskiller (Secondary)
  - Profile: Adult learner preparing for certifications or learning a new skill.
  - Goals: Focused micro-learning sessions; retain professional terms and procedures; monitor long-term retention metrics.
  - Example: "Omar, 32, prepares for a professional certificate by practicing 15 minute quizzes tied to learning objectives."

- Tutor / Instructor (Tertiary)
  - Profile: Creates study packs for students and monitors cohort progress.
  - Goals: Author content, assign study schedules to learners, view analytics for interventions.
  - Example: "Leah, an adjunct instructor, uploads reading-based quizzes and assigns weekly review sets to students."

## 3. User Stories
Format: As a [persona], I want [goal] so that [benefit]

- As a Student, I want to create a flashcard deck for a subject so that I can review key facts in short sessions.
- As a Student, I want to schedule daily study sessions so that I build a consistent habit.
- As a Student, I want an adaptive review algorithm (SRS) so that my reviews prioritize material I forget more often.
- As a Lifelong Learner, I want to import existing flashcards (e.g., CSV or Anki) so that I can reuse previous materials without retyping them.
- As a Lifelong Learner, I want offline study capability so that I can study on the go without an internet connection.
- As a Tutor, I want to create and share assignment decks with students so that they prepare for lessons consistently.
- As a Tutor, I want to view per-student completion and retention metrics so that I can identify students who need help.
- As any user, I want simple in-session timers and break reminders so that I can use the Pomodoro technique during study sessions.
- As any user, I want to track streaks and session counts so that I can see progress over time.

## 4. Feature Requirements

Notes on priority: P0 = Must have for first usable release; P1 = Should have in near-term roadmap; P2 = Nice to have for later releases.

### Must Have (P0)
- Account management
  - Sign up / login (email + password)
  - Unique email per account
  - Password reset via email
  - Session management (sign out)
- Basic study content
  - Create / edit / delete flashcards (front, back, optional tags)
  - Organize flashcards into decks and/or courses
  - Add plain-text notes to decks
- Study sessions
  - Start a timed study session (user-configurable duration)
  - Present flashcards in a session with basic controls (show answer, mark Known/Unknown)
  - Track per-card review outcomes (Known / Difficult / Forgotten)
- Progress tracking
  - Per-deck and per-user metrics: cards reviewed today, session count, simple accuracy % (known / total)
  - Display next review date per card (even if algorithm is simple FIFO)
- Local persistence and sync
  - Basic online storage and retrieval of user data
  - Work offline for in-session activity and sync changes when online
- Notifications / reminders
  - Push/email reminders for scheduled sessions (basic daily reminders)
- Data export (basic)
  - Export deck as CSV
- Security & privacy (minimum compliance)
  - HTTPS-only traffic
  - Password hashing (bcrypt/argon2)
  - Unique user identifiers and opt-out for data sharing
- Acceptable performance
  - Page or screen loads for core flows under 2s on typical mobile broadband

### Should Have (P1)
- Spaced Repetition System (SRS)
  - Implement at least one parametric SRS algorithm (e.g., simplified SM-2) for scheduling reviews
  - Allow users to choose between Manual and SRS scheduling
- Import capabilities
  - Import from CSV and common formats (Anki .apkg optionally marked UNKNOWN for feasibility)
- Rich content
  - Image support on sides of a flashcard
  - Basic formatting (bold, lists) for notes
- Analytics & insights
  - Retention rate, review interval distribution, streak/chart for 7/30/90 days
  - Export analytics CSV
- Collaboration
  - Shareable public decks via URL (read-only)
  - Tutor ability to assign decks to students (view-only or graded)
- Calendar integration
  - Add scheduled sessions to user calendar (Google Calendar ICS)
- Improved notifications
  - In-app push + email with configurable frequency
- Localization scaffold
  - App supports adding translations (English default)

### Nice to Have (P2)
- AI-assisted features (flagged as advanced/OPTIONAL)
  - Auto-generate flashcard suggestions from uploaded notes or PDF (UNKNOWN — see Open Questions)
  - Summarize long notes into key facts
- Gamification
  - Badges, levels, leaderboards for friend groups
- Social learning
  - Live study rooms, real-time co-study (web RTC)
- Rich media import
  - Import from Anki .apkg with deck/media extraction (UNKNOWN)
- Advanced integrations
  - LMS (Canvas/Moodle) connectors, SSO for institutions
- Payments / subscriptions
  - Premium plan for advanced features (analytics, AI generation) (UNKNOWN — business model)

## 5. Hard Rules Catalog
Non-negotiable business and domain rules the system must enforce

- Unique User Email: Each account must be keyed by a unique email address. Duplicate accounts with same email not allowed.
- Authentication Security: All passwords must be hashed with a secure algorithm (bcrypt/argon2) and never stored or logged in plaintext.
- HTTPS Only: All client-server communication must use HTTPS; mixed content blocked.
- Data Ownership: Each deck, card, and progress record is owned by a single user or by an owner entity (tutor/institution). Owner permissions determine shareability.
- Consent for Sharing: A deck marked private cannot be made public without explicit action from the owner; when shared, record the sharing timestamp and recipients.
- Atomic Progress Update: Card review updates must be atomic and idempotent to prevent double-counting of reviews in the event of retries.
- Timekeeping: All timestamps stored in UTC with ISO 8601 format.
- Retention of Review History: Keep full per-card review history for at least 90 days for analytics and audit (unless user requests deletion).
- Minimum Password Strength: Passwords must meet a policy: at least 8 characters, one uppercase, one number OR be replaced by an SSO flow. (Password policy configurable.)
- Rate Limits: API calls per-user limited to prevent abuse (e.g., max 60 requests/minute per user) — concrete rate TBD in REBS.
- Data Export and Deletion: Users must be able to export their data (decks, cards, progress) and request account deletion; deletion must cascade to remove personal study data unless legal hold applies.
- Notification Consent: Send push/email only to users who opted-in; store opt-in status.
- Offline Conflict Resolution: Last-writer-wins on sync for conflicting card edits unless the edit originates from owner vs collaborator (owner wins). Conflicts must be surfaced in UI for manual resolution.

## 6. Acceptance Criteria
How we know each feature is complete — concrete, testable criteria.

Core account flows
- Sign-up
  - Given no existing account with an email, when user registers with valid email and password, then account is created, confirmation sent, and user can log in.
- Login / password reset
  - When a registered user submits valid credentials they are authenticated and receive a session token; invalid credentials return 401 without revealing which field was wrong.

Create & manage study content
- Create flashcard
  - Given a logged-in user, when they create a flashcard with front and back text, then the card appears in the chosen deck and is retrievable via API with a created_at timestamp.
- Edit/delete flashcard
  - When a user edits a card, the change is stored and versioned; when they delete a card, it no longer appears in deck listings and is soft-deleted for 90 days.

Study sessions & reviews
- Start session
  - Given a deck with >=1 card, when user starts a timed session, the UI presents cards and records each review outcome (Known / Difficult / Forgotten).
- Record review outcome
  - For each card reviewed, the system persists a review record with card_id, user_id, outcome, timestamp in UTC.
- Progress metrics
  - Dashboard displays counts that match the persisted review records (e.g., "Cards reviewed today = N").
- Sync & offline
  - When user studies offline, all actions are persisted locally; upon reconnect, local changes sync to server and server acknowledges with 200 and preserves client timestamps within 60s skew.

Notifications
- Scheduled reminder
  - Given a user sets daily reminder, a reminder is delivered within the scheduled window by push or email at least 95% of the time during a 24-hour test period (metrics logged).

SRS (P1)
- Algorithm schedules next review date: when user marks card as Known/Difficult/Forgotten, the system calculates next_review_date using the configured algorithm and stores the metadata (interval, ease factor).
- For manual scheduling, next_review_date can be set by the user and respected.

Import/export
- Export CSV
  - Exported CSV contains deck metadata and fields front/back/tags; opened by spreadsheet software without malformed cells.
- Import CSV
  - Import validates required columns and reports row-level errors with line numbers; successful rows are created as new cards.

Security & privacy
- HTTPS enforcement
  - Any non-HTTPS request redirects or is rejected.
- Password storage
  - Database stores hashes only; manual verification of bcrypt/argon2 formatting in database.

Sharing & permissions
- Share deck
  - When owner shares a public link, recipients can view deck read-only without modification; link revocation prevents access within 60s of revocation.

Performance
- Core UI flows render within 2s on 4G mobile emulation for 90% of requests.

## 7. Out of Scope
Explicitly excluded for this version (to reduce scope and focus MVP)

- Live video classes, in-app live tutoring, or real-time collaborative editing.
- Full LMS features (gradebooks, deep institutional SSO) unless later prioritized.
- Advanced AI content generation (auto-create flashcards from PDF) — marked as P2 and requires separate feasibility study.
- Paid subscription management and billing flows (unless business decision to monetize immediately — UNKNOWN).
- Import of complex proprietary formats (.apkg) until import requirements are clarified (UNKNOWN).
- Multi-language translations beyond English for MVP (localization tooling scaffold is P1).
- Offline-first full conflict resolution beyond last-writer-wins and basic user conflict UI.

## 8. Open Questions (UNKNOWN)
Items requiring clarification or stakeholder decisions

- Target platforms: Should we build native mobile apps (iOS/Android), a responsive web app, or both for MVP? UNKNOWN — prioritize which.
- Monetization: Is there a requirement to include paid features or subscriptions in the initial roadmap? UNKNOWN — affects user account design and billing.
- Import formats priority: Is Anki .apkg import required for launch or can we limit import to CSV/TSV first? UNKNOWN.
- SRS algorithm specifics: Which algorithm and default parameters should be used (SM-2, Anki variant, or custom)? UNKNOWN — decision will affect data model and UX.
- Legal / compliance: Are there target markets (EU) that require GDPR-specific workflows beyond export and deletion? UNKNOWN — affects data handling.
- Institutional features: Do we need multi-tenant support and institution admin roles for launch? UNKNOWN.
- Offline sync policy: Should conflict resolution be manual-only, last-writer-wins, or CRDT-based for some objects? UNKNOWN — technical complexity tradeoff.
- Media storage limits: Maximum allowed image/audio size per card and per account quotas? UNKNOWN — set limits to control cost.
- Accessibility requirements: Are specific accessibility standards (WCAG AA) required from day one? UNKNOWN — affects UI design schedule.
- Analytics retention: How long should analytics and historical review data be retained beyond the 90-day review history rule? UNKNOWN.

Notes for follow-up:
- Prioritize answers to the above OPEN QUESTIONS before finalizing the REBS (engineering design). Each UNKNOWN will change data model, API contracts, and implementation effort estimates.

-- End of RPBS_Product.md --