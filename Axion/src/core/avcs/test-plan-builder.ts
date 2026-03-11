import type { CertificationRunType, AVCSTestPlan, AVCSTestDomain } from "./types.js";
import { TEST_CATALOG, getTestsByRunType, getMVPTests } from "./test-catalog.js";
import { resolveTool } from "./tool-registry.js";

export interface TestPlanOptions {
  mvpOnly?: boolean;
  includeDomains?: AVCSTestDomain[];
  excludeTests?: string[];
}

const DOMAIN_ORDER: AVCSTestDomain[] = [
  "BUILD_INTEGRITY",
  "FUNCTIONAL",
  "SECURITY",
  "PERFORMANCE",
  "DEPLOYMENT",
  "UI",
  "UX",
  "ACCESSIBILITY",
  "ENTERPRISE",
];

export function buildTestPlan(
  runType: CertificationRunType,
  options: TestPlanOptions = {},
): AVCSTestPlan {
  const { mvpOnly = true, includeDomains, excludeTests } = options;

  let tests = getTestsByRunType(runType);

  if (mvpOnly) {
    const mvpIds = new Set(getMVPTests().map(t => t.id));
    tests = tests.filter(t => mvpIds.has(t.id));
  }

  if (includeDomains && includeDomains.length > 0) {
    const domainSet = new Set(includeDomains);
    tests = tests.filter(t => domainSet.has(t.domain));
  }

  if (excludeTests && excludeTests.length > 0) {
    const excludeSet = new Set(excludeTests);
    tests = tests.filter(t => !excludeSet.has(t.id));
  }

  tests.sort((a, b) => {
    const aIdx = DOMAIN_ORDER.indexOf(a.domain);
    const bIdx = DOMAIN_ORDER.indexOf(b.domain);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.id.localeCompare(b.id);
  });

  const requiredToolSet = new Set<string>();
  for (const test of tests) {
    for (const toolId of test.primaryTools) {
      requiredToolSet.add(toolId);
    }
  }

  const requiredTools = Array.from(requiredToolSet);

  let estimatedDurationSeconds = 0;
  for (const toolId of requiredTools) {
    try {
      const tool = resolveTool(toolId);
      estimatedDurationSeconds += tool.defaultTimeoutSeconds;
    } catch {
      estimatedDurationSeconds += 30;
    }
  }

  const domainCoverage: Record<string, number> = {};
  for (const domain of DOMAIN_ORDER) {
    const totalInDomain = TEST_CATALOG.filter(t => t.domain === domain).length;
    const selectedInDomain = tests.filter(t => t.domain === domain).length;
    if (totalInDomain > 0) {
      domainCoverage[domain] = Math.round((selectedInDomain / totalInDomain) * 100);
    }
  }

  return {
    id: `PLAN-${runType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    runType,
    tests,
    estimatedDurationSeconds,
    requiredTools,
    domainCoverage: domainCoverage as Record<AVCSTestDomain, number>,
    mvpOnly,
    createdAt: new Date().toISOString(),
  };
}

export function summarizePlan(plan: AVCSTestPlan): {
  totalTests: number;
  domainBreakdown: Record<string, number>;
  toolsRequired: string[];
  estimatedMinutes: number;
} {
  const domainBreakdown: Record<string, number> = {};
  for (const test of plan.tests) {
    domainBreakdown[test.domain] = (domainBreakdown[test.domain] || 0) + 1;
  }

  return {
    totalTests: plan.tests.length,
    domainBreakdown,
    toolsRequired: plan.requiredTools,
    estimatedMinutes: Math.ceil(plan.estimatedDurationSeconds / 60),
  };
}
