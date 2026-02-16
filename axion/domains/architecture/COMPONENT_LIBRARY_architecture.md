# Component Library — architecture

## Overview
**Domain Slug:** architecture
**Prefix:** arch
**Project:** Application

---

## Component Inventory

| Component ID | Name | Category | Description | Reusable? | Props/Inputs |
|-------------|------|----------|-------------|----------|-------------|
| arch_CMP_001 | ApplicationCard | Data Display | Displays a application summary in list/grid views | Yes | application: Application, onClick: () => void |
| arch_CMP_002 | UserCard | Input/Form | Form for creating/editing user records | Yes | user: User, onClick: () => void |
| arch_CMP_003 | Platform targetsCard | Data Display | Detailed view of a single platform targets | Yes | platform targets: Platform targets, onClick: () => void |
| arch_CMP_004 | Integrations complexityCard | Layout | Container layout for integrations complexity sections | Yes | integrations complexity: Integrations complexity, onClick: () => void |

---

## Component Variants

| Component ID | Variant | When to Use | Visual Difference |
|-------------|---------|-------------|-------------------|
| arch_CMP_001 | default | Standard list/grid display | Full card with image, title, meta |
| arch_CMP_001 | compact | Search results, sidebar | Title + meta inline, no image |
| arch_CMP_002 | default | Standard list/grid display | Full card with image, title, meta |
| arch_CMP_002 | compact | Search results, sidebar | Title + meta inline, no image |

---

## Component Composition

| Parent Component | Child Components | Composition Pattern |
|-----------------|-----------------|-------------------|
| ApplicationCard | Avatar, Badge, ActionButton | Horizontal header + vertical body |
| UserCard | Avatar, Badge, ActionButton | Horizontal header + vertical body |

---

## Component Dependencies

| Component ID | Depends On | External Libraries |
|-------------|-----------|-------------------|
| arch_CMP_001 | Button, Badge, Avatar | Shadcn UI, Lucide React |
| arch_CMP_002 | Button, Badge, Avatar | Shadcn UI, Lucide React |
| arch_CMP_003 | Button, Badge, Avatar | Shadcn UI, Lucide React |

---

## Component State

| Component ID | Internal State | Controlled/Uncontrolled | Default |
|-------------|---------------|------------------------|---------|
| arch_CMP_001 | expanded: boolean | Uncontrolled | false |
| arch_CMP_002 | formValues: FormData | Controlled | empty |

---

## Component Sizing

| Component | Min Width | Max Width | Height | Responsive Behavior |
|-----------|----------|----------|--------|-------------------|
| ApplicationCard | 200px | 400px | Auto | Stack vertically on mobile |
| UserCard | 200px | 400px | Auto | Stack vertically on mobile |

---

## Open Questions
- Component prop types need refinement from DDES entity field definitions
- Accessibility requirements per component pending UX_Foundations review
