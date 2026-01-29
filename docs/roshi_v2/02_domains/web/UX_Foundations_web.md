# UX Foundations — Web

## Overview
**Domain Slug:** web

## User Types

| User Type | Description | Primary Goals |
|-----------|-------------|---------------|
| Developer | Technical user generating docs for AI agent | Create bundle quickly, get working output |
| Non-technical User | Business user exploring docs-first approach | Submit idea, receive downloadable result |

## User Journeys

### Journey: Generate Bundle
- **Trigger:** User lands on home page with an idea
- **Steps:**
  1. Enter idea in text area
  2. Optionally add context
  3. Click Generate
  4. Watch pipeline progress
  5. Download bundle when ready
- **Outcome:** User has zip file ready to upload to AI coding agent

### Journey: Copy Agent Prompt
- **Trigger:** User wants to manually paste prompt to agent
- **Steps:**
  1. Complete generation
  2. Click "Copy Agent Prompt"
  3. Paste into AI agent chat
- **Outcome:** Agent has instructions for using the bundle

## Information Architecture
- Home page is primary entry point
- No navigation needed for MVP (single-page focus)
- Status and download appear inline after generation
- Optional: Run history page for power users

## Accessibility Requirements
- Keyboard navigable form
- Focus visible on interactive elements
- Status changes announced to screen readers
- Sufficient color contrast (WCAG AA)
- Form labels properly associated with inputs

## Open Questions
- None - UX is defined for MVP
