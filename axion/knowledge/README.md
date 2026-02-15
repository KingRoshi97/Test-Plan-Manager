# AXION Knowledge Base

This directory contains curated industry best practices, patterns, and standards that AXION references when generating Agent Kits. When a user selects a project preset (web app, API, mobile, etc.), the pipeline consults these references to produce higher-quality documentation and more informed architectural decisions.

## Structure

| File | Purpose |
|------|---------|
| `stacks.md` | Technology stack recommendations by project type |
| `navigation-ui.md` | Navigation and UI layout patterns |
| `security.md` | Security best practices and hardening checklists |
| `accessibility.md` | WCAG compliance and inclusive design standards |
| `performance.md` | Performance optimization patterns and budgets |
| `api-design.md` | REST/GraphQL API design conventions |
| `database.md` | Database design patterns and data modeling |
| `testing.md` | Testing strategies and coverage standards |
| `devops.md` | CI/CD, deployment, and infrastructure patterns |
| `error-handling.md` | Error handling, logging, and observability |

## Usage

These files are read by:
- **Content-fill system** (`axion-content-fill.ts`) — to enrich AI prompts with best practices
- **Package system** (`axion-package.ts`) — to include relevant knowledge in Agent Kits
- **Draft/seed scripts** — to inform initial document generation

## Contributing

Each file follows the same pattern:
1. A brief intro explaining the category
2. Sections organized by concern
3. Concrete recommendations (not vague advice)
4. "When to use" and "When to avoid" guidance where applicable
