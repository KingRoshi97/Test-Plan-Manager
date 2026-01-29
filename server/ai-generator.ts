import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface GeneratedDocs {
  projectOverview: string;
  rpbs: string;
  rebs: string;
  domainMap: string;
  reasonCodes: string;
  actionVocabulary: string;
  glossary: string;
}

export interface StructuredInput {
  projectName: string;
  description: string;
  features?: { name: string; description: string; priority: "P0" | "P1" | "P2" }[];
  users?: { type: string; goal: string }[];
  techStack?: { frontend?: string; backend?: string; database?: string };
  preset?: string;
}

export interface GenerateDocsOptions {
  idea: string;
  projectName?: string;
  context?: string;
  domains?: string[];
  structuredInput?: StructuredInput;
}

const SYSTEM_PROMPT = `You are Roshi, a documentation architect that generates structured product and engineering documentation for software projects.

Given a project idea, you generate documentation following the Roshi methodology:
- RPBS (Roshi Product Brief Specification): Product requirements, user stories, features, constraints
- REBS (Roshi Engineering Brief Specification): Technical architecture, data models, API design, implementation approach
- Domain Map: Mapping of business domains to technical components
- Reason Codes: Error codes and their meanings
- Action Vocabulary: Standardized action names (verbs) used across the system
- Glossary: Key terms and definitions

Rules:
1. Be specific and actionable - avoid vague statements
2. Use consistent terminology throughout
3. Include concrete examples where helpful
4. Mark uncertain items as UNKNOWN and note them for follow-up
5. Reference sources when extracting from provided context
6. Use markdown formatting with clear headings`;

function buildStructuredContext(options: GenerateDocsOptions): string {
  const si = options.structuredInput;
  if (!si) return "";
  
  let ctx = "";
  
  if (si.features?.length) {
    ctx += "\n## Provided Features\n";
    for (const f of si.features) {
      ctx += `- [${f.priority}] ${f.name}: ${f.description}\n`;
    }
  }
  
  if (si.users?.length) {
    ctx += "\n## Provided User Types\n";
    for (const u of si.users) {
      ctx += `- ${u.type}: ${u.goal}\n`;
    }
  }
  
  if (si.techStack) {
    ctx += "\n## Tech Stack Preferences\n";
    if (si.techStack.frontend) ctx += `- Frontend: ${si.techStack.frontend}\n`;
    if (si.techStack.backend) ctx += `- Backend: ${si.techStack.backend}\n`;
    if (si.techStack.database) ctx += `- Database: ${si.techStack.database}\n`;
  }
  
  return ctx;
}

export async function generateProjectOverview(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName, context, structuredInput } = options;
  
  const structuredCtx = buildStructuredContext(options);
  
  const prompt = `Generate a PROJECT_OVERVIEW.md for this project:

Project Name: ${structuredInput?.projectName || projectName || "Untitled Project"}
Description: ${structuredInput?.description || idea}
${context ? `Additional Context:\n${context}` : ""}
${structuredCtx}

Include:
1. Project summary (2-3 sentences)
2. Core value proposition
3. Target users
4. Key features (bullet list)
5. Success metrics
6. Constraints and assumptions

Format as markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateRPBS(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName, context, structuredInput } = options;
  
  const structuredCtx = buildStructuredContext(options);
  
  const prompt = `Generate RPBS_Product.md (Roshi Product Brief Specification) for:

Project Name: ${structuredInput?.projectName || projectName || "Untitled Project"}
Description: ${structuredInput?.description || idea}
${context ? `Additional Context:\n${context}` : ""}
${structuredCtx}

IMPORTANT: If features and user types are provided above, use them as the source of truth. Do not invent new features or user types - expand on what is given.

Include these sections:
# RPBS: ${projectName || "Product"}

## 1. Product Vision
(Brief vision statement)

## 2. User Personas
(List 2-3 key user types with their goals)

## 3. User Stories
(Format: As a [persona], I want [goal] so that [benefit])

## 4. Feature Requirements
### Must Have (P0)
### Should Have (P1)  
### Nice to Have (P2)

## 5. Hard Rules Catalog
(Non-negotiable business rules the system must enforce)

## 6. Acceptance Criteria
(How we know each feature is complete)

## 7. Out of Scope
(What this version explicitly does NOT include)

## 8. Open Questions
(Items needing clarification - mark as UNKNOWN)

Format as markdown with clear structure.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateREBS(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName, context, domains, structuredInput } = options;
  
  const structuredCtx = buildStructuredContext(options);
  
  const prompt = `Generate REBS_Product.md (Roshi Engineering Brief Specification) for:

Project Name: ${structuredInput?.projectName || projectName || "Untitled Project"}
Description: ${structuredInput?.description || idea}
Domains: ${domains?.join(", ") || "platform, api, web"}
${context ? `Additional Context:\n${context}` : ""}
${structuredCtx}

IMPORTANT: If a tech stack is provided above, use it as the implementation preference. Do not contradict what the user has specified.

Include these sections:
# REBS: ${projectName || "Engineering Brief"}

## 1. System Architecture
(High-level architecture description)

## 2. Tech Stack
(Languages, frameworks, databases, infrastructure)

## 3. Data Model
(Key entities and their relationships)

## 4. API Design
(Key endpoints with methods, paths, request/response shapes)

## 5. Domain Boundaries
(How the system is divided into domains/services)

## 6. Security Model
(Authentication, authorization, data protection)

## 7. Integration Points
(External services, APIs, webhooks)

## 8. Performance Requirements
(Latency, throughput, scaling considerations)

## 9. Implementation Phases
(Suggested build order)

## 10. Technical Risks
(Potential challenges and mitigations)

Format as markdown with clear structure.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateDomainMap(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName, domains } = options;
  
  const domainList = domains || ["platform", "api", "web"];
  
  const prompt = `Generate domain-map.md for:

Project: ${projectName || "Untitled Project"}
Idea: ${idea}
Domains: ${domainList.join(", ")}

Create a domain map that:
1. Lists each domain with its purpose
2. Shows domain dependencies
3. Maps features to domains
4. Identifies cross-cutting concerns

Format:
# Domain Map

## Domains

### ${domainList[0] || "core"}
- **Purpose**: ...
- **Owns**: ...
- **Depends on**: ...

(Repeat for each domain)

## Domain-Feature Matrix
| Feature | ${domainList.join(" | ")} |
|---------|${domainList.map(() => "---|").join("")}
| Feature 1 | X | | X |

## Cross-Cutting Concerns
- Logging
- Error handling
- Authentication
`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateReasonCodes(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName } = options;
  
  const prompt = `Generate reason-codes.md for:

Project: ${projectName || "Untitled Project"}
Idea: ${idea}

Create a catalog of error/reason codes the system might return:

# Reason Codes

## Format
\`{DOMAIN}_{CATEGORY}_{CODE}\` - Example: AUTH_VALIDATION_001

## Codes

### Authentication (AUTH)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| AUTH_INVALID_CREDENTIALS | Invalid Credentials | Username or password is incorrect | 401 |

### Validation (VAL)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|

### Business Logic (BIZ)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|

### System (SYS)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|

Include 3-5 codes per category relevant to the project idea.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateActionVocabulary(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName } = options;
  
  const prompt = `Generate action-vocabulary.md for:

Project: ${projectName || "Untitled Project"}
Idea: ${idea}

Create a standardized action vocabulary:

# Action Vocabulary

## Purpose
Standardized verbs for consistent naming across the codebase.

## Actions

| Action | Meaning | Example Usage |
|--------|---------|---------------|
| create | Create a new resource | createUser, createOrder |
| get | Retrieve a single resource | getUser, getOrder |
| list | Retrieve multiple resources | listUsers, listOrders |
| update | Modify an existing resource | updateUser, updateOrder |
| delete | Remove a resource | deleteUser, deleteOrder |
| validate | Check if data is valid | validateEmail, validatePayment |
| execute | Run a process or workflow | executePipeline, executeTask |
| submit | Send data for processing | submitForm, submitOrder |

Add 5-10 more actions relevant to the project idea.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 1024,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateGlossary(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName, context } = options;
  
  const prompt = `Generate glossary.md for:

Project: ${projectName || "Untitled Project"}
Idea: ${idea}
${context ? `Context: ${context}` : ""}

Create a glossary of key terms:

# Glossary

| Term | Definition | Related Terms |
|------|------------|---------------|
| Term1 | Definition of term1 | term2, term3 |

Include:
1. Domain-specific terms from the project idea
2. Technical terms that might need clarification
3. Acronyms used in the documentation
4. Business terms specific to this project

Aim for 10-20 relevant terms.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 1024,
  });

  return response.choices[0]?.message?.content || "";
}

function getTemplateFallback(docType: keyof GeneratedDocs, options: GenerateDocsOptions): string {
  const projectName = options.structuredInput?.projectName || options.projectName || "Untitled Project";
  const description = options.structuredInput?.description || options.idea || "No description provided";
  const domains = options.domains || ["platform", "api", "web"];
  const features = options.structuredInput?.features || [];
  const users = options.structuredInput?.users || [];
  const techStack = options.structuredInput?.techStack || {};

  const p0 = features.filter(f => f.priority === "P0").map(f => `- **${f.name}**: ${f.description}`).join("\n") || "- UNKNOWN: Core features not specified";
  const p1 = features.filter(f => f.priority === "P1").map(f => `- **${f.name}**: ${f.description}`).join("\n") || "- UNKNOWN: Should-have features not specified";
  const p2 = features.filter(f => f.priority === "P2").map(f => `- **${f.name}**: ${f.description}`).join("\n") || "- UNKNOWN: Nice-to-have features not specified";
  const userList = users.map(u => `- **${u.type}**: ${u.goal}`).join("\n") || "- UNKNOWN: User types not specified";
  const techList = Object.entries(techStack).filter(([_, v]) => v).map(([k, v]) => `- **${k}**: ${v}`).join("\n") || "- UNKNOWN: Tech stack not specified";

  const templates: Record<keyof GeneratedDocs, string> = {
    projectOverview: `# ${projectName} - Project Overview

## Summary
${description}

## Value Proposition
UNKNOWN: Value proposition needs clarification.

## Target Users
${userList}

## Key Features
${p0}
${p1}
${p2}

## Success Metrics
- UNKNOWN: Success metrics not defined

## Constraints & Assumptions
- UNKNOWN: Constraints and assumptions not specified

---
*Generated by Roshi Studio (template fallback)*
`,
    rpbs: `# RPBS: ${projectName}

## 1. Product Vision
${description}

## 2. User Personas
${userList}

## 3. User Stories
UNKNOWN: User stories need to be defined based on user personas.

## 4. Feature Requirements

### Must Have (P0)
${p0}

### Should Have (P1)
${p1}

### Nice to Have (P2)
${p2}

## 5. Hard Rules Catalog
- UNKNOWN: Business rules not specified

## 6. Acceptance Criteria
- UNKNOWN: Acceptance criteria not defined

## 7. Out of Scope
- UNKNOWN: Scope boundaries not defined

## 8. Open Questions
- What are the specific user workflows?
- What are the success metrics?
- What are the integration requirements?

---
*Generated by Roshi Studio (template fallback)*
`,
    rebs: `# REBS: ${projectName}

## 1. System Architecture
UNKNOWN: System architecture needs design based on requirements.

## 2. Tech Stack
${techList}

## 3. Data Model
UNKNOWN: Data model needs to be designed.

## 4. API Design
UNKNOWN: API endpoints need to be specified.

## 5. Domain Boundaries
${domains.map(d => `- **${d}**: UNKNOWN - Domain purpose not defined`).join("\n")}

## 6. Security Model
- Authentication: UNKNOWN
- Authorization: UNKNOWN
- Data Protection: UNKNOWN

## 7. Integration Points
- UNKNOWN: External integrations not specified

## 8. Performance Requirements
- UNKNOWN: Performance requirements not defined

## 9. Implementation Phases
1. Phase 1: UNKNOWN - Define phases based on feature priorities
2. Phase 2: UNKNOWN
3. Phase 3: UNKNOWN

## 10. Technical Risks
- UNKNOWN: Technical risks need assessment

---
*Generated by Roshi Studio (template fallback)*
`,
    domainMap: `# Domain Map

## Domains

${domains.map(d => `### ${d}
- **Purpose**: UNKNOWN
- **Owns**: UNKNOWN
- **Depends on**: UNKNOWN`).join("\n\n")}

## Domain-Feature Matrix
| Feature | ${domains.join(" | ")} |
|---------|${domains.map(() => "---|").join("")}
${features.length > 0 ? features.map(f => `| ${f.name} | ${domains.map(() => "UNKNOWN").join(" | ")} |`).join("\n") : "| UNKNOWN | " + domains.map(() => "UNKNOWN").join(" | ") + " |"}

## Cross-Cutting Concerns
- Logging: UNKNOWN
- Error handling: UNKNOWN
- Authentication: UNKNOWN
- Monitoring: UNKNOWN

---
*Generated by Roshi Studio (template fallback)*
`,
    reasonCodes: `# Reason Codes

## Format
\`{DOMAIN}_{CATEGORY}_{CODE}\` - Example: AUTH_VALIDATION_001

## Codes

### Authentication (AUTH)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| AUTH_INVALID_CREDENTIALS | Invalid Credentials | Username or password is incorrect | 401 |
| AUTH_UNAUTHORIZED | Unauthorized | Access denied | 403 |
| AUTH_TOKEN_EXPIRED | Token Expired | Authentication token has expired | 401 |

### Validation (VAL)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| VAL_REQUIRED_FIELD | Required Field | A required field is missing | 400 |
| VAL_INVALID_FORMAT | Invalid Format | Field format is invalid | 400 |

### Business Logic (BIZ)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| BIZ_NOT_FOUND | Not Found | Resource not found | 404 |
| BIZ_CONFLICT | Conflict | Operation conflicts with existing state | 409 |

### System (SYS)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| SYS_INTERNAL_ERROR | Internal Error | An unexpected error occurred | 500 |
| SYS_SERVICE_UNAVAILABLE | Service Unavailable | Service temporarily unavailable | 503 |

---
*Generated by Roshi Studio (template fallback)*
`,
    actionVocabulary: `# Action Vocabulary

## Purpose
Standardized verbs for consistent naming across the codebase.

## Actions

| Action | Meaning | Example Usage |
|--------|---------|---------------|
| create | Create a new resource | createUser, createOrder |
| get | Retrieve a single resource | getUser, getOrder |
| list | Retrieve multiple resources | listUsers, listOrders |
| update | Modify an existing resource | updateUser, updateOrder |
| delete | Remove a resource | deleteUser, deleteOrder |
| validate | Check if data is valid | validateEmail, validatePayment |
| execute | Run a process or workflow | executePipeline, executeTask |
| submit | Send data for processing | submitForm, submitOrder |
| approve | Accept/authorize a request | approveRequest |
| reject | Decline a request | rejectRequest |
| cancel | Cancel an operation | cancelOrder |
| archive | Move to inactive state | archiveProject |
| restore | Recover from archive | restoreProject |

---
*Generated by Roshi Studio (template fallback)*
`,
    glossary: `# Glossary

| Term | Definition | Related Terms |
|------|------------|---------------|
| ${projectName} | ${description.substring(0, 100)}${description.length > 100 ? "..." : ""} | - |
${domains.map(d => `| ${d} | Domain within the ${projectName} system | domain |`).join("\n")}
${features.slice(0, 5).map(f => `| ${f.name} | ${f.description.substring(0, 80)}${f.description.length > 80 ? "..." : ""} | feature |`).join("\n")}
${users.map(u => `| ${u.type} | ${u.goal.substring(0, 80)}${u.goal.length > 80 ? "..." : ""} | user type |`).join("\n")}

---
*Generated by Roshi Studio (template fallback)*
`,
  };

  return templates[docType];
}

async function safeGenerate<T>(
  generator: () => Promise<T>,
  fallback: () => T,
  docName: string
): Promise<{ result: T; usedFallback: boolean }> {
  try {
    const result = await generator();
    if (!result || (typeof result === "string" && result.length < 50)) {
      console.log(`[AI] ${docName}: Empty response, using fallback`);
      return { result: fallback(), usedFallback: true };
    }
    return { result, usedFallback: false };
  } catch (error) {
    console.error(`[AI] ${docName}: Error, using fallback:`, error instanceof Error ? error.message : error);
    return { result: fallback(), usedFallback: true };
  }
}

export type GenerationResult = GeneratedDocs & { generationMode: "ai" | "template_fallback" | "hybrid" };

export async function generateAllDocs(options: GenerateDocsOptions): Promise<GeneratedDocs> {
  const results = await Promise.all([
    safeGenerate(() => generateProjectOverview(options), () => getTemplateFallback("projectOverview", options), "projectOverview"),
    safeGenerate(() => generateRPBS(options), () => getTemplateFallback("rpbs", options), "rpbs"),
    safeGenerate(() => generateREBS(options), () => getTemplateFallback("rebs", options), "rebs"),
    safeGenerate(() => generateDomainMap(options), () => getTemplateFallback("domainMap", options), "domainMap"),
    safeGenerate(() => generateReasonCodes(options), () => getTemplateFallback("reasonCodes", options), "reasonCodes"),
    safeGenerate(() => generateActionVocabulary(options), () => getTemplateFallback("actionVocabulary", options), "actionVocabulary"),
    safeGenerate(() => generateGlossary(options), () => getTemplateFallback("glossary", options), "glossary"),
  ]);

  const fallbackCount = results.filter(r => r.usedFallback).length;
  const mode = fallbackCount === 0 ? "ai" : fallbackCount === 7 ? "template_fallback" : "hybrid";
  console.log(`[AI] Generation complete: mode=${mode}, fallbacks=${fallbackCount}/7`);

  return {
    projectOverview: results[0].result,
    rpbs: results[1].result,
    rebs: results[2].result,
    domainMap: results[3].result,
    reasonCodes: results[4].result,
    actionVocabulary: results[5].result,
    glossary: results[6].result,
  };
}
