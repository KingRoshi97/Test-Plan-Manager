# Requirements & Entity Baseline Specification (REBS)

## Overview
This document defines the entities and their relationships for kofa-web-app.

## Core Entities
User, Client, Person, Page, Project, Preference, Token, Session

## Entity Definitions

| Entity | Description | Owner Domain | Key Fields |
|--------|-------------|--------------|------------|
| User | Core user entity for the application | auth | id, email, name, role, createdAt |
| Client | Core client entity for the application | data | id, name, description, createdAt |
| Person | Core person entity for the application | data | id, name, description, createdAt |
| Page | Core page entity for the application | data | id, title, slug, content, authorId, status |
| Project | Core project entity for the application | data | id, name, description, teamId, status, createdAt |
| Preference | Core preference entity for the application | data | id, name, description, createdAt |
| Token | Core token entity for the application | data | id, name, description, createdAt |
| Session | Core session entity for the application | auth | id, userId, token, expiresAt, createdAt |

## Entity Relationships
- Client belongs to User (via authorId/ownerId/userId)
- Person belongs to User (via authorId/ownerId/userId)
- Page belongs to User (via authorId/ownerId/userId)
- Project belongs to User (via authorId/ownerId/userId)
- Preference belongs to User (via authorId/ownerId/userId)
- Token belongs to User (via authorId/ownerId/userId)
- Session belongs to User (via authorId/ownerId/userId)

## Open Questions
- Entity lifecycle management needs further definition
- Cross-entity validation rules need to be specified
- Cascading delete behavior needs stakeholder input
