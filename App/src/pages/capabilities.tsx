import { Loader2, AlertTriangle } from "lucide-react";
import { useCapabilitiesPage } from "../hooks/capabilities/useCapabilitiesPage";
import { CapabilitiesPageHeader } from "../components/capabilities/CapabilitiesPageHeader";
import { CapabilityStatStrip } from "../components/capabilities/CapabilityStatStrip";
import { CapabilityControlBar } from "../components/capabilities/CapabilityControlBar";
import { CapabilityTabs } from "../components/capabilities/CapabilityTabs";
import { OverviewPanel } from "../components/capabilities/panels/OverviewPanel";
import { ReadinessPanel } from "../components/capabilities/panels/ReadinessPanel";
import { DependenciesPanel } from "../components/capabilities/panels/DependenciesPanel";
import { GatesPanel } from "../components/capabilities/panels/GatesPanel";
import { ModulesPanel } from "../components/capabilities/panels/ModulesPanel";
import { RiskPanel } from "../components/capabilities/panels/RiskPanel";

export default function CapabilitiesPage() {
  const {
    isLoading,
    isError,
    error,
    activeTab,
    setActiveTab,
    filters,
    setSearch,
    setCategory,
    setRegistryStatus,
    setImplementationStatus,
    setRiskLevel,
    setSort,
    toggleFilter,
    resetFilters,
    model,
  } = useCapabilitiesPage();

  const categories = Array.from(
    new Set(model.records.map((r) => r.category))
  ).sort();

  const subtitle = model.stats.total > 0
    ? `${model.stats.total} capabilities tracked · ${model.stats.implemented} implemented · ${model.stats.blocked} blocked · ${model.stats.highRisk} at risk`
    : "Capability readiness, dependency health, and implementation coverage";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-400">
          Failed to load capabilities
          {error instanceof Error ? `: ${error.message}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <CapabilitiesPageHeader subtitle={subtitle} />
      </div>

      <CapabilityStatStrip stats={model.stats} />

      <CapabilityControlBar
        filter={filters}
        onFilterChange={(patch) => {
          if (patch.search !== undefined) setSearch(patch.search);
          if (patch.category !== undefined) setCategory(patch.category);
          if (patch.registryStatus !== undefined) setRegistryStatus(patch.registryStatus);
          if (patch.implementationStatus !== undefined) setImplementationStatus(patch.implementationStatus);
          if (patch.riskLevel !== undefined) setRiskLevel(patch.riskLevel);
          if (patch.sort !== undefined) setSort(patch.sort);
          if (patch.onlyBlocked !== undefined) toggleFilter("onlyBlocked");
          if (patch.onlyIncomplete !== undefined) toggleFilter("onlyIncomplete");
          if (patch.onlyUnverified !== undefined) toggleFilter("onlyUnverified");
          if (patch.onlyMissingGates !== undefined) toggleFilter("onlyMissingGates");
          if (patch.onlyMissingModules !== undefined) toggleFilter("onlyMissingModules");
          if (patch.onlyHighImpact !== undefined) toggleFilter("onlyHighImpact");
        }}
        categories={categories}
      />

      <CapabilityTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        {activeTab === "overview" && (
          <OverviewPanel
            records={model.records}
            filtered={model.filtered}
            stats={model.stats}
            onReset={resetFilters}
          />
        )}
        {activeTab === "readiness" && (
          <ReadinessPanel
            groupedByImplementation={model.groupedByImplementation}
          />
        )}
        {activeTab === "dependencies" && (
          <DependenciesPanel
            records={model.filtered}
            onReset={resetFilters}
          />
        )}
        {activeTab === "gates" && (
          <GatesPanel
            records={model.filtered}
            onReset={resetFilters}
          />
        )}
        {activeTab === "modules" && (
          <ModulesPanel
            records={model.filtered}
            onReset={resetFilters}
          />
        )}
        {activeTab === "risk" && (
          <RiskPanel
            records={model.filtered}
            groupedByRisk={model.groupedByRisk}
            onReset={resetFilters}
          />
        )}
      </div>
    </div>
  );
}
