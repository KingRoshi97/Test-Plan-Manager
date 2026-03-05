---
kid: "KID-LANG-GO-CORE-0002"
title: "Project Structure Norms (cmd/internal/pkg)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [go]
subdomains: []
tags: [go, project-structure, cmd, internal]
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

# Project Structure Norms (cmd/internal/pkg)

# Project Structure Norms (`cmd/internal/pkg`)

## Summary
In Go projects, structuring code effectively is critical for maintainability, scalability, and readability. The `cmd/internal/pkg` pattern is a widely recognized convention for organizing Go projects, separating code into distinct areas for commands (`cmd`), shared internal utilities (`internal`), and reusable packages (`pkg`). This structure promotes modularity, encapsulation, and clarity in large-scale software projects.

## When to Use
- **Large-scale projects**: When working on a project with multiple components, services, or commands.
- **Shared utilities**: When you need to separate internal code that should not be exposed to external consumers.
- **Reusable libraries**: When building packages that might be imported across multiple projects or modules.
- **Team collaboration**: When multiple developers are contributing to a codebase, and clear separation of concerns is necessary.

## Do / Don't

### Do
1. **Use `cmd` for entry points**: Place executable programs and CLI commands in the `cmd` directory. Each subdirectory should represent a distinct command.
2. **Use `internal` for private code**: Place code in `internal` that is shared across the project but should not be imported by external modules.
3. **Use `pkg` for reusable libraries**: Place code in `pkg` that is intended to be imported by other projects or modules.
4. **Follow naming conventions**: Name directories and packages descriptively to reflect their purpose (e.g., `cmd/server`, `pkg/utils`).
5. **Enforce encapsulation**: Use the `internal` directory to restrict access to sensitive or project-specific code.

### Don't
1. **Don't mix concerns**: Avoid placing reusable libraries (`pkg`) or private code (`internal`) inside the `cmd` directory.
2. **Don't expose `internal` code**: Never import code from `internal` outside of the project—it violates Go's access control mechanisms.
3. **Don't overuse `pkg`**: Avoid placing project-specific code in `pkg`. Only use it for libraries intended for external reuse.
4. **Don't ignore modularity**: Avoid creating overly large directories with unrelated functionality. Break code into logical components.
5. **Don't skip documentation**: Always document the purpose of each directory and package to aid understanding for contributors.

## Core Content
The `cmd/internal/pkg` structure is a Go convention designed to organize codebases into logical components. It leverages Go's package system and import rules to enforce encapsulation and modularity. Here's a breakdown of each directory:

### `cmd`
The `cmd` directory contains the entry points for executable programs. Each subdirectory represents a distinct command or service. For example:
```
cmd/
  server/   # Entry point for a server application
  client/   # Entry point for a client application
```
Code within these directories typically includes `main.go` files, which define the application's startup logic. The `cmd` directory ensures that executable code is isolated from libraries and utilities.

### `internal`
The `internal` directory is used for code that is shared across the project but should not be imported by external modules. Go enforces this restriction by preventing imports from `internal` directories outside the project root. For example:
```
internal/
  db/       # Database connection utilities
  config/   # Configuration parsing logic
```
This approach ensures sensitive or project-specific code remains private, reducing the risk of unintended usage or dependency coupling.

### `pkg`
The `pkg` directory contains reusable libraries that are intended to be imported by other projects or modules. For example:
```
pkg/
  utils/    # General-purpose utility functions
  logger/   # Logging library
```
While not enforced by Go itself, placing reusable code in `pkg` signals to developers that this code is designed for external consumption. Care should be taken to document and version libraries appropriately.

### Benefits
- **Encapsulation**: The `internal` directory ensures private code cannot be imported externally.
- **Modularity**: The separation of `cmd`, `internal`, and `pkg` promotes clear boundaries between executable code, shared utilities, and reusable libraries.
- **Scalability**: This structure scales well for large projects with multiple components or services.
- **Team collaboration**: Clear organization reduces confusion and improves onboarding for new contributors.

### Example
A typical Go project might look like this:
```
project/
  cmd/
    server/
      main.go
    client/
      main.go
  internal/
    db/
      connection.go
    config/
      parser.go
  pkg/
    utils/
      strings.go
    logger/
      logger.go
```
Here, the `cmd` directory contains entry points for the server and client applications, `internal` contains project-specific utilities, and `pkg` contains reusable libraries.

## Links
- **Go Modules Documentation**: Learn about Go's module system and package import rules.
- **Effective Go**: Best practices for writing Go code, including project structuring.
- **Encapsulation in Go**: Explanation of Go's access control mechanisms (`internal` directory).
- **Go CLI Applications**: Guide to building command-line applications in Go.

## Proof / Confidence
This structure is widely adopted in the Go community and aligns with Go's design philosophy of simplicity and modularity. The use of `internal` is explicitly supported by Go's import rules, and the `cmd/internal/pkg` convention is recommended in many industry-standard Go project templates, including those provided by popular frameworks like Cobra and Gin.
