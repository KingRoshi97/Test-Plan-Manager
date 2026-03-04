import { join } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { ProofLedger } from "../../core/proofLedger/ledger.js";

export function cmdWriteProof(runId: string, runDir: string, baseDir?: string): void {
  const ledgerPath = join(runDir, "proof", "proof_ledger.jsonl");
  const registryPath = baseDir ? join(baseDir, "registries", "PROOF_TYPE_REGISTRY.json") : undefined;
  const ledger = new ProofLedger(ledgerPath, registryPath);

  const gatesDir = join(runDir, "gates");
  if (!existsSync(gatesDir)) {
    ledger.append(runId, "G0_NO_GATES", "gate_evaluation", {
      gate_id: "G0_NO_GATES",
      predicate_results: [],
      overall_status: "pass",
      evidence_pointers: [],
      evaluated_at: new Date().toISOString(),
    });
    console.log(`  Wrote proof_ledger.jsonl (no gate reports found)`);
    return;
  }

  const gateFiles = readdirSync(gatesDir).filter((f) => f.endsWith(".gate_report.json"));
  if (gateFiles.length === 0) {
    ledger.append(runId, "G0_NO_GATES", "gate_evaluation", {
      gate_id: "G0_NO_GATES",
      predicate_results: [],
      overall_status: "pass",
      evidence_pointers: [],
      evaluated_at: new Date().toISOString(),
    });
    console.log(`  Wrote proof_ledger.jsonl (no gate reports found)`);
    return;
  }

  for (const file of gateFiles) {
    const reportPath = join(gatesDir, file);
    const report = JSON.parse(readFileSync(reportPath, "utf-8")) as Record<string, unknown>;

    const gateId = (report.gate_id as string) ?? file.replace(".gate_report.json", "");
    const checks = (report.checks ?? []) as Array<Record<string, unknown>>;
    const evidence = (report.evidence ?? []) as Array<Record<string, unknown>>;

    ledger.append(runId, gateId, "gate_evaluation", {
      gate_id: gateId,
      predicate_results: checks.map((c) => ({
        check_id: c.check_id,
        status: c.status,
        failure_code: c.failure_code ?? null,
      })),
      overall_status: report.status ?? "unknown",
      evidence_pointers: evidence.map((e) => ({
        path: e.path ?? "",
        pointer: e.pointer ?? "",
      })),
      evaluated_at: (report.evaluated_at as string) ?? new Date().toISOString(),
    });
  }

  console.log(`  Wrote proof_ledger.jsonl (${gateFiles.length} gate entries)`);
}
