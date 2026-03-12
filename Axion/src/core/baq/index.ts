export type {
  BAQRunStatus,
  BAQSeverity,
  BAQSectionStatus,
  BAQApplicabilityStatus,
  BuildQualityGateId,
  GenerationFailureClass,
  BAQSectionEntry,
  BAQCriticalObligation,
  BAQExtractionWarning,
  BAQKitExtraction,
  BAQSubsystemEntry,
  BAQFeatureEntry,
  BAQDomainEntity,
  BAQDomainModel,
  BAQStorageModel,
  BAQAPISurface,
  BAQAuthModel,
  BAQUISurfaceEntry,
  BAQVerificationObligation,
  BAQOpsObligation,
  BAQAssumption,
  BAQRisk,
  BAQDerivedBuildInputs,
  BAQRepoFileEntry,
  BAQRepoInventory,
  BAQWorkUnit,
  BAQAcceptanceItem,
  BAQUnmappedRequirement,
  BAQTraceEntry,
  BAQRequirementTraceMap,
  BAQGateResult,
  BAQBuildQualityReport,
  BAQFailureEntry,
  BAQGenerationFailureReport,
  BAQSufficiencyEvaluation,
  BAQSufficiencyDimension,
  BAQSufficiencyGap,
  BAQHookName,
} from "./types.js";

export { runBAQExtraction, checkBAQExtractionGate } from "./extraction.js";
export { buildDerivedInputs, checkBAQDerivedInputsGate } from "./derivedInputs.js";
export { buildRepoInventory, checkBAQInventoryGate } from "./repoInventory.js";
export { buildRequirementTraceMap, checkBAQTraceabilityGate, getUnmappedRequirements } from "./traceability.js";
export { evaluateSufficiency, checkBAQSufficiencyGate, classifyArtifactFamilies, validateCrossSchemaIntegrity } from "./sufficiency.js";
export type { ArtifactFamily, ArtifactFamilyClassification } from "./sufficiency.js";
export {
  validateKitExtraction,
  validateDerivedBuildInputs,
  validateBuildQualityReport,
  validateGenerationFailureReport,
  validateRepoInventory,
  validateRequirementTraceMap,
  validateSufficiencyEvaluation,
} from "./validators.js";
export type { ValidationResult, ValidationError } from "./validators.js";
export {
  BuildQualityHookRunner,
  createHookContext,
} from "./hooks.js";
export type {
  BuildQualityHookContext,
  BuildQualityHookResult,
  HookEvidence,
  HookHandler,
} from "./hooks.js";

export {
  runPreflightCheck,
  createFileTracker,
  trackGeneratedFile,
  reconcileGeneration,
  buildAlignmentSummary,
} from "./generationAlignment.js";
export type {
  PreflightArtifactCheck,
  PreflightResult,
  TrackedFile,
  FileTracker,
  ReconciliationResult,
  AlignmentSummary,
} from "./generationAlignment.js";

export {
  evaluateGateBQ01,
  evaluateGateBQ02,
  evaluateGateBQ03,
  evaluateGateBQ04,
  evaluateGateBQ05,
  evaluateGateBQ06,
  evaluateGateBQ07,
  evaluateAllGates,
} from "./gates.js";
export type {
  BAQGateCondition,
  VerificationSignals,
  PackagingSignals,
  FullGateEvaluation,
} from "./gates.js";

export {
  buildQualityReport,
  writeQualityReport,
} from "./qualityReport.js";
export type { QualityReportInput } from "./qualityReport.js";

export {
  createFailureEntry,
  buildFailureReport,
  writeFailureReport,
  FailureCollector,
} from "./failureReport.js";
export type { FailureInput } from "./failureReport.js";
