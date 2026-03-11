import type {
  Feature,
  CapabilityRecord,
  CapabilityPageModel,
  CapabilityStats,
  CapabilityFilterState,
  CapabilityWarnings,
  CapabilityWarningCode,
  ImplementationStatus,
  RiskLevel,
  CapabilitySortMode,
} from "../../types/capabilities";
import { deriveCapabilityRecord } from "./deriveCapabilityRecord";

function buildReverseDepsMap(features: Feature[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const f of features) {
    if (!map[f.feature_id]) map[f.feature_id] = [];
  }
  for (const f of features) {
    for (const dep of f.dependencies) {
      if (!map[dep]) map[dep] = [];
      map[dep].push(f.feature_id);
    }
  }
  return map;
}

function computeStats(records: CapabilityRecord[]): CapabilityStats {
  return {
    total: records.length,
    implemented: records.filter((r) => r.implementationStatus === "implemented").length,
    partial: records.filter((r) => r.implementationStatus === "partial").length,
    blocked: records.filter((r) => r.implementationStatus === "blocked").length,
    unverified: records.filter((r) => r.implementationStatus === "unverified").length,
    highRisk: records.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length,
    specOnly: records.filter((r) => r.implementationStatus === "spec_only").length,
    stubbed: records.filter((r) => r.implementationStatus === "stubbed").length,
    missingGates: records.filter((r) => r.gateHealth === "missing").length,
    missingModules: records.filter((r) => r.moduleHealth === "missing").length,
  };
}

function applyFilters(
  records: CapabilityRecord[],
  filters: CapabilityFilterState
): CapabilityRecord[] {
  return records.filter((r) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesSearch =
        r.feature_id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.srcModules.some((m) => m.toLowerCase().includes(q)) ||
        r.dependencies.some((d) => d.toLowerCase().includes(q)) ||
        r.gates.some((g) => g.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    if (filters.category !== "all" && r.category !== filters.category) return false;
    if (filters.registryStatus !== "all" && r.registryStatus !== filters.registryStatus) return false;
    if (filters.implementationStatus !== "all" && r.implementationStatus !== filters.implementationStatus) return false;
    if (filters.riskLevel !== "all" && r.riskLevel !== filters.riskLevel) return false;

    if (filters.onlyBlocked && r.implementationStatus !== "blocked") return false;
    if (filters.onlyIncomplete && r.implementationStatus !== "partial" && r.implementationStatus !== "stubbed") return false;
    if (filters.onlyUnverified && r.implementationStatus !== "unverified") return false;
    if (filters.onlyMissingGates && r.gateHealth !== "missing") return false;
    if (filters.onlyMissingModules && r.moduleHealth !== "missing") return false;
    if (filters.onlyHighImpact && r.impactCount < 3) return false;

    return true;
  });
}

function applySorting(
  records: CapabilityRecord[],
  sort: CapabilitySortMode
): CapabilityRecord[] {
  const sorted = [...records];
  switch (sort) {
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "feature_id":
      sorted.sort((a, b) => a.feature_id.localeCompare(b.feature_id));
      break;
    case "readiness_desc":
      sorted.sort((a, b) => b.readinessScore - a.readinessScore);
      break;
    case "risk_desc": {
      const riskOrder: Record<RiskLevel, number> = { critical: 4, high: 3, moderate: 2, low: 1 };
      sorted.sort((a, b) => riskOrder[b.riskLevel] - riskOrder[a.riskLevel]);
      break;
    }
    case "dependency_count_desc":
      sorted.sort((a, b) => b.dependencyCount - a.dependencyCount);
      break;
    case "gates_count_desc":
      sorted.sort((a, b) => b.gateCount - a.gateCount);
      break;
    case "module_count_desc":
      sorted.sort((a, b) => b.moduleCount - a.moduleCount);
      break;
  }
  return sorted;
}

function groupByCategory(records: CapabilityRecord[]): Record<string, CapabilityRecord[]> {
  const groups: Record<string, CapabilityRecord[]> = {};
  for (const r of records) {
    const cat = r.category || "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  }
  return groups;
}

function groupByImplementation(records: CapabilityRecord[]): Record<ImplementationStatus, CapabilityRecord[]> {
  const groups: Record<ImplementationStatus, CapabilityRecord[]> = {
    implemented: [],
    partial: [],
    stubbed: [],
    spec_only: [],
    blocked: [],
    unverified: [],
  };
  for (const r of records) {
    groups[r.implementationStatus].push(r);
  }
  return groups;
}

function groupByRisk(records: CapabilityRecord[]): Record<RiskLevel, CapabilityRecord[]> {
  const groups: Record<RiskLevel, CapabilityRecord[]> = {
    low: [],
    moderate: [],
    high: [],
    critical: [],
  };
  for (const r of records) {
    groups[r.riskLevel].push(r);
  }
  return groups;
}

function collectWarnings(
  records: CapabilityRecord[],
  filtered: CapabilityRecord[]
): CapabilityWarnings[] {
  const warnings: CapabilityWarnings[] = [];

  if (records.length > 0 && filtered.length === 0) {
    warnings.push({
      code: "no_capabilities_for_filter",
      message: "No capabilities found for current filter set.",
      count: 0,
    });
  }

  const noModules = records.filter(
    (r) => r.registryStatus === "active" && r.moduleCount === 0
  );
  if (noModules.length > 0) {
    warnings.push({
      code: "registered_no_modules",
      message: "Capability is registered but has no linked implementation modules.",
      count: noModules.length,
    });
  }

  const modulesNoGates = records.filter(
    (r) => r.moduleCount > 0 && r.gateCount === 0
  );
  if (modulesNoGates.length > 0) {
    warnings.push({
      code: "modules_no_gates",
      message: "Capability has implementation modules but no gate coverage.",
      count: modulesNoGates.length,
    });
  }

  const activeIncomplete = records.filter(
    (r) =>
      r.registryStatus === "active" &&
      r.implementationStatus !== "implemented"
  );
  if (activeIncomplete.length > 0) {
    warnings.push({
      code: "active_but_incomplete",
      message: "Capability is marked active but appears incomplete.",
      count: activeIncomplete.length,
    });
  }

  const depUnknown = records.filter(
    (r) => r.dependencyHealth === "unknown" || r.dependencyHealth === "blocked"
  );
  if (depUnknown.length > 0) {
    warnings.push({
      code: "dependency_health_unknown",
      message: "Dependency references exist but downstream health is unknown.",
      count: depUnknown.length,
    });
  }

  return warnings;
}

export const DEFAULT_FILTER_STATE: CapabilityFilterState = {
  search: "",
  category: "all",
  registryStatus: "all",
  implementationStatus: "all",
  riskLevel: "all",
  sort: "feature_id",
  onlyBlocked: false,
  onlyIncomplete: false,
  onlyUnverified: false,
  onlyMissingGates: false,
  onlyMissingModules: false,
  onlyHighImpact: false,
};

export function buildCapabilityPageModel(
  features: Feature[],
  filters: CapabilityFilterState
): CapabilityPageModel {
  const allFeatureIds = new Set(features.map((f) => f.feature_id));
  const reverseDepsMap = buildReverseDepsMap(features);

  const records = features.map((f) =>
    deriveCapabilityRecord(f, allFeatureIds, reverseDepsMap)
  );

  const stats = computeStats(records);
  const filtered = applySorting(applyFilters(records, filters), filters.sort);
  const warnings = collectWarnings(records, filtered);

  return {
    records,
    filtered,
    stats,
    warnings,
    groupedByCategory: groupByCategory(filtered),
    groupedByImplementation: groupByImplementation(filtered),
    groupedByRisk: groupByRisk(filtered),
  };
}
