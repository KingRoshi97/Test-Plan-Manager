import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import type {
  Feature,
  CapabilityTabId,
  CapabilityFilterState,
  CapabilityPageModel,
  CapabilitySortMode,
  CapabilityCategory,
  RegistryStatus,
  ImplementationStatus,
  RiskLevel,
} from "../../types/capabilities";
import { DEFAULT_FILTER_STATE } from "../../lib/capabilities/buildCapabilityPageModel";
import { useCapabilitiesPageModel } from "./useCapabilitiesPageModel";

export function useCapabilitiesPage() {
  const {
    data: features = [],
    isLoading,
    isError,
    error,
  } = useQuery<Feature[]>({
    queryKey: ["/api/features"],
    queryFn: () => apiRequest("/api/features"),
  });

  const [activeTab, setActiveTab] = useState<CapabilityTabId>("overview");
  const [filters, setFilters] = useState<CapabilityFilterState>(DEFAULT_FILTER_STATE);

  const model: CapabilityPageModel = useCapabilitiesPageModel(features, filters);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: CapabilityCategory | "all") => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setRegistryStatus = useCallback((registryStatus: RegistryStatus | "all") => {
    setFilters((prev) => ({ ...prev, registryStatus }));
  }, []);

  const setImplementationStatus = useCallback((implementationStatus: ImplementationStatus | "all") => {
    setFilters((prev) => ({ ...prev, implementationStatus }));
  }, []);

  const setRiskLevel = useCallback((riskLevel: RiskLevel | "all") => {
    setFilters((prev) => ({ ...prev, riskLevel }));
  }, []);

  const setSort = useCallback((sort: CapabilitySortMode) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const toggleFilter = useCallback(
    (key: keyof Pick<
      CapabilityFilterState,
      "onlyBlocked" | "onlyIncomplete" | "onlyUnverified" | "onlyMissingGates" | "onlyMissingModules" | "onlyHighImpact"
    >) => {
      setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  return {
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
  };
}
