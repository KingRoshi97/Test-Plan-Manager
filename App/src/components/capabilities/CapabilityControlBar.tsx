import { Search } from "lucide-react";
import type {
  CapabilityFilterState,
  CapabilityCategory,
  RegistryStatus,
  ImplementationStatus,
  RiskLevel,
  CapabilitySortMode,
} from "../../types/capabilities";

interface CapabilityControlBarProps {
  filter: CapabilityFilterState;
  onFilterChange: (patch: Partial<CapabilityFilterState>) => void;
  categories: string[];
}

const implementationOptions: { value: ImplementationStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "implemented", label: "Implemented" },
  { value: "partial", label: "Partial" },
  { value: "stubbed", label: "Stubbed" },
  { value: "spec_only", label: "Spec Only" },
  { value: "blocked", label: "Blocked" },
  { value: "unverified", label: "Unverified" },
];

const registryOptions: { value: RegistryStatus | "all"; label: string }[] = [
  { value: "all", label: "All Registry" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "error", label: "Error" },
  { value: "deprecated", label: "Deprecated" },
];

const riskOptions: { value: RiskLevel | "all"; label: string }[] = [
  { value: "all", label: "All Risk" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const sortOptions: { value: CapabilitySortMode; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "feature_id", label: "Feature ID" },
  { value: "readiness_desc", label: "Readiness" },
  { value: "risk_desc", label: "Risk" },
  { value: "dependency_count_desc", label: "Dependencies" },
  { value: "gates_count_desc", label: "Gates" },
  { value: "module_count_desc", label: "Modules" },
];

const toggles: { key: keyof Pick<CapabilityFilterState, "onlyBlocked" | "onlyIncomplete" | "onlyUnverified" | "onlyMissingGates" | "onlyMissingModules" | "onlyHighImpact">; label: string }[] = [
  { key: "onlyBlocked", label: "Blocked" },
  { key: "onlyIncomplete", label: "Incomplete" },
  { key: "onlyUnverified", label: "Unverified" },
  { key: "onlyMissingGates", label: "Missing Gates" },
  { key: "onlyMissingModules", label: "Missing Modules" },
  { key: "onlyHighImpact", label: "High Impact" },
];

const selectClasses =
  "h-8 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]";

export function CapabilityControlBar({
  filter,
  onFilterChange,
  categories,
}: CapabilityControlBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search capabilities..."
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full h-8 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-8 pr-3 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <select
          value={filter.category}
          onChange={(e) => onFilterChange({ category: e.target.value as CapabilityCategory | "all" })}
          className={selectClasses}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/-/g, " ")}
            </option>
          ))}
        </select>

        <select
          value={filter.registryStatus}
          onChange={(e) => onFilterChange({ registryStatus: e.target.value as RegistryStatus | "all" })}
          className={selectClasses}
        >
          {registryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filter.implementationStatus}
          onChange={(e) => onFilterChange({ implementationStatus: e.target.value as ImplementationStatus | "all" })}
          className={selectClasses}
        >
          {implementationOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filter.riskLevel}
          onChange={(e) => onFilterChange({ riskLevel: e.target.value as RiskLevel | "all" })}
          className={selectClasses}
        >
          {riskOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filter.sort}
          onChange={(e) => onFilterChange({ sort: e.target.value as CapabilitySortMode })}
          className={selectClasses}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {toggles.map((t) => (
          <button
            key={t.key}
            onClick={() => onFilterChange({ [t.key]: !filter[t.key] })}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              filter[t.key]
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.4)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
