import { NotImplementedError } from "../../utils/errors.js";

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

export function createCAS(_options: CASOptions): ContentAddressableStore {
  throw new NotImplementedError("createCAS");
}

export function computeContentHash(_content: Buffer | string, _algorithm?: string): string {
  throw new NotImplementedError("computeContentHash");
}
