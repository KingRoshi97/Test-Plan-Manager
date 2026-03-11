import type { Feature, AttentionFlag } from "../../types/capabilities";

export function collectAttentionFlags(
  feature: Feature,
  allFeatureIds: Set<string>
): AttentionFlag[] {
  const flags: AttentionFlag[] = [];

  if (feature.status === "active" && feature.src_modules.length === 0) {
    flags.push("active_without_modules");
  }

  if (feature.status === "active" && feature.gates.length === 0) {
    flags.push("active_without_gates");
  }

  if (feature.status === "draft" && feature.src_modules.length > 0) {
    flags.push("implementation_ahead_of_registry");
  }

  const hasUnresolvedDeps = feature.dependencies.some(
    (dep) => !allFeatureIds.has(dep)
  );
  if (hasUnresolvedDeps) {
    flags.push("blocked_by_dependency");
  }

  if (feature.status === "error") {
    flags.push("error_state");
  }

  if (
    feature.src_modules.length > 0 &&
    feature.gates.length > 0 &&
    feature.status !== "active"
  ) {
    flags.push("registry_state_review");
  }

  if (
    feature.status === "active" &&
    (feature.src_modules.length === 0 || feature.gates.length === 0)
  ) {
    flags.push("active_but_incomplete");
  }

  if (
    feature.dependencies.length > 0 &&
    !hasUnresolvedDeps &&
    feature.dependencies.length > 3
  ) {
    flags.push("dependency_health_unknown");
  }

  return flags;
}
