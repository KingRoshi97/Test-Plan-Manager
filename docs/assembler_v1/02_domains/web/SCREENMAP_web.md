# Screen Map — Web

## Overview
**Domain Slug:** web

## Screens

### Screen: Home / Generator
- **Route:** /
- **Purpose:** Main landing page where users submit ideas and generate bundles
- **Components:**
  - IdeaForm: textarea for idea input, optional context field
  - GenerateButton: triggers pipeline execution
  - RunStatusDisplay: shows current pipeline step progress
  - DownloadSection: appears when bundle is ready
- **User Actions:**
  - Enter idea text
  - Click Generate
  - View pipeline progress
  - Download bundle zip
  - Copy agent prompt
- **Data Requirements:**
  - Current run status (if any)
  - Pipeline step progress
  - Bundle download URL

### Screen: Run History
- **Route:** /runs
- **Purpose:** View past runs and their status
- **Components:**
  - RunList: table of past runs with status, date, actions
  - RunRow: individual run with status badge, download button
- **User Actions:**
  - View run history
  - Download previous bundles
  - Delete old runs
- **Data Requirements:**
  - List of runs with id, status, createdAt, bundlePath

## Screen Flow
```
Home (/) -> [Generate] -> Pipeline Running -> Bundle Ready -> Download
                                           -> Run History (/runs)
```

## Navigation Patterns
- Single-page focus: Home is primary screen
- Optional: Link to Run History for power users
- Download triggers browser save dialog

## Modal/Dialog Screens

| Modal | Trigger | Purpose |
|-------|---------|---------|
| CopyPromptModal | Click "Copy Agent Prompt" | Display agent_prompt.md content with copy button |
| ErrorModal | Pipeline fails | Show error message and retry option |

## Open Questions
- None - screens are well-defined for MVP
