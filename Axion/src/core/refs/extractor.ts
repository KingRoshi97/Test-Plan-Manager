import { NotImplementedError } from "../../utils/errors.js";

export interface ExtractedRef {
  source_path: string;
  ref_id: string;
  ref_type: string;
  context: string;
}

export function extractRefs(_artifact: unknown, _artifactPath: string): ExtractedRef[] {
  throw new NotImplementedError("extractRefs");
}

export function extractRefsFromSpec(_spec: unknown): ExtractedRef[] {
  throw new NotImplementedError("extractRefsFromSpec");
}

export function extractRefsFromTemplate(_templateContent: string, _templatePath: string): ExtractedRef[] {
  throw new NotImplementedError("extractRefsFromTemplate");
}
