import { ensureDir } from "../../utils/fs.js";

export interface HandoffPacket {
  run_id: string;
  handoff_dir: string;
  artifacts: string[];
}

export function createHandoffDir(runDir: string): string {
  const handoffDir = `${runDir}/state/handoff_packet`;
  ensureDir(handoffDir);
  return handoffDir;
}
