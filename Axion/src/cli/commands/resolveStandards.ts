import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { resolveStandards } from "../../core/standards/resolver.js";

export function cmdResolveStandards(runDir: string, libraryPath?: string): void {
  const resolvedLibraryPath = libraryPath ?? join(".", "libraries", "standards");

  const normalizedPath = join(runDir, "intake", "normalized_payload.json");
  if (!existsSync(normalizedPath)) {
    console.error(`Normalized payload not found: ${normalizedPath}`);
    console.error("Run S1_INGEST_NORMALIZE first to produce intake/normalized_payload.json");
    process.exit(1);
  }

  const normalizedInput = JSON.parse(readFileSync(normalizedPath, "utf-8"));
  const output = resolveStandards(normalizedInput, resolvedLibraryPath);

  console.log(`Standards Resolution Complete`);
  console.log(`  Packs selected: ${output.selected_packs.length}`);
  for (const pack of output.selected_packs) {
    console.log(`    - ${pack.pack_id}@${pack.pack_version} (category: ${pack.category}, specificity: ${pack.specificity_score})`);
  }
  console.log(`  Rules resolved: ${output.resolved_rules.length}`);
  console.log(`    Fixed: ${output.resolved_rules.filter((r) => r.fixed).length}`);
  console.log(`    Configurable: ${output.resolved_rules.filter((r) => !r.fixed).length}`);
  console.log(`  Conflicts: ${output.conflict_log.length}`);
  console.log(`  Overrides applied: ${output.overrides_applied.length}`);
  console.log(`  Overrides blocked: ${output.overrides_blocked.length}`);
}
