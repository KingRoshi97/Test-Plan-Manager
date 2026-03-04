import { existsSync } from "node:fs";
import { appendJsonl, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { ProofEntry } from "./types.js";

export interface ProofTypeRegistryEntry {
  proof_type: string;
  version: string;
  required_fields: string[];
  description: string;
  applies_to: string[];
}

export interface ProofTypeRegistryFile {
  entries: ProofTypeRegistryEntry[];
}

let cachedRegistry: ProofTypeRegistryEntry[] | null = null;
let cachedRegistryPath: string | null = null;

export function loadProofTypeRegistry(registryPath: string): ProofTypeRegistryEntry[] {
  if (cachedRegistry && cachedRegistryPath === registryPath) return cachedRegistry;
  if (!existsSync(registryPath)) return [];
  const reg = readJson<ProofTypeRegistryFile>(registryPath);
  cachedRegistry = reg.entries ?? [];
  cachedRegistryPath = registryPath;
  return cachedRegistry;
}

export function resetRegistryCache(): void {
  cachedRegistry = null;
  cachedRegistryPath = null;
}

export function isRegisteredProofType(proofType: string, registryPath: string): boolean {
  const entries = loadProofTypeRegistry(registryPath);
  if (entries.length === 0) return true;
  return entries.some((e) => e.proof_type === proofType);
}

export function getRegistryEntry(proofType: string, registryPath: string): ProofTypeRegistryEntry | undefined {
  const entries = loadProofTypeRegistry(registryPath);
  return entries.find((e) => e.proof_type === proofType);
}

export function validateRequiredFields(proofType: string, evidence: Record<string, unknown>, registryPath: string): { valid: boolean; missing: string[] } {
  const entry = getRegistryEntry(proofType, registryPath);
  if (!entry) return { valid: true, missing: [] };
  const missing = entry.required_fields.filter((f) => !(f in evidence) || evidence[f] === undefined || evidence[f] === null);
  return { valid: missing.length === 0, missing };
}

export class ProofLedger {
  private registryPath: string | null = null;

  constructor(private ledgerPath: string, registryPath?: string) {
    this.registryPath = registryPath ?? null;
  }

  append(runId: string, gateId: string, proofType: string, evidence: Record<string, unknown>): ProofEntry {
    if (this.registryPath) {
      const entries = loadProofTypeRegistry(this.registryPath);
      if (entries.length > 0) {
        const registered = entries.find((e) => e.proof_type === proofType);
        if (!registered) {
          throw new Error(`Unregistered proof type: "${proofType}". Registered types: ${entries.map((e) => e.proof_type).join(", ")}`);
        }

        const fieldCheck = validateRequiredFields(proofType, evidence, this.registryPath);
        if (!fieldCheck.valid) {
          throw new Error(`Proof type "${proofType}" missing required fields: ${fieldCheck.missing.join(", ")}`);
        }
      }
    }

    const timestamp = isoNow();
    const proofId = `proof_${sha256(`${runId}_${gateId}_${timestamp}`).slice(0, 12)}`;
    const hash = sha256(JSON.stringify({ proofId, runId, gateId, proofType, evidence, timestamp }));

    const entry: ProofEntry = {
      proof_id: proofId,
      run_id: runId,
      gate_id: gateId,
      proof_type: proofType,
      timestamp,
      evidence,
      hash,
    };

    appendJsonl(this.ledgerPath, entry);
    return entry;
  }

  getLedgerPath(): string {
    return this.ledgerPath;
  }

  getRegistryPath(): string | null {
    return this.registryPath;
  }
}
