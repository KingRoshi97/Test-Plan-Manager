---
pillar: LANGUAGES_AND_LIBRARIES
title: Languages & Libraries
version: 1.0.0
---

# Languages & Libraries Pillar

Curated knowledge items covering programming languages, frameworks, and ecosystem tooling used across Axion-managed projects.

## Scope

- Language-specific mental models, project structure norms, testing norms, and common pitfalls
- Framework-specific architecture patterns, security checklists, performance guidance, and deployment notes
- Ecosystem tooling (build systems, linters, formatters, CI patterns)
- Security and performance guidance per stack

## Stacks Covered

1. JavaScript / TypeScript (language core + Node.js + React + Next.js)
2. Python (language core + FastAPI)
3. Go (language core + web frameworks)
4. Rust (language core + web frameworks)
5. SQL / Postgres (language core + references + security/performance)
6. Solidity / EVM (language core + security + patterns + references)

## Universal Structure

Each stack folder supports these KID groups:
- `language_core/` — mental model, project structure, testing norms, common pitfalls
- `frameworks/<name>/` — framework-specific KIDs (overview, structure, data/state, security, performance, testing, deployment)
- `security/` — ecosystem-specific security footguns, dependency safety, secrets handling
- `performance/` — bottlenecks, profiling, optimization patterns
- `tooling/` — build tooling, lint/format, CI setup
- `references/` — default stack reference, versioning/migrations
- `examples/` — restricted by default; structure learning only
