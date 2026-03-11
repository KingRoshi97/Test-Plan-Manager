import type {
  Feature,
  CapabilityRecord,
  RegistryStatus,
  DependencyHealth,
  GateHealth,
  ModuleHealth,
  RiskLevel,
} from "../../types/capabilities";
import { deriveImplementationStatus } from "./deriveImplementationStatus";
import { deriveReadinessScore } from "./deriveReadinessScore";
import { collectAttentionFlags } from "./collectAttentionFlags";

function normalizeRegistryStatus(status: string): RegistryStatus {
  if (["active", "draft", "error", "deprecated"].includes(status)) {
    return status as RegistryStatus;
  }
  return "draft";
}

function deriveDependencyHealth(
  feature: Feature,
  allFeatureIds: Set<string>
): DependencyHealth {
  if (feature.dependencies.length === 0) return "healthy";

  const unresolvedCount = feature.dependencies.filter(
    (dep) => !allFeatureIds.has(dep)
  ).length;

  if (unresolvedCount > 0) return "blocked";
  if (feature.dependencies.length > 3) return "unknown";
  return "healthy";
}

function deriveGateHealth(feature: Feature): GateHealth {
  if (feature.gates.length === 0) {
    return feature.status === "active" ? "missing" : "unknown";
  }
  if (feature.gates.length >= 2) return "covered";
  return "partial";
}

function deriveModuleHealth(feature: Feature): ModuleHealth {
  if (feature.src_modules.length === 0) {
    return feature.status === "active" ? "missing" : "orphaned";
  }
  if (feature.src_modules.length >= 2) return "linked";
  return "partial";
}

function deriveRiskLevel(
  feature: Feature,
  reverseDepCount: number,
  allFeatureIds: Set<string>
): RiskLevel {
  let riskScore = 0;

  if (reverseDepCount >= 5) riskScore += 3;
  else if (reverseDepCount >= 3) riskScore += 2;
  else if (reverseDepCount >= 1) riskScore += 1;

  if (feature.src_modules.length === 0 && feature.status === "active") riskScore += 2;
  if (feature.gates.length === 0 && feature.status === "active") riskScore += 1;

  const hasUnresolvedDeps = feature.dependencies.some(
    (dep) => !allFeatureIds.has(dep)
  );
  if (hasUnresolvedDeps) riskScore += 2;

  if (feature.status === "error") riskScore += 3;

  if (
    feature.status === "active" &&
    feature.src_modules.length === 0 &&
    feature.gates.length === 0
  ) {
    riskScore += 2;
  }

  if (riskScore >= 6) return "critical";
  if (riskScore >= 4) return "high";
  if (riskScore >= 2) return "moderate";
  return "low";
}

export function deriveCapabilityRecord(
  feature: Feature,
  allFeatureIds: Set<string>,
  reverseDepsMap: Record<string, string[]>
): CapabilityRecord {
  const registryStatus = normalizeRegistryStatus(feature.status);
  const implementationStatus = deriveImplementationStatus(feature, allFeatureIds);
  const { score: readinessScore, label: readinessLabel } = deriveReadinessScore(
    feature,
    allFeatureIds
  );

  const reverseDependencies = reverseDepsMap[feature.feature_id] || [];
  const unresolvedDependencies = feature.dependencies.filter(
    (dep) => !allFeatureIds.has(dep)
  );

  const dependencyHealth = deriveDependencyHealth(feature, allFeatureIds);
  const gateHealth = deriveGateHealth(feature);
  const moduleHealth = deriveModuleHealth(feature);
  const riskLevel = deriveRiskLevel(
    feature,
    reverseDependencies.length,
    allFeatureIds
  );
  const attentionFlags = collectAttentionFlags(feature, allFeatureIds);

  return {
    feature_id: feature.feature_id,
    title: feature.title,
    description: feature.description,
    category: feature.category,
    registryStatus,
    implementationStatus,
    readinessScore,
    readinessLabel,
    riskLevel,
    dependencyHealth,
    gateHealth,
    moduleHealth,
    attentionFlags,
    dependencies: feature.dependencies,
    reverseDependencies,
    unresolvedDependencies,
    srcModules: feature.src_modules,
    gates: feature.gates,
    moduleCount: feature.src_modules.length,
    gateCount: feature.gates.length,
    dependencyCount: feature.dependencies.length,
    blockerCount: unresolvedDependencies.length,
    warningCount: attentionFlags.length,
    impactCount: reverseDependencies.length,
  };
}
