export type AuthorityStatus = "authoritative" | "partial" | "missing" | "disputed";
export type ControlState =
  | "governed"
  | "review-required"
  | "degraded"
  | "blocked"
  | "unsafe"
  | "recovery";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type TrustDecision = "trusted" | "conditional" | "untrusted";

export type HealthBandId =
  | "authoritative"
  | "stable"
  | "incomplete"
  | "stale"
  | "fragmented"
  | "untrusted";

export type ActivityType =
  | "audit-run"
  | "drift-detected"
  | "authority-restored"
  | "blocker-cleared"
  | "registry-rebuilt"
  | "downgraded"
  | "restored";

export type DependencyRelation = "depends-on" | "governs" | "blocks" | "supports";

export type ControlActionType =
  | "health-check"
  | "coverage-audit"
  | "drift-detection"
  | "rebuild-registries"
  | "review-authority-gaps"
  | "dependency-refresh"
  | "open-unsafe"
  | "resolve-blockers";

export type EstateHeaderStats = {
  controlScore: number;
  governedLibraries: number;
  activeRisks: number;
  blockedDependencies: number;
};

export type EstateStatusMetrics = {
  totalLibraries: number;
  governed: number;
  reviewRequired: number;
  stale: number;
  unsafe: number;
  blocked: number;
  missingAuthority: number;
  driftAlerts: number;
};

export type ControlAction = {
  id: string;
  label: string;
  icon: string;
  actionType: ControlActionType;
  enabled: boolean;
};

export type LibraryHealthBand = {
  id: HealthBandId;
  label: string;
  count: number;
  libraryIds: string[];
  recommendedAction: string;
};

export type LibraryControlRecord = {
  id: string;
  name: string;
  shortName: string;
  route?: string;
  owner?: string;
  authorityStatus: AuthorityStatus;
  coveragePercent: number;
  freshnessPercent: number;
  integrityPercent: number;
  dependencyPressure: number;
  lastAuditAt?: string;
  risk: RiskLevel;
  controlState: ControlState;
  trustDecision: TrustDecision;
  recommendedAction: string;
  dependencyBlockers: string[];
  driftAlert: boolean;
  stale: boolean;
  missingAuthority: boolean;
  blocked: boolean;
};

export type LibraryDetail = {
  id: string;
  name: string;
  shortName: string;
  route?: string;
  owner?: string;
  purpose: string;
  estateRole?: string;
  authoritySource?: string;
  authorityStatus: AuthorityStatus;
  trustDecision: TrustDecision;
  coveragePercent: number;
  freshnessPercent: number;
  integrityPercent: number;
  dependencyFitnessPercent: number;
  missingArtifacts: string[];
  staleArtifacts: string[];
  brokenReferences: string[];
  unresolvedConflicts: string[];
  unsupportedDependents: string[];
  upstreamDependencies: string[];
  downstreamDependents: string[];
  blockerImpact: string[];
  recommendedAction: string;
  urgency: RiskLevel;
  suggestedMaintenanceMode?: string;
};

export type LeverageFix = {
  id: string;
  libraryId: string;
  title: string;
  summary: string;
  impactRadius: "local" | "cross-library" | "estate-wide";
  effort: "small" | "medium" | "large";
  payoffScore: number;
  recommendedAction: string;
};

export type ActiveBlocker = {
  id: string;
  title: string;
  severity: RiskLevel;
  items: string[];
  affectedLibraries: string[];
};

export type SystemRisk = {
  id: string;
  title: string;
  severity: RiskLevel;
  summary: string;
  affectedLibraries: string[];
};

export type GovernanceRule = {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "strict";
};

export type MaintenanceModeCard = {
  id: string;
  name: string;
  purpose: string;
  triggerCondition: string;
  suggestedForStates: ControlState[];
  launchable: boolean;
};

export type DependencyLink = {
  fromLibraryId: string;
  toLibraryId: string;
  relation: DependencyRelation;
  severity?: RiskLevel;
};

export type LibraryActivityEvent = {
  id: string;
  timestamp: string;
  type: ActivityType;
  libraryId?: string;
  title: string;
  summary: string;
};

export type LibraryControlFilters = {
  query: string;
  authorityStatus?: AuthorityStatus[];
  controlState?: ControlState[];
  risk?: RiskLevel[];
  staleOnly?: boolean;
  blockedOnly?: boolean;
  missingAuthorityOnly?: boolean;
  driftOnly?: boolean;
  sortBy?:
    | "risk"
    | "dependency-pressure"
    | "freshness"
    | "coverage"
    | "last-audit"
    | "control-score";
};

export type LibraryControlCenterState = {
  header: EstateHeaderStats;
  metrics: EstateStatusMetrics;
  actions: ControlAction[];
  healthBands: LibraryHealthBand[];
  libraries: LibraryControlRecord[];
  libraryDetails: Record<string, LibraryDetail>;
  leverageFixes: LeverageFix[];
  blockers: ActiveBlocker[];
  risks: SystemRisk[];
  governanceRules: GovernanceRule[];
  maintenanceModes: MaintenanceModeCard[];
  dependencyLinks: DependencyLink[];
  recentActivity: LibraryActivityEvent[];
  defaultFilters: LibraryControlFilters;
};

const AUTHORITY_SCORE: Record<AuthorityStatus, number> = {
  authoritative: 100,
  partial: 60,
  disputed: 30,
  missing: 0,
};

export function computeLibraryControlScore(input: {
  authorityStatus: AuthorityStatus;
  coveragePercent: number;
  freshnessPercent: number;
  integrityPercent: number;
  dependencyPressure: number;
}) {
  const authorityScore = AUTHORITY_SCORE[input.authorityStatus];
  return Math.round(
    input.coveragePercent * 0.3 +
      input.freshnessPercent * 0.2 +
      input.integrityPercent * 0.25 +
      (100 - input.dependencyPressure) * 0.1 +
      authorityScore * 0.15
  );
}

export function inferControlState(input: {
  authorityStatus: AuthorityStatus;
  risk: RiskLevel;
  blocked: boolean;
  coveragePercent: number;
  freshnessPercent: number;
  integrityPercent: number;
}): ControlState {
  if (input.blocked) return "blocked";

  if (
    (input.authorityStatus === "missing" || input.authorityStatus === "disputed") &&
    (input.risk === "high" || input.risk === "critical")
  ) {
    return "unsafe";
  }

  const avg = Math.round(
    (input.coveragePercent + input.freshnessPercent + input.integrityPercent) / 3
  );

  if (avg >= 85 && input.authorityStatus === "authoritative") return "governed";
  if (avg >= 70) return "review-required";
  if (avg >= 50) return "degraded";
  return "recovery";
}

export function isStale(freshnessPercent: number) {
  return freshnessPercent < 60;
}

export const LIBRARY_REGISTRY: Array<{
  id: string;
  name: string;
  shortName: string;
  route: string;
}> = [
  { id: "ops", name: "Ops", shortName: "OPS", route: "/ops" },
  { id: "knowledge", name: "Knowledge", shortName: "KNO", route: "/knowledge-library" },
  { id: "templates", name: "Templates", shortName: "TPL", route: "/templates-library" },
  { id: "gates", name: "Gates", shortName: "GAT", route: "/gates" },
  { id: "maintenance", name: "Maintenance", shortName: "MNT", route: "/maintenance" },
  { id: "policy", name: "Policy", shortName: "POL", route: "/policy" },
  { id: "telemetry", name: "Telemetry", shortName: "TEL", route: "/telemetry-library" },
  { id: "kit", name: "Kit", shortName: "KIT", route: "/kit-library" },
  { id: "standards", name: "Standards", shortName: "STD", route: "/standards" },
  { id: "verification", name: "Verification", shortName: "VER", route: "/verification-library" },
  { id: "planning", name: "Planning", shortName: "PLN", route: "/planning-library" },
  { id: "orchestration", name: "Orchestration", shortName: "ORC", route: "/orchestration" },
  { id: "intake", name: "Intake", shortName: "INT", route: "/intake-library" },
  { id: "canonical", name: "Canonical", shortName: "CAN", route: "/canonical" },
  { id: "audit", name: "Audit", shortName: "AUD", route: "/audit-library" },
  { id: "system", name: "System", shortName: "SYS", route: "/system" },
];

export const LIBRARIES: LibraryControlRecord[] = [
  {
    id: "ops",
    name: "Ops",
    shortName: "OPS",
    route: "/ops",
    owner: "Axion Core",
    authorityStatus: "authoritative",
    coveragePercent: 92,
    freshnessPercent: 88,
    integrityPercent: 94,
    dependencyPressure: 78,
    lastAuditAt: "2026-03-09T10:00:00Z",
    risk: "moderate",
    controlState: "governed",
    trustDecision: "trusted",
    recommendedAction: "Monitor dependency pressure and keep audit cadence.",
    dependencyBlockers: [],
    driftAlert: false,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "knowledge",
    name: "Knowledge",
    shortName: "KNO",
    route: "/knowledge-library",
    owner: "Axion Core",
    authorityStatus: "authoritative",
    coveragePercent: 86,
    freshnessPercent: 80,
    integrityPercent: 83,
    dependencyPressure: 61,
    lastAuditAt: "2026-03-07T14:00:00Z",
    risk: "moderate",
    controlState: "governed",
    trustDecision: "trusted",
    recommendedAction: "Run health check before next dependent update.",
    dependencyBlockers: [],
    driftAlert: false,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "templates",
    name: "Templates",
    shortName: "TPL",
    route: "/templates-library",
    owner: "Axion Core",
    authorityStatus: "partial",
    coveragePercent: 78,
    freshnessPercent: 73,
    integrityPercent: 76,
    dependencyPressure: 54,
    lastAuditAt: "2026-02-28T16:30:00Z",
    risk: "moderate",
    controlState: "review-required",
    trustDecision: "conditional",
    recommendedAction: "Close authority gaps and rerun coverage audit.",
    dependencyBlockers: [],
    driftAlert: false,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "gates",
    name: "Gates",
    shortName: "GAT",
    route: "/gates",
    owner: "Axion Core",
    authorityStatus: "partial",
    coveragePercent: 72,
    freshnessPercent: 66,
    integrityPercent: 71,
    dependencyPressure: 67,
    lastAuditAt: "2026-02-24T12:00:00Z",
    risk: "high",
    controlState: "review-required",
    trustDecision: "conditional",
    recommendedAction: "Repair missing authority links and review downstream impact.",
    dependencyBlockers: [],
    driftAlert: true,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "maintenance",
    name: "Maintenance",
    shortName: "MNT",
    route: "/maintenance",
    owner: "Axion Core",
    authorityStatus: "authoritative",
    coveragePercent: 90,
    freshnessPercent: 55,
    integrityPercent: 91,
    dependencyPressure: 49,
    lastAuditAt: "2026-01-30T08:00:00Z",
    risk: "high",
    controlState: "review-required",
    trustDecision: "conditional",
    recommendedAction: "Run drift detection and refresh stale source material.",
    dependencyBlockers: [],
    driftAlert: true,
    stale: true,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "policy",
    name: "Policy",
    shortName: "POL",
    route: "/policy",
    owner: "Axion Core",
    authorityStatus: "partial",
    coveragePercent: 64,
    freshnessPercent: 58,
    integrityPercent: 69,
    dependencyPressure: 72,
    lastAuditAt: "2026-01-18T11:15:00Z",
    risk: "high",
    controlState: "degraded",
    trustDecision: "conditional",
    recommendedAction: "Run coverage audit and reduce dependency fragility.",
    dependencyBlockers: ["Registry references incomplete"],
    driftAlert: true,
    stale: true,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "telemetry",
    name: "Telemetry",
    shortName: "TEL",
    route: "/telemetry-library",
    owner: "Axion Core",
    authorityStatus: "missing",
    coveragePercent: 51,
    freshnessPercent: 62,
    integrityPercent: 57,
    dependencyPressure: 43,
    lastAuditAt: "2026-02-10T09:45:00Z",
    risk: "high",
    controlState: "unsafe",
    trustDecision: "untrusted",
    recommendedAction: "Assign authoritative source before further governance use.",
    dependencyBlockers: ["No authoritative governing source"],
    driftAlert: false,
    stale: false,
    missingAuthority: true,
    blocked: false,
  },
  {
    id: "kit",
    name: "Kit",
    shortName: "KIT",
    route: "/kit-library",
    owner: "Axion Core",
    authorityStatus: "disputed",
    coveragePercent: 68,
    freshnessPercent: 61,
    integrityPercent: 52,
    dependencyPressure: 64,
    lastAuditAt: "2026-02-06T17:20:00Z",
    risk: "critical",
    controlState: "unsafe",
    trustDecision: "untrusted",
    recommendedAction: "Resolve source conflict and freeze downstream governance.",
    dependencyBlockers: ["Conflicting authority sources"],
    driftAlert: true,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "standards",
    name: "Standards",
    shortName: "STD",
    route: "/standards",
    owner: "Axion Core",
    authorityStatus: "authoritative",
    coveragePercent: 87,
    freshnessPercent: 84,
    integrityPercent: 85,
    dependencyPressure: 32,
    lastAuditAt: "2026-03-08T13:00:00Z",
    risk: "low",
    controlState: "governed",
    trustDecision: "trusted",
    recommendedAction: "Maintain current audit cadence.",
    dependencyBlockers: [],
    driftAlert: false,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "verification",
    name: "Verification",
    shortName: "VER",
    route: "/verification-library",
    owner: "Axion Core",
    authorityStatus: "partial",
    coveragePercent: 74,
    freshnessPercent: 57,
    integrityPercent: 74,
    dependencyPressure: 58,
    lastAuditAt: "2026-01-26T07:40:00Z",
    risk: "moderate",
    controlState: "review-required",
    trustDecision: "conditional",
    recommendedAction: "Refresh stale sections and rerun integrity cleanup.",
    dependencyBlockers: [],
    driftAlert: true,
    stale: true,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "planning",
    name: "Planning",
    shortName: "PLN",
    route: "/planning-library",
    owner: "Axion Core",
    authorityStatus: "missing",
    coveragePercent: 46,
    freshnessPercent: 44,
    integrityPercent: 49,
    dependencyPressure: 57,
    lastAuditAt: "2026-01-12T19:10:00Z",
    risk: "critical",
    controlState: "unsafe",
    trustDecision: "untrusted",
    recommendedAction: "Restore authority and rebuild registry entries immediately.",
    dependencyBlockers: ["Missing authority", "Registry entry incomplete"],
    driftAlert: true,
    stale: true,
    missingAuthority: true,
    blocked: false,
  },
  {
    id: "orchestration",
    name: "Orchestration",
    shortName: "ORC",
    route: "/orchestration",
    owner: "Axion Core",
    authorityStatus: "authoritative",
    coveragePercent: 82,
    freshnessPercent: 79,
    integrityPercent: 88,
    dependencyPressure: 45,
    lastAuditAt: "2026-03-05T15:00:00Z",
    risk: "low",
    controlState: "governed",
    trustDecision: "trusted",
    recommendedAction: "No immediate action required.",
    dependencyBlockers: [],
    driftAlert: false,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "intake",
    name: "Intake",
    shortName: "INT",
    route: "/intake-library",
    owner: "Axion Core",
    authorityStatus: "partial",
    coveragePercent: 59,
    freshnessPercent: 52,
    integrityPercent: 63,
    dependencyPressure: 81,
    lastAuditAt: "2026-01-29T10:20:00Z",
    risk: "high",
    controlState: "degraded",
    trustDecision: "conditional",
    recommendedAction: "Reduce dependency bottleneck and run failure triage.",
    dependencyBlockers: ["High downstream dependency pressure"],
    driftAlert: true,
    stale: true,
    missingAuthority: false,
    blocked: true,
  },
  {
    id: "canonical",
    name: "Canonical",
    shortName: "CAN",
    route: "/canonical",
    owner: "Axion Core",
    authorityStatus: "authoritative",
    coveragePercent: 91,
    freshnessPercent: 90,
    integrityPercent: 93,
    dependencyPressure: 27,
    lastAuditAt: "2026-03-10T09:30:00Z",
    risk: "low",
    controlState: "governed",
    trustDecision: "trusted",
    recommendedAction: "Use as benchmark library for restoration patterns.",
    dependencyBlockers: [],
    driftAlert: false,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "audit",
    name: "Audit",
    shortName: "AUD",
    route: "/audit-library",
    owner: "Axion Core",
    authorityStatus: "disputed",
    coveragePercent: 63,
    freshnessPercent: 67,
    integrityPercent: 59,
    dependencyPressure: 69,
    lastAuditAt: "2026-02-03T06:50:00Z",
    risk: "high",
    controlState: "unsafe",
    trustDecision: "untrusted",
    recommendedAction: "Resolve authority conflict and audit dependent surfaces.",
    dependencyBlockers: ["Authority dispute affects dependent libraries"],
    driftAlert: false,
    stale: false,
    missingAuthority: false,
    blocked: false,
  },
  {
    id: "system",
    name: "System",
    shortName: "SYS",
    route: "/system",
    owner: "Axion Core",
    authorityStatus: "partial",
    coveragePercent: 69,
    freshnessPercent: 64,
    integrityPercent: 72,
    dependencyPressure: 75,
    lastAuditAt: "2026-02-18T18:00:00Z",
    risk: "high",
    controlState: "blocked",
    trustDecision: "conditional",
    recommendedAction: "Clear dependency blockers and rerun health check.",
    dependencyBlockers: ["Upstream registry mismatch", "Dependent library unresolved"],
    driftAlert: true,
    stale: false,
    missingAuthority: false,
    blocked: true,
  },
];

const DEFAULT_MISSING_ARTIFACTS = [
  "Authority source mapping",
  "Registry link verification",
  "Coverage evidence",
];

const DEFAULT_STALE_ARTIFACTS = [
  "Audit snapshot",
  "Dependency review notes",
];

function makeDetail(record: LibraryControlRecord): LibraryDetail {
  return {
    id: record.id,
    name: record.name,
    shortName: record.shortName,
    route: record.route,
    owner: record.owner,
    purpose: `${record.name} governs a defined segment of the Axion library estate.`,
    estateRole: "Library governance unit",
    authoritySource:
      record.authorityStatus === "missing"
        ? undefined
        : `${record.name} canonical source`,
    authorityStatus: record.authorityStatus,
    trustDecision: record.trustDecision,
    coveragePercent: record.coveragePercent,
    freshnessPercent: record.freshnessPercent,
    integrityPercent: record.integrityPercent,
    dependencyFitnessPercent: Math.max(0, 100 - record.dependencyPressure),
    missingArtifacts:
      record.missingAuthority || record.coveragePercent < 70
        ? DEFAULT_MISSING_ARTIFACTS
        : ["None critical"],
    staleArtifacts:
      record.stale ? DEFAULT_STALE_ARTIFACTS : ["None significant"],
    brokenReferences:
      record.blocked ? ["Registry pointer mismatch"] : [],
    unresolvedConflicts:
      record.authorityStatus === "disputed" ? ["Authority conflict unresolved"] : [],
    unsupportedDependents:
      record.risk === "critical" ? ["Downstream trust should be suspended"] : [],
    upstreamDependencies: [],
    downstreamDependents: [],
    blockerImpact: record.dependencyBlockers,
    recommendedAction: record.recommendedAction,
    urgency: record.risk,
    suggestedMaintenanceMode:
      record.missingAuthority
        ? "MM-13"
        : record.driftAlert
        ? "MM-04"
        : record.blocked
        ? "MM-20"
        : "MM-01",
  };
}

export const LIBRARY_DETAILS: Record<string, LibraryDetail> = Object.fromEntries(
  LIBRARIES.map((lib) => [lib.id, makeDetail(lib)])
);

LIBRARY_DETAILS["kit"] = {
  ...LIBRARY_DETAILS["kit"],
  purpose: "Controls kit packaging and assembly — disputed governance area with conflicting source authority.",
  upstreamDependencies: ["templates", "maintenance"],
  downstreamDependents: ["intake", "system"],
  unresolvedConflicts: [
    "Authority source A conflicts with source B",
    "Dependent trust chain unresolved",
  ],
  blockerImpact: [
    "Dependent libraries should not inherit governance from this library",
  ],
  suggestedMaintenanceMode: "MM-20",
};

LIBRARY_DETAILS["planning"] = {
  ...LIBRARY_DETAILS["planning"],
  purpose: "Represents planning governance — authority-critical library missing canonical governance.",
  missingArtifacts: [
    "Canonical authority source",
    "Resolved authority snapshot",
    "Registry record",
    "Audit evidence pack",
  ],
  staleArtifacts: ["Backcompat notes", "Coverage audit output"],
  brokenReferences: ["Registry entry missing", "Broken authority pointer"],
  suggestedMaintenanceMode: "MM-21",
};

export const CONTROL_ACTIONS: ControlAction[] = [
  { id: "act-health", label: "Run Health Check", icon: "HeartPulse", actionType: "health-check", enabled: true },
  { id: "act-coverage", label: "Run Coverage Audit", icon: "ScanSearch", actionType: "coverage-audit", enabled: true },
  { id: "act-drift", label: "Run Drift Detection", icon: "GitCompareArrows", actionType: "drift-detection", enabled: true },
  { id: "act-registry", label: "Rebuild Registries", icon: "DatabaseZap", actionType: "rebuild-registries", enabled: true },
  { id: "act-authority", label: "Review Authority Gaps", icon: "ShieldAlert", actionType: "review-authority-gaps", enabled: true },
  { id: "act-refresh", label: "Refresh Dependencies", icon: "RefreshCcw", actionType: "dependency-refresh", enabled: true },
  { id: "act-unsafe", label: "Open Unsafe Libraries", icon: "TriangleAlert", actionType: "open-unsafe", enabled: true },
  { id: "act-blockers", label: "Resolve Blockers", icon: "Hammer", actionType: "resolve-blockers", enabled: true },
];

export const HEALTH_BANDS: LibraryHealthBand[] = [
  {
    id: "authoritative",
    label: "Authoritative",
    count: 4,
    libraryIds: ["ops", "standards", "orchestration", "canonical"],
    recommendedAction: "Preserve audit freshness and use as benchmark libraries.",
  },
  {
    id: "stable",
    label: "Stable",
    count: 2,
    libraryIds: ["knowledge", "templates"],
    recommendedAction: "Close minor gaps before dependency growth increases risk.",
  },
  {
    id: "incomplete",
    label: "Incomplete",
    count: 3,
    libraryIds: ["gates", "policy", "verification"],
    recommendedAction: "Run coverage and integrity checks to restore confidence.",
  },
  {
    id: "stale",
    label: "Stale",
    count: 3,
    libraryIds: ["maintenance", "verification", "intake"],
    recommendedAction: "Refresh source material and rerun drift detection.",
  },
  {
    id: "fragmented",
    label: "Fragmented",
    count: 2,
    libraryIds: ["intake", "system"],
    recommendedAction: "Reduce dependency bottlenecks and rebuild broken links.",
  },
  {
    id: "untrusted",
    label: "Untrusted",
    count: 4,
    libraryIds: ["telemetry", "kit", "planning", "audit"],
    recommendedAction: "Resolve authority issues before governance use continues.",
  },
];

export const LEVERAGE_FIXES: LeverageFix[] = [
  {
    id: "fix-01",
    libraryId: "planning",
    title: "Restore authority and registry record",
    summary: "One repair removes a critical trust failure and re-enables governance use.",
    impactRadius: "cross-library",
    effort: "medium",
    payoffScore: 96,
    recommendedAction: "Run MM-13 then MM-21",
  },
  {
    id: "fix-02",
    libraryId: "kit",
    title: "Resolve disputed authority chain",
    summary: "Stops unsafe downstream inheritance across multiple dependent libraries.",
    impactRadius: "estate-wide",
    effort: "medium",
    payoffScore: 92,
    recommendedAction: "Run MM-20 and freeze dependent trust",
  },
  {
    id: "fix-03",
    libraryId: "intake",
    title: "Reduce dependency bottleneck",
    summary: "Clears a blocked path affecting multiple downstream libraries.",
    impactRadius: "cross-library",
    effort: "small",
    payoffScore: 88,
    recommendedAction: "Run MM-17 then rerun MM-01",
  },
  {
    id: "fix-04",
    libraryId: "maintenance",
    title: "Refresh stale authority surfaces",
    summary: "A freshness repair returns a strong library to reliable governed state.",
    impactRadius: "local",
    effort: "small",
    payoffScore: 79,
    recommendedAction: "Run MM-04",
  },
  {
    id: "fix-05",
    libraryId: "telemetry",
    title: "Assign canonical authority source",
    summary: "Converts an unsafe library into a reviewable one.",
    impactRadius: "cross-library",
    effort: "small",
    payoffScore: 85,
    recommendedAction: "Run MM-13",
  },
];

export const ACTIVE_BLOCKERS: ActiveBlocker[] = [
  {
    id: "blk-01",
    title: "Missing authoritative source assignments",
    severity: "critical",
    items: [
      "Governance cannot be trusted where authority is missing",
      "Dependent libraries should not inherit unresolved authority",
    ],
    affectedLibraries: ["telemetry", "planning"],
  },
  {
    id: "blk-02",
    title: "Authority disputes in active control paths",
    severity: "critical",
    items: [
      "Conflicting sources are present",
      "Trust decisions cannot safely propagate",
    ],
    affectedLibraries: ["kit", "audit"],
  },
  {
    id: "blk-03",
    title: "Dependency bottleneck blocking downstream confidence",
    severity: "high",
    items: [
      "High dependency pressure is concentrating estate risk",
      "Blocked libraries require triage before expansion",
    ],
    affectedLibraries: ["intake", "system"],
  },
];

export const SYSTEM_RISKS: SystemRisk[] = [
  {
    id: "risk-01",
    title: "Stale governing surfaces",
    severity: "high",
    summary: "Several libraries retain strong structure but aging source freshness reduces trust.",
    affectedLibraries: ["maintenance", "policy", "verification", "intake"],
  },
  {
    id: "risk-02",
    title: "Registry integrity drift",
    severity: "high",
    summary: "Broken or incomplete registry references threaten cross-library governance confidence.",
    affectedLibraries: ["policy", "planning", "system"],
  },
  {
    id: "risk-03",
    title: "Unsafe downstream reliance",
    severity: "critical",
    summary: "Dependent libraries may be inheriting governance from disputed or missing authority sources.",
    affectedLibraries: ["kit", "planning", "intake", "system"],
  },
];

export const GOVERNANCE_RULES: GovernanceRule[] = [
  {
    id: "rule-01",
    title: "One authoritative source per governed subject",
    description: "Every governed library area must resolve to one canonical authority source.",
    severity: "strict",
  },
  {
    id: "rule-02",
    title: "Stale authority cannot silently govern runtime",
    description: "Freshness decay forces review or remediation before trust continues.",
    severity: "strict",
  },
  {
    id: "rule-03",
    title: "No template or derivative control without source backing",
    description: "Derived governance artifacts require valid authority support.",
    severity: "strict",
  },
  {
    id: "rule-04",
    title: "Registry integrity required before trust restoration",
    description: "Libraries cannot return to governed state with broken registry links.",
    severity: "strict",
  },
  {
    id: "rule-05",
    title: "Unresolved conflicts force review-required or unsafe state",
    description: "Authority disputes must never remain invisible to operators.",
    severity: "warning",
  },
  {
    id: "rule-06",
    title: "Dependency-critical libraries require fresh audit evidence",
    description: "High-pressure libraries need tighter audit cadence than low-pressure libraries.",
    severity: "warning",
  },
];

export const MAINTENANCE_MODES: MaintenanceModeCard[] = [
  {
    id: "MM-01",
    name: "Health Check",
    purpose: "Run a broad estate health pass across libraries.",
    triggerCondition: "Use when you need an overall health baseline.",
    suggestedForStates: ["governed", "review-required", "degraded"],
    launchable: true,
  },
  {
    id: "MM-03",
    name: "Coverage Audit",
    purpose: "Validate completeness and identify coverage gaps.",
    triggerCondition: "Use when coverage percent is low or incomplete.",
    suggestedForStates: ["review-required", "degraded", "recovery"],
    launchable: true,
  },
  {
    id: "MM-04",
    name: "Drift Detection",
    purpose: "Detect divergence between intended governance and current library state.",
    triggerCondition: "Use when freshness declines or drift alerts appear.",
    suggestedForStates: ["review-required", "degraded"],
    launchable: true,
  },
  {
    id: "MM-12",
    name: "Rebuild Indexes/Registries",
    purpose: "Regenerate indexes and registries supporting control surfaces.",
    triggerCondition: "Use when registry pathing or reference integrity is weak.",
    suggestedForStates: ["degraded", "blocked", "recovery"],
    launchable: true,
  },
  {
    id: "MM-13",
    name: "Registry Integrity Cleanup",
    purpose: "Repair registry-level integrity issues and broken authority linkages.",
    triggerCondition: "Use when authority is missing or registry references are broken.",
    suggestedForStates: ["review-required", "unsafe", "recovery"],
    launchable: true,
  },
  {
    id: "MM-17",
    name: "Dependency Refresh",
    purpose: "Refresh dependency assumptions and supporting references.",
    triggerCondition: "Use when dependency pressure or cross-library fragility is high.",
    suggestedForStates: ["degraded", "blocked"],
    launchable: true,
  },
  {
    id: "MM-18",
    name: "Workspace Compatibility Check",
    purpose: "Validate that library state remains compatible across connected workspaces.",
    triggerCondition: "Use after major updates or suspected compatibility drift.",
    suggestedForStates: ["review-required", "degraded"],
    launchable: true,
  },
  {
    id: "MM-20",
    name: "Failure Triage Mode",
    purpose: "Contain, inspect, and prioritize active failures.",
    triggerCondition: "Use when blockers or authority disputes are actively affecting governance.",
    suggestedForStates: ["blocked", "unsafe"],
    launchable: true,
  },
  {
    id: "MM-21",
    name: "Emergency Recovery Mode",
    purpose: "Recover control authority after severe integrity or trust failure.",
    triggerCondition: "Use for critical authority or registry failures.",
    suggestedForStates: ["unsafe", "recovery"],
    launchable: true,
  },
];

export const DEPENDENCY_LINKS: DependencyLink[] = [
  { fromLibraryId: "templates", toLibraryId: "kit", relation: "supports", severity: "moderate" },
  { fromLibraryId: "maintenance", toLibraryId: "kit", relation: "supports", severity: "moderate" },
  { fromLibraryId: "kit", toLibraryId: "intake", relation: "governs", severity: "critical" },
  { fromLibraryId: "kit", toLibraryId: "system", relation: "governs", severity: "critical" },
  { fromLibraryId: "planning", toLibraryId: "intake", relation: "blocks", severity: "critical" },
  { fromLibraryId: "intake", toLibraryId: "system", relation: "blocks", severity: "high" },
  { fromLibraryId: "ops", toLibraryId: "gates", relation: "supports", severity: "low" },
  { fromLibraryId: "canonical", toLibraryId: "knowledge", relation: "supports", severity: "low" },
];

export const RECENT_ACTIVITY: LibraryActivityEvent[] = [
  {
    id: "evt-01",
    timestamp: "2026-03-10T09:45:00Z",
    type: "audit-run",
    libraryId: "canonical",
    title: "Audit completed for Canonical",
    summary: "Library retained governed state with strong integrity and freshness.",
  },
  {
    id: "evt-02",
    timestamp: "2026-03-09T12:15:00Z",
    type: "drift-detected",
    libraryId: "maintenance",
    title: "Drift alert raised on Maintenance",
    summary: "Freshness fell below preferred threshold for a governing source surface.",
  },
  {
    id: "evt-03",
    timestamp: "2026-03-08T17:10:00Z",
    type: "downgraded",
    libraryId: "intake",
    title: "Intake downgraded to blocked",
    summary: "Dependency bottleneck exceeded safe threshold and blocked downstream trust.",
  },
  {
    id: "evt-04",
    timestamp: "2026-03-07T14:20:00Z",
    type: "registry-rebuilt",
    libraryId: "policy",
    title: "Registry rebuild executed for Policy",
    summary: "Registry structure refreshed; follow-up integrity review still required.",
  },
  {
    id: "evt-05",
    timestamp: "2026-03-06T11:00:00Z",
    type: "blocker-cleared",
    libraryId: "knowledge",
    title: "Blocking reference cleared for Knowledge",
    summary: "Dependent trust path restored after reference cleanup.",
  },
];

export const DEFAULT_FILTERS: LibraryControlFilters = {
  query: "",
  authorityStatus: undefined,
  controlState: undefined,
  risk: undefined,
  staleOnly: false,
  blockedOnly: false,
  missingAuthorityOnly: false,
  driftOnly: false,
  sortBy: "risk",
};

export function getEstateHeaderStats(libraries: LibraryControlRecord[]): EstateHeaderStats {
  const governedLibraries = libraries.filter((l) => l.controlState === "governed").length;
  const activeRisks = libraries.filter((l) => l.risk === "high" || l.risk === "critical").length;
  const blockedDependencies = libraries.filter((l) => l.blocked).length;

  const controlScore = Math.round(
    libraries.reduce((sum, lib) => {
      return sum + computeLibraryControlScore({
        authorityStatus: lib.authorityStatus,
        coveragePercent: lib.coveragePercent,
        freshnessPercent: lib.freshnessPercent,
        integrityPercent: lib.integrityPercent,
        dependencyPressure: lib.dependencyPressure,
      });
    }, 0) / libraries.length
  );

  return {
    controlScore,
    governedLibraries,
    activeRisks,
    blockedDependencies,
  };
}

export function getEstateStatusMetrics(libraries: LibraryControlRecord[]): EstateStatusMetrics {
  return {
    totalLibraries: libraries.length,
    governed: libraries.filter((l) => l.controlState === "governed").length,
    reviewRequired: libraries.filter((l) => l.controlState === "review-required").length,
    stale: libraries.filter((l) => l.stale).length,
    unsafe: libraries.filter((l) => l.controlState === "unsafe").length,
    blocked: libraries.filter((l) => l.blocked).length,
    missingAuthority: libraries.filter((l) => l.missingAuthority).length,
    driftAlerts: libraries.filter((l) => l.driftAlert).length,
  };
}

export const libraryControlCenterState: LibraryControlCenterState = {
  header: getEstateHeaderStats(LIBRARIES),
  metrics: getEstateStatusMetrics(LIBRARIES),
  actions: CONTROL_ACTIONS,
  healthBands: HEALTH_BANDS,
  libraries: LIBRARIES,
  libraryDetails: LIBRARY_DETAILS,
  leverageFixes: LEVERAGE_FIXES,
  blockers: ACTIVE_BLOCKERS,
  risks: SYSTEM_RISKS,
  governanceRules: GOVERNANCE_RULES,
  maintenanceModes: MAINTENANCE_MODES,
  dependencyLinks: DEPENDENCY_LINKS,
  recentActivity: RECENT_ACTIVITY,
  defaultFilters: DEFAULT_FILTERS,
};
