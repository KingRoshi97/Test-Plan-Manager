export interface SecretMatch {
  type: string;
  pattern: string;
  line: number;
  column: number;
  context: string;
  redacted: string;
}

export interface SecretScanResult {
  hasSecrets: boolean;
  matches: SecretMatch[];
  highEntropyStrings: SecretMatch[];
  summary: {
    totalMatches: number;
    byType: Record<string, number>;
  };
}

interface PatternDefinition {
  name: string;
  pattern: RegExp;
  description: string;
}

const SECRET_PATTERNS: PatternDefinition[] = [
  {
    name: "AWS_ACCESS_KEY",
    pattern: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
    description: "AWS Access Key ID",
  },
  {
    name: "AWS_SECRET_KEY",
    pattern: /\b[A-Za-z0-9/+=]{40}\b(?=.*aws|.*secret|.*key)/gi,
    description: "AWS Secret Access Key",
  },
  {
    name: "STRIPE_SECRET",
    pattern: /\b(sk_live_|sk_test_|rk_live_|rk_test_)[a-zA-Z0-9]{24,}\b/g,
    description: "Stripe Secret Key",
  },
  {
    name: "STRIPE_PUBLISHABLE",
    pattern: /\b(pk_live_|pk_test_)[a-zA-Z0-9]{24,}\b/g,
    description: "Stripe Publishable Key",
  },
  {
    name: "GITHUB_TOKEN",
    pattern: /\b(ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]{36,}\b/g,
    description: "GitHub Token",
  },
  {
    name: "GITHUB_PAT_CLASSIC",
    pattern: /\bghp_[a-zA-Z0-9]{36}\b/g,
    description: "GitHub Personal Access Token (Classic)",
  },
  {
    name: "OPENAI_API_KEY",
    pattern: /\bsk-[a-zA-Z0-9]{20}T3BlbkFJ[a-zA-Z0-9]{20}\b/g,
    description: "OpenAI API Key",
  },
  {
    name: "OPENAI_API_KEY_V2",
    pattern: /\bsk-proj-[a-zA-Z0-9_-]{40,}\b/g,
    description: "OpenAI Project API Key",
  },
  {
    name: "ANTHROPIC_API_KEY",
    pattern: /\bsk-ant-[a-zA-Z0-9_-]{40,}\b/g,
    description: "Anthropic API Key",
  },
  {
    name: "SLACK_TOKEN",
    pattern: /\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*\b/g,
    description: "Slack Token",
  },
  {
    name: "SLACK_WEBHOOK",
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/g,
    description: "Slack Webhook URL",
  },
  {
    name: "DISCORD_TOKEN",
    pattern: /\b[MN][A-Za-z0-9]{23,}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}\b/g,
    description: "Discord Bot Token",
  },
  {
    name: "DISCORD_WEBHOOK",
    pattern: /https:\/\/discord\.com\/api\/webhooks\/[0-9]+\/[a-zA-Z0-9_-]+/g,
    description: "Discord Webhook URL",
  },
  {
    name: "GOOGLE_API_KEY",
    pattern: /\bAIza[A-Za-z0-9_-]{35}\b/g,
    description: "Google API Key",
  },
  {
    name: "FIREBASE_KEY",
    pattern: /\bAAAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{140,}\b/g,
    description: "Firebase Cloud Messaging Key",
  },
  {
    name: "TWILIO_API_KEY",
    pattern: /\bSK[a-f0-9]{32}\b/g,
    description: "Twilio API Key",
  },
  {
    name: "SENDGRID_API_KEY",
    pattern: /\bSG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}\b/g,
    description: "SendGrid API Key",
  },
  {
    name: "MAILGUN_API_KEY",
    pattern: /\bkey-[a-f0-9]{32}\b/g,
    description: "Mailgun API Key",
  },
  {
    name: "NPM_TOKEN",
    pattern: /\bnpm_[a-zA-Z0-9]{36}\b/g,
    description: "NPM Access Token",
  },
  {
    name: "PYPI_TOKEN",
    pattern: /\bpypi-[a-zA-Z0-9_-]{50,}\b/g,
    description: "PyPI API Token",
  },
  {
    name: "HEROKU_API_KEY",
    pattern: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*heroku)/gi,
    description: "Heroku API Key",
  },
  {
    name: "JWT_SECRET",
    pattern: /\b(jwt|token)[\s_-]*(secret|key)\s*[:=]\s*['"`]([^'"`\s]{16,})['"`]/gi,
    description: "JWT Secret",
  },
  {
    name: "PRIVATE_KEY_HEADER",
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
    description: "Private Key",
  },
  {
    name: "PRIVATE_KEY_ENCRYPTED",
    pattern: /-----BEGIN\s+ENCRYPTED\s+PRIVATE\s+KEY-----/g,
    description: "Encrypted Private Key",
  },
  {
    name: "OAUTH_SECRET",
    pattern: /\b(client|oauth)[\s_-]*(secret|key)\s*[:=]\s*['"`]([a-zA-Z0-9_-]{20,})['"`]/gi,
    description: "OAuth Client Secret",
  },
  {
    name: "DATABASE_URL_WITH_CREDS",
    pattern: /(postgres|mysql|mongodb|redis):\/\/[^:]+:[^@]+@[^\s]+/gi,
    description: "Database URL with credentials",
  },
  {
    name: "GENERIC_SECRET",
    pattern: /\b(password|passwd|pwd|secret|api_key|apikey|api-key|auth_token|access_token)\s*[:=]\s*['"`]([^'"`\s]{8,})['"`]/gi,
    description: "Generic secret assignment",
  },
  {
    name: "BEARER_TOKEN",
    pattern: /Bearer\s+[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    description: "Bearer Token (JWT)",
  },
  {
    name: "BASIC_AUTH",
    pattern: /Basic\s+[A-Za-z0-9+/=]{20,}/g,
    description: "Basic Auth Header",
  },
];

function calculateEntropy(str: string): number {
  if (str.length === 0) return 0;

  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

function isLikelySecret(str: string): boolean {
  const entropy = calculateEntropy(str);
  const normalizedEntropy = entropy / Math.log2(Math.min(str.length, 64));

  if (str.length >= 20 && normalizedEntropy > 0.7) {
    if (/^[a-zA-Z0-9_-]{20,}$/.test(str)) {
      if (!/^[a-z]+$|^[A-Z]+$|^[0-9]+$/.test(str)) {
        return true;
      }
    }
  }

  return false;
}

function findHighEntropyStrings(
  content: string,
  lines: string[]
): SecretMatch[] {
  const matches: SecretMatch[] = [];
  const seen = new Set<string>();

  const tokenPattern = /[a-zA-Z0-9_-]{32,}/g;
  let match;

  while ((match = tokenPattern.exec(content)) !== null) {
    const token = match[0];

    if (seen.has(token)) continue;
    seen.add(token);

    if (!isLikelySecret(token)) continue;

    let lineNum = 1;
    let col = 1;
    let pos = 0;
    for (const line of lines) {
      const idx = line.indexOf(token);
      if (idx !== -1 && pos + idx <= match.index && match.index < pos + line.length) {
        col = idx + 1;
        break;
      }
      pos += line.length + 1;
      lineNum++;
    }

    const context = lines[lineNum - 1]?.substring(0, 100) || "";

    matches.push({
      type: "HIGH_ENTROPY_STRING",
      pattern: "Entropy analysis",
      line: lineNum,
      column: col,
      context: context.length > 60 ? context.substring(0, 60) + "..." : context,
      redacted: redactSecret(token),
    });
  }

  return matches;
}

function redactSecret(secret: string): string {
  if (secret.length <= 8) {
    return "*".repeat(secret.length);
  }

  const visibleChars = Math.min(4, Math.floor(secret.length * 0.1));
  const prefix = secret.substring(0, visibleChars);
  const suffix = secret.substring(secret.length - visibleChars);
  const redactedLength = secret.length - visibleChars * 2;

  return `${prefix}${"*".repeat(Math.min(redactedLength, 20))}${suffix}`;
}

function getLineAndColumn(
  content: string,
  index: number
): { line: number; column: number } {
  const beforeMatch = content.substring(0, index);
  const lines = beforeMatch.split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function scanForSecrets(content: string): SecretScanResult {
  const matches: SecretMatch[] = [];
  const lines = content.split("\n");

  for (const patternDef of SECRET_PATTERNS) {
    const pattern = new RegExp(patternDef.pattern.source, patternDef.pattern.flags);
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const { line, column } = getLineAndColumn(content, match.index);
      const context = lines[line - 1]?.substring(0, 100) || "";

      matches.push({
        type: patternDef.name,
        pattern: patternDef.description,
        line,
        column,
        context: context.length > 60 ? context.substring(0, 60) + "..." : context,
        redacted: redactSecret(match[0]),
      });
    }
  }

  const highEntropyStrings = findHighEntropyStrings(content, lines);

  const byType: Record<string, number> = {};
  for (const m of matches) {
    byType[m.type] = (byType[m.type] || 0) + 1;
  }
  for (const m of highEntropyStrings) {
    byType[m.type] = (byType[m.type] || 0) + 1;
  }

  return {
    hasSecrets: matches.length > 0 || highEntropyStrings.length > 0,
    matches,
    highEntropyStrings,
    summary: {
      totalMatches: matches.length + highEntropyStrings.length,
      byType,
    },
  };
}

export function scanMultipleFiles(
  files: Array<{ path: string; content: string }>
): Map<string, SecretScanResult> {
  const results = new Map<string, SecretScanResult>();

  for (const file of files) {
    const result = scanForSecrets(file.content);
    if (result.hasSecrets) {
      results.set(file.path, result);
    }
  }

  return results;
}

export function aggregateScanResults(
  results: Map<string, SecretScanResult>
): {
  totalFiles: number;
  filesWithSecrets: number;
  totalMatches: number;
  byType: Record<string, number>;
  topFiles: Array<{ path: string; matchCount: number }>;
} {
  const byType: Record<string, number> = {};
  let totalMatches = 0;
  const fileScores: Array<{ path: string; matchCount: number }> = [];

  results.forEach((result, filePath) => {
    totalMatches += result.summary.totalMatches;
    fileScores.push({ path: filePath, matchCount: result.summary.totalMatches });

    for (const type of Object.keys(result.summary.byType)) {
      const count = result.summary.byType[type];
      byType[type] = (byType[type] || 0) + count;
    }
  });

  fileScores.sort((a, b) => b.matchCount - a.matchCount);

  return {
    totalFiles: results.size,
    filesWithSecrets: results.size,
    totalMatches,
    byType,
    topFiles: fileScores.slice(0, 10),
  };
}

export function redactSecretsInText(content: string): string {
  let redacted = content;

  for (const patternDef of SECRET_PATTERNS) {
    const pattern = new RegExp(patternDef.pattern.source, patternDef.pattern.flags);
    redacted = redacted.replace(pattern, (match) => redactSecret(match));
  }

  return redacted;
}
