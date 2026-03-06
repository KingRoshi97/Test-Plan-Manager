import { useState, useCallback, useEffect } from "react";
import type { UpgradeStatus } from "../data/upgrade-matrix";
import { libraries } from "../data/upgrade-matrix";

const STORAGE_KEY = "axion-upgrade-progress";

interface ProgressState {
  completedArtifacts: Record<string, string[]>;
  libraryStatuses: Record<string, UpgradeStatus>;
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completedArtifacts: {}, libraryStatuses: {} };
}

function saveState(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useUpgradeProgress() {
  const [state, setState] = useState<ProgressState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleArtifact = useCallback((libraryId: string, artifact: string) => {
    setState((prev) => {
      const current = prev.completedArtifacts[libraryId] || [];
      const next = current.includes(artifact)
        ? current.filter((a) => a !== artifact)
        : [...current, artifact];
      return { ...prev, completedArtifacts: { ...prev.completedArtifacts, [libraryId]: next } };
    });
  }, []);

  const setLibraryStatus = useCallback((libraryId: string, status: UpgradeStatus) => {
    setState((prev) => ({
      ...prev,
      libraryStatuses: { ...prev.libraryStatuses, [libraryId]: status },
    }));
  }, []);

  const isArtifactComplete = useCallback(
    (libraryId: string, artifact: string) => {
      return (state.completedArtifacts[libraryId] || []).includes(artifact);
    },
    [state.completedArtifacts],
  );

  const getLibraryStatus = useCallback(
    (libraryId: string): UpgradeStatus => {
      return state.libraryStatuses[libraryId] || "not-started";
    },
    [state.libraryStatuses],
  );

  const getLibraryArtifactProgress = useCallback(
    (libraryId: string) => {
      const lib = libraries.find((l) => l.id === libraryId);
      if (!lib) return { completed: 0, total: 0, percent: 0 };
      const completed = (state.completedArtifacts[libraryId] || []).length;
      const total = lib.requiredArtifacts.length;
      return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },
    [state.completedArtifacts],
  );

  const getOverallProgress = useCallback(() => {
    const totalArtifacts = libraries.reduce((s, l) => s + l.requiredArtifacts.length, 0);
    const completedArtifacts = Object.values(state.completedArtifacts).reduce(
      (s, arr) => s + arr.length,
      0,
    );
    return {
      totalArtifacts,
      completedArtifacts,
      percent: totalArtifacts > 0 ? Math.round((completedArtifacts / totalArtifacts) * 100) : 0,
    };
  }, [state.completedArtifacts]);

  const getPhaseProgress = useCallback(
    (phase: 1 | 2 | 3) => {
      const phaseLibs = libraries.filter((l) => l.phase === phase);
      const total = phaseLibs.reduce((s, l) => s + l.requiredArtifacts.length, 0);
      const completed = phaseLibs.reduce(
        (s, l) => s + (state.completedArtifacts[l.id] || []).length,
        0,
      );
      return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },
    [state.completedArtifacts],
  );

  return {
    toggleArtifact,
    setLibraryStatus,
    isArtifactComplete,
    getLibraryStatus,
    getLibraryArtifactProgress,
    getOverallProgress,
    getPhaseProgress,
  };
}
