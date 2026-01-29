# RPBS: Untitled Project

## 1. Product Vision
Provide small teams with a lightweight, fast task management app that uses kanban boards, due dates, and clear assignee ownership to help teams coordinate work, visualize progress, and ship reliably with minimal setup and friction.

Key attributes: simple onboarding, intuitive drag-and-drop kanban, clear responsibility (assignees), and straightforward due-date tracking and reminders.

## 2. User Personas

- Team Lead (Sam)
  - Role: Leads a small team (2–10 people), prioritizes work, and tracks delivery.
  - Goals: Quickly create and prioritize work, assign owners, and monitor tasks by due date and board state.
  - Technical level: Comfortable with web apps; expects quick setup.

- Individual Contributor (Priya)
  - Role: Developer/designer/marketer on a small team who executes tasks assigned to them.
  - Goals: See own work, understand priorities and due dates, move tasks through workflow with minimal overhead.
  - Technical level: Regular app user; expects clarity and low noise.

- Project Coordinator (Alex) (optional / secondary)
  - Role: Operates across multiple small teams or projects, organizes tasks and recurring work.
  - Goals: Create templates, set deadlines, add new members, and export task lists for reporting.
  - Technical level: Comfortable with lightweight admin features.

## 3. User Stories
- As a Team Lead, I want to create a new kanban board so that my team can visualize and organize work for a single project.
- As a Team Lead, I want to add/remove columns on a board (e.g., To Do, In Progress, Done) so that the board matches my team’s workflow.
- As an Individual Contributor, I want to create a task card with a title, description, assignee, and due date so that I can capture work and ownership.
- As an Individual Contributor, I want to move a task card between columns via drag-and-drop so that its status is updated quickly.
- As a Team Lead, I want to assign a task to a team member so that responsibility is clear.
- As an Individual Contributor, I want to filter the board to see only my tasks or only overdue tasks so that I can focus on what I must do.
- As a Project Coordinator, I want to export a board or list of tasks to CSV so that I can share status with stakeholders.
- As any user, I want to receive a reminder before a task is due so that I don’t miss deadlines. (Should have)
- As a Team Lead, I want to invite new members to the team by email so that the right people can access the board.

## 4. Feature Requirements

### Must Have (P0)
Features required for initial release:
1. Board management
   - Create/delete boards
   - Add/edit/delete columns (minimum: create, rename, reorder)
   - One default template board (To Do, In Progress, Done)
2. Task (card) management
   - Create/edit/delete tasks with: title (required), description (optional), assignee (optional), due date (optional), labels/tags (optional)
   - Drag-and-drop tasks between columns and reorder within column
3. Team and membership
   - Create team workspace
   - Invite members by email; member role = Member; owner role = Owner
   - Only team members can access team boards
4. Assignments & due dates
   - Assign one or more members to a task (default: single assignee if UI simplified)
   - Set due date (date and optional time)
   - Overdue state computed automatically
5. Authentication & basic security
   - Email/password sign up and sign in
   - Password reset via email
6. Search & basic filters
   - Filter by assignee, due date (overdue, due today, due this week), label, and text search for title
7. Notifications (in-app and email)
   - Notify assignee when assigned
   - Remind assignee 24 hours before due date (configurable later)
8. Data persistence & backups
   - Persistent storage for boards/tasks/users; daily backups (format and retention: UNKNOWN — see Open Questions)
9. Responsive web UI (desktop & mobile web)

### Should Have (P1)
Features planned for next release or shortly after:
1. Multiple assignees per task (if P0 uses single assignee)
2. Calendar view that displays tasks by due date and allows drag-to-reschedule
3. CSV export of board and tasks
4. Role management beyond Owner/Member: Viewer/Editor (minimal ACL)
5. Integrations: calendar sync (Google Calendar) and Slack notifications (basic)
6. Customizable reminder times (user preference)
7. Activity log / simple history for task moves and edits

### Nice to Have (P2)
Non-essential features for later:
1. Templates for boards and recurring tasks
2. Checklists/subtasks inside a task card
3. Native mobile apps (iOS and Android)
4. Advanced reporting and analytics (cycle time, throughput)
5. SSO / SAML enterprise auth
6. Offline support and local caching
7. Attachments preview and file storage integrations (Google Drive, Dropbox)

## 5. Hard Rules Catalog
Non-negotiable business rules the system must enforce:
1. Task ownership: only team members can be assigned to tasks in that team.
   - Example: If user alice@example.com is not in Team A, she cannot be assigned tasks on Team A boards.
2. Board visibility: boards inherit the team membership — only team members see its boards unless explicit sharing exists (sharing = OUT OF SCOPE).
3. Required task fields: task Title is mandatory; creation fails without title.
4. Dates:
   - Due date cannot be earlier than task creation timestamp.
   - Due date must be expressed in user's timezone for display; store timestamps in UTC.
5. Permissions:
   - Only Team Owner can delete a board.
   - Members can create/edit/delete tasks and columns but cannot delete the board or change team membership.
6. Unique identifiers:
   - Each board, task, team, and user has a globally unique ID (GUID/UUID).
7. Soft delete:
   - Deleting a task or board performs a soft delete for 30 days, during which it can be restored by an Owner (UNKNOWN: retention period — default 30 days).
8. Email invitations:
   - Invitation tokens expire after 7 days (UNKNOWN: configurable duration).
9. Notification opt-out:
   - Users can opt out of email notifications globally.

## 6. Acceptance Criteria
How we know each feature is complete — testable criteria.

P0 Acceptance Criteria (must pass all):
1. Board management
   - Given a signed-in Owner, when I create a board with name "Website Launch", then the board appears in the team's board list and contains default columns if chosen.
   - Given an Owner, when I delete a board, it is not visible to team members and is flagged as soft-deleted in the database.
2. Column operations
   - Given a board, when I add a column "Blocked", it appears at the selected position and tasks can be moved into it.
   - Renaming and reordering columns updates the UI and persists.
3. Task CRUD
   - Given a Member, when I create a task with title "Design mockup", assign it to Priya, and set due date tomorrow, the task shows assignee, due date, and appears in the chosen column.
   - Creating a task without a title returns a validation error and is not created.
   - Deleting a task marks it soft-deleted and removes it from the board UI.
4. Drag-and-drop
   - When a user drags a task to another column, the task's column state updates and persisted.
   - Simultaneous moves resolve deterministically (last write wins) and UI reflects the final state.
5. Team and membership
   - Owner can invite a new member by email; the member receives an invitation link; after accepting, the member is listed in the team.
   - Non-members cannot view or access team boards (403).
6. Assignments & due dates
   - Assigning a task to a non-team user fails with a clear error.
   - Setting a due date prior to creation time fails with a validation error.
   - Overdue tasks are visually flagged (e.g., red badge) after midnight UTC following the due date.
7. Authentication & security
   - New users can sign up and receive confirmation email (if email confirmation required).
   - Password reset flow sends reset email and allows secure password update.
8. Search & filters
   - Filtering by assignee returns only tasks assigned to that user within the active board.
   - Searching for "mockup" returns tasks with "mockup" in title or description.
9. Notifications
   - When a task is assigned, the assignee receives an in-app notification and an email (unless opted out).
   - Reminder emails are sent 24 hours before a due date for tasks with assignees.
10. Data persistence & backups
   - Creating a board or task persists to storage and survives server restart.
   - A documented backup policy exists (UNKNOWN: retention/restore SLA).

P1 Acceptance Criteria (should pass for P1 release):
- Multiple assignees:
  - Task UI allows selecting multiple assignees; notification sent to all assignees.
- Calendar view:
  - Calendar shows tasks on their due dates and allows dragging to change due date.
- Export:
  - Exporting to CSV generates a file with task id, title, assignee(s), due date (UTC), column, labels.
- Integrations:
  - Able to add Google Calendar integration: tasks with due dates appear in the connected calendar.

P2 Acceptance Criteria (for future releases):
- Templates:
  - User can save a board as a template and instantiate from it.
- Checklists:
  - Tasks can contain checklists with completion progress shown on the card.

## 7. Out of Scope
Explicit exclusions for this version:
- Enterprise SSO/SAML and advanced RBAC (Out of Scope for initial release)
- Native mobile apps (iOS/Android) — mobile web only
- Advanced analytics (cycle time, throughput) and AI-assisted prioritization
- Cross-team boards / public boards / anonymous access
- File storage integrations (Google Drive, Dropbox) and large attachment hosting
- Real-time collaborative cursors or multi-user simultaneous editing on the same card (beyond last-write updates)
- Full audit trails beyond basic activity log (detailed immutable audit events are Out of Scope)

## 8. Open Questions (UNKNOWN)
Items that require clarification before implementation or that affect scope:

1. Team size limit
   - What is considered a "small team" for product limits? (e.g., 2–20 users, 50 users) — UNKNOWN
2. Multi-assignee policy
   - Should P0 support multiple assignees or single assignee only? (affects notification and UI) — UNKNOWN
3. Soft-delete retention period and restore UX
   - Default retention 30 days proposed — confirm retention period and restore permissions — UNKNOWN
4. Backup and restore SLAs
   - Backup frequency, retention, and recovery time objective (RTO) — UNKNOWN
5. Notification timing and channels
   - Default reminder times (24h), whether push notifications are required — confirm — UNKNOWN
6. Email deliverability requirements
   - Use third-party email provider (SendGrid, SES) or in-house SMTP? — UNKNOWN
7. Internationalization
   - Required locales and date/time formatting locales for initial release — UNKNOWN
8. GDPR / data residency compliance
   - Required data residency or compliance measures for target customers — UNKNOWN
9. Pricing & free tier limits
   - Will there be a free tier, team size limits on free plan, or paid features gating (e.g., attachments)? — UNKNOWN
10. Integrations priority
   - Which integrations (Slack, Google Calendar) are highest priority for P1? — UNKNOWN

Notes for follow-up: confirm answers to the above Open Questions with stakeholders before scoping implementation sprints.

--- 
End of RPBS_Product.md.