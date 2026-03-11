import type { Feature, ImplementationStatus } from "../../types/capabilities";

export function deriveImplementationStatus(
  feature: Feature,
  allFeatureIds: Set<string>
): ImplementationStatus {
  const hasModules = feature.src_modules.length > 0;
  const hasGates = feature.gates.length > 0;
  const hasUnresolvedDeps = feature.dependencies.some(
    (dep) => !allFeatureIds.has(dep)
  );

  if (hasUnresolvedDeps) {
    return "blocked";
  }

  if (feature.status === "error") {
    return "blocked";
  }

  if (feature.status === "deprecated") {
    return "spec_only";
  }

  if (feature.status === "draft" && !hasModules && !hasGates) {
    return "spec_only";
  }

  if (feature.status === "draft" && hasModules) {
    return "stubbed";
  }

  if (hasModules && hasGates) {
    return "implemented";
  }

  if (hasModules && !hasGates) {
    return "partial";
  }

  if (!hasModules && hasGates) {
    return "partial";
  }

  if (feature.status === "active" && !hasModules && !hasGates) {
    return "unverified";
  }

  return "spec_only";
}
