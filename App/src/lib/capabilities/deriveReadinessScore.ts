import type { Feature, ReadinessLabel } from "../../types/capabilities";

export function deriveReadinessScore(
  feature: Feature,
  allFeatureIds: Set<string>
): { score: number; label: ReadinessLabel } {
  let score = 0;

  if (feature.status === "active") {
    score += 25;
  } else if (feature.status === "draft") {
    score += 10;
  } else if (feature.status === "error") {
    score += 0;
  } else if (feature.status === "deprecated") {
    score += 5;
  }

  if (feature.src_modules.length > 0) {
    score += 25;
  }

  if (feature.gates.length > 0) {
    score += 25;
  }

  const hasUnresolvedDeps = feature.dependencies.some(
    (dep) => !allFeatureIds.has(dep)
  );
  if (feature.dependencies.length === 0 || !hasUnresolvedDeps) {
    score += 15;
  }

  if (feature.status === "active" && feature.src_modules.length > 0 && feature.gates.length > 0) {
    score += 10;
  }

  score = Math.min(100, Math.max(0, score));

  let label: ReadinessLabel;
  if (hasUnresolvedDeps) {
    label = "blocked";
  } else if (score >= 90) {
    label = "ready";
  } else if (score >= 70) {
    label = "near_ready";
  } else if (score >= 40) {
    label = "partial";
  } else if (score >= 20) {
    label = "fragile";
  } else {
    label = "blocked";
  }

  return { score, label };
}
