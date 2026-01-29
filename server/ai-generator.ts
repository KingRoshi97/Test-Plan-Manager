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

export interface GenerateDocsOptions {
  idea: string;
  projectName?: string;
  context?: string;
  domains?: string[];
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

export async function generateProjectOverview(options: GenerateDocsOptions): Promise<string> {
  const { idea, projectName, context } = options;
  
  const prompt = `Generate a PROJECT_OVERVIEW.md for this project:

Project Name: ${projectName || "Untitled Project"}
Idea: ${idea}
${context ? `Additional Context:\n${context}` : ""}

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
  const { idea, projectName, context } = options;
  
  const prompt = `Generate RPBS_Product.md (Roshi Product Brief Specification) for:

Project Name: ${projectName || "Untitled Project"}
Idea: ${idea}
${context ? `Additional Context:\n${context}` : ""}

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
  const { idea, projectName, context, domains } = options;
  
  const prompt = `Generate REBS_Product.md (Roshi Engineering Brief Specification) for:

Project Name: ${projectName || "Untitled Project"}
Idea: ${idea}
Domains: ${domains?.join(", ") || "platform, api, web"}
${context ? `Additional Context:\n${context}` : ""}

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

export async function generateAllDocs(options: GenerateDocsOptions): Promise<GeneratedDocs> {
  const [projectOverview, rpbs, rebs, domainMap, reasonCodes, actionVocabulary, glossary] = await Promise.all([
    generateProjectOverview(options),
    generateRPBS(options),
    generateREBS(options),
    generateDomainMap(options),
    generateReasonCodes(options),
    generateActionVocabulary(options),
    generateGlossary(options),
  ]);

  return {
    projectOverview,
    rpbs,
    rebs,
    domainMap,
    reasonCodes,
    actionVocabulary,
    glossary,
  };
}
