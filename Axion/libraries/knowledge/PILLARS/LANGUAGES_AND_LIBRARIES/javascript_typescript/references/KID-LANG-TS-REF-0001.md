---
kid: "KID-LANG-TS-REF-0001"
title: "TS Project Baseline Reference (recommended defaults)"
type: reference
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript]
subdomains: []
tags: [reference, baseline, defaults]
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

# TS Project Baseline Reference (recommended defaults)

```markdown
# TS Project Baseline Reference (Recommended Defaults)

## Summary
This document outlines the recommended baseline configuration for TypeScript (TS) projects. It provides default settings, compiler options, and project structure best practices to ensure maintainability, compatibility, and performance. These defaults are suitable for most modern JavaScript/TypeScript projects.

## When to Use
- When initializing a new TypeScript project.
- When migrating a JavaScript project to TypeScript.
- When standardizing configurations across multiple projects in an organization.
- When optimizing for strict type-checking and compatibility with modern JavaScript runtimes.

## Do / Don't

### Do
- Use `strict: true` to enable all strict type-checking options.
- Use `esnext` for `module` and `target` to support modern JavaScript features.
- Organize your project with a clear `src` and `dist` folder structure.
- Enable `noEmit` when using TypeScript for type-checking only in non-build workflows.
- Use `tsconfig.json` inheritance (`extends`) for shared configurations.

### Don't
- Don’t disable strict options unless absolutely necessary (e.g., `strictNullChecks` or `noImplicitAny`).
- Don’t include unnecessary files in the `include` or `exclude` fields of `tsconfig.json`.
- Don’t use outdated module targets like `commonjs` unless required for legacy environments.
- Don’t mix compiled and source files in the same directory.
- Don’t ignore TypeScript warnings or errors during development.

## Core Content

### Recommended `tsconfig.json` Defaults
Below is a recommended `tsconfig.json` configuration for most TypeScript projects:

```json
{
  "compilerOptions": {
    "target": "esnext", // Use the latest ECMAScript features
    "module": "esnext", // Use ES module syntax
    "moduleResolution": "node", // Node.js module resolution
    "strict": true, // Enable all strict type-checking options
    "esModuleInterop": true, // Allow default imports from CommonJS modules
    "forceConsistentCasingInFileNames": true, // Enforce consistent file name casing
    "skipLibCheck": true, // Skip type checking of declaration files for faster builds
    "declaration": true, // Generate type declaration files
    "outDir": "./dist", // Output directory for compiled files
    "rootDir": "./src", // Root directory of source files
    "resolveJsonModule": true, // Allow importing JSON files
    "isolatedModules": true // Ensure each file can be safely transpiled
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Key Compiler Options
| Option                     | Description                                                                 |
|----------------------------|-----------------------------------------------------------------------------|
| `strict`                   | Enables all strict type-checking options.                                  |
| `target`                   | Specifies the ECMAScript version to compile to.                            |
| `module`                   | Defines the module code generation (e.g., `esnext`, `commonjs`).           |
| `esModuleInterop`          | Allows better compatibility with CommonJS modules.                        |
| `declaration`              | Generates `.d.ts` files for type declarations.                            |
| `skipLibCheck`             | Skips type-checking of declaration files for faster builds.               |
| `rootDir` and `outDir`     | Defines source and output directories for better project organization.     |

### Project Structure
Organize your project as follows:
```
project-root/
├── src/                # Source files
│   ├── index.ts
│   ├── components/
│   └── utils/
├── dist/               # Compiled output
├── tsconfig.json       # TypeScript configuration
├── package.json        # Project metadata and dependencies
└── node_modules/       # Installed dependencies
```

### Advanced Tips
- Use `tsconfig.base.json` to define shared configurations across multiple projects in a monorepo.
- Enable `incremental` for faster rebuilds in large projects.
- Use `paths` and `baseUrl` for module aliasing to simplify imports.

## Links
- **TypeScript Compiler Options Reference**: Comprehensive list of all available TypeScript compiler options.
- **TypeScript Project Configuration Guide**: Best practices for setting up and managing TypeScript projects.
- **ESNext Features**: Overview of the latest ECMAScript features supported in modern runtimes.
- **Node.js Module Resolution**: Explanation of how Node.js resolves modules.

## Proof / Confidence
These recommendations are based on TypeScript's official documentation, industry best practices, and common configurations used in open-source projects. The `strict` mode and modern ECMAScript targets are widely adopted as they improve code quality and compatibility with modern JavaScript runtimes. Benchmarks show that enabling `skipLibCheck` and `incremental` significantly reduces build times in large projects.
```
