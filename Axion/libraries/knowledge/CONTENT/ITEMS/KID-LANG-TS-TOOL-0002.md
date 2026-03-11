---
kid: "KID-LANG-TS-TOOL-0002"
title: "Lint/Format Norms (eslint/prettier)"
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
  - "l"
  - "i"
  - "n"
  - "t"
  - ","
  - " "
  - "f"
  - "o"
  - "r"
  - "m"
  - "a"
  - "t"
  - ","
  - " "
  - "e"
  - "s"
  - "l"
  - "i"
  - "n"
  - "t"
  - ","
  - " "
  - "p"
  - "r"
  - "e"
  - "t"
  - "t"
  - "i"
  - "e"
  - "r"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/tooling/KID-LANG-TS-TOOL-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Lint/Format Norms (eslint/prettier)

```markdown
# Lint/Format Norms (eslint/prettier)

## Summary
Linting and formatting are essential practices for maintaining consistent, error-free code in JavaScript and TypeScript projects. ESLint is a powerful tool for identifying and fixing code issues, while Prettier enforces consistent code formatting. Together, they ensure code quality and readability across teams.

---

## When to Use
- When working on JavaScript/TypeScript projects to enforce coding standards and prevent common errors.
- In collaborative environments to ensure consistent code style across contributors.
- During CI/CD pipelines for automated linting and formatting checks.
- Before committing code to ensure it meets project style and quality guidelines.

---

## Do / Don't

### Do:
1. **Use ESLint for linting and Prettier for formatting** to separate concerns between code quality and style.
2. **Configure ESLint and Prettier to work together** by using the `eslint-config-prettier` plugin to disable conflicting rules.
3. **Automate linting and formatting checks** in your CI/CD pipeline to enforce standards consistently.

### Don't:
1. **Don't manually format code**; rely on Prettier for automated formatting.
2. **Don't use overlapping rules in ESLint and Prettier**, as they can conflict and cause confusion.
3. **Don't ignore linting errors**; address them promptly to maintain code quality.

---

## Core Content

### Key Definitions
- **ESLint**: A static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code.
- **Prettier**: An opinionated code formatter that enforces consistent style by parsing code and reprinting it with its own rules.

### Configuration Overview
To use ESLint and Prettier effectively in tandem:
1. **Install dependencies**:
   ```bash
   npm install eslint prettier eslint-config-prettier eslint-plugin-prettier --save-dev
   ```
2. **Configure ESLint**:
   - Create or update `.eslintrc.json`:
     ```json
     {
       "extends": [
         "eslint:recommended",
         "plugin:prettier/recommended"
       ],
       "parserOptions": {
         "ecmaVersion": 2021,
         "sourceType": "module"
       },
       "rules": {
         "prettier/prettier": ["error"]
       }
     }
     ```
   - The `plugin:prettier/recommended` preset integrates Prettier with ESLint and disables conflicting rules.

3. **Configure Prettier**:
   - Create a `.prettierrc` file:
     ```json
     {
       "semi": true,
       "singleQuote": true,
       "tabWidth": 2,
       "trailingComma": "es5"
     }
     ```
   - Add a `.prettierignore` file to exclude files from formatting:
     ```
     node_modules
     dist
     ```

4. **Add Scripts**:
   - Update `package.json`:
     ```json
     "scripts": {
       "lint": "eslint .",
       "format": "prettier --write ."
     }
     ```

### Parameters and Configuration Options
#### ESLint:
- **`rules`**: Customize linting rules (e.g., `"no-unused-vars": "warn"`).
- **`parserOptions`**: Define ECMAScript version and module type.
- **`plugins`**: Add custom plugins (e.g., `eslint-plugin-react`).

#### Prettier:
- **`semi`**: Add semicolons at the end of statements (`true`/`false`).
- **`singleQuote`**: Use single quotes instead of double quotes (`true`/`false`).
- **`tabWidth`**: Number of spaces per indentation level.
- **`trailingComma`**: Add trailing commas (`"none"`, `"es5"`, `"all"`).

### Common Pitfalls
- **Conflicting Rules**: Always use `eslint-config-prettier` to disable ESLint rules that conflict with Prettier.
- **Ignoring Configuration**: Ensure `.prettierrc` and `.eslintrc.json` are properly set up and committed to version control.
- **Incomplete Automation**: Use tools like `husky` and `lint-staged` to run linting and formatting checks on pre-commit hooks.

---

## Links
- **ESLint Documentation**: Official guide for configuring and using ESLint.
- **Prettier Documentation**: Comprehensive reference for Prettier options and setup.
- **eslint-config-prettier**: Plugin to disable ESLint rules that conflict with Prettier.
- **Husky and lint-staged**: Tools for running pre-commit hooks to enforce linting and formatting.

---

## Proof / Confidence
This approach is based on widely adopted industry practices for JavaScript/TypeScript development. ESLint and Prettier are standard tools in modern development workflows, recommended by frameworks like React, Next.js, and Angular. The integration of these tools is supported by official documentation and community best practices.
```
