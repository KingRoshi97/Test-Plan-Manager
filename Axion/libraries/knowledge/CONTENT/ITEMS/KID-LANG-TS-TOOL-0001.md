---
kid: "KID-LANG-TS-TOOL-0001"
title: "Toolchain Baseline (tsc + bundler)"
content_type: "reference"
primary_domain: "["
secondary_domains:
  - "j"
  - "a"
  - "v"
  - "a"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - "_"
  - "t"
  - "y"
  - "p"
  - "e"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - "]"
industry_refs: []
stack_family_refs:
  - "tooling"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "t"
  - "o"
  - "o"
  - "l"
  - "i"
  - "n"
  - "g"
  - ","
  - " "
  - "t"
  - "s"
  - "c"
  - ","
  - " "
  - "b"
  - "u"
  - "n"
  - "d"
  - "l"
  - "e"
  - "r"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/tooling/KID-LANG-TS-TOOL-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Toolchain Baseline (tsc + bundler)

```markdown
# Toolchain Baseline (tsc + bundler)

## Summary
The "Toolchain Baseline (tsc + bundler)" refers to a development setup combining the TypeScript Compiler (`tsc`) for type-checking and a JavaScript bundler (e.g., Webpack, Rollup, or esbuild) for packaging code. This approach separates type-checking from code bundling, optimizing both processes for performance and flexibility.

## When to Use
- When working on large-scale TypeScript projects where incremental builds and fast feedback loops are critical.
- When you need a custom bundling configuration for advanced use cases (e.g., tree-shaking, code splitting, or plugin-based workflows).
- When leveraging modern bundlers for optimized production builds while retaining `tsc` for type safety.
- When migrating JavaScript projects to TypeScript incrementally.

## Do / Don't

### Do
- Use `tsc --noEmit` to perform type-checking without generating JavaScript files.
- Configure your bundler to handle module resolution, transpilation, and asset processing.
- Use `tsconfig.json` to define TypeScript-specific options and ensure compatibility with your bundler.

### Don't
- Don't rely solely on the bundler's TypeScript support (e.g., Babel with `@babel/preset-typescript`) for type-checking; it does not enforce full type safety.
- Don't mix `tsc` and bundler-generated outputs in the same directory to avoid conflicts.
- Don't skip type-checking in CI/CD pipelines; always run `tsc` as part of your build process.

## Core Content

### Key Definitions
- **TypeScript Compiler (`tsc`)**: The official compiler for TypeScript, responsible for type-checking and optionally transpiling TypeScript into JavaScript.
- **Bundler**: A tool that packages multiple JavaScript/TypeScript modules into optimized bundles for deployment. Examples include Webpack, Rollup, and esbuild.

### Parameters and Configuration Options

#### `tsc` Configuration (`tsconfig.json`)
| Option               | Description                                                                                  | Example Value         |
|-----------------------|----------------------------------------------------------------------------------------------|-----------------------|
| `compilerOptions.outDir` | Specifies the output directory for compiled JavaScript files (if `emit` is enabled).      | `"dist"`             |
| `compilerOptions.noEmit` | Prevents `tsc` from emitting JavaScript files, used when `tsc` is run for type-checking.  | `true`               |
| `compilerOptions.strict` | Enables all strict type-checking options for maximum type safety.                        | `true`               |
| `include`            | Specifies files or directories to include in the compilation process.                        | `["src/**/*"]`       |
| `exclude`            | Specifies files or directories to exclude from the compilation process.                      | `["node_modules"]`   |

#### Bundler Configuration (Example: Webpack)
| Option               | Description                                                                                  | Example Value         |
|-----------------------|----------------------------------------------------------------------------------------------|-----------------------|
| `entry`              | Specifies the entry point(s) for the application.                                            | `"./src/index.ts"`    |
| `output.filename`    | Defines the output bundle filename.                                                          | `"bundle.js"`         |
| `module.rules`       | Configures loaders for processing TypeScript files.                                          | `ts-loader` or `babel-loader` |
| `resolve.extensions` | Specifies extensions for module resolution.                                                  | `[".ts", ".tsx", ".js"]` |

### Workflow
1. **Type-Checking**: Run `tsc --noEmit` to ensure type correctness.
2. **Bundling**: Use your bundler to transpile and package the code. For example:
   - Webpack: Configure `ts-loader` or `babel-loader` to handle `.ts` and `.tsx` files.
   - Rollup: Use plugins like `@rollup/plugin-typescript` for TypeScript support.
   - esbuild: Use the built-in TypeScript transpilation feature.
3. **Production Builds**: Optimize the bundler configuration for production (e.g., minification, tree-shaking).

### Common Pitfalls
- **Duplicate Transpilation**: Avoid double-transpiling TypeScript (once in `tsc` and again in the bundler). Use `tsc` only for type-checking.
- **Misaligned Configurations**: Ensure `tsconfig.json` and bundler settings (e.g., module resolution) are aligned to prevent runtime errors.

## Links
- **TypeScript Compiler Options**: Comprehensive documentation on `tsconfig.json` options.
- **Webpack Documentation**: Official guide to configuring Webpack for TypeScript.
- **Rollup TypeScript Plugin**: Documentation for using TypeScript with Rollup.
- **esbuild Documentation**: Guide to configuring esbuild for TypeScript builds.

## Proof / Confidence
This approach aligns with TypeScript's official recommendations to separate type-checking from transpilation for better performance. Leading bundlers (Webpack, Rollup, and esbuild) support this workflow natively, and it is widely adopted in the JavaScript/TypeScript ecosystem for scalability and maintainability.
```
