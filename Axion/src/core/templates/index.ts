export { selectTemplates } from "./selector.js";
export type { TemplateIndexEntry, TemplateIndex, SelectedTemplate, OmittedTemplate, BaselineWarning, TemplateSelectionResult } from "./selector.js";

export { renderTemplate, countPlaceholders, scanUnresolvedPlaceholders, buildAutoContext } from "./renderer.js";
export type { UnresolvedEntry } from "./renderer.js";

export { writeSelectionResult, writeRenderedDocs } from "./evidence.js";

export { fillTemplate, parsePlaceholder, resolvePlaceholder } from "./filler.js";
export type { FillContext, FilledTemplate, PlaceholderSyntax, CAN03Unknown } from "./filler.js";

export { checkCompleteness, checkAllTemplates } from "./completenessGate.js";
export type { CompletenessCheck, CompletenessResult } from "./completenessGate.js";
