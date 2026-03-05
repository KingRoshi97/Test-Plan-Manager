import type { ExtractedRef } from "./extractor.js";

export interface RefResolutionResult {
  resolved: Array<{ ref: ExtractedRef; target_path: string }>;
  unresolved: Array<{ ref: ExtractedRef; error: string }>;
  all_valid: boolean;
}

const INDEX_MAP: Record<string, { index_path: string; collection_path: string; id_field: string }> = {
  ROLE: { index_path: "index.roles_by_id", collection_path: "entities.roles", id_field: "role_id" },
  FEAT: { index_path: "index.features_by_id", collection_path: "entities.features", id_field: "feature_id" },
  WF: { index_path: "index.workflows_by_id", collection_path: "entities.workflows", id_field: "workflow_id" },
  PERM: { index_path: "index.permissions_by_id", collection_path: "entities.permissions", id_field: "perm_id" },
  SCREEN: { index_path: "index.screens_by_id", collection_path: "entities.screens", id_field: "screen_id" },
  DATA: { index_path: "index.data_objects_by_id", collection_path: "entities.data_objects", id_field: "data_object_id" },
  OP: { index_path: "index.operations_by_id", collection_path: "entities.operations", id_field: "operation_id" },
  INTG: { index_path: "index.integrations_by_id", collection_path: "entities.integrations", id_field: "integration_id" },
  UNK: { index_path: "index.unknowns_by_id", collection_path: "unknowns", id_field: "unknown_id" },
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function findInCollection(
  spec: Record<string, unknown>,
  collectionPath: string,
  idField: string,
  refId: string
): string | null {
  const collection = getNestedValue(spec, collectionPath);
  if (!Array.isArray(collection)) return null;

  for (let i = 0; i < collection.length; i++) {
    const item = collection[i] as Record<string, unknown> | undefined;
    if (item && item[idField] === refId) {
      return `${collectionPath}[${i}]`;
    }
  }
  return null;
}

function findInIndex(
  spec: Record<string, unknown>,
  indexPath: string,
  refId: string
): boolean {
  const index = getNestedValue(spec, indexPath);
  if (index != null && typeof index === "object") {
    return refId in (index as Record<string, unknown>);
  }
  return false;
}

export function resolveRefs(refs: ExtractedRef[], spec: unknown): RefResolutionResult {
  if (spec == null || typeof spec !== "object") {
    return {
      resolved: [],
      unresolved: refs.map((ref) => ({
        ref,
        error: "Spec is null or not an object",
      })),
      all_valid: refs.length === 0,
    };
  }

  const specObj = spec as Record<string, unknown>;
  const resolved: RefResolutionResult["resolved"] = [];
  const unresolved: RefResolutionResult["unresolved"] = [];

  for (const ref of refs) {
    const mapping = INDEX_MAP[ref.ref_type];

    if (!mapping) {
      unresolved.push({
        ref,
        error: `Unknown ref type: ${ref.ref_type}`,
      });
      continue;
    }

    if (findInIndex(specObj, mapping.index_path, ref.ref_id)) {
      resolved.push({
        ref,
        target_path: `${mapping.index_path}.${ref.ref_id}`,
      });
      continue;
    }

    const collectionPath = findInCollection(
      specObj,
      mapping.collection_path,
      mapping.id_field,
      ref.ref_id
    );

    if (collectionPath) {
      resolved.push({ ref, target_path: collectionPath });
    } else {
      unresolved.push({
        ref,
        error: `Reference ${ref.ref_id} (type ${ref.ref_type}) not found in ${mapping.collection_path} or ${mapping.index_path}`,
      });
    }
  }

  return {
    resolved,
    unresolved,
    all_valid: unresolved.length === 0,
  };
}

export async function validateRefIntegrity(spec: unknown): Promise<RefResolutionResult> {
  if (spec == null || typeof spec !== "object") {
    return { resolved: [], unresolved: [], all_valid: true };
  }

  const { extractRefsFromSpec } = await import("./extractor.js");
  const refs = extractRefsFromSpec(spec);
  return resolveRefs(refs, spec);
}
