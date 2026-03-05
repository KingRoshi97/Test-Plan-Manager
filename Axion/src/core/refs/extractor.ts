export interface ExtractedRef {
  source_path: string;
  ref_id: string;
  ref_type: string;
  context: string;
}

const ENTITY_COLLECTIONS: Array<{
  collection_path: string;
  id_field: string;
  ref_fields: Array<{ field: string; target_type: string; required: boolean }>;
}> = [
  {
    collection_path: "entities.workflows",
    id_field: "workflow_id",
    ref_fields: [
      { field: "actor_role_ref", target_type: "ROLE", required: true },
    ],
  },
  {
    collection_path: "entities.permissions",
    id_field: "perm_id",
    ref_fields: [
      { field: "role_ref", target_type: "ROLE", required: true },
    ],
  },
  {
    collection_path: "entities.screens",
    id_field: "screen_id",
    ref_fields: [
      { field: "primary_actor_role_ref", target_type: "ROLE", required: false },
    ],
  },
];

const ID_PATTERNS: Record<string, RegExp> = {
  ROLE: /\bROLE-\d{3}\b/g,
  FEAT: /\bFEAT-\d{3}\b/g,
  WF: /\bWF-\d{3}\b/g,
  PERM: /\bPERM-\d{3}\b/g,
  SCREEN: /\bSCR-\d{3}\b/g,
  DATA: /\bDATA-\d{3}\b/g,
  OP: /\bOP-\d{3}\b/g,
  INTG: /\bINTG-\d{3}\b/g,
  UNK: /\bUNK-\d{4}\b/g,
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

export function extractRefs(artifact: unknown, artifactPath: string): ExtractedRef[] {
  if (artifact == null || typeof artifact !== "object") {
    return [];
  }
  const refs: ExtractedRef[] = [];
  extractRefsRecursive(artifact as Record<string, unknown>, artifactPath, "", refs);
  return refs;
}

function extractRefsRecursive(
  obj: Record<string, unknown>,
  artifactPath: string,
  currentPath: string,
  refs: ExtractedRef[]
): void {
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = currentPath ? `${currentPath}.${key}` : key;

    if (typeof value === "string") {
      for (const [refType, pattern] of Object.entries(ID_PATTERNS)) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match: RegExpExecArray | null;
        while ((match = regex.exec(value)) !== null) {
          refs.push({
            source_path: artifactPath,
            ref_id: match[0],
            ref_type: refType,
            context: fieldPath,
          });
        }
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item != null && typeof item === "object") {
          extractRefsRecursive(
            item as Record<string, unknown>,
            artifactPath,
            `${fieldPath}[${i}]`,
            refs
          );
        } else if (typeof item === "string") {
          for (const [refType, pattern] of Object.entries(ID_PATTERNS)) {
            const regex = new RegExp(pattern.source, pattern.flags);
            let match: RegExpExecArray | null;
            while ((match = regex.exec(item)) !== null) {
              refs.push({
                source_path: artifactPath,
                ref_id: match[0],
                ref_type: refType,
                context: `${fieldPath}[${i}]`,
              });
            }
          }
        }
      }
    } else if (value != null && typeof value === "object") {
      extractRefsRecursive(
        value as Record<string, unknown>,
        artifactPath,
        fieldPath,
        refs
      );
    }
  }
}

export function extractRefsFromSpec(spec: unknown): ExtractedRef[] {
  if (spec == null || typeof spec !== "object") {
    return [];
  }
  const specObj = spec as Record<string, unknown>;
  const refs: ExtractedRef[] = [];

  for (const collectionDef of ENTITY_COLLECTIONS) {
    const items = getNestedValue(specObj, collectionDef.collection_path);
    if (!Array.isArray(items)) continue;

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as Record<string, unknown> | undefined;
      if (item == null) continue;

      const sourceId = item[collectionDef.id_field] as string | undefined;

      for (const refField of collectionDef.ref_fields) {
        const refValue = item[refField.field];
        if (typeof refValue === "string" && refValue.length > 0) {
          refs.push({
            source_path: `${collectionDef.collection_path}[${i}]`,
            ref_id: refValue,
            ref_type: refField.target_type,
            context: `${collectionDef.collection_path}[${i}].${refField.field} (from ${sourceId ?? "unknown"})`,
          });
        }
      }
    }
  }

  const genericRefs = extractRefs(specObj, "spec");
  const structuralRefIds = new Set(refs.map((r) => `${r.source_path}:${r.ref_id}`));
  for (const ref of genericRefs) {
    const key = `${ref.source_path}:${ref.ref_id}`;
    if (!structuralRefIds.has(key)) {
      refs.push(ref);
    }
  }

  return refs;
}

export function extractRefsFromTemplate(templateContent: string, templatePath: string): ExtractedRef[] {
  if (!templateContent || typeof templateContent !== "string") {
    return [];
  }
  const refs: ExtractedRef[] = [];

  for (const [refType, pattern] of Object.entries(ID_PATTERNS)) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(templateContent)) !== null) {
      const lineNumber = templateContent.substring(0, match.index).split("\n").length;
      refs.push({
        source_path: templatePath,
        ref_id: match[0],
        ref_type: refType,
        context: `line:${lineNumber}`,
      });
    }
  }

  return refs;
}
