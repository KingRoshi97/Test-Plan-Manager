export { KitController } from "./controller.js";
export type {
  KitRun,
  KitRunStatus,
  KitWorkUnit,
  WorkUnitStatus,
  KitValidationReport,
  GuardrailReport,
  GuardrailViolation,
  KitRunReport,
  VerificationResult,
  ImplementationRef,
  ProofRef,
  AttemptRecord,
} from "./model.js";
export { isValidKitRunTransition, KIT_RUN_TRANSITIONS } from "./model.js";
export type { KitRunStore } from "./store.js";
export { JSONKitRunStore } from "./store.js";
export { validateKitIntegrity } from "./validator.js";
export {
  loadPlanUnits,
  createWorkUnits,
  enforceOneTargetRule,
  getNextUnit,
  buildUnitStatusIndex,
} from "./unitManager.js";
export {
  runVerificationCommand,
  runAllVerifications,
} from "./verificationRunner.js";
export { buildUnitResult, writeUnitResult } from "./resultWriter.js";
export {
  captureProofFromVerification,
  captureProofsFromVerifications,
  writeProofObjects,
  appendToProofLedger,
} from "./proofCapture.js";
export {
  checkForbiddenPaths,
  checkCommandAllowlist,
  checkSecretsAndPii,
  checkReuseRules,
  buildGuardrailReport,
} from "./guardrails.js";
export { buildKitRunReport, isKitRunMergeable } from "./runReport.js";
