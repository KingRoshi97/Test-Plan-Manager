import { createHash } from "node:crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input, "utf-8").digest("hex");
}

export function shortHash(input: string, length: number = 8): string {
  return sha256(input).slice(0, length);
}
