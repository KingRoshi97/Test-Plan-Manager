export * from "./upload-validator";
export * from "./secret-scanner";
export * from "./webhook-validator";
export { safeUnzipBuffer, cleanupExtractedDir } from "./safe-unzip";
export type { SafeUnzipOptions, SafeUnzipResult, UnzipStats, UnzipWarning } from "./safe-unzip";

export type SafetyMode = "warn" | "strict";

export interface SafetyConfig {
  mode: SafetyMode;
  upload: {
    enabled: boolean;
    maxZipSizeMb: number;
    maxDocSizeMb: number;
    maxTotalDocsSizeMb: number;
    maxExtractedFiles: number;
    maxExtractedSizeGb: number;
    maxCompressionRatio: number;
    blockOnViolation: boolean;
  };
  secrets: {
    enabled: boolean;
    blockDeliveryOnHardSecrets: boolean;
    redactInOutput: boolean;
    warnOnHighEntropy: boolean;
  };
  webhook: {
    enforceHttps: boolean;
    allowLocalhostInDev: boolean;
    blockPrivateIps: boolean;
    maxRedirects: number;
    timeoutMs: number;
    maxPayloadBytes: number;
  };
}

export const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  mode: "warn",
  upload: {
    enabled: true,
    maxZipSizeMb: 200,
    maxDocSizeMb: 25,
    maxTotalDocsSizeMb: 100,
    maxExtractedFiles: 20000,
    maxExtractedSizeGb: 1,
    maxCompressionRatio: 100,
    blockOnViolation: false,
  },
  secrets: {
    enabled: true,
    blockDeliveryOnHardSecrets: false,
    redactInOutput: false,
    warnOnHighEntropy: true,
  },
  webhook: {
    enforceHttps: true,
    allowLocalhostInDev: true,
    blockPrivateIps: true,
    maxRedirects: 3,
    timeoutMs: 10000,
    maxPayloadBytes: 5 * 1024 * 1024,
  },
};

let currentConfig: SafetyConfig = { ...DEFAULT_SAFETY_CONFIG };

export function getSafetyConfig(): SafetyConfig {
  return { ...currentConfig };
}

export function updateSafetyConfig(updates: Partial<SafetyConfig>): SafetyConfig {
  currentConfig = {
    ...currentConfig,
    ...updates,
    upload: { ...currentConfig.upload, ...updates.upload },
    secrets: { ...currentConfig.secrets, ...updates.secrets },
    webhook: { ...currentConfig.webhook, ...updates.webhook },
  };
  return getSafetyConfig();
}

export function setSafetyMode(mode: SafetyMode): void {
  currentConfig.mode = mode;
  
  if (mode === "strict") {
    currentConfig.upload.blockOnViolation = true;
    currentConfig.secrets.blockDeliveryOnHardSecrets = true;
  } else {
    currentConfig.upload.blockOnViolation = false;
    currentConfig.secrets.blockDeliveryOnHardSecrets = false;
  }
}

export function shouldBlockOnViolation(): boolean {
  return currentConfig.mode === "strict" || currentConfig.upload.blockOnViolation;
}

export function shouldBlockDeliveryOnSecrets(): boolean {
  return currentConfig.mode === "strict" || currentConfig.secrets.blockDeliveryOnHardSecrets;
}
