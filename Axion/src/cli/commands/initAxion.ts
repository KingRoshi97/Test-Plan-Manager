import { ensureDir } from "../../utils/fs.js";
import { join } from "node:path";

export function cmdInit(baseDir: string = "."): void {
  const axionDir = join(baseDir, ".axion");
  ensureDir(join(axionDir, "runs"));
  console.log(`Initialized .axion/ directory at ${axionDir}`);
}
