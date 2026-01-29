# PROJECT_OVERVIEW.md
Project: Task Manager Pro
Date: 2026-01-29
Prepared by: Roshi (documentation architect)

## 1. Project summary
Task Manager Pro is a lightweight task management application for small teams that provides kanban boards with drag-and-drop task cards, task assignment, and due date tracking. The product is built with a React frontend, Node/Express backend, and PostgreSQL for persistent storage.

Sources: project description and provided features (P1: Kanban Board).

## 2. Core value proposition
Enable small team leads to organize work visually and reduce coordination overhead by providing an intuitive kanban board, clear task ownership, and reliable due-date visibility — so teams spend less time chasing status and more time delivering.

Concrete example: Team Lead Alice creates a board "Sprint 12", adds columns "To Do / In Progress / Done", creates task "Fix login bug", drags it to "In Progress", assigns it to Bob with due date 2026-02-15. Bob sees the assignment, updates status, and the board reflects progress in real time.

## 3. Target users
- Primary: Team Lead — manages team tasks and tracks progress (provided).
- Secondary (assumed): Team Member — receives assignments and updates task status. (UNKNOWN — not explicitly provided; confirm required user types.)
- Tertiary (possible future): Stakeholder / Viewer — read-only access to boards for stakeholders. (UNKNOWN)

Note: The only explicitly provided user type is Team Lead.

## 4. Key features
- P1: Kanban Board — drag-and-drop task cards between columns (Provided).
- Task creation and editing — title, description, priority, tags, attachments (attachments = OPTIONAL/UNKNOWN if needed).
- Task assignment — assign one or more team members to a task.
- Due date tracking — set and display due dates; overdue visual state.
- Column/board customization — create/edit columns and multiple boards per team. (UNKNOWN: limit on number of boards/columns.)
- Swimlanes and quick filters — filter by assignee, tag, priority, due date (Proposed).
- Activity log / basic task history — record moves, assignments, and status changes (Proposed).
- Notifications — in-app and email for assignments, mentions, and due-date reminders (UNKNOWN: channels and cadence).
- Permissions & roles — Team Lead = manage boards; Team Member = create/update assigned tasks (Role model to be defined).
- Simple analytics dashboard — counts by status, overdue tasks, tasks per assignee (Proposed).
- Import/Export CSV for tasks (Proposed/UNKNOWN).

Concrete examples:
- Assigning: "Assign 'QA: Add tests' to user bob@example.com; due 2026-03-01."
- Overdue visual state: tasks past due show red badge and are listed in 'Overdue' quick filter.

## 5. Success metrics
Measure product success with these KPIs. Targets noted where possible — if no target available, marked UNKNOWN.

Adoption & engagement
- Active Teams: number of distinct teams with at least one active board per month. Target: 100 teams in first 3 months (PROPOSED / UNKNOWN).
- Active Users: daily active users (DAU) and monthly active users (MAU). Target DAU/MAU ratio >= 20% (PROPOSED).
- Time to onboard: median time from account creation to first board created. Target: < 10 minutes.

Usage & productivity
- Task throughput: average tasks completed per team per week.
- Cycle time: median time from task creation to Done (track changes per board).
- Task completion rate: % of tasks completed before due date. Target: increase by 15% for onboarded teams (PROPOSED / UNKNOWN).

Reliability & quality
- Uptime: 99.9% availability for web app and API.
- Error rate: < 1% of API responses return 5xx per week.
- Mean time to recover (MTTR): < 1 hour for critical outages.

Satisfaction
- Net Promoter Score (NPS) or user satisfaction survey score — measure after 30 and 90 days. Target: NPS >= 30 (PROPOSED / UNKNOWN).
- Support response time: initial response within 24 hours.

Notes: Specific numeric targets are proposed defaults and marked PROPOSED or UNKNOWN where business input is required.

## 6. Constraints and assumptions
Technical constraints
- Frontend must use React (provided).
- Backend must use Node.js with Express (provided).
- Primary database: PostgreSQL (provided).
- Real-time UI updates for drag-and-drop / assignments will be implemented via WebSockets (e.g., Socket.IO) or short-polling if realtime is out of scope. Choice = DESIGN DECISION / UNKNOWN — confirm preferred approach.
- Hosting and deployment model: UNKNOWN (cloud provider and CI/CD pipeline to be decided).

Data and scalability assumptions
- Target scale: small teams (suggested team size <= 20). System load expected to be low-to-moderate; design for horizontal scaling but optimized for cost-efficiency.
- Data retention: default storage of all tasks indefinitely unless user deletes them. Compliance/retention policies = UNKNOWN (confirm).
- Backups: regular nightly DB backups expected.

Security & privacy
- Authentication: use secure login (email/password + encrypted passwords). OAuth / SSO support = UNKNOWN (likely future).
- Authorization: role-based access (Team Lead vs Team Member). Fine-grained permissions beyond these roles = UNKNOWN.
- PCI/PHI not expected; standard data protection practices required (TLS in transit, encryption at rest for sensitive fields).

Product assumptions
- Provided user type is Team Lead. We assume Team Member is required for assignment flows; confirm required user types.
- Provided feature P1 (kanban drag-and-drop) is core and must be implemented with smooth UX and accessible keyboard interactions.
- Integrations (e.g., Slack, Jira, calendar sync) are out-of-scope for initial MVP unless prioritized (assumed NOT INCLUDED).
- Mobile-first responsive web app is required; native mobile apps are OUT OF SCOPE for initial release (UNKNOWN — confirm roadmap).

Operational assumptions
- Small initial team of developers and designers; scope the MVP accordingly.
- Support: lightweight email support and a help center for self-serve documentation.

Open / unknown items (for follow-up)
- Exact user roles beyond Team Lead (confirm Team Member and Viewer roles).
- Target adoption and revenue goals (exact KPI targets).
- Real-time architecture choice (WebSockets vs polling).
- Integrations and SSO requirements.
- Hosting provider, CDN use, and monitoring stack.
- Retention and compliance requirements.

---

If you want, next steps I can produce:
- RPBS (product requirements and user stories) focused on the MVP
- REBS (technical architecture, API surface, and data models) aligned to the React / Node / PostgreSQL stack
- A prioritized backlog for the first 8 sprints based on the constraints above

Which deliverable would you like next?