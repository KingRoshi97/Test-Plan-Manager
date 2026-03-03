import type { EvidencePointer, ProofObject, ProofLedgerEntry } from "../../types/controlPlane.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { appendJsonl, readJson, ensureDir } from "../../utils/fs.js";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

const REGISTERED_PROOF_TYPES: ReadonlySet<string> = new Set([
  "verification_log",
  "snapshot_hash",
  "selection_output",
  "manual_attestation",
  "command_output",
  "gate_evaluation",
  "coverage_report",
  "diff_report",
  "guardrail_check",
  "compatibility_check",
]);

const REDACTION_PATTERNS: RegExp[] = [
  /password\s*[:=]\s*\S+/gi,
  /secret\s*[:=]\s*\S+/gi,
  /api[_-]?key\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi,
];

function generateProofId(): string {
  return `PRF-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function shouldRedact(content: string): boolean {
  return REDACTION_PATTERNS.some((p) => p.test(content));
}

export function captureProof(
  source: EvidencePointer,
  proofType: string,
  appliesTo: { spec_items?: string[]; unit_ids?: string[]; gate_ids?: string[]; run_id: string },
): ProofObject {
  if (!REGISTERED_PROOF_TYPES.has(proofType)) {
    throw new Error(`Unregistered proof type: ${proofType}. Allowed: ${[...REGISTERED_PROOF_TYPES].join(", ")}`);
  }

  let contentForHash = JSON.stringify(source);
  let redacted = false;

  if (source.path && existsSync(source.path)) {
    try {
      const fileContent = readFileSync(source.path, "utf-8");
      contentForHash = fileContent;
      redacted = shouldRedact(fileContent);
    } catch {
      contentForHash = JSON.stringify(source);
    }
  }

  const proofHash = sha256(contentForHash);

  return {
    proof_id: generateProofId(),
    proof_type: proofType,
    source,
    applies_to: appliesTo,
    hash: proofHash,
    redacted,
    captured_at: isoNow(),
  };
}

export function appendToLedger(ledgerPath: string, proofObject: ProofObject): void {
  ensureDir(dirname(ledgerPath));

  const entry: ProofLedgerEntry = {
    proof_id: proofObject.proof_id,
    run_id: proofObject.applies_to.run_id,
    gate_ids: proofObject.applies_to.gate_ids ?? [],
    affected_targets: [
      ...(proofObject.applies_to.spec_items ?? []),
      ...(proofObject.applies_to.unit_ids ?? []),
    ],
    appended_at: isoNow(),
  };

  appendJsonl(ledgerPath, entry);
}

export function verifyProofPointers(proofObjects: ProofObject[]): {
  valid: boolean;
  unresolved: Array<{ proof_id: string; path: string; reason: string }>;
} {
  const unresolved: Array<{ proof_id: string; path: string; reason: string }> = [];

  for (const proof of proofObjects) {
    if (proof.source.path && !existsSync(proof.source.path)) {
      unresolved.push({
        proof_id: proof.proof_id,
        path: proof.source.path,
        reason: "source file not found",
      });
    }

    if (proof.source.hash && proof.source.path && existsSync(proof.source.path)) {
      try {
        const content = readFileSync(proof.source.path, "utf-8");
        const actualHash = sha256(content);
        if (actualHash !== proof.source.hash) {
          unresolved.push({
            proof_id: proof.proof_id,
            path: proof.source.path,
            reason: `hash mismatch: expected ${proof.source.hash}, got ${actualHash}`,
          });
        }
      } catch {
        unresolved.push({
          proof_id: proof.proof_id,
          path: proof.source.path,
          reason: "unable to read file for hash verification",
        });
      }
    }
  }

  return {
    valid: unresolved.length === 0,
    unresolved,
  };
}

export function loadLedger(ledgerPath: string): ProofLedgerEntry[] {
  if (!existsSync(ledgerPath)) {
    return [];
  }
  const content = readFileSync(ledgerPath, "utf-8").trim();
  if (!content) return [];
  return content.split("\n").map((line) => JSON.parse(line) as ProofLedgerEntry);
}
