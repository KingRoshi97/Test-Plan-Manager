import OpenAI from "openai";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";
import { resolveKnowledge, summarizeKnowledgeForPrompt } from "../Axion/src/core/knowledge/resolver.js";

const TEXT_READABLE_EXTENSIONS = new Set([".txt", ".md", ".csv", ".json", ".xml", ".rtf"]);
const BINARY_EXTENSIONS = new Set([".pdf", ".zip", ".doc", ".docx", ".xlsx", ".xls"]);
const PER_FILE_CHAR_LIMIT = 4000;
const TOTAL_CHAR_LIMIT = 12000;

interface AttachmentInfo {
  id: string;
  filename: string;
  originalName: string;
}

function readAttachmentContents(attachments: AttachmentInfo[]): string {
  if (!attachments || attachments.length === 0) return "";

  const uploadsDir = resolve(process.cwd(), "uploads");
  const sections: string[] = [];
  let totalChars = 0;

  for (const att of attachments) {
    if (totalChars >= TOTAL_CHAR_LIMIT) break;

    if (!/^[a-f0-9]{16}\.[a-z0-9]+$/i.test(att.filename)) {
      sections.push(`[${att.originalName}]: (invalid filename — skipped)`);
      continue;
    }
    const ext = extname(att.filename).toLowerCase();
    const filePath = resolve(uploadsDir, att.filename);
    if (!filePath.startsWith(uploadsDir + "/")) {
      sections.push(`[${att.originalName}]: (invalid file path — skipped)`);
      continue;
    }

    if (BINARY_EXTENSIONS.has(ext)) {
      sections.push(`[${att.originalName}]: (binary file — attached but not readable as text)`);
      continue;
    }

    if (!TEXT_READABLE_EXTENSIONS.has(ext)) {
      sections.push(`[${att.originalName}]: (unsupported file type — skipped)`);
      continue;
    }

    if (!existsSync(filePath)) {
      sections.push(`[${att.originalName}]: (file not found on disk)`);
      continue;
    }

    try {
      let content = readFileSync(filePath, "utf-8");
      const remaining = TOTAL_CHAR_LIMIT - totalChars;
      const limit = Math.min(PER_FILE_CHAR_LIMIT, remaining);
      if (content.length > limit) {
        content = content.slice(0, limit) + "\n... (truncated)";
      }
      totalChars += content.length;
      sections.push(`[${att.originalName}]:\n${content}`);
    } catch {
      sections.push(`[${att.originalName}]: (failed to read file)`);
    }
  }

  if (sections.length === 0) return "";
  return "\n\nAttached Files:\n" + sections.join("\n\n");
}

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

  integrations: `Based on the project context, suggest:
- services: 2-4 third-party integrations (as an array of objects with "name", "purpose", "direction" (inbound/outbound/bidirectional), "triggers", and "secrets" fields)
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
  integrations: ["apis_integrations", "architecture_design"],
  category_specific: ["ci_cd_devops", "release_management", "observability_sre"],
};

export async function generateAutofillSuggestions(
  routing: Record<string, string>,
  project: Record<string, unknown>,
  targetSection: string,
  axionBaseDir?: string,
  attachments?: AttachmentInfo[],
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

  const attachmentContents = readAttachmentContents(attachments || (project.attachments as AttachmentInfo[] | undefined) || []);

  const userMessage = `Project Context:
- Category: ${routing.category || "not specified"}
- Type: ${routing.type_preset || "not specified"}
- Build Target: ${routing.build_target || "not specified"}
- Audience: ${routing.audience_context || "not specified"}
- Skill Level: ${routing.skill_level || "not specified"}
- Project Name: ${(project.project_name as string) || "not specified"}
- Problem Statement: ${(project.problem_statement as string) || "not specified"}
- Overview: ${(project.overview as string) || "not specified"}${attachmentContents}

${sectionPrompt}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
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
