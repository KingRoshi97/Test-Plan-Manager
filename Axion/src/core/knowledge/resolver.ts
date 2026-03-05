import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";

export interface KIDEntry {
  kid: string;
  title: string;
  type: string;
  pillar: string;
  path: string;
  use_policy: string;
  maturity: string;
  executor_access: string;
  domains?: string[];
  tags?: string[];
  coreContent?: string;
}

export interface KnowledgeContext {
  resolvedKids: KIDEntry[];
  domainMap: Record<string, string[]>;
  citationRefs: string[];
  bundleId: string | null;
  resolvedAt: string;
}

interface KnowledgeIndex {
  schema_version: string;
  total_items: number;
  items: KIDEntry[];
}

interface TaxonomyDomain {
  description: string;
}

interface TaxonomyGroup {
  domains: Record<string, TaxonomyDomain>;
}

interface TaxonomyPillar {
  description: string;
  groups: Record<string, TaxonomyGroup>;
}

interface Taxonomy {
  pillars: Record<string, TaxonomyPillar>;
}

interface Bundle {
  bundle_id: string;
  name: string;
  description: string;
  kids: string[];
  filter_rules: Record<string, unknown>;
  tags: string[];
}

interface BundlesIndex {
  bundles: Array<{
    bundle_id: string;
    path: string;
    category: string;
  }>;
}

const ROUTING_TO_BUNDLE: Record<string, string> = {
  web_app: "WEB_APP_BASIC",
  web: "WEB_APP_BASIC",
  api: "API_SERVICE_BASIC",
  api_service: "API_SERVICE_BASIC",
  mobile: "MOBILE_APP_BASIC",
  mobile_app: "MOBILE_APP_BASIC",
  saas: "FULLSTACK_SAAS",
  fullstack: "FULLSTACK_SAAS",
  chat: "REALTIME_CHAT",
  realtime: "REALTIME_CHAT",
};

const CONSTRAINT_TO_DOMAINS: Record<string, string[]> = {
  requires_auth: ["security_fundamentals", "identity_access_management"],
  manages_data: ["databases", "storage_fundamentals"],
  has_integrations: ["apis_integrations"],
  data_enabled: ["databases", "distributed_systems", "caching"],
  realtime: ["distributed_systems"],
  compliance: ["compliance_governance"],
};

const ROUTING_CATEGORY_DOMAINS: Record<string, string[]> = {
  software: ["architecture_design", "testing_qa", "ci_cd_devops", "observability_sre"],
  data: ["databases", "distributed_systems", "caching", "search_retrieval"],
  docs: ["architecture_design"],
};

function extractKIDCoreContent(fullPath: string): string {
  try {
    if (!existsSync(fullPath)) return "";
    const raw = readFileSync(fullPath, "utf-8");
    const coreMatch = raw.match(/## Core Content\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/);
    if (!coreMatch) return "";
    const content = coreMatch[1].trim();
    if (content.includes("Draft content") || content.includes("to be populated")) return "";
    return content;
  } catch {
    return "";
  }
}

function matchBundleId(
  routing: Record<string, unknown>,
): string | null {
  const category = String(routing.category ?? "").toLowerCase();
  const typePreset = String(routing.type_preset ?? "").toLowerCase();
  const buildTarget = String(routing.build_target ?? "").toLowerCase();

  for (const key of [typePreset, category, buildTarget]) {
    for (const [pattern, bundleId] of Object.entries(ROUTING_TO_BUNDLE)) {
      if (key.includes(pattern)) return bundleId;
    }
  }

  return null;
}

function collectRelevantDomains(
  routing: Record<string, unknown>,
  constraints: Record<string, unknown>,
): Set<string> {
  const domains = new Set<string>();

  const category = String(routing.category ?? "").toLowerCase();
  const categoryDomains = ROUTING_CATEGORY_DOMAINS[category];
  if (categoryDomains) {
    categoryDomains.forEach((d) => domains.add(d));
  }

  for (const [constraintKey, domainList] of Object.entries(CONSTRAINT_TO_DOMAINS)) {
    const val = constraints[constraintKey] ?? routing[constraintKey];
    if (val === true || val === "true" || val === "yes") {
      domainList.forEach((d) => domains.add(d));
    }
  }

  domains.add("architecture_design");

  return domains;
}

function kidMatchesDomains(kid: KIDEntry, targetDomains: Set<string>, taxonomy: Taxonomy): boolean {
  const kidPath = kid.path.toLowerCase();

  for (const domain of targetDomains) {
    if (kidPath.includes(domain)) return true;
  }

  if (kid.domains) {
    for (const d of kid.domains) {
      if (targetDomains.has(d)) return true;
    }
  }

  if (kid.tags) {
    for (const tag of kid.tags) {
      if (targetDomains.has(tag)) return true;
    }
  }

  return false;
}

export function resolveKnowledge(
  baseDir: string,
  routing: Record<string, unknown>,
  constraints: Record<string, unknown>,
): KnowledgeContext {
  const knowledgeBase = join(baseDir, "libraries", "knowledge");
  const indexPath = join(knowledgeBase, "INDEX", "knowledge.index.json");
  const taxonomyPath = join(knowledgeBase, "INDEX", "taxonomy.json");

  if (!existsSync(indexPath)) {
    return {
      resolvedKids: [],
      domainMap: {},
      citationRefs: [],
      bundleId: null,
      resolvedAt: new Date().toISOString(),
    };
  }

  const index = readJson<KnowledgeIndex>(indexPath);
  let taxonomy: Taxonomy = { pillars: {} };
  try {
    taxonomy = readJson<Taxonomy>(taxonomyPath);
  } catch { /* empty */ }

  const bundleId = matchBundleId(routing);
  const targetDomains = collectRelevantDomains(routing, constraints);

  let bundleKidIds = new Set<string>();
  if (bundleId) {
    const bundlesIndexPath = join(knowledgeBase, "INDEX", "bundles.index.json");
    try {
      const bundlesIndex = readJson<BundlesIndex>(bundlesIndexPath);
      const bundleEntry = bundlesIndex.bundles.find((b) => b.bundle_id === bundleId);
      if (bundleEntry) {
        const bundlePath = join(knowledgeBase, bundleEntry.path);
        if (existsSync(bundlePath)) {
          const bundle = readJson<Bundle>(bundlePath);
          if (bundle.kids && bundle.kids.length > 0) {
            bundleKidIds = new Set(bundle.kids);
          }
          if (bundle.tags) {
            bundle.tags.forEach((t) => targetDomains.add(t));
          }
        }
      }
    } catch { /* empty */ }
  }

  const resolved: KIDEntry[] = [];
  const domainMap: Record<string, string[]> = {};

  for (const kid of index.items) {
    const inBundle = bundleKidIds.size > 0 && bundleKidIds.has(kid.kid);
    const domainMatch = kidMatchesDomains(kid, targetDomains, taxonomy);

    if (!inBundle && !domainMatch) continue;

    const fullPath = join(knowledgeBase, kid.path);
    const coreContent = extractKIDCoreContent(fullPath);

    const entry: KIDEntry = { ...kid, coreContent };
    resolved.push(entry);

    const kidDomain = kid.path.split("/").slice(-2, -1)[0] ?? "general";
    if (!domainMap[kidDomain]) domainMap[kidDomain] = [];
    domainMap[kidDomain].push(kid.kid);
  }

  resolved.sort((a, b) => {
    const maturityOrder: Record<string, number> = { golden: 0, verified: 1, reviewed: 2, draft: 3 };
    const ma = maturityOrder[a.maturity] ?? 4;
    const mb = maturityOrder[b.maturity] ?? 4;
    if (ma !== mb) return ma - mb;
    return a.kid.localeCompare(b.kid);
  });

  const citationRefs = resolved.map((k) => k.kid);

  return {
    resolvedKids: resolved,
    domainMap,
    citationRefs,
    bundleId,
    resolvedAt: new Date().toISOString(),
  };
}

export function summarizeKnowledgeForPrompt(
  knowledge: KnowledgeContext,
  maxKids: number = 15,
): string {
  if (knowledge.resolvedKids.length === 0) {
    return "";
  }

  const kidsToInclude = knowledge.resolvedKids.slice(0, maxKids);
  const lines: string[] = [];

  lines.push("## Knowledge Library Context");
  lines.push(`Bundle: ${knowledge.bundleId ?? "none"}`);
  lines.push(`Resolved KIDs: ${knowledge.resolvedKids.length} (showing top ${kidsToInclude.length})`);
  lines.push("");

  const byType: Record<string, KIDEntry[]> = {};
  for (const kid of kidsToInclude) {
    if (!byType[kid.type]) byType[kid.type] = [];
    byType[kid.type].push(kid);
  }

  for (const [type, kids] of Object.entries(byType).sort()) {
    lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}s`);
    for (const kid of kids) {
      lines.push(`- **${kid.kid}**: ${kid.title}`);
      if (kid.coreContent && kid.coreContent.length > 10) {
        const truncated = kid.coreContent.length > 300
          ? kid.coreContent.substring(0, 300) + "..."
          : kid.coreContent;
        lines.push(`  > ${truncated.replace(/\n/g, "\n  > ")}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function getKnowledgeCitationsForDomain(
  knowledge: KnowledgeContext,
  domainKeywords: string[],
): KIDEntry[] {
  return knowledge.resolvedKids.filter((kid) => {
    const kidText = `${kid.title} ${kid.path} ${(kid.domains ?? []).join(" ")} ${(kid.tags ?? []).join(" ")}`.toLowerCase();
    return domainKeywords.some((kw) => kidText.includes(kw.toLowerCase()));
  });
}
