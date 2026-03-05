import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync as fsUnlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { ensureDir } from "../../utils/fs.js";

export interface StorageRef {
  scheme: "cas" | "file" | "inline";
  hash?: string;
  path?: string;
  size?: number;
  media_type?: string;
}

export interface RefStore {
  set(name: string, ref: StorageRef): void;
  get(name: string): StorageRef | null;
  delete(name: string): boolean;
  list(): string[];
  resolve(name: string): StorageRef | null;
  allRefs(): Map<string, StorageRef>;
}

export function parseRef(refString: string): StorageRef {
  const colonIdx = refString.indexOf(":");
  if (colonIdx === -1) {
    throw new Error(`ERR-ART-002: Invalid ref format — missing scheme separator: "${refString}"`);
  }

  const scheme = refString.slice(0, colonIdx) as StorageRef["scheme"];
  if (scheme !== "cas" && scheme !== "file" && scheme !== "inline") {
    throw new Error(`ERR-ART-002: Unknown ref scheme: "${scheme}"`);
  }

  const rest = refString.slice(colonIdx + 1);

  if (scheme === "cas") {
    return { scheme, hash: rest };
  }

  if (scheme === "file") {
    return { scheme, path: rest };
  }

  return { scheme, path: rest };
}

export function formatRef(ref: StorageRef): string {
  if (ref.scheme === "cas") {
    if (!ref.hash) throw new Error("ERR-ART-002: CAS ref must have a hash");
    return `cas:${ref.hash}`;
  }

  if (ref.scheme === "file") {
    if (!ref.path) throw new Error("ERR-ART-002: File ref must have a path");
    return `file:${ref.path}`;
  }

  if (ref.scheme === "inline") {
    return `inline:${ref.path || ""}`;
  }

  throw new Error(`ERR-ART-002: Unknown ref scheme: "${ref.scheme}"`);
}

export function resolveRef(ref: StorageRef, basePath: string): string {
  if (ref.scheme === "cas") {
    if (!ref.hash) throw new Error("ERR-ART-002: CAS ref must have a hash");
    const prefix = ref.hash.slice(0, 2);
    return join(basePath, "objects", prefix, ref.hash);
  }

  if (ref.scheme === "file") {
    if (!ref.path) throw new Error("ERR-ART-002: File ref must have a path");
    return resolve(basePath, ref.path);
  }

  throw new Error(`ERR-ART-003: Cannot resolve inline refs to a file path`);
}

export function createRefStore(storePath: string): RefStore {
  const refsDir = join(storePath, "refs");
  ensureDir(refsDir);

  return {
    set(name: string, ref: StorageRef): void {
      const refPath = join(refsDir, `${name}.json`);
      writeFileSync(refPath, JSON.stringify(ref, null, 2) + "\n", "utf-8");
    },

    get(name: string): StorageRef | null {
      const refPath = join(refsDir, `${name}.json`);
      if (!existsSync(refPath)) return null;
      return JSON.parse(readFileSync(refPath, "utf-8")) as StorageRef;
    },

    delete(name: string): boolean {
      const refPath = join(refsDir, `${name}.json`);
      if (!existsSync(refPath)) return false;
      fsUnlinkSync(refPath);
      return true;
    },

    list(): string[] {
      if (!existsSync(refsDir)) return [];
      return readdirSync(refsDir)
        .filter((f: string) => f.endsWith(".json"))
        .map((f: string) => f.replace(/\.json$/, ""));
    },

    resolve(name: string): StorageRef | null {
      return this.get(name);
    },

    allRefs(): Map<string, StorageRef> {
      const result = new Map<string, StorageRef>();
      for (const name of this.list()) {
        const ref = this.get(name);
        if (ref) result.set(name, ref);
      }
      return result;
    },
  };
}
