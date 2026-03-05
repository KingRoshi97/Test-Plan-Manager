import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface RunProfile {
  profile_id: string;
  name: string;
}

export interface Capability {
  capability_id: string;
  name: string;
  category: string;
}

export interface QuotaLimits {
  runs?: { per_day?: number; concurrent_max?: number };
  tokens?: { per_run_max?: number; per_day_max?: number };
  compute?: { runtime_minutes_max?: number };
  storage?: { artifacts_mb_max?: number; kits_mb_max?: number };
}

export interface QuotaSet {
  quota_set_id: string;
  limits: QuotaLimits;
  enforcement: { on_exceed: string };
  created_at: string;
  updated_at: string;
  owner: string;
}

export interface NotificationEventType {
  event_type: string;
  severity_levels: string[];
}

export interface NotificationDestination {
  destination_id: string;
  kind: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface NotificationRouteMatch {
  event_type: string;
  severity: string[];
}

export interface NotificationRoute {
  route_id: string;
  match: NotificationRouteMatch;
  deliver: { destination_ids: string[] };
  throttle: { mode: string; window_seconds: number; dedupe_key: string };
}

export type PolicyHookPoint =
  | "RUN_START"
  | "PIN_RESOLUTION"
  | "ADAPTER_SELECTION"
  | "QUOTA_CHECK"
  | "GATE_OVERRIDE"
  | "KIT_EXPORT";

export interface PolicyHookDecision {
  decision: "ALLOW" | "DENY" | "WARN";
  reason: string;
  hook_point: PolicyHookPoint;
}

export interface SystemLibrary {
  profiles: RunProfile[];
  capabilities: Capability[];
  quotaSets: QuotaSet[];
  eventTypes: NotificationEventType[];
  destinations: NotificationDestination[];
  routes: NotificationRoute[];
}

export interface SystemDoc {
  filename: string;
  frontmatter: Record<string, string>;
  content: string;
}

function readJsonSafe<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };
  const lines = match[1].split("\n");
  const fm: Record<string, string> = {};
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return { frontmatter: fm, content: match[2] };
}

const SYSTEM_LIB_REL = "Axion/libraries/system";

let cached: SystemLibrary | null = null;
let cacheRoot: string | null = null;

export function loadSystemLibrary(repoRoot: string): SystemLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, SYSTEM_LIB_REL, "registries");

  const profilesFile = readJsonSafe<{ profiles: RunProfile[] }>(join(base, "run_profiles.v1.json"));
  const capabilitiesFile = readJsonSafe<{ capabilities: Capability[] }>(join(base, "capabilities.v1.json"));
  const quotaSetsFile = readJsonSafe<{ quota_sets: QuotaSet[] }>(join(base, "quota_sets.v1.json"));
  const eventTypesFile = readJsonSafe<{ event_types: NotificationEventType[] }>(join(base, "notification_event_types.v1.json"));
  const destinationsFile = readJsonSafe<{ destinations: NotificationDestination[] }>(join(base, "notification_destinations.v1.json"));
  const routesFile = readJsonSafe<{ routes: NotificationRoute[] }>(join(base, "notification_routes.v1.json"));

  cached = {
    profiles: profilesFile?.profiles ?? [],
    capabilities: capabilitiesFile?.capabilities ?? [],
    quotaSets: quotaSetsFile?.quota_sets ?? [],
    eventTypes: eventTypesFile?.event_types ?? [],
    destinations: destinationsFile?.destinations ?? [],
    routes: routesFile?.routes ?? [],
  };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getRunProfile(repoRoot: string, profileId: string): RunProfile | null {
  const lib = loadSystemLibrary(repoRoot);
  return lib.profiles.find((p) => p.profile_id === profileId) ?? null;
}

export function checkQuota(
  repoRoot: string,
  quotaSetId: string,
  metric: string,
  currentValue: number,
): { exceeded: boolean; limit: number | null; metric: string; current: number } {
  const lib = loadSystemLibrary(repoRoot);
  const qs = lib.quotaSets.find((q) => q.quota_set_id === quotaSetId);
  if (!qs) return { exceeded: false, limit: null, metric, current: currentValue };

  const limits = qs.limits as Record<string, Record<string, number>>;
  for (const [category, values] of Object.entries(limits)) {
    for (const [key, limit] of Object.entries(values)) {
      const fullKey = `${category}.${key}`;
      if (fullKey === metric && currentValue > limit) {
        return { exceeded: true, limit, metric, current: currentValue };
      }
    }
  }

  return { exceeded: false, limit: null, metric, current: currentValue };
}

export function resolveNotificationRoutes(
  repoRoot: string,
  eventType: string,
): NotificationRoute[] {
  const lib = loadSystemLibrary(repoRoot);
  return lib.routes.filter((r) => r.match.event_type === eventType);
}

export function evaluatePolicyHook(
  _hookPoint: PolicyHookPoint,
  _context: Record<string, unknown>,
): PolicyHookDecision {
  return {
    decision: "ALLOW",
    reason: "Default policy: all hooks pass",
    hook_point: _hookPoint,
  };
}

export function loadSystemDocs(repoRoot: string): SystemDoc[] {
  const base = join(repoRoot, SYSTEM_LIB_REL);
  if (!existsSync(base)) return [];

  const files = readdirSync(base).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).sort();
  return files.map((filename) => {
    const raw = readFileSync(join(base, filename), "utf-8");
    const { frontmatter, content } = parseFrontmatter(raw);
    return { filename, frontmatter, content };
  });
}

export function loadSystemSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, SYSTEM_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadSystemRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, SYSTEM_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
