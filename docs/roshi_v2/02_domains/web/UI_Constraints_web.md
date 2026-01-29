# UI Constraints — Web

## Overview
**Domain Slug:** web

## Visual Design Constraints
- Use shadcn/ui component library for consistent styling
- Follow Tailwind CSS utility-first approach
- Maintain consistent spacing using Tailwind spacing scale
- Use system fonts for performance

## Layout Constraints
- Single-page focused design for MVP
- Center-aligned main content area
- Max width container for readability (max-w-2xl or similar)
- Responsive padding on mobile

## Component Constraints

| Component | Allowed | Notes |
|-----------|---------|-------|
| Button | Yes | Use shadcn Button variants |
| Card | Yes | For form container and status display |
| Textarea | Yes | For idea input |
| Badge | Yes | For status indicators |
| Progress | Yes | For pipeline progress |
| Toast | Yes | For notifications |

## Responsive Behavior
- Mobile-first design
- Stack elements vertically on small screens
- Maintain touch-friendly tap targets (min 44px)
- Form inputs full-width on mobile

## Performance Constraints
- Initial load under 2 seconds on 3G
- No layout shift during loading states
- Use skeleton loaders for async content

## Open Questions
- None - UI constraints are defined for MVP
