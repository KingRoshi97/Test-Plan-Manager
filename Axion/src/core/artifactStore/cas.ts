import { createHash } from "node:crypto";
import { writeFileSync, readFileSync, existsSync, readdirSync, unlinkSync, statSync } from "node:fs";
import { join } from "node:path";
import { ensureDir } from "../../utils/fs.js";

export interface ContentAddressableStore {
  put(content: Buffer | string): string;
  get(hash: string): Buffer | null;
  has(hash: string): boolean;
  delete(hash: string): boolean;
  list(): string[];
}

export interface CASOptions {
  storePath: string;
  algorithm?: "sha256" | "sha512";
}

export function computeContentHash(content: Buffer | string, algorithm: string = "sha256"): string {
  return createHash(algorithm).update(content).digest("hex");
}

function hashToPath(storePath: string, hash: string): string {
  const prefix = hash.slice(0, 2);
  return join(storePath, "objects", prefix, hash);
}

export function createCAS(options: CASOptions): ContentAddressableStore {
  const { storePath, algorithm = "sha256" } = options;

  ensureDir(join(storePath, "objects"));

  return {
    put(content: Buffer | string): string {
      const hash = computeContentHash(content, algorithm);
      const objectPath = hashToPath(storePath, hash);

      if (!existsSync(objectPath)) {
        ensureDir(join(storePath, "objects", hash.slice(0, 2)));
        const buf = typeof content === "string" ? Buffer.from(content, "utf-8") : content;
        writeFileSync(objectPath, buf);
      }

      return hash;
    },

    get(hash: string): Buffer | null {
      const objectPath = hashToPath(storePath, hash);
      if (!existsSync(objectPath)) {
        return null;
      }
      return readFileSync(objectPath);
    },

    has(hash: string): boolean {
      return existsSync(hashToPath(storePath, hash));
    },

    delete(hash: string): boolean {
      const objectPath = hashToPath(storePath, hash);
      if (!existsSync(objectPath)) {
        return false;
      }
      unlinkSync(objectPath);
      return true;
    },

    list(): string[] {
      const objectsDir = join(storePath, "objects");
      if (!existsSync(objectsDir)) {
        return [];
      }

      const hashes: string[] = [];
      const prefixes = readdirSync(objectsDir);

      for (const prefix of prefixes) {
        const prefixDir = join(objectsDir, prefix);
        if (!statSync(prefixDir).isDirectory()) continue;
        const files = readdirSync(prefixDir);
        for (const file of files) {
          hashes.push(file);
        }
      }

      return hashes;
    },
  };
}
