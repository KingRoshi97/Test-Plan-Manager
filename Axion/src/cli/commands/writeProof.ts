import { join } from "node:path";
import { ProofLedger } from "../../core/proofLedger/ledger.js";

export function cmdWriteProof(runId: string, runDir: string): void {
  const ledgerPath = join(runDir, "proof", "proof_ledger.jsonl");
  const ledger = new ProofLedger(ledgerPath);

  ledger.append(runId, "gate_placeholder", "automated_check", {
    description: "Placeholder proof entry — no real evaluation performed.",
  });

  console.log(`  Wrote proof_ledger.jsonl`);
}
