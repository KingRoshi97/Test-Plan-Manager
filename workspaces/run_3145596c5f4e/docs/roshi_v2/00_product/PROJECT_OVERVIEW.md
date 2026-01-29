# PROJECT_OVERVIEW.md
Project Name: Untitled Project

## 1. Project summary
Untitled Project is a lightweight task management app for small teams that organizes work using kanban boards, supports due dates, and assigns tasks to team members. It focuses on quick task creation, clear visual workflows, and simple team collaboration to reduce context switching and keep small teams aligned.

Source: project idea provided by stakeholder.

## 2. Core value proposition
Help small teams move from scattered lists and ad-hoc communication to a single, visual workflow where tasks are tracked end-to-end: create a task, assign an owner, set a due date, and move it through a kanban workflow. The product prioritizes speed, clarity, and low setup overhead so teams can adopt it immediately without heavy configuration.

Example value statements:
- "Create and assign a task in under 10 seconds."
- "See overdue tasks across the team at a glance on one dashboard."

## 3. Target users
- Primary: Small teams of 3–15 people (product teams, marketing, small engineering squads, operations) who need simple, visual task tracking.
- Secondary: Team leads and project coordinators who need to monitor deadlines and workload distribution.
- Not a primary target: Enterprise teams requiring complex workflows, formal approvals, or heavy integrations (UNKNOWN — confirm if enterprise features are required).

## 4. Key features
- Kanban boards
  - Multiple boards per team (e.g., "Sprint 1", "Marketing Campaign")
  - Columns / lanes like Backlog, To Do, In Progress, Review, Done
  - Drag-and-drop card movement
  - Example: Move "Design landing page" from In Progress → Review
- Task cards
  - Title, description, comments, attachments (basic)
  - Single assignee (initial) with optional support for multiple assignees (UNKNOWN — confirm)
  - Due date and optional start date
  - Priority label (Low / Medium / High)
- Team and membership
  - Team workspace containing boards and members
  - Roles: Owner, Member, Viewer (basic permissions model)
- Notifications and reminders
  - In-app notifications for assignments, comments, and due-date reminders
  - Optional email reminders (UNKNOWN — confirm email delivery)
- Filtering and search
  - Filter tasks by assignee, due date range, label, and column
  - Quick search for task titles
- Simple reporting / dashboard
  - Team-level view of overdue tasks, tasks due this week, and active assignments
- Integrations (MVP): calendar export (iCal) for due dates (UNKNOWN — confirm integration scope)
- Offline / mobile considerations (UNKNOWN — confirm target platforms: web-first, mobile native)
- Import / export
  - CSV import/export for tasks and boards (MVP)

Minimum viable product (MVP) scope: single-tenant web app with team workspaces, kanban boards, task cards with assignee and due date, basic notifications, search/filter, and CSV import/export.

## 5. Success metrics
- Time-to-first-task: median time for a new team to create first task and assign it < 5 minutes
- Activation rate: % of invited users who create or are assigned at least one task within 7 days ≥ 60% (initial target)
- Daily active usage: DAU/MAU ratio (stickiness) target ≥ 25% for pilot teams of 3–15 users
- Task completion rate: % of tasks moved to Done within their due-date window — baseline target 70% (adjust after pilot)
- Retention: % of teams still active after 30 days ≥ 50% (pilot target)
- Feature adoption: % of tasks with due dates ≥ 50% (indicates adoption of scheduling)
- Reliability: 99.5% uptime for core task operations (create/read/update/move)
- Performance: board load time < 1.5s for boards with up to 500 tasks

Mark metrics tagged UNKNOWN where additional business goals are needed:
- Revenue/monetization targets: UNKNOWN — confirm pricing strategy and revenue KPIs
- Maximum supported team size or scale per workspace: UNKNOWN — define limits for MVP

## 6. Constraints and assumptions
Assumptions
- Primary usage is for small teams (3–15 members).
- Users prefer a low-friction, web-first experience; mobile native apps may follow (UNKNOWN — confirm platform priorities).
- Initial product will support single assignee per task; multi-assignee support can be added later.
- Authentication will use email/password and optional SSO in later phases (SSO: UNKNOWN — confirm identity providers).
- Storage for attachments will be limited (e.g., size cap per file) and use cloud object storage (implementation detail: AWS S3 or equivalent — UNKNOWN until infra decision).
- Integrations beyond iCal (e.g., Slack, GitHub) are out of MVP scope unless prioritized.

Constraints
- Time to MVP: target 8–12 weeks for a minimal web app (team with 1–2 engineers + designer) — estimate is tentative and marked as UNKNOWN until staffing is confirmed.
- Budget: UNKNOWN — impacts choices for third-party services and hosting.
- Regulatory/compliance: no enterprise-level compliance (SOC2, HIPAA) required initially (UNKNOWN — confirm).
- Offline editing and full mobile app support are out of scope for MVP.
- Data export/import: provide CSV export/import only for MVP; richer migration tools postponed.
- Concurrency: assume low concurrent write volume typical of small teams; design for eventual horizontal scaling but accept single-region deployment for MVP.

Follow-ups (action items / unknowns to resolve)
- Confirm target platforms: web-only vs web + native mobile (UNKNOWN).
- Confirm pricing strategy / revenue targets (UNKNOWN).
- Confirm authentication requirements: SSO providers and enterprise auth needs (UNKNOWN).
- Confirm which third-party integrations are critical for launch (calendar only vs Slack, GitHub, etc.) (UNKNOWN).
- Decide on single vs multiple assignee support for tasks (UNKNOWN).
- Confirm compliance and data residency requirements (UNKNOWN).

End of document.