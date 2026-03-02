import { existsSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, writeJson } from "../../utils/fs.js";

export function cmdInit(baseDir: string = "."): void {
  const axionDir = join(baseDir, ".axion");
  ensureDir(join(axionDir, "runs"));

  const counterPath = join(axionDir, "run_counter.json");
  if (!existsSync(counterPath)) {
    writeJson(counterPath, { next: 1 });
    console.log(`Created run_counter.json at ${counterPath}`);
  }

  console.log(`Initialized .axion/ directory at ${axionDir}`);
}
