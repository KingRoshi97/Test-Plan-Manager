import type { KitManifest } from "./schemas.js";

export interface KitValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateKit(manifest: KitManifest): KitValidationResult {
  const errors: string[] = [];

  if (!manifest.kit_id || typeof manifest.kit_id !== "string") {
    errors.push("kit_id is required and must be a string");
  }
  if (!manifest.run_id || typeof manifest.run_id !== "string") {
    errors.push("run_id is required and must be a string");
  }
  if (!manifest.version || typeof manifest.version !== "string") {
    errors.push("version is required and must be a string");
  }
  if (!manifest.created_at || typeof manifest.created_at !== "string") {
    errors.push("created_at is required and must be a string");
  }
  if (!Array.isArray(manifest.artifacts)) {
    errors.push("artifacts must be an array");
  } else {
    for (let i = 0; i < manifest.artifacts.length; i++) {
      const art = manifest.artifacts[i];
      if (!art.artifact_id) errors.push(`artifacts[${i}].artifact_id is required`);
      if (!art.path) errors.push(`artifacts[${i}].path is required`);
      if (!art.type) errors.push(`artifacts[${i}].type is required`);
      if (!art.hash) errors.push(`artifacts[${i}].hash is required`);
    }
  }
  if (manifest.metadata === undefined || manifest.metadata === null || typeof manifest.metadata !== "object") {
    errors.push("metadata is required and must be an object");
  }

  return { valid: errors.length === 0, errors };
}
