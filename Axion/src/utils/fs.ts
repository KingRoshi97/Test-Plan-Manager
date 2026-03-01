import { writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function writeJson(filePath: string, data: unknown): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export function appendJsonl(filePath: string, entry: unknown): void {
  ensureDir(dirname(filePath));
  appendFileSync(filePath, JSON.stringify(entry) + "\n", "utf-8");
}
