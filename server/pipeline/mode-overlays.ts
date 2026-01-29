import type { AssemblyCategory, AssemblyMode } from "@shared/schema";
import type { ProjectPackageSummary } from "../presets";

export interface ModeOverlayOptions {
  category: AssemblyCategory;
  mode: AssemblyMode;
  domain: string;
  projectSummary?: ProjectPackageSummary;
}

type OverlayRenderer = (opts: ModeOverlayOptions) => string;

const MODE_OVERLAY_RENDERERS: Record<AssemblyMode, OverlayRenderer> = {
  new_build: renderNewBuildOverlay,
  existing_upgrade: renderExistingUpgradeOverlay,
  ui_overhaul: renderUIOverhaulOverlay,
  refactor_hardening: renderRefactorHardeningOverlay,
  add_feature_module: renderAddFeatureModuleOverlay,
};

export function renderModeOverlay(opts: ModeOverlayOptions): string {
  const renderer = MODE_OVERLAY_RENDERERS[opts.mode];
  if (!renderer) {
    return "";
  }
  return renderer(opts);
}

function renderNewBuildOverlay(opts: ModeOverlayOptions): string {
  const lines: string[] = [
    "## Mode Context: New Build",
    "",
    "This documentation is generated for a **new project build**.",
    "",
    "### Focus Areas",
    "- Design decisions should prioritize simplicity and MVP scope",
    "- Establish clear naming conventions and patterns early",
    "- Document UNKNOWN values explicitly for agent clarification",
    "- Prefer convention over configuration where possible",
    "",
  ];
  
  if (opts.domain === "uxui") {
    lines.push(
      "### UX/UI Considerations",
      "- Define core screens and navigation flow",
      "- Establish design tokens (colors, spacing, typography)",
      "- Prioritize responsive layouts from the start",
      ""
    );
  }
  
  if (opts.domain === "api") {
    lines.push(
      "### API Considerations",
      "- Design stable v1 routes with consistent error envelopes",
      "- Use reason codes for all error responses",
      "- Include OpenAPI/Zod schema documentation",
      ""
    );
  }
  
  if (opts.domain === "security") {
    lines.push(
      "### Security Considerations",
      "- Implement authentication before shipping features",
      "- Use secure defaults for all configurations",
      "- Plan for rate limiting and input validation",
      ""
    );
  }
  
  return lines.join("\n");
}

function renderExistingUpgradeOverlay(opts: ModeOverlayOptions): string {
  const lines: string[] = [
    "## Mode Context: Existing Upgrade",
    "",
    "This documentation is generated for an **existing project upgrade**.",
    "",
    "### Compatibility Requirements",
    "- Preserve existing API contracts unless explicitly upgrading",
    "- Document breaking changes with migration paths",
    "- Maintain backward compatibility where feasible",
    "",
    "### Migration Planning",
    "- Identify deprecated patterns to replace",
    "- Create incremental migration steps",
    "- Test against existing data and edge cases",
    "",
    "### Regression Awareness",
    "- List critical paths that must not break",
    "- Document existing test coverage gaps",
    "- Add regression test requirements for changed areas",
    "",
  ];
  
  if (opts.projectSummary) {
    lines.push(
      "### Detected Project Context",
      `- **Framework**: ${opts.projectSummary.framework || "Unknown"}`,
      `- **File Count**: ${opts.projectSummary.fileCount || "Unknown"}`,
      ""
    );
    
    if (opts.projectSummary.warnings?.length) {
      lines.push("### Project Warnings");
      for (const warning of opts.projectSummary.warnings) {
        lines.push(`- ${warning}`);
      }
      lines.push("");
    }
  }
  
  return lines.join("\n");
}

function renderUIOverhaulOverlay(opts: ModeOverlayOptions): string {
  const lines: string[] = [
    "## Mode Context: UI Overhaul",
    "",
    "This documentation is generated for a **UI/UX redesign project**.",
    "",
    "### Design System Focus",
    "- Audit existing components and create inventory",
    "- Define design tokens: colors, spacing, typography, shadows",
    "- Establish component naming and organization conventions",
    "",
    "### Screen Inventory",
    "- Document all existing screens and their purposes",
    "- Identify screens needing complete redesign vs. polish",
    "- Map navigation flows and identify bottlenecks",
    "",
    "### Copy and Content",
    "- Review all user-facing text for clarity",
    "- Establish voice and tone guidelines",
    "- Identify localization requirements",
    "",
    "### Accessibility",
    "- Audit current accessibility compliance",
    "- Define WCAG target level",
    "- Document keyboard navigation requirements",
    "",
  ];
  
  if (opts.projectSummary) {
    lines.push(
      "### Existing UI Context",
      `- **Framework**: ${opts.projectSummary.framework || "Unknown"}`,
      ""
    );
  }
  
  return lines.join("\n");
}

function renderRefactorHardeningOverlay(opts: ModeOverlayOptions): string {
  const lines: string[] = [
    "## Mode Context: Refactor / Hardening",
    "",
    "This documentation is generated for a **code quality and security hardening** project.",
    "",
    "### Stability Targets",
    "- Define uptime and reliability SLOs",
    "- Identify single points of failure",
    "- Document recovery procedures",
    "",
    "### Performance Targets",
    "- Set latency budgets for critical paths",
    "- Identify performance bottlenecks",
    "- Define caching strategy",
    "",
    "### Security Hardening",
    "- Audit authentication and authorization",
    "- Review input validation and sanitization",
    "- Check for secrets exposure and rotation",
    "",
    "### Test Gates",
    "- Define minimum test coverage requirements",
    "- Identify critical paths requiring integration tests",
    "- Document manual testing checklist",
    "",
    "### Rollout Strategy",
    "- Define feature flag requirements",
    "- Plan staged rollout approach",
    "- Document rollback procedures",
    "",
  ];
  
  if (opts.projectSummary?.warnings?.length) {
    lines.push("### Detected Risk Areas");
    for (const warning of opts.projectSummary.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push("");
  }
  
  return lines.join("\n");
}

function renderAddFeatureModuleOverlay(opts: ModeOverlayOptions): string {
  const lines: string[] = [
    "## Mode Context: Add Feature Module",
    "",
    "This documentation is generated for **adding new functionality** to an existing project.",
    "",
    "### Integration Points",
    "- Identify where new feature connects to existing code",
    "- Document required API extensions",
    "- Map data model changes needed",
    "",
    "### Data Model Changes",
    "- Document new entities and relationships",
    "- Plan database migrations",
    "- Consider backward compatibility of schema changes",
    "",
    "### Acceptance Criteria",
    "- Define clear success metrics for the feature",
    "- List edge cases and error scenarios",
    "- Document user stories and acceptance tests",
    "",
    "### Feature Scope",
    "- Define MVP boundaries clearly",
    "- List explicit non-goals",
    "- Identify future enhancement opportunities",
    "",
  ];
  
  if (opts.projectSummary) {
    lines.push(
      "### Existing Project Context",
      `- **Framework**: ${opts.projectSummary.framework || "Unknown"}`,
      ""
    );
    
    if (opts.projectSummary.entrypoints?.length) {
      lines.push("### Integration Targets");
      for (const entry of opts.projectSummary.entrypoints.slice(0, 5)) {
        lines.push(`- \`${entry}\``);
      }
      lines.push("");
    }
  }
  
  return lines.join("\n");
}

export function generateMigrationNotes(projectSummary?: ProjectPackageSummary): string {
  const lines: string[] = [
    "# Migration Notes",
    "",
    "This document outlines the migration strategy for upgrading the existing project.",
    "",
    "## Current State",
    "",
  ];
  
  if (projectSummary) {
    lines.push(
      `- **Framework**: ${projectSummary.framework || "UNKNOWN"}`,
      `- **File Count**: ${projectSummary.fileCount || "UNKNOWN"}`,
      ""
    );
    
    if (projectSummary.dependencies && Object.keys(projectSummary.dependencies).length > 0) {
      lines.push("### Key Dependencies");
      const deps = Object.entries(projectSummary.dependencies).slice(0, 10);
      for (const [name, version] of deps) {
        lines.push(`- \`${name}@${version}\``);
      }
      lines.push("");
    }
  } else {
    lines.push("- Project details: PENDING_ANALYSIS");
    lines.push("");
  }
  
  lines.push(
    "## Migration Steps",
    "",
    "1. [ ] Review current architecture and identify pain points",
    "2. [ ] Create backup and establish rollback procedure",
    "3. [ ] Update dependencies incrementally with testing",
    "4. [ ] Refactor deprecated patterns",
    "5. [ ] Update documentation and README",
    "6. [ ] Run full test suite and manual verification",
    "",
    "## Breaking Changes",
    "",
    "Document any breaking changes here:",
    "",
    "- TBD based on analysis",
    "",
    "## Rollback Plan",
    "",
    "If migration fails:",
    "",
    "1. Restore from pre-migration backup",
    "2. Revert dependency changes",
    "3. Document failure points for retry",
    ""
  );
  
  return lines.join("\n");
}

export function generateRegressionChecklist(projectSummary?: ProjectPackageSummary): string {
  const lines: string[] = [
    "# Regression Checklist",
    "",
    "Use this checklist to verify that changes do not break existing functionality.",
    "",
    "## Critical Paths",
    "",
    "- [ ] Application starts without errors",
    "- [ ] Authentication flow works correctly",
    "- [ ] Core user journeys complete successfully",
    "- [ ] API endpoints return expected responses",
    "- [ ] Database operations function correctly",
    "",
    "## UI/UX Verification",
    "",
    "- [ ] All pages render without console errors",
    "- [ ] Navigation works as expected",
    "- [ ] Forms submit correctly",
    "- [ ] Error states display appropriately",
    "- [ ] Responsive layouts function on mobile",
    "",
    "## Integration Points",
    "",
    "- [ ] External API integrations function",
    "- [ ] Webhook handlers respond correctly",
    "- [ ] Background jobs process successfully",
    "",
    "## Performance",
    "",
    "- [ ] Page load times within acceptable range",
    "- [ ] API response times within SLO",
    "- [ ] No memory leaks in long-running processes",
    "",
  ];
  
  if (projectSummary?.scripts) {
    const testScript = projectSummary.scripts["test"];
    const lintScript = projectSummary.scripts["lint"];
    
    if (testScript || lintScript) {
      lines.push("## Automated Checks");
      lines.push("");
      if (testScript) {
        lines.push(`- [ ] Run \`npm test\` (${testScript})`);
      }
      if (lintScript) {
        lines.push(`- [ ] Run \`npm run lint\` (${lintScript})`);
      }
      lines.push("");
    }
  }
  
  return lines.join("\n");
}

export function generateUIChangelog(): string {
  return [
    "# UI Changelog",
    "",
    "Document all UI changes made during the overhaul.",
    "",
    "## Components Updated",
    "",
    "| Component | Change Type | Description |",
    "|-----------|------------|-------------|",
    "| TBD | TBD | TBD |",
    "",
    "## Design Token Changes",
    "",
    "| Token | Old Value | New Value |",
    "|-------|-----------|-----------|",
    "| TBD | TBD | TBD |",
    "",
    "## Screens Modified",
    "",
    "- [ ] List screens here as they are updated",
    "",
    "## Breaking UI Changes",
    "",
    "Document any UI changes that may affect user workflows:",
    "",
    "- None yet",
    "",
  ].join("\n");
}

export function generateComponentAdoptionPlan(): string {
  return [
    "# Component Adoption Plan",
    "",
    "This document outlines the strategy for migrating to the new component system.",
    "",
    "## Component Inventory",
    "",
    "### Existing Components",
    "",
    "| Component | Status | Priority | Notes |",
    "|-----------|--------|----------|-------|",
    "| TBD | TBD | TBD | TBD |",
    "",
    "### New Components Needed",
    "",
    "| Component | Purpose | Priority |",
    "|-----------|---------|----------|",
    "| TBD | TBD | TBD |",
    "",
    "## Migration Order",
    "",
    "1. Foundation components (Button, Input, Card)",
    "2. Layout components (Header, Sidebar, Footer)",
    "3. Feature components (specific to app)",
    "4. Page-level compositions",
    "",
    "## Design System Integration",
    "",
    "- [ ] Define color palette",
    "- [ ] Establish typography scale",
    "- [ ] Create spacing system",
    "- [ ] Document component API patterns",
    "",
  ].join("\n");
}

export function generateHardeningPlan(): string {
  return [
    "# Hardening Plan",
    "",
    "This document outlines the security and reliability improvements.",
    "",
    "## Security Improvements",
    "",
    "### Authentication",
    "",
    "- [ ] Review session management",
    "- [ ] Audit password policies",
    "- [ ] Check token expiration",
    "",
    "### Authorization",
    "",
    "- [ ] Review role-based access controls",
    "- [ ] Audit resource-level permissions",
    "- [ ] Check for privilege escalation paths",
    "",
    "### Input Validation",
    "",
    "- [ ] Sanitize all user inputs",
    "- [ ] Validate request schemas",
    "- [ ] Check for injection vulnerabilities",
    "",
    "## Reliability Improvements",
    "",
    "### Error Handling",
    "",
    "- [ ] Add proper error boundaries",
    "- [ ] Implement graceful degradation",
    "- [ ] Add retry logic for transient failures",
    "",
    "### Monitoring",
    "",
    "- [ ] Add health check endpoints",
    "- [ ] Implement structured logging",
    "- [ ] Set up alerting thresholds",
    "",
    "## Performance Improvements",
    "",
    "- [ ] Identify and optimize slow queries",
    "- [ ] Add caching where appropriate",
    "- [ ] Optimize asset loading",
    "",
  ].join("\n");
}

export function generateTestStrategy(): string {
  return [
    "# Test Strategy",
    "",
    "This document outlines the testing approach for the hardening project.",
    "",
    "## Coverage Goals",
    "",
    "- Unit tests: 80% coverage on business logic",
    "- Integration tests: All API endpoints",
    "- E2E tests: Critical user journeys",
    "",
    "## Test Categories",
    "",
    "### Unit Tests",
    "",
    "- [ ] Service layer functions",
    "- [ ] Utility functions",
    "- [ ] Data transformations",
    "",
    "### Integration Tests",
    "",
    "- [ ] API endpoint responses",
    "- [ ] Database operations",
    "- [ ] External service integrations",
    "",
    "### End-to-End Tests",
    "",
    "- [ ] User registration flow",
    "- [ ] Authentication flow",
    "- [ ] Core feature workflows",
    "",
    "## Test Data Strategy",
    "",
    "- Use factories for consistent test data",
    "- Isolate test database per run",
    "- Clean up test data after runs",
    "",
    "## CI/CD Integration",
    "",
    "- Run tests on every PR",
    "- Block merges on test failures",
    "- Generate coverage reports",
    "",
  ].join("\n");
}
