import { readFileSync, existsSync } from "node:fs";

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

export function loadScanPacks(packsPath: string): ScanPack[] {
  if (!existsSync(packsPath)) {
    return getDefaultPacks();
  }
  const raw = JSON.parse(readFileSync(packsPath, "utf-8"));
  if (Array.isArray(raw)) return raw as ScanPack[];
  if (raw.packs && Array.isArray(raw.packs)) return raw.packs as ScanPack[];
  return getDefaultPacks();
}

export function getDefaultPacks(): ScanPack[] {
  return [
    {
      pack_id: "SECRETS_CORE",
      name: "Core Secrets Scanner",
      version: "1.0.0",
      patterns: [
        {
          pattern_id: "SEC-001",
          type: "regex",
          value: "(?:AKIA|ASIA)[A-Z0-9]{16}",
          severity: "critical",
          description: "AWS Access Key ID",
        },
        {
          pattern_id: "SEC-002",
          type: "regex",
          value: "-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----",
          severity: "critical",
          description: "Private key block",
        },
        {
          pattern_id: "SEC-003",
          type: "regex",
          value: "(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}",
          severity: "critical",
          description: "GitHub personal access token",
        },
        {
          pattern_id: "SEC-004",
          type: "regex",
          value: "sk-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}",
          severity: "critical",
          description: "OpenAI API key",
        },
        {
          pattern_id: "SEC-005",
          type: "regex",
          value: "(?:password|passwd|pwd)\\s*[:=]\\s*[\"'][^\"']{4,}[\"']",
          severity: "high",
          description: "Hardcoded password assignment",
        },
        {
          pattern_id: "SEC-006",
          type: "regex",
          value: "(?:api_key|apikey|api_secret|secret_key)\\s*[:=]\\s*[\"'][A-Za-z0-9+/=]{8,}[\"']",
          severity: "high",
          description: "Generic API key/secret assignment",
        },
        {
          pattern_id: "SEC-007",
          type: "regex",
          value: "(?:Bearer|token)\\s+[A-Za-z0-9\\-._~+/]+=*",
          severity: "high",
          description: "Bearer token or auth token",
        },
        {
          pattern_id: "SEC-008",
          type: "regex",
          value: "xox[bpoas]-[A-Za-z0-9-]{10,}",
          severity: "critical",
          description: "Slack token",
        },
      ],
    },
    {
      pack_id: "PII_CORE",
      name: "Core PII Scanner",
      version: "1.0.0",
      patterns: [
        {
          pattern_id: "PII-001",
          type: "regex",
          value: "\\b\\d{3}-\\d{2}-\\d{4}\\b",
          severity: "critical",
          description: "US Social Security Number",
        },
        {
          pattern_id: "PII-002",
          type: "regex",
          value: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
          severity: "medium",
          description: "Email address (potential PII)",
        },
        {
          pattern_id: "PII-003",
          type: "regex",
          value: "\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\\b",
          severity: "critical",
          description: "Credit card number",
        },
      ],
    },
  ];
}
