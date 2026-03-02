import { NotImplementedError } from "../../utils/errors.js";

export interface StorageRef {
  scheme: "cas" | "file" | "inline";
  hash?: string;
  path?: string;
  size?: number;
  media_type?: string;
}

export function parseRef(_refString: string): StorageRef {
  throw new NotImplementedError("parseRef");
}

export function formatRef(_ref: StorageRef): string {
  throw new NotImplementedError("formatRef");
}

export function resolveRef(_ref: StorageRef, _basePath: string): string {
  throw new NotImplementedError("resolveRef");
}
