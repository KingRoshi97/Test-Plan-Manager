# PROJECT_OVERVIEW.md

## Mode Context: New Build

This documentation is generated for a **new project build**.

### Focus Areas
- Design decisions should prioritize simplicity and MVP scope
- Establish clear naming conventions and patterns early
- Document UNKNOWN values explicitly for agent clarification
- Prefer convention over configuration where possible


Project Name: hhhhhhh  
Source: project brief provided by user (description: "hhhhhhhhhhh") — several fields are UNKNOWN and require clarification (see "Open questions / UNKNOWN" below).

## 1) Project summary
hhhhhhh is a product with an unspecified scope (project description provided as "hhhhhhhhhhh" — UNKNOWN). At a high level, this project aims to deliver a software product that solves a targeted user problem through a core set of features (details below). Next steps: confirm the product domain, primary use case, and intended platform (web / mobile / desktop).

## 2) Core value proposition
- Enable target users to accomplish [PRIMARY_GOAL] faster and more reliably than current alternatives. (PRIMARY_GOAL = UNKNOWN; please confirm.)
- Reduce operational friction and time-to-outcome through a focused feature set and simple onboarding.
- Provide measurable business value by improving (choose as applicable) productivity, conversion, cost-savings, or visibility.

Concrete example (placeholder): If the product is a task-management tool, the value proposition would be: "Help small teams organize, prioritize, and complete work 30% faster by combining lightweight workflows, automatic reminders, and simple reporting."

## 3) Target users
(These are recommended user segments; confirm which apply.)
- Primary: Individual contributors and small teams who need a lightweight productivity tool or workflow automation (UNKNOWN — confirm domain).
- Secondary: Managers and administrators who need visibility and simple reporting.
- Tertiary: Integrators or technical staff who require APIs or export capabilities.

Example personas:
- "Alex, Product Manager" — needs to assign and track tasks daily.
- "Sam, Operations Lead" — needs reporting and SLA dashboards weekly.

If the product domain is different (e.g., analytics, marketplace, developer tool), update personas accordingly.

## 4) Key features
The exact feature set should reflect the confirmed product domain. Below is a recommended, actionable baseline feature set to make the product viable and testable:

- User accounts and authentication
  - Email/password sign-up, password reset, and optional SSO (SAML/OIDC) for enterprise customers.
  - Example: email verification + onboarding tour on first sign-in.
- Core domain workflow
  - The central functionality users come for (define after domain confirmation).
  - Example: For task management — create/edit tasks, assign owners, due dates, status.
- Onboarding and first-run experience
  - Guided tour and sample data to reduce time-to-value.
- Notifications and reminders
  - In-app notifications and optional email or push notifications.
- Dashboard and reporting
  - Summary view for users and an admin dashboard with usage and performance metrics.
- Integrations and import/export
  - CSV import/export at a minimum; webhooks and a basic REST API for integrations.
- Role-based access control
  - At least "user", "manager", and "admin" roles with clear permission boundaries.
- Data storage and backups
  - Persistent storage with daily backups and retention policy.
- Security & compliance basics
  - TLS in transit, basic encryption at rest for sensitive data, logging of admin actions.
- Billing and subscription management (if commercial)
  - Stripe or similar integration for trials, subscriptions, and invoicing.

Mark any domain-specific features as UNKNOWN until product domain is confirmed.

## 5) Success metrics
Define measurable metrics to evaluate product success. Each metric should have a target once users and timeframe are confirmed.

Suggested baseline metrics:
- Activation: % of new users who complete onboarding within 7 days (target: 40–60% initially).
- Retention: 30-day retention rate for active users (target: 20–40% depending on domain).
- Engagement: Weekly active users (WAU) / Monthly active users (MAU) ratio (target: >25%).
- Time-to-first-value (TTFV): median time for a user to complete the core workflow for the first time (target: <24 hours or <1 session).
- Conversion (if paid): Trial-to-paid conversion rate (target: 5–15% initial).
- Reliability: System uptime (target: 99.9% SLA) and mean time to recovery (MTTR).
- Business: Revenue / MRR and Customer Acquisition Cost (CAC) payback period — define targets after pricing is set.

For each metric, define baseline, target, and measurement cadence once domain and audience are confirmed.

## 6) Constraints and assumptions
Explicitly state constraints and assumptions to align planning and reduce risk.

Known constraints and assumptions:
- Project description and primary domain are UNKNOWN — key follow-up required to concretize features and success metrics.
- Tech stack preferences were requested but not provided — technical choices (language, framework, hosting) are UNKNOWN and will affect timelines and integrations.
- Time and budget constraints are UNKNOWN — assume an MVP delivery window of 8–12 weeks for a small team (2–4 engineers + 1 designer + 1 PM) unless otherwise specified.
- Regulatory/compliance constraints (e.g., GDPR, HIPAA) are UNKNOWN — assume minimal regulatory requirements by default but confirm for any customer data processing scenarios.
- Target platforms (web / mobile / desktop) are UNKNOWN — assume web-first responsive implementation for fastest time-to-market.
- Integration requirements are UNKNOWN — include CSV import and webhook support in MVP; add full API/SSO/integrations after scoping.

Open questions / UNKNOWN (needs confirmation)
- What problem does "hhhhhhhhhhh" solve? (PRIMARY_GOAL)
- Who is the definitive target user persona?
- Which platform(s) should be prioritized? (web / iOS / Android / desktop)
- What are the tech stack preferences (language, framework, hosting, DB)?
- Is this a commercial product requiring billing/subscriptions?
- Are there any regulatory/compliance requirements?

Source
- This document was generated from the project brief provided by the user (Project Name: hhhhhhh; Description: hhhhhhhhhhh). Items marked UNKNOWN require user clarification.

Next steps (recommended)
- Answer the "Open questions / UNKNOWN" list above.
- Choose 2–3 top-priority success metrics and set measurable targets.
- Confirm tech stack preferences and platform scope to produce a full RPBS and REBS.