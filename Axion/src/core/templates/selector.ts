import { NotImplementedError } from "../../utils/errors.js";

export interface TemplateEntry {
  template_id: string;
  title: string;
  type: string;
  template_version: string;
  file_path: string;
  status: "draft" | "active" | "deprecated";
  applies_when: {
    category?: string[];
    type_preset?: string[];
    audience_context?: string[];
    build_target?: string[];
    skill_level?: string[];
    requires_data_enabled?: boolean | null;
    requires_auth_required?: boolean | null;
    requires_integrations_enabled?: boolean | null;
  };
  requiredness: "always" | "conditional" | "optional";
  required_by_skill_level: {
    beginner: "required" | "optional" | "omit";
    intermediate: "required" | "optional" | "omit";
    expert: "required" | "optional" | "omit";
  };
  inputs_required: string[];
  derived_inputs?: string[];
  output_path: string;
  upstream_dependencies: string[];
  compliance_gate_id: string;
  references_entities: string[];
  no_duplicate_truth: true;
}

export interface TemplateIndex {
  template_library_version: string;
  template_index_version: string;
  generated_at: string;
  templates: TemplateEntry[];
}

export interface TemplateSelection {
  selected: TemplateEntry[];
  skipped: Array<{ template_id: string; reason: string }>;
}

export function loadTemplateIndex(_indexPath: string): TemplateIndex {
  throw new NotImplementedError("loadTemplateIndex");
}

export function selectTemplates(_index: TemplateIndex, _context: unknown): TemplateSelection {
  throw new NotImplementedError("selectTemplates");
}
