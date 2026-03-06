import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface EventTypeEntry {
  event_type: string;
  schema_ref: string;
  description: string;
}

export interface EventTypesV1 {
  schema_version: string;
  registry_id: string;
  types: EventTypeEntry[];
}

export interface SinkEntry {
  sink_id: string;
  type: "local_file" | "internal_http" | "external_http";
  enabled: boolean;
  endpoint?: string;
  notes?: string;
}

export interface SinkPolicyV1 {
  schema_version: string;
  policy_id: string;
  sinks: SinkEntry[];
  redaction: {
    deny_keys: string[];
    deny_patterns: string[];
    external_strict_mode: boolean;
  };
}

export interface PrivacyPolicyV1 {
  schema_version: string;
  policy_id: string;
  data_classes?: Record<string, string[]>;
  deny_keys: string[];
  deny_patterns: string[];
  free_text: {
    internal_allowlist_keys: string[];
    max_chars_internal: number;
    external_allowed: boolean;
  };
  external_sink_rules: {
    block_on_unknown_keys: boolean;
    block_on_free_text: boolean;
  };
}

export interface TelemetryLibrary {
  eventTypes: EventTypesV1 | null;
  sinkPolicy: SinkPolicyV1 | null;
  privacyPolicy: PrivacyPolicyV1 | null;
}

export interface TelemetryDoc {
  filename: string;
  frontmatter: Record<string, string>;
  content: string;
}

function readJsonSafe<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
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

const TELEMETRY_LIB_REL = "Axion/libraries/telemetry";

let cached: TelemetryLibrary | null = null;
let cacheRoot: string | null = null;

export function loadTelemetryLibrary(repoRoot: string): TelemetryLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, TELEMETRY_LIB_REL, "registries");
  const eventTypes = readJsonSafe<EventTypesV1>(join(base, "telemetry_event_types.v1.json"));
  const sinkPolicy = readJsonSafe<SinkPolicyV1>(join(base, "telemetry_sink_policy.v1.json"));
  const privacyPolicy = readJsonSafe<PrivacyPolicyV1>(join(base, "telemetry_privacy_policy.v1.json"));

  cached = { eventTypes, sinkPolicy, privacyPolicy };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getEventTypes(repoRoot: string): EventTypesV1 | null {
  return loadTelemetryLibrary(repoRoot).eventTypes;
}

export function getSinkPolicy(repoRoot: string): SinkPolicyV1 | null {
  return loadTelemetryLibrary(repoRoot).sinkPolicy;
}

export function getPrivacyPolicy(repoRoot: string): PrivacyPolicyV1 | null {
  return loadTelemetryLibrary(repoRoot).privacyPolicy;
}

export function loadTelemetryDocs(repoRoot: string): TelemetryDoc[] {
  const base = join(repoRoot, TELEMETRY_LIB_REL);
  if (!existsSync(base)) return [];

  const files = readdirSync(base)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
    .sort();
  return files.map((filename) => {
    const raw = readFileSync(join(base, filename), "utf-8");
    const { frontmatter, content } = parseFrontmatter(raw);
    return { filename, frontmatter, content };
  });
}

export function loadTelemetrySchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, TELEMETRY_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadTelemetryRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, TELEMETRY_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
