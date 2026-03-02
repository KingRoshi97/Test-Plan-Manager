import { readFileSync } from "node:fs";
import { join } from "node:path";

const FIXTURES_DIR = join(import.meta.dirname ?? ".", "..", "fixtures");

export function loadFixture(name: string): unknown {
  const raw = readFileSync(join(FIXTURES_DIR, name), "utf-8");
  return JSON.parse(raw);
}

export function loadFixtureText(name: string): string {
  return readFileSync(join(FIXTURES_DIR, name), "utf-8");
}
