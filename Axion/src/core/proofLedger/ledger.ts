import { appendJsonl } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { ProofEntry, ProofType, ProofQuery } from "./types.js";
import { loadProofEntries, queryProofs, getProofById, getAcceptanceCoverage } from "./registry.js";

export class ProofLedger {
  constructor(private ledgerPath: string) {}

  append(
    runId: string,
    gateId: string,
    proofType: ProofType,
    evidence: Record<string, unknown>,
    acceptanceRefs: string[] = [],
  ): ProofEntry {
    const timestamp = isoNow();
    const proofId = `proof_${sha256(`${runId}_${gateId}_${timestamp}`).slice(0, 12)}`;
    const hash = sha256(JSON.stringify({ proofId, runId, gate_id: gateId, evidence, timestamp }));

    const entry: ProofEntry = {
      proof_id: proofId,
      run_id: runId,
      gate_id: gateId,
      proof_type: proofType,
      timestamp,
      evidence,
      hash,
      acceptance_refs: acceptanceRefs,
    };

    appendJsonl(this.ledgerPath, entry);
    return entry;
  }

  appendProofObject(proof: {
    proof_id: string;
    run_id: string;
    gate_id: string;
    proof_type: string;
    status: string;
    created_at: string;
    acceptance_refs: string[];
    evidence: Record<string, unknown>;
    hash: string;
  }): ProofEntry {
    const entry: ProofEntry = {
      proof_id: proof.proof_id,
      run_id: proof.run_id,
      gate_id: proof.gate_id,
      proof_type: proof.proof_type as ProofType,
      timestamp: proof.created_at,
      evidence: proof.evidence,
      hash: proof.hash,
      acceptance_refs: proof.acceptance_refs,
    };

    appendJsonl(this.ledgerPath, entry);
    return entry;
  }

  load(): ProofEntry[] {
    return loadProofEntries(this.ledgerPath);
  }

  query(q: ProofQuery): ProofEntry[] {
    return queryProofs(this.load(), q);
  }

  getById(proofId: string): ProofEntry | undefined {
    return getProofById(this.load(), proofId);
  }

  getByRun(runId: string): ProofEntry[] {
    return this.query({ run_id: runId });
  }

  getByGate(gateId: string): ProofEntry[] {
    return this.query({ gate_id: gateId });
  }

  getCoverage(requiredAcceptanceRefs: string[]): { covered: string[]; uncovered: string[]; coverage: number } {
    return getAcceptanceCoverage(this.load(), requiredAcceptanceRefs);
  }
}
