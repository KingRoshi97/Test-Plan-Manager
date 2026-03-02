export { loadTemplateIndex, selectTemplates } from "./selector.js";
export type { TemplateEntry, TemplateIndex, TemplateSelection } from "./selector.js";

export { fillTemplate, parsePlaceholder, resolvePlaceholder } from "./filler.js";
export type { FillContext, FilledTemplate, PlaceholderSyntax } from "./filler.js";

export { checkCompleteness, checkAllTemplates } from "./completenessGate.js";
export type { CompletenessCheck, CompletenessResult } from "./completenessGate.js";
