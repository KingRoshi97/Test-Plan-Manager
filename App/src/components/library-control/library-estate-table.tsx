import { useState } from "react";
import {
  Search,
  ChevronDown,
  ExternalLink,
  ScanSearch,
  ClipboardCheck,
  GitCompareArrows,
  Wrench,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { StatusChip, type StatusVariant } from "../ui/status-chip";
import type {
  LibraryControlRecord,
  AuthorityStatus,
  ControlState,
  RiskLevel,
  LibraryControlFilters,
} from "../../data/library-control";

function riskVariant(risk: RiskLevel): StatusVariant {
  switch (risk) {
    case "low": return "success";
    case "moderate": return "warning";
    case "high": return "failure";
    case "critical": return "failure";
  }
}

function controlStateVariant(state: ControlState): StatusVariant {
  switch (state) {
    case "governed": return "success";
    case "review-required": return "warning";
    case "degraded": return "warning";
    case "blocked": return "failure";
    case "unsafe": return "failure";
    case "recovery": return "intelligence";
  }
}

function authorityVariant(status: AuthorityStatus): StatusVariant {
  switch (status) {
    case "authoritative": return "success";
    case "partial": return "warning";
    case "missing": return "failure";
    case "disputed": return "failure";
  }
}

function percentBar(value: number) {
  const color =
    value >= 80
      ? "bg-[hsl(var(--status-success))]"
      : value >= 60
      ? "bg-[hsl(var(--status-warning))]"
      : "bg-[hsl(var(--status-failure))]";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[hsl(var(--border))] overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
        {value}%
      </span>
    </div>
  );
}

type RowAction = "open" | "inspect" | "audit" | "drift-check" | "repair" | "assign-mode";

interface LibraryEstateTableProps {
  libraries: LibraryControlRecord[];
  filters: LibraryControlFilters;
  selectedLibraryId: string | null;
  onSelectLibrary: (id: string) => void;
  onFilterChange: (updates: Partial<LibraryControlFilters>) => void;
  onRowAction?: (libraryId: string, action: RowAction) => void;
}

const rowActions: { id: RowAction; label: string; icon: typeof ExternalLink }[] = [
  { id: "open", label: "Open", icon: ExternalLink },
  { id: "inspect", label: "Inspect", icon: ScanSearch },
  { id: "audit", label: "Audit", icon: ClipboardCheck },
  { id: "drift-check", label: "Drift Check", icon: GitCompareArrows },
  { id: "repair", label: "Repair", icon: Wrench },
  { id: "assign-mode", label: "Assign Mode", icon: Settings },
];

const AUTHORITY_OPTIONS: AuthorityStatus[] = ["authoritative", "partial", "missing", "disputed"];
const CONTROL_OPTIONS: ControlState[] = ["governed", "review-required", "degraded", "blocked", "unsafe", "recovery"];
const RISK_OPTIONS: RiskLevel[] = ["low", "moderate", "high", "critical"];

export function LibraryEstateTable({
  libraries,
  filters,
  selectedLibraryId,
  onSelectLibrary,
  onFilterChange,
  onRowAction,
}: LibraryEstateTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
        Library Estate
      </h2>

      <GlassPanel className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              placeholder="Search libraries..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <select
            value={filters.authorityStatus?.[0] ?? ""}
            onChange={(e) =>
              onFilterChange({
                authorityStatus: e.target.value
                  ? [e.target.value as AuthorityStatus]
                  : undefined,
              })
            }
            className="text-xs px-2 py-1.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))] focus:outline-none"
          >
            <option value="">All Authority</option>
            {AUTHORITY_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={filters.controlState?.[0] ?? ""}
            onChange={(e) =>
              onFilterChange({
                controlState: e.target.value
                  ? [e.target.value as ControlState]
                  : undefined,
              })
            }
            className="text-xs px-2 py-1.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))] focus:outline-none"
          >
            <option value="">All Control States</option>
            {CONTROL_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.risk?.[0] ?? ""}
            onChange={(e) =>
              onFilterChange({
                risk: e.target.value
                  ? [e.target.value as RiskLevel]
                  : undefined,
              })
            }
            className="text-xs px-2 py-1.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))] focus:outline-none"
          >
            <option value="">All Risk</option>
            {RISK_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: "staleOnly" as const, label: "Stale" },
              { key: "blockedOnly" as const, label: "Blocked" },
              { key: "missingAuthorityOnly" as const, label: "Missing Auth" },
              { key: "driftOnly" as const, label: "Drift" },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() =>
                  onFilterChange({ [chip.key]: !filters[chip.key] })
                }
                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                  filters[chip.key]
                    ? "bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.3)]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <select
            value={filters.sortBy ?? "risk"}
            onChange={(e) =>
              onFilterChange({ sortBy: e.target.value as LibraryControlFilters["sortBy"] })
            }
            className="text-xs px-2 py-1.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))] focus:outline-none"
          >
            <option value="risk">Sort: Risk</option>
            <option value="coverage">Sort: Coverage</option>
            <option value="freshness">Sort: Freshness</option>
            <option value="dependency-pressure">Sort: Dep. Pressure</option>
            <option value="last-audit">Sort: Last Audit</option>
            <option value="control-score">Sort: Control Score</option>
          </select>
        </div>
      </GlassPanel>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {["Library", "Authority", "Coverage", "Freshness", "Integrity", "Dep. Pressure", "Last Audit", "Risk", "Control State", "Action", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-system-label py-2 px-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {libraries.map((lib) => {
              const isSelected = lib.id === selectedLibraryId;
              return (
                <tr
                  key={lib.id}
                  onClick={() => onSelectLibrary(lib.id)}
                  className={`border-b border-[hsl(var(--border)/0.5)] cursor-pointer transition-colors hover:bg-[hsl(var(--accent)/0.5)] ${
                    isSelected ? "bg-[hsl(var(--primary)/0.08)]" : ""
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">
                        {lib.shortName}
                      </span>
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {lib.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusChip
                      variant={authorityVariant(lib.authorityStatus)}
                      label={lib.authorityStatus}
                      size="sm"
                    />
                  </td>
                  <td className="py-2.5 px-3">{percentBar(lib.coveragePercent)}</td>
                  <td className="py-2.5 px-3">{percentBar(lib.freshnessPercent)}</td>
                  <td className="py-2.5 px-3">{percentBar(lib.integrityPercent)}</td>
                  <td className="py-2.5 px-3">{percentBar(lib.dependencyPressure)}</td>
                  <td className="py-2.5 px-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                    {lib.lastAuditAt
                      ? new Date(lib.lastAuditAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusChip
                      variant={riskVariant(lib.risk)}
                      label={lib.risk}
                      size="sm"
                      pulse={lib.risk === "critical"}
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusChip
                      variant={controlStateVariant(lib.controlState)}
                      label={lib.controlState}
                      size="sm"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-xs text-[hsl(var(--muted-foreground))] max-w-[180px] truncate">
                    {lib.recommendedAction}
                  </td>
                  <td className="py-2.5 px-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === lib.id ? null : lib.id);
                      }}
                      className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openDropdown === lib.id && (
                      <div className="absolute right-0 top-full z-50 mt-1 w-40 glass-panel-solid border border-[hsl(var(--border))] rounded-md shadow-lg py-1">
                        {rowActions.map((action) => {
                          const ActionIcon = action.icon;
                          return (
                            <button
                              key={action.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRowAction?.(lib.id, action.id);
                                setOpenDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
                            >
                              <ActionIcon className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {libraries.length === 0 && (
          <div className="text-center py-8 text-sm text-[hsl(var(--muted-foreground))]">
            No libraries match current filters.
          </div>
        )}
      </div>
    </div>
  );
}
