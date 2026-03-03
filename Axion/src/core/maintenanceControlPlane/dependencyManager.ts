import type { DependencyDelta, DependencyUpdateReport } from "./types.js";
import { isoNow } from "../../utils/time.js";

export interface VersionBumpPolicy {
  allow_major: boolean;
  allow_minor: boolean;
  allow_patch: boolean;
  blocklist?: string[];
}

export interface ManifestEntry {
  package_name: string;
  current_version: string;
  latest_version: string;
}

function classifyBump(before: string, after: string): "patch" | "minor" | "major" {
  const [bMaj, bMin] = before.replace(/^[^0-9]*/, "").split(".").map(Number);
  const [aMaj, aMin] = after.replace(/^[^0-9]*/, "").split(".").map(Number);
  if (aMaj !== bMaj) return "major";
  if (aMin !== bMin) return "minor";
  return "patch";
}

export function applyVersionBumps(
  manifests: Map<string, ManifestEntry[]>,
  policy: VersionBumpPolicy,
): { deltas: DependencyDelta[]; updatedManifests: Map<string, ManifestEntry[]> } {
  const deltas: DependencyDelta[] = [];
  const updatedManifests = new Map<string, ManifestEntry[]>();

  for (const [manifestPath, entries] of manifests) {
    const updated: ManifestEntry[] = [];
    for (const entry of entries) {
      if (policy.blocklist?.includes(entry.package_name)) {
        updated.push(entry);
        continue;
      }

      const changeType = classifyBump(entry.current_version, entry.latest_version);

      const allowed =
        (changeType === "patch" && policy.allow_patch) ||
        (changeType === "minor" && policy.allow_minor) ||
        (changeType === "major" && policy.allow_major);

      if (allowed && entry.current_version !== entry.latest_version) {
        deltas.push({
          package_name: entry.package_name,
          before: entry.current_version,
          after: entry.latest_version,
          change_type: changeType,
          breaking: changeType === "major",
        });
        updated.push({ ...entry, current_version: entry.latest_version });
      } else {
        updated.push(entry);
      }
    }
    updatedManifests.set(manifestPath, updated);
  }

  return { deltas, updatedManifests };
}

export function updateLockfiles(_repoPath: string): string[] {
  return [];
}

export function detectBreakingChanges(deltas: DependencyDelta[]): string[] {
  return deltas.filter((d) => d.breaking).map((d) => `${d.package_name}: ${d.before} → ${d.after} (major)`);
}

export function buildDependencyUpdateReport(
  runId: string,
  manifestPaths: string[],
  deltas: DependencyDelta[],
  lockfilesUpdated: string[],
): DependencyUpdateReport {
  const breakingChanges = detectBreakingChanges(deltas);
  const changelogLines = deltas.map(
    (d) => `- ${d.package_name}: ${d.before} → ${d.after} (${d.change_type})`,
  );

  return {
    run_id: runId,
    manifests_processed: manifestPaths,
    deltas,
    lockfiles_updated: lockfilesUpdated,
    changelog_entry: changelogLines.join("\n"),
    breaking_changes: breakingChanges,
    created_at: isoNow(),
  };
}
