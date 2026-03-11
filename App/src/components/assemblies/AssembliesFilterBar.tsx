import {
  Activity,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  Boxes,
  Users,
  FolderTree,
  AlertTriangle,
  Zap,
  Shield,
  Bot,
  Network,
  Globe,
  Sunset,
  Archive,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import {
  type FilterStatus,
  type LifecycleFilter,
  type UsageFilter,
  type RiskFilter,
  type OwnershipFilter,
  type EcosystemFilter,
  type ViewSetters,
  type SavedView,
  lifecycleOptions,
  lifecycleLabels,
  usageFilterOptions,
  riskFilterOptions,
  ownershipFilterOptions,
  ecosystemFilterOptions,
  filterChips,
  resetFilters,
} from "../../lib/assembly-helpers";

const iconMap = {
  Activity, Radio, CheckCircle2, XCircle, Clock, Boxes, Users, FolderTree,
  AlertTriangle, Zap, Shield, Bot, Network, Globe, Sunset, Archive,
};

const chipIcons: Record<string, typeof Activity> = {
  all: Activity,
  running: Radio,
  completed: CheckCircle2,
  failed: XCircle,
  queued: Clock,
};

export const savedViews: SavedView[] = [
  { key: "all", label: "All Assemblies", apply: (s) => resetFilters(s) },
  { key: "running", label: "Running", apply: (s) => { resetFilters(s); s.setActiveFilter("running"); } },
  { key: "failed", label: "Failed", apply: (s) => { resetFilters(s); s.setActiveFilter("failed"); } },
  { key: "in_use", label: "In Use", apply: (s) => { resetFilters(s); s.setLifecycleFilter("in_use"); } },
  { key: "unowned", label: "Unowned", apply: (s) => { resetFilters(s); s.setOwnershipFilter("unowned"); } },
  { key: "no_family", label: "No Family", apply: (s) => { resetFilters(s); s.setFamilyFilter("unassigned"); } },
  { key: "deprecated_candidates", label: "Deprecated", apply: (s) => { resetFilters(s); s.setLifecycleFilter("deprecated"); } },
  { key: "at_risk_families", label: "At Risk Families", apply: (s) => { resetFilters(s); s.setActiveFilter("failed"); s.setGroupByFamily(true); } },
  { key: "high_risk", label: "High Risk", apply: (s) => { resetFilters(s); s.setRiskFilter("high"); } },
  { key: "no_control_plane", label: "No Control Plane", apply: (s) => { resetFilters(s); s.setOwnershipFilter("no_control_plane"); } },
  { key: "agentless", label: "Agentless", apply: (s) => { resetFilters(s); s.setOwnershipFilter("without_agents"); } },
  { key: "partial_assignment", label: "Partial Assignment", apply: (s) => { resetFilters(s); s.setOwnershipFilter("partial"); } },
  { key: "deprecated_view", label: "Deprecated", apply: (s) => { resetFilters(s); s.setLifecycleFilter("deprecated"); } },
  { key: "retirement_candidates", label: "Retirement Candidates", apply: (s) => { resetFilters(s); s.setLifecycleFilter("retirement_candidates"); } },
  { key: "archived_view", label: "Archived", apply: (s) => { resetFilters(s); s.setLifecycleFilter("archived"); } },
  { key: "degraded_view", label: "Degraded", apply: (s) => { resetFilters(s); s.setLifecycleFilter("degraded"); } },
  { key: "live", label: "Live", apply: (s) => { resetFilters(s); s.setUsageFilter("live"); } },
  { key: "idle_view", label: "Idle", apply: (s) => { resetFilters(s); s.setUsageFilter("idle"); } },
  { key: "high_dependency_risk", label: "High Dep Risk", apply: (s) => { resetFilters(s); s.setEcosystemFilter("high_risk"); } },
  { key: "core_services", label: "Core Services", apply: (s) => { resetFilters(s); s.setEcosystemFilter("core"); } },
];

const savedViewIcons: Record<string, typeof Activity> = {
  all: Boxes, running: Radio, failed: XCircle, in_use: CheckCircle2,
  unowned: Users, no_family: FolderTree, deprecated_candidates: AlertTriangle,
  at_risk_families: Zap, high_risk: Shield, no_control_plane: Network,
  agentless: Bot, partial_assignment: Users, deprecated_view: Sunset,
  retirement_candidates: Archive, archived_view: Archive, degraded_view: AlertTriangle,
  live: Radio, idle_view: Clock, high_dependency_risk: Zap, core_services: Globe,
};

function FilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary)/0.5)] focus:outline-none transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

interface AssembliesFilterBarProps {
  activeFilter: FilterStatus;
  lifecycleFilter: LifecycleFilter;
  familyFilter: string;
  ownershipFilter: OwnershipFilter;
  usageFilter: UsageFilter;
  riskFilter: RiskFilter;
  ecosystemFilter: EcosystemFilter;
  groupByFamily: boolean;
  activeView: string;
  counts: Record<FilterStatus, number>;
  familyNames: string[];
  onActiveFilterChange: (v: FilterStatus) => void;
  onLifecycleFilterChange: (v: LifecycleFilter) => void;
  onFamilyFilterChange: (v: string) => void;
  onOwnershipFilterChange: (v: OwnershipFilter) => void;
  onUsageFilterChange: (v: UsageFilter) => void;
  onRiskFilterChange: (v: RiskFilter) => void;
  onEcosystemFilterChange: (v: EcosystemFilter) => void;
  onGroupByFamilyChange: (v: boolean) => void;
  onViewChange: (view: SavedView) => void;
  onClearActiveView: () => void;
}

export function AssembliesFilterBar({
  activeFilter,
  lifecycleFilter,
  familyFilter,
  ownershipFilter,
  usageFilter,
  riskFilter,
  ecosystemFilter,
  groupByFamily,
  activeView,
  counts,
  familyNames,
  onActiveFilterChange,
  onLifecycleFilterChange,
  onFamilyFilterChange,
  onOwnershipFilterChange,
  onUsageFilterChange,
  onRiskFilterChange,
  onEcosystemFilterChange,
  onGroupByFamilyChange,
  onViewChange,
  onClearActiveView,
}: AssembliesFilterBarProps) {
  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
        <Bookmark className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0 mr-0.5" />
        {savedViews.map((view) => {
          const Icon = savedViewIcons[view.key] || Activity;
          return (
            <button
              key={view.key}
              onClick={() => onViewChange(view)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                activeView === view.key
                  ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] border border-transparent"
              }`}
            >
              <Icon className="w-3 h-3" />
              {view.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.key;
          const ChipIcon = chipIcons[chip.key] || Activity;
          return (
            <button
              key={chip.key}
              onClick={() => { onActiveFilterChange(chip.key); onClearActiveView(); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <ChipIcon className="w-3 h-3" />
              {chip.label}
              <span
                className={`ml-0.5 tabular-nums ${
                  isActive
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground)/0.7)]"
                }`}
              >
                {counts[chip.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          value={lifecycleFilter}
          onChange={(v) => { onLifecycleFilterChange(v as LifecycleFilter); onClearActiveView(); }}
          options={lifecycleOptions.map((o) => ({ value: o, label: lifecycleLabels[o] }))}
        />
        <FilterDropdown
          value={familyFilter}
          onChange={(v) => { onFamilyFilterChange(v); onClearActiveView(); }}
          options={[
            { value: "all", label: "All Families" },
            { value: "unassigned", label: "Unassigned" },
            ...familyNames.map((n) => ({ value: n, label: n })),
          ]}
        />
        <FilterDropdown
          value={ownershipFilter}
          onChange={(v) => { onOwnershipFilterChange(v as OwnershipFilter); onClearActiveView(); }}
          options={ownershipFilterOptions}
        />
        <FilterDropdown
          value={usageFilter}
          onChange={(v) => { onUsageFilterChange(v as UsageFilter); onClearActiveView(); }}
          options={usageFilterOptions}
        />
        <FilterDropdown
          value={riskFilter}
          onChange={(v) => { onRiskFilterChange(v as RiskFilter); onClearActiveView(); }}
          options={riskFilterOptions}
        />
        <FilterDropdown
          value={ecosystemFilter}
          onChange={(v) => { onEcosystemFilterChange(v as EcosystemFilter); onClearActiveView(); }}
          options={ecosystemFilterOptions}
        />
        <div className="ml-auto">
          <button
            onClick={() => { onGroupByFamilyChange(!groupByFamily); onClearActiveView(); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              groupByFamily
                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <FolderTree className="w-3 h-3" />
            Group by Family
          </button>
        </div>
      </div>
    </>
  );
}
