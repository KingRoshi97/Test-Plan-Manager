import type { CanonicalSpec } from "../canonical/specBuilder.js";
import type { WorkBreakdownOutput, WorkUnit } from "../planning/workBreakdown.js";
import { recordUsage } from "../usage/tracker.js";

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

async function chatCompletion(messages: OpenAIMessage[], maxTokens = 4096, stage = "pipeline"): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const response: OpenAIResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_completion_tokens: maxTokens,
    });
    const usage = (response as any).usage;
    if (usage) {
      recordUsage({
        stage,
        model: "gpt-4o",
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
      });
    }
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
  const ni = normalizedInput as any;
  const projectName = ni?.project?.project_name ?? "Unknown Project";
  const projectOverview = ni?.project?.project_overview ?? "";
  const problemStatement = ni?.project?.problem_statement ?? "";
  const targetAudience = ni?.project?.target_audience ?? "";
  const projectIdea = ni?.project?.idea ?? ni?.project?.project_idea ?? "";

  const functionalSection = ni?.functional ?? ni?.raw?.functional ?? {};
  const authSection = ni?.auth ?? ni?.raw?.auth ?? {};
  const techSection = ni?.tech ?? ni?.raw?.tech ?? {};

  const intakeContext = [
    projectIdea ? `Project Idea: ${typeof projectIdea === "string" ? projectIdea : JSON.stringify(projectIdea)}` : "",
    targetAudience ? `Target Audience: ${typeof targetAudience === "string" ? targetAudience : JSON.stringify(targetAudience)}` : "",
    Object.keys(functionalSection).length > 0 ? `Functional Requirements: ${JSON.stringify(functionalSection)}` : "",
    Object.keys(authSection).length > 0 ? `Auth Requirements: ${JSON.stringify(authSection)}` : "",
    Object.keys(techSection).length > 0 ? `Tech Requirements: ${JSON.stringify(techSection)}` : "",
  ].filter(Boolean).join("\n");

  const featureSummary = spec.entities.features.map((f) => `- ${f.feature_id}: ${f.name}: ${f.description ?? "no description"}`).join("\n");
  const roleSummary = spec.entities.roles.map((r) => `- ${r.role_id}: ${r.name}: ${r.description ?? r.primary_goal ?? "no description"}`).join("\n");
  const workflowSummary = spec.entities.workflows.map((w) => `- ${w.workflow_id}: ${w.name} (actor: ${w.actor_role_ref}): ${w.steps.join(" → ")}`).join("\n");

  const existingFeatureCount = spec.entities.features.length;
  const nextFeatureIndex = existingFeatureCount;
  const existingRoleCount = spec.entities.roles.length;
  const nextRoleIndex = existingRoleCount;
  const existingWorkflowCount = spec.entities.workflows.length;
  const nextWorkflowIndex = existingWorkflowCount;

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `You are the Internal Agent (IA) of the Axion pipeline. Your job is to ENRICH and EXPAND a canonical specification to enterprise-grade completeness.

You MUST:
1. ENRICH existing features with detailed, project-specific descriptions that include: what the feature does, what data it operates on, what UI/API surfaces it exposes, and what constraints apply
2. IDENTIFY and ADD missing features that are essential for the described project. Decompose vague or broad features into specific, implementable sub-features (e.g., "Search functionality" → "Search with Filters", "Search Results Display", "Saved Searches"). Each feature MUST have a description of at least 2 sentences describing concrete behavior.
3. Ensure the total feature count (existing + new) is at least 8 for any non-trivial project. Aim for 8-12 features.
4. IDENTIFY and ADD missing roles beyond just "User" — consider Admin, Moderator, Manager, or domain-specific roles based on the project context. Each role MUST have a primary_goal that describes specific capabilities (not just "manage the system").
5. IDENTIFY and ADD missing workflows that cover key user journeys, admin operations, and edge cases. Each workflow MUST have at least 4 specific steps that describe concrete actions (not vague phrases like "process data").
6. Provide failure_states for ALL workflows (existing and new). Failure states MUST be specific failure modes with causes — not just "error occurs". Example: "Payment gateway timeout after 30s → show retry with saved cart state" instead of "Payment fails".

QUALITY REQUIREMENTS:
- Every feature description must mention specific data fields, UI elements, or API endpoints it involves
- Every workflow step must be an actionable verb phrase (e.g., "Validate email format and check uniqueness against users table" not "Validate input")
- Rules must be specific and measurable (e.g., "All API responses must return within 500ms p95" not "System should be fast")
- NEVER use vague phrases: "as needed", "as appropriate", "various", "etc.", "and more", "other features"

For NEW features, use feature_ids starting from FEAT-${String(nextFeatureIndex + 1).padStart(3, "0")}.
For NEW roles, use role_ids starting from ROLE-${String(nextRoleIndex + 1).padStart(3, "0")}.
For NEW workflows, use workflow_ids starting from WF-${String(nextWorkflowIndex + 1).padStart(3, "0")}. New workflows must reference a role_id in actor_role_ref.

Return a JSON object with:
- "features": array of ALL features (existing enriched + new ones), each with "feature_id", "name", "description", "priority_tier" ("must" or "nice")
- "roles": array of ALL roles (existing enriched + new ones), each with "role_id", "name", "description", "primary_goal"
- "workflows": array of ALL workflows (existing enriched + new ones), each with "workflow_id", "name", "actor_role_ref" (a role_id), "steps" (array of strings), "success_outcome", "failure_states"
- "rules": object with "must_always" (array of 3-5 project-specific rules) and "must_never" (array of 3-5 things to avoid)
- "definition_of_done": a concise definition of done specific to this project

Only return valid JSON.`,
    },
    {
      role: "user",
      content: `Project: ${projectName}
Overview: ${projectOverview}
Problem: ${problemStatement}

${intakeContext}

Current Features (${existingFeatureCount}):
${featureSummary}

Current Roles (${existingRoleCount}):
${roleSummary}

Current Workflows (${existingWorkflowCount}):
${workflowSummary}

Analyze the project context and:
1. Enrich all existing features with detailed descriptions
2. Add missing features to reach at least 8 total (decompose broad features into specific ones)
3. Add missing roles (Admin, and any domain-specific roles)
4. Add missing workflows for complete user journeys
5. Provide project-specific rules and definition of done`,
    },
  ];

  const result = await chatCompletion(messages, 6144, "S3_CANONICAL_SPEC");
  const parsed = safeJsonParse<{
    features?: Array<{ feature_id: string; name: string; description: string; priority_tier?: string }>;
    roles?: Array<{ role_id: string; name: string; description?: string; primary_goal?: string }>;
    workflows?: Array<{ workflow_id: string; name: string; actor_role_ref: string; steps: string[]; success_outcome: string; failure_states?: string }>;
    rules?: { must_always?: string[]; must_never?: string[] };
    definition_of_done?: string;
  }>(result);

  if (!parsed) return spec;

  const enriched = { ...spec };
  enriched.entities = { ...enriched.entities };

  if (parsed.features && parsed.features.length > 0) {
    const existingIds = new Set(spec.entities.features.map((f) => f.feature_id));
    const updatedFeatures = spec.entities.features.map((f) => {
      const match = parsed.features!.find((pf) => pf.feature_id === f.feature_id);
      if (match) {
        return {
          ...f,
          description: match.description ?? f.description,
          name: match.name ?? f.name,
        };
      }
      return f;
    });

    const newFeatures = parsed.features
      .filter((pf) => !existingIds.has(pf.feature_id) && pf.name && typeof pf.name === "string")
      .map((pf, i) => ({
        feature_id: pf.feature_id || `FEAT-${String(nextFeatureIndex + i + 1).padStart(3, "0")}`,
        name: pf.name,
        description: pf.description || pf.name,
        priority_tier: (pf.priority_tier === "nice" ? "nice" : "must") as "must" | "nice" | "future",
        priority_rank: updatedFeatures.length + i + 1,
      }));

    enriched.entities.features = [...updatedFeatures, ...newFeatures];
  }

  if (parsed.roles && parsed.roles.length > 0) {
    const existingRoleIds = new Set(spec.entities.roles.map((r) => r.role_id));
    const updatedRoles = spec.entities.roles.map((r) => {
      const match = parsed.roles!.find((pr) => pr.role_id === r.role_id);
      if (match) {
        return {
          ...r,
          description: match.description ?? r.description,
          primary_goal: match.primary_goal ?? r.primary_goal,
        };
      }
      return r;
    });

    const newRoles = parsed.roles
      .filter((pr) => !existingRoleIds.has(pr.role_id) && pr.name && typeof pr.name === "string")
      .map((pr, i) => ({
        role_id: pr.role_id || `ROLE-${String(nextRoleIndex + i + 1).padStart(3, "0")}`,
        name: pr.name,
        description: pr.description || pr.name,
        ...(pr.primary_goal ? { primary_goal: pr.primary_goal } : {}),
      }));

    enriched.entities.roles = [...updatedRoles, ...newRoles];
  }

  if (parsed.workflows && parsed.workflows.length > 0) {
    const existingWfIds = new Set(spec.entities.workflows.map((w) => w.workflow_id));
    const updatedWorkflows = spec.entities.workflows.map((w) => {
      const match = parsed.workflows!.find((pw) => pw.workflow_id === w.workflow_id);
      if (match) {
        return {
          ...w,
          failure_states: match.failure_states ?? w.failure_states,
          steps: match.steps && match.steps.length > 0 ? match.steps : w.steps,
        };
      }
      return w;
    });

    const validRoleIds = new Set(enriched.entities.roles.map((r) => r.role_id));
    const defaultRoleId = enriched.entities.roles[0]?.role_id ?? "ROLE-001";

    const newWorkflows = parsed.workflows
      .filter((pw) => !existingWfIds.has(pw.workflow_id))
      .map((pw, i) => ({
        workflow_id: pw.workflow_id || `WF-${String(nextWorkflowIndex + i + 1).padStart(3, "0")}`,
        name: pw.name,
        actor_role_ref: validRoleIds.has(pw.actor_role_ref) ? pw.actor_role_ref : defaultRoleId,
        steps: pw.steps ?? [],
        success_outcome: pw.success_outcome ?? `${pw.name} completed successfully`,
        ...(pw.failure_states ? { failure_states: pw.failure_states } : {}),
      }));

    enriched.entities.workflows = [...updatedWorkflows, ...newWorkflows];
  }

  if (parsed.rules) {
    enriched.rules = { ...enriched.rules };
    if (parsed.rules.must_always) enriched.rules.must_always = parsed.rules.must_always;
    if (parsed.rules.must_never) enriched.rules.must_never = parsed.rules.must_never;
  }

  if (parsed.definition_of_done) {
    enriched.rules = { ...enriched.rules, definition_of_done: parsed.definition_of_done };
  }

  const allRoles = enriched.entities.roles;
  const allFeatures = enriched.entities.features;
  const allWorkflows = enriched.entities.workflows;

  const roles_by_id: Record<string, typeof allRoles[0]> = {};
  for (const r of allRoles) roles_by_id[r.role_id] = r;

  const features_by_id: Record<string, typeof allFeatures[0]> = {};
  for (const f of allFeatures) features_by_id[f.feature_id] = f;

  const workflows_by_id: Record<string, typeof allWorkflows[0]> = {};
  for (const w of allWorkflows) workflows_by_id[w.workflow_id] = w;

  const role_to_workflows: Record<string, string[]> = {};
  const workflow_to_features: Record<string, string[]> = {};
  const feature_to_workflows: Record<string, string[]> = {};
  const role_to_permissions: Record<string, string[]> = {};

  for (const w of allWorkflows) {
    if (!role_to_workflows[w.actor_role_ref]) role_to_workflows[w.actor_role_ref] = [];
    role_to_workflows[w.actor_role_ref].push(w.workflow_id);
    workflow_to_features[w.workflow_id] = [];
  }
  for (const f of allFeatures) {
    feature_to_workflows[f.feature_id] = [];
  }
  for (const p of enriched.entities.permissions ?? []) {
    if (!role_to_permissions[p.role_ref]) role_to_permissions[p.role_ref] = [];
    role_to_permissions[p.role_ref].push(p.perm_id);
  }

  enriched.index = {
    roles_by_id,
    features_by_id,
    workflows_by_id,
    cross_maps: {
      workflow_to_features,
      feature_to_workflows,
      feature_to_operations: enriched.index?.cross_maps?.feature_to_operations ?? {},
      role_to_workflows,
      role_to_permissions,
    },
  };

  enriched.rules = {
    ...enriched.rules,
    acceptance_criteria: allFeatures.map(
      (f) => `${f.feature_id}: ${f.name} is functional and tested`
    ),
  };

  const newRoleEntities = allRoles.filter(
    (r) => !spec.entities.permissions?.some((p) => p.role_ref === r.role_id)
  );
  if (newRoleEntities.length > 0) {
    const existingPerms = enriched.entities.permissions ?? [];
    const maxPermIndex = existingPerms.length;
    const newPerms = newRoleEntities.map((r, i) => ({
      perm_id: `PERM-${String(maxPermIndex + i + 1).padStart(3, "0")}`,
      role_ref: r.role_id,
      allowed_capabilities: r.primary_goal ? [r.primary_goal] : ["default_access"],
    }));
    enriched.entities.permissions = [...existingPerms, ...newPerms];
  }

  console.log(`  [IA] Canonical spec enriched via OpenAI — ${allFeatures.length} features, ${allRoles.length} roles, ${allWorkflows.length} workflows`);
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
      content: `You are the Internal Agent (IA) enriching a work breakdown for a software project. For each work unit, provide implementation-level detail and specific, testable acceptance criteria.

QUALITY REQUIREMENTS:
- Each description MUST specify: what components/files to create, what patterns/technologies to use, what data structures are involved, and how it connects to other units
- Each acceptance_criteria MUST be a specific, testable statement — not "works correctly" but "POST /api/users returns 201 with user object containing id, email, created_at fields"
- Include at least 2 acceptance criteria per unit, separated by semicolons
- Descriptions must be 3-5 sentences with concrete technical details (specific API endpoints, database tables, UI components, state management patterns)
- NEVER use vague phrases: "implement feature", "add functionality", "handle errors properly", "write tests". Be specific about WHAT to implement and HOW.
- For test-related units, specify exact test scenarios (e.g., "Test login with valid credentials returns JWT token; Test login with wrong password returns 401; Test login with locked account returns 403")

Return JSON:
{
  "units": [
    { "unit_id": "WU-001", "description": "...", "acceptance_criteria": "..." },
    ...
  ]
}
Only return valid JSON.`,
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

  const result = await chatCompletion(messages, 4096, "S5_WORK_BREAKDOWN");
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
        name: u.name,
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

  const result = await chatCompletion(messages, 2048, "S7_TEMPLATE_ENRICH");
  const parsed = safeJsonParse<{ replacements?: Record<string, string> }>(result);

  if (!parsed?.replacements) return templateContent;

  let enrichedContent = templateContent;
  for (const [key, value] of Object.entries(parsed.replacements)) {
    const regex = new RegExp(`\\{\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\}\\}`, "g");
    enrichedContent = enrichedContent.replace(regex, value);
  }

  return enrichedContent;
}
