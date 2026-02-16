# Screen Map — architecture

## Overview
**Domain Slug:** architecture
**Prefix:** arch
**Project:** Application

---

## Screen Inventory

| Screen ID | Name | Route/Path | Purpose | Parent Screen | Auth Required? | RPBS Feature Ref |
|----------|------|-----------|---------|--------------|---------------|-----------------|
| arch_SCR_001 | Application List | /applications | Browse and search all application records | — (top-level) | No | FEAT_001 |
| arch_SCR_002 | User Detail | /users/:id | View user detail | — (top-level) | No | FEAT_002 |
| arch_SCR_003 | Platform targets Create | /platform targetss/new | Create new platform targets | — (top-level) | Yes | FEAT_003 |
| arch_SCR_004 | Integrations complexity Edit | /integrations complexitys/:id/edit | Edit existing integrations complexity | — (top-level) | Yes | FEAT_004 |

---

## Navigation Flows

| Flow ID | Description | Steps | Entry Point | Exit Point | Trigger |
|---------|-------------|-------|------------|-----------|---------|
| arch_NAV_001 | Application browse-to-detail | List → Detail | Application List | Application Detail | Click application card |
| arch_NAV_002 | User browse-to-detail | List → Detail | User List | User Detail | Click user card |

---

## Screen-to-Component Mapping

| Screen ID | Layout Type | Components Used | Key Interactive Elements |
|----------|------------|----------------|------------------------|
| arch_SCR_001 | List + Sidebar | ApplicationCard, SearchBar, Pagination | Search, filter, click actions |
| arch_SCR_002 | Detail + Actions | UserCard, SearchBar, Pagination | Search, filter, click actions |
| arch_SCR_003 | Form | Platform targetsCard, SearchBar, Pagination | Search, filter, click actions |

---

## State Requirements Per Screen

| Screen ID | Required Data | Data Source | Loading Strategy | Cache Strategy |
|----------|---------------|-----------|-----------------|---------------|
| arch_SCR_001 | Application list data | GET /api/applications | Skeleton | Cache 5min |
| arch_SCR_002 | User list data | GET /api/users | Skeleton | Cache 5min |
| arch_SCR_003 | Platform targets list data | GET /api/platform targetss | Skeleton | Cache 5min |

---

## Open Questions
- Screen wireframe details need visual design input
- Navigation flow edge cases need RPBS §5 journey mapping
