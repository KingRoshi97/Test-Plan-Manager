import { NotImplementedError } from "../../utils/errors.js";
import type { KitManifest } from "./schemas.js";

export interface KitValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateKit(_manifest: KitManifest): KitValidationResult {
  throw new NotImplementedError("validateKit");
}
