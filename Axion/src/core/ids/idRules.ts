import { NotImplementedError } from "../../utils/errors.js";

export type EntityPrefix =
  | "rol_"
  | "feat_"
  | "wf_"
  | "perm_"
  | "scr_"
  | "cmp_"
  | "dat_"
  | "op_"
  | "int_"
  | "nfr_"
  | "unk_";

export const ENTITY_PREFIXES: Record<string, EntityPrefix> = {
  role: "rol_",
  feature: "feat_",
  workflow: "wf_",
  permission: "perm_",
  screen: "scr_",
  component: "cmp_",
  data_object: "dat_",
  operation: "op_",
  integration: "int_",
  nfr: "nfr_",
  unknown: "unk_",
};

export interface IdValidationResult {
  valid: boolean;
  errors: Array<{
    error_code: "INVALID_FORMAT" | "INVALID_PREFIX" | "DUPLICATE_VALUE";
    id: string;
    message: string;
  }>;
}

export function validateId(_id: string, _entityType: string): boolean {
  throw new NotImplementedError("validateId");
}

export function validateAllIds(_spec: unknown): IdValidationResult {
  throw new NotImplementedError("validateAllIds");
}

export function generateId(_entityType: string, _name: string): string {
  throw new NotImplementedError("generateId");
}
