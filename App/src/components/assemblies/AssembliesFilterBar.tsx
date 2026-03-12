import { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  SlidersHorizontal,
  X,
  Layers,
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

function SavedViewDropdown({
  activeView,
  onViewChange,
}: {
  activeView: string;
  onViewChange: (view: SavedView) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const activeLabel = savedViews.find((v) => v.key === activeView)?.label || "All Assemblies";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
          activeView && activeView !== "all"
            ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] hover:text-[hsl(var(--foreground))]"
        }`}
      >
        <Layers className="w-3 h-3" />
        {activeLabel}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-56 max-h-72 overflow-y-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl py-1 scrollbar-thin">
          {savedViews.map((view) => {
            const Icon = savedViewIcons[view.key] || Activity;
            return (
              <button
                key={view.key}
                onClick={() => { onViewChange(view); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeView === view.key
                    ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)]"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                {view.label}
              </button>
            );
          })}
        </div>
      )}
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeSecondaryCount = [
    lifecycleFilter !== "all" ? 1 : 0,
    familyFilter !== "all" ? 1 : 0,
    ownershipFilter !== "all" ? 1 : 0,
    usageFilter !== "all" ? 1 : 0,
    riskFilter !== "all" ? 1 : 0,
    ecosystemFilter !== "all" ? 1 : 0,
    groupByFamily ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function clearSecondaryFilters() {
    onLifecycleFilterChange("all");
    onFamilyFilterChange("all");
    onOwnershipFilterChange("all");
    onUsageFilterChange("all");
    onRiskFilterChange("all");
    onEcosystemFilterChange("all");
    onGroupByFamilyChange(false);
    onClearActiveView();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <SavedViewDropdown activeView={activeView} onViewChange={onViewChange} />

        <div className="w-px h-5 bg-[hsl(var(--border))]" />

        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.key;
          const ChipIcon = chipIcons[chip.key] || Activity;
          return (
            <button
              key={chip.key}
              onClick={() => { onActiveFilterChange(chip.key); onClearActiveView(); }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                  : "text-[hsl(var(--muted-foreground))] border border-transparent hover:border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <ChipIcon className="w-3 h-3" />
              {chip.label}
              <span
                className={`tabular-nums ${
                  isActive
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground)/0.6)]"
                }`}
              >
                {counts[chip.key]}
              </span>
            </button>
          );
        })}

        <div className="w-px h-5 bg-[hsl(var(--border))]" />

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
            filtersOpen || activeSecondaryCount > 0
              ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
              : "text-[hsl(var(--muted-foreground))] border border-transparent hover:border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          Filters
          {activeSecondaryCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-bold">
              {activeSecondaryCount}
            </span>
          )}
        </button>

        {activeSecondaryCount > 0 && (
          <button
            onClick={clearSecondaryFilters}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {filtersOpen && (
        <div className="flex items-center gap-2 flex-wrap px-1 py-2 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border)/0.5)] animate-fade-in">
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
          <div className="w-px h-5 bg-[hsl(var(--border)/0.5)]" />
          <button
            onClick={() => { onGroupByFamilyChange(!groupByFamily); onClearActiveView(); }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              groupByFamily
                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                : "text-[hsl(var(--muted-foreground))] border border-transparent hover:border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <FolderTree className="w-3 h-3" />
            Group by Family
          </button>
        </div>
      )}
    </div>
  );
}
