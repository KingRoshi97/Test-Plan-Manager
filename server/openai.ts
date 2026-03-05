import OpenAI from "openai";
import { join } from "node:path";
import { resolveKnowledge, summarizeKnowledgeForPrompt } from "../Axion/src/core/knowledge/resolver.js";

export function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

const SECTION_PROMPTS: Record<string, string> = {
  intent: `Based on the project context, suggest:
- alternatives: What alternatives exist to building this?
- primary_goals: 3-5 primary goals for the project (as an array)
- success_metrics: How will success be measured?
- out_of_scope: What is explicitly out of scope?
Return JSON with these fields.`,

  design: `Based on the project context, suggest:
- style_adjectives: 2-3 adjectives describing the desired visual style
- visual_preset: A visual preset (e.g., "modern", "corporate", "playful")
- ui_density: UI density preference ("compact", "comfortable", "spacious")
- navigation_pref: Navigation pattern ("sidebar", "top-nav", "bottom-tabs")
Return JSON with these fields.`,

  functional: `Based on the project context, suggest:
- must_have_features: 3-5 must-have features (as an array of strings)
- nice_to_have_features: 2-3 nice-to-have features (as an array of strings)
- roles: 2-3 user roles (as an array of objects with "name" and "permissions" fields)
- core_workflows: Brief description of core workflows
- business_rules: Key business rules
Return JSON with these fields.`,

  data: `Based on the project context, suggest:
- entities: 2-4 data entities (as an array of objects with "name", "fields", and "relationships" fields)
- sensitive_flags: Data sensitivity flags (as an array of strings)
- retention: Data retention policy suggestion
- ownership: Data ownership model
Return JSON with these fields.`,

  auth: `Based on the project context, suggest:
- methods: Authentication methods (as an array, e.g., ["email_password", "google_oauth"])
- account_lifecycle: Account lifecycle description
- session_rules: Session management rules
- authorization_model: Authorization model (e.g., "RBAC", "ABAC")
Return JSON with these fields.`,

  nfr: `Based on the project context, suggest:
- response_time: Target response time
- throughput: Expected throughput
- expected_users: Expected number of users
- concurrent_sessions: Expected concurrent sessions
- reliability: Reliability target (e.g., "99.9%")
- compliance: Applicable compliance standards (as an array)
Return JSON with these fields.`,

  category_specific: `Based on the project context, suggest:
- screens: Key screens/pages (as an array of strings)
- navigation_summary: Navigation structure summary
- endpoints: Key API endpoints (as an array of strings)
- environments: Deployment environments
- runtime: Runtime/platform
- observability: Observability approach
Return JSON with these fields.`,
};

const SECTION_KNOWLEDGE_DOMAINS: Record<string, string[]> = {
  intent: ["architecture_design", "testing_qa"],
  design: ["architecture_design"],
  functional: ["architecture_design", "apis_integrations"],
  data: ["databases", "storage_fundamentals", "caching", "search_retrieval"],
  auth: ["security_fundamentals", "identity_access_management"],
  nfr: ["observability_sre", "compliance_governance", "cloud_fundamentals"],
  category_specific: ["ci_cd_devops", "release_management", "observability_sre"],
};

export async function generateAutofillSuggestions(
  routing: Record<string, string>,
  project: Record<string, unknown>,
  targetSection: string,
  axionBaseDir?: string,
): Promise<Record<string, unknown>> {
  const sectionPrompt = SECTION_PROMPTS[targetSection];
  if (!sectionPrompt) {
    return {};
  }

  const client = getOpenAIClient();

  let knowledgeSection = "";
  if (axionBaseDir) {
    try {
      const constraints: Record<string, unknown> = {};
      if (routing.requires_auth === "true") constraints.requires_auth = true;
      if (routing.manages_data === "true") constraints.manages_data = true;
      if (routing.has_integrations === "true") constraints.has_integrations = true;

      const knowledge = resolveKnowledge(axionBaseDir, routing, constraints);

      const sectionDomains = SECTION_KNOWLEDGE_DOMAINS[targetSection] ?? [];
      const relevantKids = knowledge.resolvedKids.filter((kid) => {
        const kidText = `${kid.title} ${kid.path} ${(kid.domains ?? []).join(" ")} ${(kid.tags ?? []).join(" ")}`.toLowerCase();
        return sectionDomains.some((d) => kidText.includes(d)) ||
               sectionDomains.length === 0;
      });

      const contextForPrompt = {
        ...knowledge,
        resolvedKids: relevantKids.slice(0, 10),
      };
      knowledgeSection = summarizeKnowledgeForPrompt(contextForPrompt, 10);
    } catch {
      knowledgeSection = "";
    }
  }

  const systemMessage = `You are a software project intake assistant for the AXION system. You help users fill out project intake forms by generating smart suggestions based on the project context and the Knowledge Library they've provided.

${knowledgeSection ? `You have access to the following knowledge from the AXION Knowledge Library. Use these patterns, checklists, and concepts to guide your suggestions and maintain consistency. Do not copy them verbatim — adapt them to the specific project context.\n\n${knowledgeSection}\n` : ""}Always return valid JSON. Only return the JSON object, no markdown or explanation.`;

  const userMessage = `Project Context:
- Category: ${routing.category || "not specified"}
- Type: ${routing.type_preset || "not specified"}
- Build Target: ${routing.build_target || "not specified"}
- Audience: ${routing.audience_context || "not specified"}
- Skill Level: ${routing.skill_level || "not specified"}
- Project Name: ${(project.project_name as string) || "not specified"}
- Problem Statement: ${(project.problem_statement as string) || "not specified"}
- Overview: ${(project.overview as string) || "not specified"}

${sectionPrompt}`;

  const response = await client.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return {};

  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}
