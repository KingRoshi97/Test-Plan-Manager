import type { AVCSToolDefinition, CertificationRunType } from "./types.js";

export const TOOL_REGISTRY: AVCSToolDefinition[] = [
  {
    id: "internal",
    name: "AVCS Internal Checks",
    category: "INTERNAL",
    officialSource: "builtin",
    installMethod: "builtin",
    allowedRunTypes: ["smoke", "functional", "security", "performance", "full_certification", "pre_deployment"],
    domains: ["BUILD_INTEGRITY", "FUNCTIONAL", "SECURITY", "PERFORMANCE", "DEPLOYMENT", "ENTERPRISE"],
    defaultTimeoutSeconds: 30,
  },
  {
    id: "lighthouse",
    name: "Google Lighthouse",
    category: "PERFORMANCE",
    officialSource: "https://github.com/GoogleChrome/lighthouse",
    installMethod: "npm",
    allowedRunTypes: ["performance", "full_certification"],
    domains: ["PERFORMANCE", "ACCESSIBILITY", "UI"],
    defaultTimeoutSeconds: 60,
  },
  {
    id: "k6",
    name: "Grafana k6",
    category: "PERFORMANCE",
    officialSource: "https://github.com/grafana/k6",
    installMethod: "binary",
    allowedRunTypes: ["performance", "full_certification"],
    domains: ["PERFORMANCE"],
    defaultTimeoutSeconds: 300,
  },
  {
    id: "trivy",
    name: "Trivy Vulnerability Scanner",
    category: "SECURITY",
    officialSource: "https://github.com/aquasecurity/trivy",
    installMethod: "binary",
    allowedRunTypes: ["security", "full_certification"],
    domains: ["SECURITY", "DEPLOYMENT"],
    defaultTimeoutSeconds: 120,
  },
  {
    id: "zap",
    name: "OWASP ZAP",
    category: "SECURITY",
    officialSource: "https://github.com/zaproxy/zaproxy",
    installMethod: "docker",
    allowedRunTypes: ["security", "full_certification"],
    domains: ["SECURITY"],
    defaultTimeoutSeconds: 300,
  },
  {
    id: "semgrep",
    name: "Semgrep Community Edition",
    category: "SECURITY",
    officialSource: "https://github.com/semgrep/semgrep",
    installMethod: "binary",
    allowedRunTypes: ["security", "full_certification"],
    domains: ["SECURITY"],
    defaultTimeoutSeconds: 120,
  },
  {
    id: "playwright",
    name: "Playwright",
    category: "FUNCTIONAL",
    officialSource: "https://github.com/microsoft/playwright",
    installMethod: "npm",
    allowedRunTypes: ["functional", "full_certification"],
    domains: ["FUNCTIONAL", "UX", "UI"],
    defaultTimeoutSeconds: 120,
  },
  {
    id: "backstop",
    name: "BackstopJS",
    category: "UI",
    officialSource: "https://github.com/garris/BackstopJS",
    installMethod: "npm",
    allowedRunTypes: ["full_certification"],
    domains: ["UI"],
    defaultTimeoutSeconds: 120,
  },
  {
    id: "axe",
    name: "axe-core",
    category: "ACCESSIBILITY",
    officialSource: "https://github.com/dequelabs/axe-core",
    installMethod: "npm",
    allowedRunTypes: ["full_certification"],
    domains: ["ACCESSIBILITY"],
    defaultTimeoutSeconds: 60,
  },
  {
    id: "pa11y",
    name: "Pa11y",
    category: "ACCESSIBILITY",
    officialSource: "https://github.com/pa11y/pa11y",
    installMethod: "npm",
    allowedRunTypes: ["full_certification"],
    domains: ["ACCESSIBILITY"],
    defaultTimeoutSeconds: 60,
  },
  {
    id: "dependency-check",
    name: "OWASP Dependency-Check",
    category: "SECURITY",
    officialSource: "https://github.com/jeremylong/DependencyCheck",
    installMethod: "binary",
    allowedRunTypes: ["security", "full_certification"],
    domains: ["SECURITY"],
    defaultTimeoutSeconds: 300,
  },
];

export function resolveTool(toolId: string): AVCSToolDefinition {
  const tool = TOOL_REGISTRY.find(t => t.id === toolId);
  if (!tool) {
    throw new Error(`AVCS tool not approved: ${toolId}`);
  }
  return tool;
}

export function validateToolForRunType(tool: AVCSToolDefinition, runType: CertificationRunType): void {
  if (!tool.allowedRunTypes.includes(runType)) {
    throw new Error(`Tool ${tool.id} not allowed for run type ${runType}`);
  }
}

export function getToolsByDomain(domain: string): AVCSToolDefinition[] {
  return TOOL_REGISTRY.filter(t => t.domains.includes(domain as any));
}

export function getAllToolIds(): string[] {
  return TOOL_REGISTRY.map(t => t.id);
}
