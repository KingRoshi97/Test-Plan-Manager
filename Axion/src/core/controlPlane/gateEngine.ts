import type {
  EvidencePointer,
  RemediationStep,
  RunContext,
  ICPGateReport,
} from "../../types/controlPlane.js";
import { isoNow } from "../../utils/time.js";

export type PredicateOp =
  | "file_exists"
  | "json_valid"
  | "json_has"
  | "json_eq"
  | "coverage_gte"
  | "verify_hash_manifest";

const VALID_OPS: ReadonlySet<string> = new Set<PredicateOp>([
  "file_exists",
  "json_valid",
  "json_has",
  "json_eq",
  "coverage_gte",
  "verify_hash_manifest",
]);

export interface GatePredicate {
  predicate_id: string;
  op: string;
  path?: string;
  pointer?: string;
  min?: number;
  expected?: unknown;
  manifest_path?: string;
  bundle_root?: string;
}

export interface GateSetEntry {
  gate_id: string;
  stage_id: string;
  severity: "blocking" | "advisory";
  required_evidence_types: string[];
  predicates: GatePredicate[];
}

export interface GateSetProfile {
  profile_id: string;
  gates: GateSetEntry[];
}

export interface PredicateResult {
  predicate_id: string;
  status: "PASS" | "FAIL";
  message?: string;
}

export interface GateResult {
  gate_id: string;
  status: "PASS" | "FAIL";
  predicate_results: PredicateResult[];
  required_evidence_types: string[];
  satisfied_evidence: string[];
  missing_evidence: string[];
  evidence_pointers: EvidencePointer[];
  remediation: RemediationStep[];
}

function validateOp(op: string): boolean {
  return VALID_OPS.has(op);
}

function evaluatePredicate(
  predicate: GatePredicate,
  artifacts: Record<string, unknown>,
  evidencePointers: EvidencePointer[],
): PredicateResult {
  if (!validateOp(predicate.op)) {
    return {
      predicate_id: predicate.predicate_id,
      status: "FAIL",
      message: `Unknown predicate operator: ${predicate.op}. Allowed: ${[...VALID_OPS].join(", ")}`,
    };
  }

  const targetPath = predicate.path ?? predicate.manifest_path ?? "";
  const hasArtifact = targetPath in artifacts || evidencePointers.some((e) => e.path === targetPath);

  if (predicate.op === "file_exists") {
    return {
      predicate_id: predicate.predicate_id,
      status: hasArtifact ? "PASS" : "FAIL",
      message: hasArtifact ? undefined : `File not found: ${targetPath}`,
    };
  }

  if (!hasArtifact && targetPath) {
    return {
      predicate_id: predicate.predicate_id,
      status: "FAIL",
      message: `Required artifact not found: ${targetPath}`,
    };
  }

  return {
    predicate_id: predicate.predicate_id,
    status: "PASS",
  };
}

function buildRemediation(gateId: string, failedPredicates: PredicateResult[]): RemediationStep[] {
  return failedPredicates.map((p, i) => ({
    step_id: `${gateId}_REM_${i + 1}`,
    description: p.message ?? `Fix failed predicate: ${p.predicate_id}`,
    priority: "high" as const,
  }));
}

export function evaluateGates(
  artifacts: Record<string, unknown>,
  evidencePointers: EvidencePointer[],
  gateSetProfile: GateSetProfile,
): GateResult[] {
  return gateSetProfile.gates.map((gate) => {
    const predicateResults = gate.predicates.map((pred) =>
      evaluatePredicate(pred, artifacts, evidencePointers),
    );

    const allPass = predicateResults.every((r) => r.status === "PASS");
    const failedPredicates = predicateResults.filter((r) => r.status === "FAIL");

    const evidenceTypes = evidencePointers.map((e) => e.type);
    const satisfiedEvidence = gate.required_evidence_types.filter((t) =>
      evidenceTypes.includes(t as EvidencePointer["type"]),
    );
    const missingEvidence = gate.required_evidence_types.filter(
      (t) => !evidenceTypes.includes(t as EvidencePointer["type"]),
    );

    const gateEvidencePointers = evidencePointers.filter(
      (e) => gate.required_evidence_types.includes(e.type) || gate.predicates.some((p) => p.path === e.path),
    );

    return {
      gate_id: gate.gate_id,
      status: allPass && missingEvidence.length === 0 ? "PASS" : "FAIL",
      predicate_results: predicateResults,
      required_evidence_types: gate.required_evidence_types,
      satisfied_evidence: satisfiedEvidence,
      missing_evidence: missingEvidence,
      evidence_pointers: gateEvidencePointers,
      remediation: allPass ? [] : buildRemediation(gate.gate_id, failedPredicates),
    };
  });
}

export function buildGateReport(
  results: GateResult[],
  runContext: RunContext,
  gateSetProfileId: string,
): ICPGateReport {
  const overallStatus = results.every((r) => r.status === "PASS") ? "PASS" : "FAIL";

  return {
    run_id: runContext.run_id ?? "",
    gate_set_profile_id: gateSetProfileId,
    overall_status: overallStatus,
    run_context_summary: runContext,
    gates: results,
    evaluated_at: isoNow(),
  };
}
