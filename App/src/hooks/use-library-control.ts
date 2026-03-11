import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type {
  AuthorityStatus,
  ControlState,
  RiskLevel,
  LibraryControlFilters,
  LibraryControlRecord,
  LibraryDetail,
  ControlActionType,
} from "../data/library-control";
import {
  LIBRARIES,
  LIBRARY_DETAILS,
  DEFAULT_FILTERS,
  computeLibraryControlScore,
} from "../data/library-control";

const RISK_WEIGHT: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  moderate: 2,
  low: 1,
};

function matchesSearch(lib: LibraryControlRecord, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    lib.name.toLowerCase().includes(q) ||
    lib.shortName.toLowerCase().includes(q) ||
    lib.id.toLowerCase().includes(q)
  );
}

function matchesArrayFilter<T>(value: T, filter?: T[]): boolean {
  if (!filter || filter.length === 0) return true;
  return filter.includes(value);
}

function sortLibraries(
  libs: LibraryControlRecord[],
  sortBy?: LibraryControlFilters["sortBy"]
): LibraryControlRecord[] {
  if (!sortBy) return libs;
  const sorted = [...libs];
  switch (sortBy) {
    case "risk":
      sorted.sort((a, b) => RISK_WEIGHT[b.risk] - RISK_WEIGHT[a.risk]);
      break;
    case "dependency-pressure":
      sorted.sort((a, b) => b.dependencyPressure - a.dependencyPressure);
      break;
    case "freshness":
      sorted.sort((a, b) => a.freshnessPercent - b.freshnessPercent);
      break;
    case "coverage":
      sorted.sort((a, b) => a.coveragePercent - b.coveragePercent);
      break;
    case "last-audit":
      sorted.sort((a, b) => {
        const da = a.lastAuditAt ? new Date(a.lastAuditAt).getTime() : 0;
        const db = b.lastAuditAt ? new Date(b.lastAuditAt).getTime() : 0;
        return da - db;
      });
      break;
    case "control-score":
      sorted.sort((a, b) => {
        const sa = computeLibraryControlScore(a);
        const sb = computeLibraryControlScore(b);
        return sa - sb;
      });
      break;
  }
  return sorted;
}

export function useLibraryControl() {
  const [filters, setFilters] = useState<LibraryControlFilters>({ ...DEFAULT_FILTERS });
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);

  const filteredLibraries = useMemo(() => {
    let result = LIBRARIES.filter((lib) => {
      if (!matchesSearch(lib, filters.query)) return false;
      if (!matchesArrayFilter(lib.authorityStatus, filters.authorityStatus)) return false;
      if (!matchesArrayFilter(lib.controlState, filters.controlState)) return false;
      if (!matchesArrayFilter(lib.risk, filters.risk)) return false;
      if (filters.staleOnly && !lib.stale) return false;
      if (filters.blockedOnly && !lib.blocked) return false;
      if (filters.missingAuthorityOnly && !lib.missingAuthority) return false;
      if (filters.driftOnly && !lib.driftAlert) return false;
      return true;
    });
    result = sortLibraries(result, filters.sortBy);
    return result;
  }, [filters]);

  const selectedLibrary = useMemo<LibraryDetail | null>(() => {
    if (!selectedLibraryId) return null;
    return LIBRARY_DETAILS[selectedLibraryId] ?? null;
  }, [selectedLibraryId]);

  const unsafeLibraries = useMemo(
    () => LIBRARIES.filter((l) => l.controlState === "unsafe"),
    []
  );

  const blockedLibraries = useMemo(
    () => LIBRARIES.filter((l) => l.blocked),
    []
  );

  const staleLibraries = useMemo(
    () => LIBRARIES.filter((l) => l.stale),
    []
  );

  const missingAuthorityLibraries = useMemo(
    () => LIBRARIES.filter((l) => l.missingAuthority),
    []
  );

  const driftLibraries = useMemo(
    () => LIBRARIES.filter((l) => l.driftAlert),
    []
  );

  const setQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  }, []);

  const setAuthorityFilter = useCallback((authorityStatus?: AuthorityStatus[]) => {
    setFilters((prev) => ({ ...prev, authorityStatus }));
  }, []);

  const setControlStateFilter = useCallback((controlState?: ControlState[]) => {
    setFilters((prev) => ({ ...prev, controlState }));
  }, []);

  const setRiskFilter = useCallback((risk?: RiskLevel[]) => {
    setFilters((prev) => ({ ...prev, risk }));
  }, []);

  const setSortBy = useCallback((sortBy: LibraryControlFilters["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const toggleStaleOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, staleOnly: !prev.staleOnly }));
  }, []);

  const toggleBlockedOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, blockedOnly: !prev.blockedOnly }));
  }, []);

  const toggleMissingAuthorityOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, missingAuthorityOnly: !prev.missingAuthorityOnly }));
  }, []);

  const toggleDriftOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, driftOnly: !prev.driftOnly }));
  }, []);

  const updateFilters = useCallback((updates: Partial<LibraryControlFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const applyCriticalOnlyPreset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, risk: ["critical"] });
  }, []);

  const applyUnsafePreset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, controlState: ["unsafe"] });
  }, []);

  const applyBlockedPreset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, blockedOnly: true });
  }, []);

  const applyStalePreset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, staleOnly: true });
  }, []);

  const applyDriftPreset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, driftOnly: true });
  }, []);

  const applyMissingAuthorityPreset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, missingAuthorityOnly: true });
  }, []);

  const selectLibrary = useCallback((id: string) => {
    setSelectedLibraryId(id);
  }, []);

  const clearSelectedLibrary = useCallback(() => {
    setSelectedLibraryId(null);
  }, []);

  const selectFirstVisibleLibrary = useCallback(() => {
    if (filteredLibraries.length > 0) {
      setSelectedLibraryId(filteredLibraries[0].id);
    }
  }, [filteredLibraries]);

  const runControlAction = useCallback((actionType: ControlActionType) => {
    toast.info(`Control action "${actionType}" is not yet connected to a backend endpoint.`);
  }, []);

  const assignMaintenanceMode = useCallback((_libraryId: string, modeId: string) => {
    toast.info(`Maintenance mode "${modeId}" is not yet connected to a backend endpoint.`);
  }, []);

  const getLibraryControlScore = useCallback((lib: LibraryControlRecord) => {
    return computeLibraryControlScore({
      authorityStatus: lib.authorityStatus,
      coveragePercent: lib.coveragePercent,
      freshnessPercent: lib.freshnessPercent,
      integrityPercent: lib.integrityPercent,
      dependencyPressure: lib.dependencyPressure,
    });
  }, []);

  const getRiskWeight = useCallback((risk: RiskLevel) => {
    return RISK_WEIGHT[risk];
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.query !== "" ||
      (filters.authorityStatus !== undefined && filters.authorityStatus.length > 0) ||
      (filters.controlState !== undefined && filters.controlState.length > 0) ||
      (filters.risk !== undefined && filters.risk.length > 0) ||
      filters.staleOnly === true ||
      filters.blockedOnly === true ||
      filters.missingAuthorityOnly === true ||
      filters.driftOnly === true
    );
  }, [filters]);

  const visibleCount = filteredLibraries.length;
  const totalCount = LIBRARIES.length;

  return {
    filters,
    selectedLibraryId,
    selectedLibrary,
    filteredLibraries,

    unsafeLibraries,
    blockedLibraries,
    staleLibraries,
    missingAuthorityLibraries,
    driftLibraries,

    setQuery,
    setAuthorityFilter,
    setControlStateFilter,
    setRiskFilter,
    setSortBy,
    toggleStaleOnly,
    toggleBlockedOnly,
    toggleMissingAuthorityOnly,
    toggleDriftOnly,
    updateFilters,
    clearFilters,

    applyCriticalOnlyPreset,
    applyUnsafePreset,
    applyBlockedPreset,
    applyStalePreset,
    applyDriftPreset,
    applyMissingAuthorityPreset,

    selectLibrary,
    clearSelectedLibrary,
    selectFirstVisibleLibrary,

    runControlAction,
    assignMaintenanceMode,

    getLibraryControlScore,
    getRiskWeight,

    hasActiveFilters,
    visibleCount,
    totalCount,
  };
}
