import { ensureDir } from "../../utils/fs.js";
import { join } from "node:path";

export function createKitLayout(runDir: string): void {
  ensureDir(join(runDir, "kit"));
}
