import * as dns from "dns";
import * as net from "net";
import { promisify } from "util";

const dnsResolve4 = promisify(dns.resolve4);
const dnsResolve6 = promisify(dns.resolve6);

export interface WebhookValidationResult {
  valid: boolean;
  blocked: boolean;
  reason?: string;
  resolvedIps?: string[];
  warnings: string[];
}

export interface WebhookLimits {
  enforceHttps: boolean;
  allowLocalhost: boolean;
  blockPrivateIps: boolean;
  maxRedirects: number;
  timeoutMs: number;
  maxPayloadBytes: number;
}

export const DEFAULT_WEBHOOK_LIMITS: WebhookLimits = {
  enforceHttps: true,
  allowLocalhost: process.env.NODE_ENV !== "production",
  blockPrivateIps: true,
  maxRedirects: 3,
  timeoutMs: 10000,
  maxPayloadBytes: 5 * 1024 * 1024,
};

const PRIVATE_IP_RANGES = [
  { start: "10.0.0.0", end: "10.255.255.255" },
  { start: "172.16.0.0", end: "172.31.255.255" },
  { start: "192.168.0.0", end: "192.168.255.255" },
  { start: "127.0.0.0", end: "127.255.255.255" },
  { start: "169.254.0.0", end: "169.254.255.255" },
  { start: "0.0.0.0", end: "0.255.255.255" },
  { start: "100.64.0.0", end: "100.127.255.255" },
  { start: "192.0.0.0", end: "192.0.0.255" },
  { start: "192.0.2.0", end: "192.0.2.255" },
  { start: "198.51.100.0", end: "198.51.100.255" },
  { start: "203.0.113.0", end: "203.0.113.255" },
  { start: "224.0.0.0", end: "239.255.255.255" },
  { start: "240.0.0.0", end: "255.255.255.255" },
];

const PRIVATE_IPV6_PREFIXES = [
  "::1",
  "fc00:",
  "fd00:",
  "fe80:",
  "ff00:",
  "::ffff:10.",
  "::ffff:172.16.",
  "::ffff:172.17.",
  "::ffff:172.18.",
  "::ffff:172.19.",
  "::ffff:172.20.",
  "::ffff:172.21.",
  "::ffff:172.22.",
  "::ffff:172.23.",
  "::ffff:172.24.",
  "::ffff:172.25.",
  "::ffff:172.26.",
  "::ffff:172.27.",
  "::ffff:172.28.",
  "::ffff:172.29.",
  "::ffff:172.30.",
  "::ffff:172.31.",
  "::ffff:192.168.",
  "::ffff:127.",
];

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function isPrivateIpv4(ip: string): boolean {
  if (!net.isIPv4(ip)) return false;

  const ipNum = ipToNumber(ip);

  for (const range of PRIVATE_IP_RANGES) {
    const startNum = ipToNumber(range.start);
    const endNum = ipToNumber(range.end);
    if (ipNum >= startNum && ipNum <= endNum) {
      return true;
    }
  }

  return false;
}

function isPrivateIpv6(ip: string): boolean {
  if (!net.isIPv6(ip)) return false;

  const lowerIp = ip.toLowerCase();
  for (const prefix of PRIVATE_IPV6_PREFIXES) {
    if (lowerIp.startsWith(prefix.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function isPrivateIp(ip: string): boolean {
  return isPrivateIpv4(ip) || isPrivateIpv6(ip);
}

function isLocalhost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  );
}

export async function validateWebhookUrl(
  url: string,
  limits: Partial<WebhookLimits> = {}
): Promise<WebhookValidationResult> {
  const opts = { ...DEFAULT_WEBHOOK_LIMITS, ...limits };
  const warnings: string[] = [];

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      valid: false,
      blocked: true,
      reason: "Invalid URL format",
      warnings,
    };
  }

  if (opts.enforceHttps && parsed.protocol !== "https:") {
    if (parsed.protocol === "http:" && opts.allowLocalhost && isLocalhost(parsed.hostname)) {
      warnings.push("HTTP allowed for localhost in development mode");
    } else {
      return {
        valid: false,
        blocked: true,
        reason: "HTTPS required for webhook URLs",
        warnings,
      };
    }
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      blocked: true,
      reason: `Invalid protocol: ${parsed.protocol}`,
      warnings,
    };
  }

  if (isLocalhost(parsed.hostname)) {
    if (!opts.allowLocalhost) {
      return {
        valid: false,
        blocked: true,
        reason: "Localhost not allowed for webhooks",
        warnings,
      };
    }
    return {
      valid: true,
      blocked: false,
      resolvedIps: ["127.0.0.1"],
      warnings: ["Localhost allowed in development mode"],
    };
  }

  if (opts.blockPrivateIps) {
    if (net.isIP(parsed.hostname)) {
      if (isPrivateIp(parsed.hostname)) {
        return {
          valid: false,
          blocked: true,
          reason: `Private IP address not allowed: ${parsed.hostname}`,
          warnings,
        };
      }
      return {
        valid: true,
        blocked: false,
        resolvedIps: [parsed.hostname],
        warnings,
      };
    }

    try {
      const ipv4Addresses = await dnsResolve4(parsed.hostname).catch(() => [] as string[]);
      const ipv6Addresses = await dnsResolve6(parsed.hostname).catch(() => [] as string[]);
      const allIps = [...ipv4Addresses, ...ipv6Addresses];

      if (allIps.length === 0) {
        return {
          valid: false,
          blocked: true,
          reason: `Could not resolve hostname: ${parsed.hostname}`,
          warnings,
        };
      }

      const privateIps = allIps.filter(isPrivateIp);
      if (privateIps.length > 0) {
        return {
          valid: false,
          blocked: true,
          reason: `Hostname resolves to private IP: ${privateIps.join(", ")}`,
          resolvedIps: allIps,
          warnings,
        };
      }

      return {
        valid: true,
        blocked: false,
        resolvedIps: allIps,
        warnings,
      };
    } catch (error) {
      warnings.push(`DNS resolution warning: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {
        valid: true,
        blocked: false,
        warnings,
      };
    }
  }

  return {
    valid: true,
    blocked: false,
    warnings,
  };
}

export function sanitizeWebhookPayload(
  payload: unknown,
  maxBytes: number = DEFAULT_WEBHOOK_LIMITS.maxPayloadBytes
): { payload: string; truncated: boolean; originalSize: number } {
  const serialized = JSON.stringify(payload);
  const originalSize = Buffer.byteLength(serialized, "utf8");

  if (originalSize <= maxBytes) {
    return {
      payload: serialized,
      truncated: false,
      originalSize,
    };
  }

  const truncatedPayload = {
    _truncated: true,
    _originalSize: originalSize,
    _message: "Payload exceeded size limit and was truncated",
    _data:
      typeof payload === "object" && payload !== null
        ? {
            type: Array.isArray(payload) ? "array" : "object",
            keys: Object.keys(payload).slice(0, 20),
          }
        : typeof payload,
  };

  return {
    payload: JSON.stringify(truncatedPayload),
    truncated: true,
    originalSize,
  };
}

export function getWebhookFetchOptions(
  limits: Partial<WebhookLimits> = {}
): RequestInit {
  const opts = { ...DEFAULT_WEBHOOK_LIMITS, ...limits };

  return {
    redirect: opts.maxRedirects === 0 ? "error" : "follow",
    signal: AbortSignal.timeout(opts.timeoutMs),
  };
}
