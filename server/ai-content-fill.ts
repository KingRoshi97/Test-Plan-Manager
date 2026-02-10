import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

export const DOC_PRIORITY_ORDER = [
  'RPBS',
  'REBS',
  'README',
  'DDES',
  'UX_Foundations',
  'UI_Constraints',
  'DIM',
  'SCREENMAP',
  'TESTPLAN',
  'COMPONENT_LIBRARY',
  'COPY_GUIDE',
  'BELS',
  'OPEN_QUESTIONS',
];

function getDocPriority(fileName: string): number {
  for (let i = 0; i < DOC_PRIORITY_ORDER.length; i++) {
    if (fileName.startsWith(DOC_PRIORITY_ORDER[i])) return i;
  }
  return DOC_PRIORITY_ORDER.length;
}

export interface UnknownScanResult {
  module: string;
  file: string;
  relativePath: string;
  unknownCount: number;
  sections: string[];
  docType?: string;
}

export interface HierarchicalUnknownTarget {
  file: string;
  relativePath: string;
  module: string;
  docType: string;
  docTypeLabel: string;
  priority: number;
  unknownCount: number;
  sections: SectionDetail[];
}

export interface SectionDetail {
  name: string;
  unknownCount: number;
  snippet: string;
}

export interface GeneratedQuestion {
  sectionName: string;
  questions: string[];
}

export interface QuestionSet {
  target: HierarchicalUnknownTarget;
  questions: GeneratedQuestion[];
  remainingUnknowns: number;
  totalFilesWithUnknowns: number;
}

export interface CascadeFillResult {
  targetFilled: ContentFillResult;
  cascadeResults: ContentFillResult[];
  remainingScan: ScanReport;
  nextTarget: HierarchicalUnknownTarget | null;
}

export interface ScanReport {
  totalUnknowns: number;
  totalFiles: number;
  filesWithUnknowns: UnknownScanResult[];
}

export interface ContentFillResult {
  file: string;
  module: string;
  status: 'filled' | 'skipped' | 'error';
  unknownsBefore: number;
  unknownsAfter: number;
  error?: string;
}

export interface ContentFillReport {
  totalFilesFilled: number;
  totalFilesSkipped: number;
  totalFilesErrored: number;
  results: ContentFillResult[];
}

function countUnknowns(content: string): number {
  return (content.match(/UNKNOWN/g) || []).length;
}

function findSectionsWithUnknowns(content: string): string[] {
  const sections: string[] = [];
  const sectionRegex = /^## (.+)$/gm;
  let match;
  const sectionPositions: { name: string; start: number }[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    sectionPositions.push({ name: match[1], start: match.index });
  }

  for (let i = 0; i < sectionPositions.length; i++) {
    const start = sectionPositions[i].start;
    const end = i + 1 < sectionPositions.length ? sectionPositions[i + 1].start : content.length;
    const sectionContent = content.substring(start, end);
    if (sectionContent.includes('UNKNOWN')) {
      sections.push(sectionPositions[i].name);
    }
  }

  return sections;
}

function getAllMdFilesInModule(moduleDir: string): string[] {
  if (!fs.existsSync(moduleDir)) return [];
  return fs.readdirSync(moduleDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(moduleDir, f));
}

export function scanBelsFile(filePath: string, projectRoot: string): UnknownScanResult | null {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const unknownCount = countUnknowns(content);

  if (unknownCount === 0) return null;

  const module = path.basename(path.dirname(filePath));
  return {
    module,
    file: filePath,
    relativePath: path.relative(projectRoot, filePath),
    unknownCount,
    sections: findSectionsWithUnknowns(content),
  };
}

export function scanModuleForUnknowns(
  projectRoot: string,
  moduleName: string
): UnknownScanResult[] {
  const moduleDir = path.join(projectRoot, 'axion', 'domains', moduleName);
  const results: UnknownScanResult[] = [];

  const mdFiles = getAllMdFilesInModule(moduleDir);
  for (const filePath of mdFiles) {
    const result = scanBelsFile(filePath, projectRoot);
    if (result) results.push(result);
  }

  return results;
}

export function scanAllModulesForUnknowns(
  projectRoot: string,
  modules: string[]
): ScanReport {
  const filesWithUnknowns: UnknownScanResult[] = [];
  let totalFiles = 0;

  for (const mod of modules) {
    const moduleDir = path.join(projectRoot, 'axion', 'domains', mod);
    const mdFiles = getAllMdFilesInModule(moduleDir);
    totalFiles += mdFiles.length;

    const results = scanModuleForUnknowns(projectRoot, mod);
    filesWithUnknowns.push(...results);
  }

  return {
    totalUnknowns: filesWithUnknowns.reduce((sum, r) => sum + r.unknownCount, 0),
    totalFiles,
    filesWithUnknowns,
  };
}

const DOC_TYPE_MAP: Record<string, { label: string; guidance: string }> = {
  'RPBS': {
    label: 'Requirements & Product Behavior Specification (RPBS)',
    guidance: `For RPBS documents:
   - Product overview should describe the application's core purpose and value proposition.
   - Target users should define specific personas with realistic demographics and needs.
   - Feature descriptions should be concrete and actionable, not vague.
   - Non-functional requirements should have specific, measurable targets.
   - Business rules should reflect real constraints for this type of application.`,
  },
  'REBS': {
    label: 'Requirements & Entity Behavior Specification (REBS)',
    guidance: `For REBS documents:
   - Entity definitions should model the core business objects of this application.
   - Behaviors should describe realistic state transitions and business rules.
   - Relationships between entities should reflect actual domain logic.
   - Validation rules should be specific and enforceable.`,
  },
  'BELS': {
    label: 'Business Entity Logic Specification (BELS)',
    guidance: `For BELS documents:
   - Policy rules should describe real business logic for this type of application.
   - State machines should model realistic entity lifecycles for this domain.
   - Validation rules should cover fields that would exist in this kind of application.
   - Reason codes should be specific SCREAMING_SNAKE_CASE identifiers.
   - Error codes should follow the pattern: MODULE_PREFIX_SPECIFIC_ERROR.`,
  },
  'OPEN_QUESTIONS': {
    label: 'Open Questions',
    guidance: `For Open Questions documents:
   - Questions should be specific to the project's domain and implementation challenges.
   - Resolution tracking should have meaningful statuses and resolution notes.`,
  },
  'DDES': {
    label: 'Domain-Driven Entity Specification (DDES)',
    guidance: `For DDES documents:
   - Entity definitions should model real data structures for this application domain.
   - Relationships between entities should reflect actual business relationships.
   - Attributes should have realistic types, constraints, and descriptions.
   - Include proper primary keys, foreign keys, and indexes.`,
  },
  'DIM': {
    label: 'Domain Integration Map (DIM)',
    guidance: `For DIM documents:
   - Integration points should reflect real external services or internal module boundaries.
   - Data flows should model realistic input/output between systems.
   - Protocols and authentication methods should be appropriate for the integration type.
   - Error handling strategies should be specific to each integration point.`,
  },
  'TESTPLAN': {
    label: 'Test Plan',
    guidance: `For Test Plan documents:
   - Test cases should cover realistic scenarios for this application domain.
   - Include unit, integration, and end-to-end test scenarios.
   - Acceptance criteria should be specific and measurable.
   - Edge cases should reflect real-world usage patterns.`,
  },
  'COMPONENT_LIBRARY': {
    label: 'Component Library',
    guidance: `For Component Library documents:
   - Components should be real UI components needed for this application.
   - Props and variants should reflect actual component API designs.
   - Usage examples should show realistic implementation patterns.
   - Accessibility notes should be specific to each component type.`,
  },
  'COPY_GUIDE': {
    label: 'Copy Guide',
    guidance: `For Copy Guide documents:
   - Tone and voice guidelines should match the application's target audience.
   - Error messages should be user-friendly and actionable.
   - Microcopy examples should cover real UI touchpoints in this application.
   - Terminology should be consistent with the project's domain.`,
  },
  'SCREENMAP': {
    label: 'Screen Map',
    guidance: `For Screen Map documents:
   - Screens should represent real views/pages needed for this application.
   - Navigation flows should model realistic user journeys.
   - Screen descriptions should include key components and data displayed.
   - User actions on each screen should be specific and actionable.`,
  },
  'UI_Constraints': {
    label: 'UI Constraints',
    guidance: `For UI Constraints documents:
   - Layout rules should reflect real responsive design requirements.
   - Spacing and sizing constraints should be practical for the application type.
   - Accessibility constraints should follow WCAG guidelines relevant to this domain.
   - Performance constraints should be realistic for the target platform.`,
  },
  'UX_Foundations': {
    label: 'UX Foundations',
    guidance: `For UX Foundations documents:
   - Design principles should align with the application's purpose and target users.
   - Interaction patterns should be appropriate for the application type.
   - User personas should represent realistic target users for this project.
   - Usability heuristics should be specific and measurable.`,
  },
  'README': {
    label: 'Module README',
    guidance: `For README documents:
   - Module purpose should clearly describe what this domain module handles.
   - Key responsibilities should be specific to the application's needs.
   - Dependencies on other modules should be accurate and meaningful.
   - Setup or configuration notes should be practical.`,
  },
};

function detectDocType(fileName: string): { label: string; guidance: string } {
  for (const [prefix, info] of Object.entries(DOC_TYPE_MAP)) {
    if (fileName.startsWith(prefix)) return info;
  }
  return {
    label: 'Software Specification Document',
    guidance: `Fill in all UNKNOWN placeholders with content that is specific, realistic, and appropriate for this project and domain.`,
  };
}

function formatStructuredInput(structuredInput?: Record<string, string> | null): string {
  if (!structuredInput || Object.keys(structuredInput).length === 0) return '';

  const fieldLabels: Record<string, string> = {
    visionProblem: 'Problem Being Solved',
    visionTargetUsers: 'Target Users',
    visionSuccess: 'Success Criteria',
    visionGoals: 'Primary Goals',
    coreFeatures: 'Core Features (Must-Have)',
    niceToHaveFeatures: 'Nice-to-Have Features',
    coreEntities: 'Core Entities / Objects',
    userJourneys: 'Key User Journeys',
    platform: 'Platform Targets',
    integrations: 'External Integrations',
    techConstraints: 'Technical Constraints',
    dataSensitivity: 'Data Sensitivity Level',
  };

  const lines: string[] = [];
  for (const [key, value] of Object.entries(structuredInput)) {
    if (value && value.trim()) {
      const label = fieldLabels[key] || key;
      lines.push(`${label}: ${value.trim()}`);
    }
  }
  return lines.length > 0 ? lines.join('\n') : '';
}

function buildFillPrompt(
  fileContent: string,
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  structuredInput?: Record<string, string> | null
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const structuredContext = formatStructuredInput(structuredInput);

  return `You are an expert software architect filling out a ${docInfo.label} document for a software project.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}
${structuredContext ? `\nDETAILED PROJECT CONTEXT (use this information directly to fill placeholders — it comes from the project creator):\n${structuredContext}\n` : ''}
Below is the current document that has UNKNOWN placeholders. Your task is to replace every instance of "UNKNOWN" with realistic, project-specific content based on the project idea and domain module.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content appropriate to this project and domain.
2. When detailed project context is provided above, use that information directly — do not invent contradicting details.
3. Keep the exact same Markdown structure, headings, and table formatting.
4. ${docInfo.guidance}
5. Do NOT add new sections or remove existing ones.
6. Do NOT wrap the output in code fences. Return ONLY the filled document content.
7. Make the content realistic and specific to a "${projectIdea}" application in the "${moduleName}" domain.

CURRENT DOCUMENT:
${fileContent}

Return the complete filled document with all UNKNOWNs replaced:`;
}

export async function fillFileWithAI(
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null
): Promise<ContentFillResult> {
  if (!fs.existsSync(filePath)) {
    return {
      file: filePath,
      module: moduleName,
      status: 'skipped',
      unknownsBefore: 0,
      unknownsAfter: 0,
      error: 'File not found',
    };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const unknownsBefore = countUnknowns(content);

  if (unknownsBefore === 0) {
    return {
      file: filePath,
      module: moduleName,
      status: 'skipped',
      unknownsBefore: 0,
      unknownsAfter: 0,
    };
  }

  onProgress?.(`Filling ${path.basename(filePath)} (${unknownsBefore} UNKNOWNs)...`);

  try {
    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    const prompt = buildFillPrompt(content, filePath, projectName, projectIdea, moduleName, structuredInput);

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise document editor. You fill in placeholder content in software specification documents. You return only the filled document, preserving all Markdown formatting exactly.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 4096,
    });

    const filledContent = response.choices[0]?.message?.content;
    if (!filledContent) {
      return {
        file: filePath,
        module: moduleName,
        status: 'error',
        unknownsBefore,
        unknownsAfter: unknownsBefore,
        error: 'Empty response from AI',
      };
    }

    const cleaned = filledContent.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
    const unknownsAfter = countUnknowns(cleaned);

    fs.writeFileSync(filePath, cleaned, 'utf8');

    onProgress?.(`Filled ${path.basename(filePath)}: ${unknownsBefore} → ${unknownsAfter} UNKNOWNs`);

    return {
      file: filePath,
      module: moduleName,
      status: 'filled',
      unknownsBefore,
      unknownsAfter,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    onProgress?.(`Error filling ${path.basename(filePath)}: ${errMsg}`);
    return {
      file: filePath,
      module: moduleName,
      status: 'error',
      unknownsBefore,
      unknownsAfter: unknownsBefore,
      error: errMsg,
    };
  }
}

export async function fillModuleUnknowns(
  projectRoot: string,
  moduleName: string,
  projectName: string,
  projectIdea: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null
): Promise<ContentFillResult[]> {
  const moduleDir = path.join(projectRoot, 'axion', 'domains', moduleName);
  const results: ContentFillResult[] = [];

  const mdFiles = getAllMdFilesInModule(moduleDir);
  for (const filePath of mdFiles) {
    const result = await fillFileWithAI(filePath, projectName, projectIdea, moduleName, onProgress, structuredInput);
    results.push(result);
  }

  return results;
}

export async function fillAllModulesUnknowns(
  projectRoot: string,
  modules: string[],
  projectName: string,
  projectIdea: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null
): Promise<ContentFillReport> {
  const results: ContentFillResult[] = [];

  for (const mod of modules) {
    onProgress?.(`Processing module: ${mod}`);
    const modResults = await fillModuleUnknowns(projectRoot, mod, projectName, projectIdea, onProgress, structuredInput);
    results.push(...modResults);
  }

  return {
    totalFilesFilled: results.filter(r => r.status === 'filled').length,
    totalFilesSkipped: results.filter(r => r.status === 'skipped').length,
    totalFilesErrored: results.filter(r => r.status === 'error').length,
    results,
  };
}

function getSectionDetails(content: string): SectionDetail[] {
  const details: SectionDetail[] = [];
  const sectionRegex = /^## (.+)$/gm;
  let match;
  const positions: { name: string; start: number }[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    positions.push({ name: match[1], start: match.index });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].start;
    const end = i + 1 < positions.length ? positions[i + 1].start : content.length;
    const sectionContent = content.substring(start, end);
    const unkCount = countUnknowns(sectionContent);
    if (unkCount > 0) {
      const lines = sectionContent.split('\n').slice(0, 8);
      details.push({
        name: positions[i].name,
        unknownCount: unkCount,
        snippet: lines.join('\n').substring(0, 400),
      });
    }
  }

  return details;
}

function discoverAllMdFiles(projectRoot: string): { file: string; module: string; relativePath: string }[] {
  const results: { file: string; module: string; relativePath: string }[] = [];

  const sourceDocsDir = path.join(projectRoot, 'axion', 'docs', 'product');
  if (fs.existsSync(sourceDocsDir)) {
    const files = fs.readdirSync(sourceDocsDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const fullPath = path.join(sourceDocsDir, f);
      results.push({
        file: fullPath,
        module: '_source',
        relativePath: path.relative(projectRoot, fullPath),
      });
    }
  }

  const domainsDir = path.join(projectRoot, 'axion', 'domains');
  if (fs.existsSync(domainsDir)) {
    const modules = fs.readdirSync(domainsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name);
    for (const mod of modules) {
      const moduleDir = path.join(domainsDir, mod);
      const mdFiles = getAllMdFilesInModule(moduleDir);
      for (const f of mdFiles) {
        results.push({
          file: f,
          module: mod,
          relativePath: path.relative(projectRoot, f),
        });
      }
    }
  }

  return results;
}

export function findNextTarget(projectRoot: string): HierarchicalUnknownTarget | null {
  const allFiles = discoverAllMdFiles(projectRoot);
  const candidates: HierarchicalUnknownTarget[] = [];

  for (const { file, module, relativePath } of allFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const unkCount = countUnknowns(content);
    if (unkCount === 0) continue;

    const fileName = path.basename(file);
    const docInfo = detectDocType(fileName);
    const priority = getDocPriority(fileName);
    const sections = getSectionDetails(content);

    candidates.push({
      file,
      relativePath,
      module,
      docType: fileName.replace(/\.md$/, '').replace(/_[a-z]+$/, ''),
      docTypeLabel: docInfo.label,
      priority,
      unknownCount: unkCount,
      sections,
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.priority - b.priority);
  return candidates[0];
}

export function getAllTargets(projectRoot: string): HierarchicalUnknownTarget[] {
  const allFiles = discoverAllMdFiles(projectRoot);
  const candidates: HierarchicalUnknownTarget[] = [];

  for (const { file, module, relativePath } of allFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const unkCount = countUnknowns(content);
    if (unkCount === 0) continue;

    const fileName = path.basename(file);
    const docInfo = detectDocType(fileName);
    const priority = getDocPriority(fileName);
    const sections = getSectionDetails(content);

    candidates.push({
      file,
      relativePath,
      module,
      docType: fileName.replace(/\.md$/, '').replace(/_[a-z]+$/, ''),
      docTypeLabel: docInfo.label,
      priority,
      unknownCount: unkCount,
      sections,
    });
  }

  candidates.sort((a, b) => a.priority - b.priority);
  return candidates;
}

export async function generateQuestionsForTarget(
  target: HierarchicalUnknownTarget,
  projectName: string,
  projectIdea: string,
): Promise<GeneratedQuestion[]> {
  const content = fs.readFileSync(target.file, 'utf8');
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const sectionsInfo = target.sections
    .map(s => `- Section "${s.name}" (${s.unknownCount} UNKNOWNs):\n${s.snippet}`)
    .join('\n\n');

  const prompt = `You are helping a user fill in missing information in a ${target.docTypeLabel} document for the project "${projectName}" (${projectIdea}).

The following sections still have UNKNOWN placeholders that need real information from the user:

${sectionsInfo}

For each section, generate 1-3 clear, specific questions that would help gather the information needed to replace the UNKNOWNs. Questions should be non-technical and easy to understand.

Respond in this exact JSON format (no code fences):
[
  {
    "sectionName": "Section Name Here",
    "questions": ["Question 1?", "Question 2?"]
  }
]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: 'You generate targeted questions to gather real project information from users. Always respond with valid JSON only, no markdown code fences.',
      },
      { role: 'user', content: prompt },
    ],
    max_completion_tokens: 2048,
  });

  const raw = response.choices[0]?.message?.content || '[]';
  const cleaned = raw.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
  try {
    return JSON.parse(cleaned) as GeneratedQuestion[];
  } catch {
    return target.sections.map(s => ({
      sectionName: s.name,
      questions: [`What specific information should go in the "${s.name}" section for this project?`],
    }));
  }
}

function buildContextAwareFillPrompt(
  fileContent: string,
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  userAnswers: Record<string, string>,
  parentContext: string,
  structuredInput?: Record<string, string> | null,
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const structuredContext = formatStructuredInput(structuredInput);

  const answersBlock = Object.entries(userAnswers)
    .map(([section, answer]) => `Section "${section}": ${answer}`)
    .join('\n');

  return `You are an expert software architect filling out a ${docInfo.label} document for a software project.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}
${structuredContext ? `\nDETAILED PROJECT CONTEXT (from the project creator — use this to inform your fills):\n${structuredContext}\n` : ''}
${parentContext ? `CONTEXT FROM HIGHER-LEVEL DOCUMENTS (use this to inform your fills):\n${parentContext}\n` : ''}
${answersBlock ? `USER-PROVIDED ANSWERS (use this information directly):\n${answersBlock}\n` : ''}

Below is the current document that has UNKNOWN placeholders. Your task is to replace every instance of "UNKNOWN" with realistic, project-specific content.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content.
2. When user-provided context or answers are available, use that information directly — do not contradict it.
3. Keep the exact same Markdown structure, headings, and table formatting.
4. ${docInfo.guidance}
5. Do NOT add new sections or remove existing ones.
6. Do NOT wrap the output in code fences. Return ONLY the filled document content.

CURRENT DOCUMENT:
${fileContent}

Return the complete filled document with all UNKNOWNs replaced:`;
}

export async function fillFileWithContext(
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  userAnswers: Record<string, string>,
  parentContext: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
): Promise<ContentFillResult> {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0, error: 'File not found' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const unknownsBefore = countUnknowns(content);
  if (unknownsBefore === 0) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0 };
  }

  onProgress?.(`Filling ${path.basename(filePath)} with user context (${unknownsBefore} UNKNOWNs)...`);

  try {
    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    const prompt = buildContextAwareFillPrompt(content, filePath, projectName, projectIdea, moduleName, userAnswers, parentContext, structuredInput);

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: 'You are a precise document editor. You fill in placeholder content in software specification documents using the user-provided context. You return only the filled document, preserving all Markdown formatting exactly.' },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 4096,
    });

    const filledContent = response.choices[0]?.message?.content;
    if (!filledContent) {
      return { file: filePath, module: moduleName, status: 'error', unknownsBefore, unknownsAfter: unknownsBefore, error: 'Empty response from AI' };
    }

    const cleaned = filledContent.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
    const unknownsAfter = countUnknowns(cleaned);
    fs.writeFileSync(filePath, cleaned, 'utf8');

    onProgress?.(`Filled ${path.basename(filePath)}: ${unknownsBefore} → ${unknownsAfter} UNKNOWNs`);
    return { file: filePath, module: moduleName, status: 'filled', unknownsBefore, unknownsAfter };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    onProgress?.(`Error filling ${path.basename(filePath)}: ${errMsg}`);
    return { file: filePath, module: moduleName, status: 'error', unknownsBefore, unknownsAfter: unknownsBefore, error: errMsg };
  }
}

export async function cascadeFill(
  projectRoot: string,
  targetFile: string,
  targetModule: string,
  projectName: string,
  projectIdea: string,
  userAnswers: Record<string, string>,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
): Promise<CascadeFillResult> {
  const filledContent = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
  const parentContext = filledContent.substring(0, 3000);

  const targetResult = await fillFileWithContext(
    targetFile, projectName, projectIdea, targetModule, userAnswers, '', onProgress, structuredInput,
  );

  const updatedParentContent = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8').substring(0, 3000) : '';

  onProgress?.('Running cascade pass across all documents...');
  const cascadeResults: ContentFillResult[] = [];
  const allFiles = discoverAllMdFiles(projectRoot);

  for (const { file, module } of allFiles) {
    if (file === targetFile) continue;
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (countUnknowns(content) === 0) continue;

    const result = await fillFileWithContext(
      file, projectName, projectIdea, module, {}, updatedParentContent, onProgress, structuredInput,
    );
    cascadeResults.push(result);
  }

  const domainsDir = path.join(projectRoot, 'axion', 'domains');
  let moduleList: string[] = [];
  if (fs.existsSync(domainsDir)) {
    moduleList = fs.readdirSync(domainsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name);
  }
  const remainingScan = scanAllModulesForUnknowns(projectRoot, moduleList);
  const nextTarget = findNextTarget(projectRoot);

  return { targetFilled: targetResult, cascadeResults, remainingScan, nextTarget };
}

export interface UpgradeResult {
  file: string;
  status: 'upgraded' | 'skipped' | 'error';
  error?: string;
}

function buildUpgradePrompt(
  fileContent: string,
  filePath: string,
  moduleName: string,
  userInstructions?: string,
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);

  let instructionBlock = '';
  if (userInstructions && userInstructions.trim()) {
    instructionBlock = `

IMPORTANT — USER-PROVIDED UPGRADE INSTRUCTIONS:
${userInstructions.trim()}

Follow the user's instructions as the primary upgrade directive. The general guidelines below still apply but the user's instructions take priority.
`;
  }

  return `You are an expert technical writer upgrading a ${docInfo.label} document for a software project.

MODULE/DOMAIN: ${moduleName}

${docInfo.guidance}
${instructionBlock}
Below is the current document. Your task is to UPGRADE its quality:
1. Make vague or generic content more specific and actionable.
2. Add missing details where sections are thin.
3. Improve clarity, consistency, and technical precision.
4. Ensure all sections are comprehensive and production-ready.
5. Replace any remaining UNKNOWN placeholders with realistic, specific content.
6. Keep the existing structure and formatting intact — improve content, not layout.
7. Do NOT remove existing valid content — only enhance it.

CURRENT DOCUMENT:
${fileContent}

Return ONLY the upgraded document. Preserve all Markdown formatting, headings, and anchors exactly.`;
}

export async function generateUpgradeSuggestions(
  filePath: string,
  moduleName: string,
): Promise<{ suggestions: string[]; error?: string }> {
  if (!fs.existsSync(filePath)) {
    return { suggestions: [], error: 'File not found' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.trim().length < 20) {
    return { suggestions: ['File is too short to analyze meaningfully.'] };
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    const fileName = path.basename(filePath);
    const docInfo = detectDocType(fileName);

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a documentation quality analyst. You analyze technical documents and provide specific, actionable upgrade suggestions. Return a JSON array of suggestion strings.',
        },
        {
          role: 'user',
          content: `Analyze this ${docInfo.label} document for module "${moduleName}" and suggest 3-6 specific improvements.

Focus on:
- Sections that are vague, thin, or contain UNKNOWN placeholders
- Missing details that would make the doc production-ready
- Areas where specificity, clarity, or technical precision could improve
- Content gaps compared to what this document type should contain

DOCUMENT:
${content.substring(0, 6000)}

Return ONLY a JSON array of suggestion strings. Example: ["Add specific API endpoint details to the interface section", "Replace UNKNOWN placeholders in the data model section"]`,
        },
      ],
      max_completion_tokens: 1024,
    });

    const raw = response.choices[0]?.message?.content || '[]';
    const cleaned = raw.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '').trim();
    const suggestions = JSON.parse(cleaned);
    return { suggestions: Array.isArray(suggestions) ? suggestions : [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { suggestions: ['Could not generate AI suggestions at this time.'], error: msg };
  }
}

export async function upgradeDocumentWithAI(
  filePath: string,
  moduleName: string,
  onProgress?: (message: string) => void,
  userInstructions?: string,
): Promise<UpgradeResult> {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, status: 'skipped', error: 'File not found' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.trim().length < 20) {
    return { file: filePath, status: 'skipped', error: 'File too short to upgrade' };
  }

  onProgress?.(`Upgrading ${path.basename(filePath)}...`);

  try {
    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    const prompt = buildUpgradePrompt(content, filePath, moduleName, userInstructions);

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise technical writer. You upgrade software documentation quality while preserving structure. Return only the upgraded document.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 8192,
    });

    const upgraded = response.choices[0]?.message?.content;
    if (!upgraded) {
      return { file: filePath, status: 'error', error: 'Empty response from AI' };
    }

    const cleaned = upgraded.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
    fs.writeFileSync(filePath, cleaned, 'utf8');

    onProgress?.(`Upgraded ${path.basename(filePath)} successfully`);
    return { file: filePath, status: 'upgraded' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    onProgress?.(`Error upgrading ${path.basename(filePath)}: ${msg}`);
    return { file: filePath, status: 'error', error: msg };
  }
}
