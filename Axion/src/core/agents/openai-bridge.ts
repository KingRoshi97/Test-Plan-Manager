import type { CanonicalSpec } from "../canonical/specBuilder.js";
import type { WorkBreakdownOutput, WorkUnit } from "../planning/workBreakdown.js";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{ message: { content: string | null } }>;
}

let _client: any = null;

async function getClient(): Promise<any | null> {
  if (_client) return _client;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey) return null;
  try {
    const mod = await import("openai");
    const OpenAI = mod.default ?? mod;
    _client = new OpenAI({ apiKey, baseURL });
    return _client;
  } catch {
    return null;
  }
}

async function chatCompletion(messages: OpenAIMessage[], maxTokens = 4096): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const response: OpenAIResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_completion_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content ?? null;
  } catch (err: any) {
    console.log(`  [IA] OpenAI call failed: ${err.message ?? err}`);
    return null;
  }
}

function safeJsonParse<T>(text: string | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function isOpenAIAvailable(): boolean {
  return !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
}

export async function enrichCanonicalSpec(
  spec: CanonicalSpec,
  normalizedInput: Record<string, unknown>,
): Promise<CanonicalSpec> {
  const projectName = (normalizedInput as any)?.project?.project_name ?? "Unknown Project";
  const projectOverview = (normalizedInput as any)?.project?.project_overview ?? "";
  const problemStatement = (normalizedInput as any)?.project?.problem_statement ?? "";

  const featureSummary = spec.entities.features.map((f) => `- ${f.name}: ${f.description ?? "no description"}`).join("\n");
  const roleSummary = spec.entities.roles.map((r) => `- ${r.name}: ${r.description ?? r.primary_goal ?? "no description"}`).join("\n");
  const workflowSummary = spec.entities.workflows.map((w) => `- ${w.name}: ${w.steps.join(" → ")}`).join("\n");

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `You are the Internal Agent (IA) of the Axion pipeline. Your job is to enrich a canonical specification with detailed, project-specific descriptions. Return a JSON object with:
- "features": array of objects with "feature_id" and "description" (enriched description for each feature)
- "workflows": array of objects with "workflow_id" and "failure_states" (what can go wrong)
- "rules": object with "must_always" (array of 3-5 project-specific rules) and "must_never" (array of 3-5 things to avoid)
- "definition_of_done": a concise definition of done specific to this project
Only return valid JSON.`,
    },
    {
      role: "user",
      content: `Project: ${projectName}
Overview: ${projectOverview}
Problem: ${problemStatement}

Current Features:
${featureSummary}

Roles:
${roleSummary}

Workflows:
${workflowSummary}

Enrich this specification with better descriptions, failure states, and project-specific rules.`,
    },
  ];

  const result = await chatCompletion(messages);
  const parsed = safeJsonParse<{
    features?: Array<{ feature_id: string; description: string }>;
    workflows?: Array<{ workflow_id: string; failure_states: string }>;
    rules?: { must_always?: string[]; must_never?: string[] };
    definition_of_done?: string;
  }>(result);

  if (!parsed) return spec;

  const enriched = { ...spec };

  if (parsed.features) {
    enriched.entities = { ...enriched.entities };
    enriched.entities.features = enriched.entities.features.map((f) => {
      const match = parsed.features!.find((pf) => pf.feature_id === f.feature_id);
      if (match?.description) {
        return { ...f, description: match.description };
      }
      return f;
    });
  }

  if (parsed.workflows) {
    enriched.entities = { ...enriched.entities };
    enriched.entities.workflows = enriched.entities.workflows.map((w) => {
      const match = parsed.workflows!.find((pw) => pw.workflow_id === w.workflow_id);
      if (match?.failure_states) {
        return { ...w, failure_states: match.failure_states };
      }
      return w;
    });
  }

  if (parsed.rules) {
    enriched.rules = { ...enriched.rules };
    if (parsed.rules.must_always) enriched.rules.must_always = parsed.rules.must_always;
    if (parsed.rules.must_never) enriched.rules.must_never = parsed.rules.must_never;
  }

  if (parsed.definition_of_done) {
    enriched.rules = { ...enriched.rules, definition_of_done: parsed.definition_of_done };
  }

  console.log("  [IA] Canonical spec enriched via OpenAI");
  return enriched;
}

export async function enrichWorkBreakdown(
  breakdown: WorkBreakdownOutput,
  spec: CanonicalSpec,
): Promise<WorkBreakdownOutput> {
  const unitSummary = breakdown.units
    .map((u) => `- ${u.unit_id} (${u.type}): ${u.title}`)
    .join("\n");

  const featureContext = spec.entities.features
    .map((f) => `- ${f.feature_id}: ${f.name} — ${f.description ?? ""}`)
    .join("\n");

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `You are the Internal Agent (IA) enriching a work breakdown for a software project. For each work unit, provide a detailed implementation description and practical acceptance criteria. Return JSON:
{
  "units": [
    { "unit_id": "WU-001", "description": "...", "acceptance_criteria": "..." },
    ...
  ]
}
Only return valid JSON. Keep descriptions actionable and specific (2-3 sentences each).`,
    },
    {
      role: "user",
      content: `Work Units:
${unitSummary}

Features:
${featureContext}

Spec ID: ${spec.meta.spec_id}
Enrich each work unit with implementation details and acceptance criteria.`,
    },
  ];

  const result = await chatCompletion(messages);
  const parsed = safeJsonParse<{
    units?: Array<{ unit_id: string; description?: string; acceptance_criteria?: string }>;
  }>(result);

  if (!parsed?.units) return breakdown;

  const enriched = { ...breakdown };
  enriched.units = enriched.units.map((u) => {
    const match = parsed.units!.find((pu) => pu.unit_id === u.unit_id);
    if (match) {
      return {
        ...u,
        description: match.description ?? u.description,
      };
    }
    return u;
  });

  const unitIndex: Record<string, WorkUnit> = {};
  for (const unit of enriched.units) {
    unitIndex[unit.unit_id] = unit;
  }
  enriched.unit_index = unitIndex;

  console.log("  [IA] Work breakdown enriched via OpenAI");
  return enriched;
}

export async function enrichRenderedTemplate(
  templateContent: string,
  templateId: string,
  projectContext: {
    projectName: string;
    projectOverview: string;
    features: string[];
    roles: string[];
  },
): Promise<string> {
  const unresolvedPlaceholders = templateContent.match(/\{\{\s*[a-zA-Z0-9_.-]+\s*\}\}/g);
  if (!unresolvedPlaceholders || unresolvedPlaceholders.length === 0) {
    return templateContent;
  }

  const uniquePlaceholders = [...new Set(unresolvedPlaceholders)];

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `You are the Internal Agent (IA) filling in template placeholders for a software project document. Replace unresolved placeholders with project-specific content. Return JSON:
{
  "replacements": {
    "placeholder_key": "replacement_value",
    ...
  }
}
Where placeholder_key is the text between {{ and }} (without braces). Only return valid JSON. Make replacements concise and relevant.`,
    },
    {
      role: "user",
      content: `Template: ${templateId}
Project: ${projectContext.projectName}
Overview: ${projectContext.projectOverview}
Features: ${projectContext.features.join(", ")}
Roles: ${projectContext.roles.join(", ")}

Unresolved placeholders to fill:
${uniquePlaceholders.join("\n")}

Provide appropriate values for each placeholder.`,
    },
  ];

  const result = await chatCompletion(messages, 2048);
  const parsed = safeJsonParse<{ replacements?: Record<string, string> }>(result);

  if (!parsed?.replacements) return templateContent;

  let enrichedContent = templateContent;
  for (const [key, value] of Object.entries(parsed.replacements)) {
    const regex = new RegExp(`\\{\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\}\\}`, "g");
    enrichedContent = enrichedContent.replace(regex, value);
  }

  return enrichedContent;
}
