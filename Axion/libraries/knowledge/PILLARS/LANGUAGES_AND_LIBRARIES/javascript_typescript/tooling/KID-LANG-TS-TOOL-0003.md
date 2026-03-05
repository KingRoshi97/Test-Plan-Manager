---
kid: "KID-LANG-TS-TOOL-0003"
title: "Package Lock Discipline (npm/pnpm/yarn)"
type: procedure
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript]
subdomains: []
tags: [package-lock, npm, pnpm, yarn]
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

# Package Lock Discipline (npm/pnpm/yarn)

```markdown
# Package Lock Discipline (npm/pnpm/yarn)

## Summary
This procedure outlines the best practices for maintaining package lock files (`package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`) in JavaScript/TypeScript projects. Proper lock file discipline ensures consistent dependency resolution across environments, reduces build errors, and mitigates security risks caused by unintentional dependency updates.

## When to Use
- When initializing a new project or adding/updating dependencies in an existing project.
- During CI/CD pipeline configuration to ensure reproducible builds.
- When debugging dependency-related issues or resolving version conflicts.
- When collaborating in a team environment to ensure consistent local development environments.

## Do / Don't
### Do:
1. **Commit lock files to version control**: Always include lock files in your repository to ensure consistent dependency resolution.
2. **Use the same package manager across the team**: Ensure all team members use the same package manager (`npm`, `pnpm`, or `yarn`) to avoid lock file conflicts.
3. **Regenerate lock files periodically**: Regularly update lock files to incorporate the latest security patches and bug fixes in dependencies.

### Don't:
1. **Don't manually edit lock files**: Lock files should only be modified by the package manager to avoid introducing errors.
2. **Don't delete and regenerate lock files without reason**: This can lead to unexpected dependency updates and potential compatibility issues.
3. **Don't ignore lock file conflicts in version control**: Resolve conflicts carefully to avoid breaking the dependency tree.

## Core Content

### Prerequisites
- A JavaScript/TypeScript project with a `package.json` file.
- A package manager installed (`npm`, `pnpm`, or `yarn`).
- Version control system (e.g., Git) configured for the project.

---

### Step 1: Install Dependencies Consistently
1. Use the appropriate command for your package manager to install dependencies:
   - `npm install`
   - `pnpm install`
   - `yarn install`
2. Verify that the lock file (`package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`) is updated or created.
   
**Expected Outcome**: Dependencies are installed, and the lock file reflects the exact versions resolved.

**Common Failure Modes**:
- Mismatched package manager versions: Ensure all team members use the same package manager version.
- Missing lock file: If the lock file is not generated, check for write permissions or package manager misconfiguration.

---

### Step 2: Commit the Lock File to Version Control
1. Stage the lock file using your version control system:
   - `git add package-lock.json`
   - `git add pnpm-lock.yaml`
   - `git add yarn.lock`
2. Commit the changes:
   - `git commit -m "Update lock file"`

**Expected Outcome**: The lock file is tracked in version control.

**Common Failure Modes**:
- Ignored lock files: Check `.gitignore` for entries that exclude lock files.
- Conflicts during commit: Resolve conflicts carefully to ensure the dependency tree remains valid.

---

### Step 3: Resolve Lock File Conflicts
1. When a lock file conflict occurs, do not delete and regenerate the file. Instead:
   - Use your version control system's merge tools to inspect the changes.
   - Retain the correct dependency versions and resolve conflicts manually.
2. After resolving the conflict, run the install command again to ensure the lock file is consistent.

**Expected Outcome**: The lock file is resolved without introducing dependency issues.

**Common Failure Modes**:
- Incorrect conflict resolution: Test the application after resolving conflicts to ensure dependencies function correctly.
- Overwriting valid changes: Avoid overwriting updates made by teammates.

---

### Step 4: Periodically Update Dependencies
1. Use the package manager's update command to refresh dependencies:
   - `npm update`
   - `pnpm update`
   - `yarn upgrade`
2. Review the changes in the lock file and test the application for compatibility.

**Expected Outcome**: Dependencies are updated, and the lock file reflects the latest versions.

**Common Failure Modes**:
- Breaking changes in dependencies: Review changelogs and test thoroughly after updates.
- Neglecting updates: Outdated dependencies can lead to security vulnerabilities.

## Links
- **Semantic Versioning Specification**: Guidelines on versioning dependencies for compatibility.
- **npm Documentation on Package Lock Files**: Official documentation on `package-lock.json`.
- **pnpm Lockfile Documentation**: Details on `pnpm-lock.yaml` and its usage.
- **yarn Lockfile Reference**: Explanation of `yarn.lock` and best practices.

## Proof / Confidence
- **Industry Standards**: Lock files are recommended by npm, pnpm, and yarn to ensure reproducible builds.
- **Common Practice**: Most modern CI/CD pipelines rely on lock files to guarantee consistent dependency resolution.
- **Security Benchmarks**: Regular lock file updates mitigate vulnerabilities in transitive dependencies.
```
