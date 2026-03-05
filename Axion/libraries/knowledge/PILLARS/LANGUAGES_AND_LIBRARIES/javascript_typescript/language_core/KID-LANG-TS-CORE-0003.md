---
kid: "KID-LANG-TS-CORE-0003"
title: "Project Structure Norms (monorepo vs single)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript]
subdomains: []
tags: [project-structure, monorepo]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Project Structure Norms (monorepo vs single)

# Project Structure Norms (monorepo vs single)

## Summary

Project structure norms, particularly the choice between a monorepo and single-repo architecture, play a critical role in managing JavaScript/TypeScript codebases. A monorepo consolidates multiple projects into a single repository, while a single-repo approach assigns one repository per project. Choosing the right structure impacts scalability, collaboration, and dependency management.

## When to Use

- **Monorepo**:
  - When you have multiple tightly coupled projects that share dependencies or code (e.g., shared libraries, utilities, or design systems).
  - When you need centralized tooling for consistent linting, testing, and CI/CD pipelines across projects.
  - When managing a large-scale application with multiple teams working on interdependent modules.

- **Single-repo**:
  - When projects are independent and have minimal or no shared code.
  - When you want to simplify version control and avoid the complexity of managing a large repository.
  - When teams work on isolated projects with separate release cycles.

## Do / Don't

### Do
1. **Do use a monorepo** if you need to enforce consistent coding standards and dependency versions across multiple projects.
2. **Do adopt a monorepo** when you need atomic commits across projects (e.g., updating shared dependencies and dependent modules simultaneously).
3. **Do use a single-repo structure** for projects with minimal interdependencies to reduce complexity.

### Don't
1. **Don't use a monorepo** if your projects are entirely independent with no shared code or dependencies.
2. **Don't use a single-repo structure** for projects that require frequent cross-project changes or shared tooling.
3. **Don't ignore tooling** when adopting a monorepo—invest in tools like `nx`, `Lerna`, or `Bazel` for efficient management.

## Core Content

### Monorepo vs Single-Repo: Definitions

A **monorepo** is a repository that contains multiple projects, often with shared dependencies or code. All projects reside within a single version-controlled repository, enabling centralized management of dependencies, tooling, and workflows. Examples include managing a frontend application, backend API, and shared design system within one repository.

A **single-repo** structure assigns one repository per project. Each repository is self-contained and versioned independently. This approach is common for independent applications or libraries with no shared dependencies.

### Why It Matters

The choice between monorepo and single-repo affects:
- **Scalability**: Monorepos simplify cross-project changes but can become unwieldy as they grow. Single repos are easier to manage individually but complicate cross-project coordination.
- **Collaboration**: Monorepos enable centralized workflows for teams working on interdependent projects. Single repos isolate teams, reducing coordination overhead.
- **Dependency Management**: Monorepos ensure consistent dependency versions across projects. Single repos allow independent versioning, which can lead to version mismatches.

### Monorepo: Benefits and Challenges

#### Benefits:
- **Centralized tooling**: Tools like `nx` or `Lerna` streamline builds, testing, and dependency management.
- **Atomic commits**: Changes to shared dependencies and dependent projects can be made together.
- **Code sharing**: Shared libraries or utilities are easily accessible across projects.

#### Challenges:
- **Scalability**: Large monorepos can slow down CI/CD pipelines and version control operations.
- **Tooling complexity**: Requires specialized tools (`nx`, `Bazel`, etc.) to manage builds and dependencies efficiently.

### Single-Repo: Benefits and Challenges

#### Benefits:
- **Simplicity**: Each repository is self-contained, making it easier to manage.
- **Independent versioning**: Projects can evolve independently without affecting others.
- **Reduced tooling overhead**: No need for complex monorepo-specific tools.

#### Challenges:
- **Cross-project coordination**: Managing shared dependencies across multiple repositories becomes difficult.
- **Duplication risk**: Shared code or utilities may be duplicated across repositories.

### Practical Example: Monorepo in JavaScript/TypeScript

Suppose you are building a SaaS platform with:
- A React frontend (`frontend/`)
- A Node.js backend (`backend/`)
- A shared TypeScript library (`shared/`)

Using a monorepo, you can:
- Store all projects in a single repository.
- Share the TypeScript library across the frontend and backend.
- Use `nx` for efficient builds and testing.

With a single-repo structure, you would:
- Create separate repositories for `frontend`, `backend`, and `shared`.
- Publish the shared library to a package registry (e.g., npm) and manage its versioning independently.

## Links

- **NX Documentation**: Learn about monorepo tooling for JavaScript/TypeScript projects.
- **Lerna Guide**: Explore Lerna for managing monorepos in JavaScript.
- **Bazel Overview**: Understand Bazel’s role in scalable monorepo builds.
- **Semantic Versioning**: Best practices for versioning shared libraries in single-repo setups.

## Proof / Confidence

The monorepo vs single-repo debate is supported by industry practices:
- **Google** and **Facebook** use monorepos to manage large-scale projects with shared dependencies.
- Tools like `nx`, `Lerna`, and `Bazel` are widely adopted for monorepo management, indicating their effectiveness.
- Open-source projects such as `React` and `Angular` use monorepos to manage their ecosystems.
- The single-repo approach is common for independent libraries published on npm, showcasing its suitability for isolated projects.
