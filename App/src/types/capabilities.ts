export interface Feature {
  feature_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  dependencies: string[];
  src_modules: string[];
  gates: string[];
}

export type CapabilityCategory =
  | "infrastructure"
  | "core-logic"
  | "interface"
  | "security"
  | string;

export type RegistryStatus = "active" | "draft" | "error" | "deprecated";

export type ImplementationStatus =
  | "implemented"
  | "partial"
  | "stubbed"
  | "spec_only"
  | "blocked"
  | "unverified";

export type ReadinessLabel =
  | "ready"
  | "near_ready"
  | "partial"
  | "fragile"
  | "blocked";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type DependencyHealth = "healthy" | "warning" | "blocked" | "unknown";

export type GateHealth = "covered" | "partial" | "missing" | "failed" | "unknown";

export type ModuleHealth = "linked" | "partial" | "missing" | "orphaned" | "stale";

export type CapabilityTabId =
  | "overview"
  | "readiness"
  | "dependencies"
  | "gates"
  | "modules"
  | "risk";

export type CapabilitySortMode =
  | "title"
  | "feature_id"
  | "readiness_desc"
  | "risk_desc"
  | "dependency_count_desc"
  | "gates_count_desc"
  | "module_count_desc";

export type AttentionFlag =
  | "active_without_modules"
  | "active_without_gates"
  | "implementation_ahead_of_registry"
  | "blocked_by_dependency"
  | "error_state"
  | "registry_state_review"
  | "active_but_incomplete"
  | "dependency_health_unknown";

export type CapabilityWarningCode =
  | "no_capabilities_for_filter"
  | "registered_no_modules"
  | "modules_no_gates"
  | "active_but_incomplete"
  | "dependency_health_unknown";

export interface CapabilityRecord {
  feature_id: string;
  title: string;
  description: string;
  category: CapabilityCategory;
  registryStatus: RegistryStatus;
  implementationStatus: ImplementationStatus;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  riskLevel: RiskLevel;
  dependencyHealth: DependencyHealth;
  gateHealth: GateHealth;
  moduleHealth: ModuleHealth;
  attentionFlags: AttentionFlag[];
  dependencies: string[];
  reverseDependencies: string[];
  unresolvedDependencies: string[];
  srcModules: string[];
  gates: string[];
  moduleCount: number;
  gateCount: number;
  dependencyCount: number;
  blockerCount: number;
  warningCount: number;
  impactCount: number;
}

export interface CapabilityStats {
  total: number;
  implemented: number;
  partial: number;
  blocked: number;
  unverified: number;
  highRisk: number;
  specOnly: number;
  stubbed: number;
  missingGates: number;
  missingModules: number;
}

export interface CapabilityFilterState {
  search: string;
  category: CapabilityCategory | "all";
  registryStatus: RegistryStatus | "all";
  implementationStatus: ImplementationStatus | "all";
  riskLevel: RiskLevel | "all";
  sort: CapabilitySortMode;
  onlyBlocked: boolean;
  onlyIncomplete: boolean;
  onlyUnverified: boolean;
  onlyMissingGates: boolean;
  onlyMissingModules: boolean;
  onlyHighImpact: boolean;
}

export interface CapabilityWarnings {
  code: CapabilityWarningCode;
  message: string;
  count: number;
}

export interface CapabilityPageModel {
  records: CapabilityRecord[];
  filtered: CapabilityRecord[];
  stats: CapabilityStats;
  warnings: CapabilityWarnings[];
  groupedByCategory: Record<string, CapabilityRecord[]>;
  groupedByImplementation: Record<ImplementationStatus, CapabilityRecord[]>;
  groupedByRisk: Record<RiskLevel, CapabilityRecord[]>;
}

export interface BadgeToken {
  label: string;
  tone: "success" | "warning" | "danger" | "info" | "neutral" | "muted";
}

export interface MetricToken {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger" | "info" | "neutral" | "muted";
}

export interface WarningToken {
  flag: AttentionFlag;
  message: string;
  severity: "info" | "warning" | "error";
}
