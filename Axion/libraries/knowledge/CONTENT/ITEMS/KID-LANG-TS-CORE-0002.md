---
kid: "KID-LANG-TS-CORE-0002"
title: "Module Systems (ESM/CJS) Basics"
content_type: "concept"
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
  - "language_core"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "m"
  - "o"
  - "d"
  - "u"
  - "l"
  - "e"
  - "s"
  - ","
  - " "
  - "e"
  - "s"
  - "m"
  - ","
  - " "
  - "c"
  - "j"
  - "s"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/language_core/KID-LANG-TS-CORE-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Module Systems (ESM/CJS) Basics

# Module Systems (ESM/CJS) Basics

## Summary

JavaScript module systems, specifically ECMAScript Modules (ESM) and CommonJS (CJS), are mechanisms for organizing and reusing code in modular units. ESM is the modern, standardized module system introduced in ES6, while CJS is the older, Node.js-specific module system. Understanding these systems is essential for writing maintainable, reusable, and interoperable JavaScript or TypeScript code.

---

## When to Use

- **Use ESM** when working with modern JavaScript projects, especially for browser-based applications or when leveraging tools like Webpack, Vite, or ESBuild.
- **Use CJS** when maintaining legacy Node.js projects or working with environments that do not yet fully support ESM.
- **Use a hybrid approach** when transitioning a codebase from CJS to ESM, ensuring compatibility with older modules while adopting modern standards.

---

## Do / Don't

### Do:
1. **Do use ESM for new projects** to align with modern JavaScript standards and ensure compatibility with the latest tooling.
2. **Do use `import` and `export` syntax** when working with ESM for clear and concise module declarations.
3. **Do check your runtime environment** (e.g., Node.js version or browser support) to ensure compatibility with the chosen module system.

### Don't:
1. **Don't mix ESM and CJS in the same file**; this can lead to runtime errors and compatibility issues.
2. **Don't use `require` in ESM modules**; use `import` instead, as they are not interchangeable.
3. **Don't ignore package.json settings** like `"type": "module"` or `"exports"` when configuring your project for ESM or CJS.

---

## Core Content

### What Are Module Systems?

Modules are reusable pieces of code that can be imported and exported between files. They help organize large codebases, reduce duplication, and improve maintainability. JavaScript supports two primary module systems:

1. **CommonJS (CJS):**
   - Introduced by Node.js, CJS uses `require` to import modules and `module.exports` or `exports` to export them.
   - Example:
     ```javascript
     // math.js
     module.exports.add = (a, b) => a + b;

     // app.js
     const math = require('./math');
     console.log(math.add(2, 3)); // 5
     ```

2. **ECMAScript Modules (ESM):**
   - Standardized in ES6, ESM uses `import` and `export` syntax.
   - Example:
     ```javascript
     // math.js
     export const add = (a, b) => a + b;

     // app.js
     import { add } from './math.js';
     console.log(add(2, 3)); // 5
     ```

### Key Differences Between CJS and ESM

| Feature                | CommonJS (CJS)         | ECMAScript Modules (ESM) |
|------------------------|------------------------|---------------------------|
| Syntax                 | `require`, `module.exports` | `import`, `export`       |
| Loading                | Synchronous           | Asynchronous (via Promises) |
| Scope                  | File-level            | Strict module scope       |
| Standardization        | Node.js-specific      | ECMAScript standard       |
| Browser Support        | No                    | Yes                       |

### Why Does It Matter?

- **Interoperability:** ESM is a standardized system supported by browsers and Node.js, making it ideal for cross-environment projects.
- **Tooling and Optimization:** Modern build tools (e.g., Webpack, Rollup) are optimized for ESM, enabling tree-shaking and smaller bundle sizes.
- **Future-Proofing:** ESM is the future of JavaScript modules, with growing adoption and support across the ecosystem.

### Transitioning from CJS to ESM

To migrate a project from CJS to ESM:
1. Update your `package.json` to include `"type": "module"`.
2. Replace `require` with `import` and `module.exports` with `export`.
3. Ensure all dependencies are ESM-compatible or use tools like `esm` or `babel` for compatibility.

---

## Links

- **ECMAScript Language Specification:** Official documentation of the ESM standard.
- **Node.js Modules Documentation:** Comprehensive guide on CJS and ESM in Node.js.
- **MDN Web Docs on Modules:** Detailed explanation of JavaScript modules and their usage.
- **Webpack Documentation:** Information on bundling ESM and CJS modules.

---

## Proof / Confidence

- **Industry Standards:** ESM is part of the official ECMAScript standard (ES6) and is supported by modern browsers and Node.js (since v12+).
- **Adoption Trends:** Major libraries (e.g., React, Lodash) have adopted ESM for better compatibility and performance.
- **Tooling Support:** Build tools like Webpack, Rollup, and ESBuild are optimized for ESM, enabling advanced features like tree-shaking.
