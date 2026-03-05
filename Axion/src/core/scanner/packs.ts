import * as fs from "fs";
import * as path from "path";

export interface ScanPack {
  pack_id: string;
  name: string;
  version: string;
  patterns: ScanPattern[];
}

export interface ScanPattern {
  pattern_id: string;
  type: "regex" | "entropy" | "keyword";
  value: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

const DEFAULT_PACKS: ScanPack[] = [
  {
    pack_id: "secrets-core",
    name: "Core Secrets Detection",
    version: "1.0.0",
    patterns: [
      {
        pattern_id: "SEC-AWS-KEY",
        type: "regex",
        value: "(?:AKIA|ASIA)[A-Z0-9]{16}",
        severity: "critical",
        description: "AWS Access Key ID",
      },
      {
        pattern_id: "SEC-AWS-SECRET",
        type: "regex",
        value: "(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\\s*[=:]\\s*[A-Za-z0-9/+=]{40}",
        severity: "critical",
        description: "AWS Secret Access Key",
      },
      {
        pattern_id: "SEC-GENERIC-API-KEY",
        type: "regex",
        value: "(?:api[_-]?key|apikey|api[_-]?secret)\\s*[=:]\\s*['\"][A-Za-z0-9_\\-]{16,}['\"]",
        severity: "high",
        description: "Generic API key assignment",
      },
      {
        pattern_id: "SEC-PRIVATE-KEY",
        type: "regex",
        value: "-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----",
        severity: "critical",
        description: "Private key header",
      },
      {
        pattern_id: "SEC-GITHUB-TOKEN",
        type: "regex",
        value: "gh[pousr]_[A-Za-z0-9_]{36,}",
        severity: "critical",
        description: "GitHub personal access token",
      },
      {
        pattern_id: "SEC-GENERIC-PASSWORD",
        type: "regex",
        value: "(?:password|passwd|pwd)\\s*[=:]\\s*['\"][^'\"]{8,}['\"]",
        severity: "high",
        description: "Password assignment in code",
      },
      {
        pattern_id: "SEC-JWT",
        type: "regex",
        value: "eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}",
        severity: "high",
        description: "JSON Web Token",
      },
      {
        pattern_id: "SEC-CONNECTION-STRING",
        type: "regex",
        value: "(?:mongodb|postgres|mysql|redis|amqp)://[^\\s'\"]{10,}",
        severity: "high",
        description: "Database connection string with credentials",
      },
    ],
  },
  {
    pack_id: "pii-core",
    name: "Core PII Detection",
    version: "1.0.0",
    patterns: [
      {
        pattern_id: "PII-EMAIL",
        type: "regex",
        value: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        severity: "medium",
        description: "Email address",
      },
      {
        pattern_id: "PII-SSN",
        type: "regex",
        value: "\\b\\d{3}-\\d{2}-\\d{4}\\b",
        severity: "critical",
        description: "US Social Security Number",
      },
      {
        pattern_id: "PII-PHONE-US",
        type: "regex",
        value: "\\b(?:\\+1[- ]?)?\\(?\\d{3}\\)?[- ]?\\d{3}[- ]?\\d{4}\\b",
        severity: "medium",
        description: "US phone number",
      },
      {
        pattern_id: "PII-CREDIT-CARD",
        type: "regex",
        value: "\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b",
        severity: "critical",
        description: "Credit card number (Visa, MC, Amex, Discover)",
      },
      {
        pattern_id: "PII-IP-ADDRESS",
        type: "regex",
        value: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
        severity: "low",
        description: "IPv4 address",
      },
    ],
  },
];

export function loadScanPacks(packsPath: string): ScanPack[] {
  const resolvedPath = path.resolve(packsPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `ERR-SCAN-001: Scan packs directory not found: ${resolvedPath}`,
    );
  }

  const stat = fs.statSync(resolvedPath);
  if (stat.isFile()) {
    return loadPackFromFile(resolvedPath);
  }

  const files = fs.readdirSync(resolvedPath).filter(
    (f) => f.endsWith(".json"),
  );

  if (files.length === 0) {
    throw new Error(
      `ERR-SCAN-001: No scan pack files found in: ${resolvedPath}`,
    );
  }

  const packs: ScanPack[] = [];
  for (const file of files) {
    const filePacks = loadPackFromFile(path.join(resolvedPath, file));
    packs.push(...filePacks);
  }

  return packs;
}

function loadPackFromFile(filePath: string): ScanPack[] {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `ERR-SCAN-001: Failed to read scan pack file: ${(err as Error).message}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `ERR-SCAN-002: Scan pack file is not valid JSON: ${filePath} — ${(err as Error).message}`,
    );
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  const packs: ScanPack[] = [];

  for (const item of items) {
    const pack = item as Record<string, unknown>;
    if (!pack.pack_id || !pack.name || !pack.version || !Array.isArray(pack.patterns)) {
      throw new Error(
        `ERR-SCAN-002: Invalid scan pack structure in ${filePath} — requires pack_id, name, version, patterns[]`,
      );
    }
    packs.push(pack as unknown as ScanPack);
  }

  return packs;
}

export function getDefaultPacks(): ScanPack[] {
  return DEFAULT_PACKS.map((pack) => ({
    ...pack,
    patterns: pack.patterns.map((p) => ({ ...p })),
  }));
}

export function mergePacks(...packSets: ScanPack[][]): ScanPack[] {
  const merged = new Map<string, ScanPack>();

  for (const packs of packSets) {
    for (const pack of packs) {
      if (merged.has(pack.pack_id)) {
        const existing = merged.get(pack.pack_id)!;
        const existingIds = new Set(existing.patterns.map((p) => p.pattern_id));
        for (const pattern of pack.patterns) {
          if (!existingIds.has(pattern.pattern_id)) {
            existing.patterns.push(pattern);
            existingIds.add(pattern.pattern_id);
          }
        }
      } else {
        merged.set(pack.pack_id, {
          ...pack,
          patterns: [...pack.patterns],
        });
      }
    }
  }

  return Array.from(merged.values());
}
