import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

export interface UnknownScanResult {
  module: string;
  file: string;
  relativePath: string;
  unknownCount: number;
  sections: string[];
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
  const domainsDir = path.join(projectRoot, 'axion', 'domains', moduleName);
  const results: UnknownScanResult[] = [];

  const belsPath = path.join(domainsDir, `BELS_${moduleName}.md`);
  const belsResult = scanBelsFile(belsPath, projectRoot);
  if (belsResult) results.push(belsResult);

  const oqPath = path.join(domainsDir, `OPEN_QUESTIONS_${moduleName}.md`);
  const oqResult = scanBelsFile(oqPath, projectRoot);
  if (oqResult) results.push(oqResult);

  return results;
}

export function scanAllModulesForUnknowns(
  projectRoot: string,
  modules: string[]
): ScanReport {
  const filesWithUnknowns: UnknownScanResult[] = [];
  let totalFiles = 0;

  for (const mod of modules) {
    const domainsDir = path.join(projectRoot, 'axion', 'domains', mod);
    const belsPath = path.join(domainsDir, `BELS_${mod}.md`);
    const oqPath = path.join(domainsDir, `OPEN_QUESTIONS_${mod}.md`);

    if (fs.existsSync(belsPath)) totalFiles++;
    if (fs.existsSync(oqPath)) totalFiles++;

    const results = scanModuleForUnknowns(projectRoot, mod);
    filesWithUnknowns.push(...results);
  }

  return {
    totalUnknowns: filesWithUnknowns.reduce((sum, r) => sum + r.unknownCount, 0),
    totalFiles,
    filesWithUnknowns,
  };
}

function buildFillPrompt(
  fileContent: string,
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string
): string {
  const isBELS = path.basename(filePath).startsWith('BELS_');
  const docType = isBELS ? 'Business Entity Logic Specification (BELS)' : 'Open Questions';

  return `You are an expert software architect filling out a ${docType} document for a software project.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}

Below is the current document that has UNKNOWN placeholders. Your task is to replace every instance of "UNKNOWN" with realistic, project-specific content based on the project idea and domain module.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content appropriate to this project and domain.
2. Keep the exact same Markdown structure, headings, and table formatting.
3. For BELS documents:
   - Policy rules should describe real business logic for this type of application.
   - State machines should model realistic entity lifecycles for this domain.
   - Validation rules should cover fields that would exist in this kind of application.
   - Reason codes should be specific SCREAMING_SNAKE_CASE identifiers.
   - Error codes should follow the pattern: MODULE_PREFIX_SPECIFIC_ERROR.
4. For Open Questions documents:
   - Questions should be specific to the project's domain and implementation challenges.
   - Resolution tracking should have meaningful statuses and resolution notes.
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
  onProgress?: (message: string) => void
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

    const prompt = buildFillPrompt(content, filePath, projectName, projectIdea, moduleName);

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
  onProgress?: (message: string) => void
): Promise<ContentFillResult[]> {
  const domainsDir = path.join(projectRoot, 'axion', 'domains', moduleName);
  const results: ContentFillResult[] = [];

  const belsPath = path.join(domainsDir, `BELS_${moduleName}.md`);
  const belsResult = await fillFileWithAI(belsPath, projectName, projectIdea, moduleName, onProgress);
  results.push(belsResult);

  const oqPath = path.join(domainsDir, `OPEN_QUESTIONS_${moduleName}.md`);
  const oqResult = await fillFileWithAI(oqPath, projectName, projectIdea, moduleName, onProgress);
  results.push(oqResult);

  return results;
}

export async function fillAllModulesUnknowns(
  projectRoot: string,
  modules: string[],
  projectName: string,
  projectIdea: string,
  onProgress?: (message: string) => void
): Promise<ContentFillReport> {
  const results: ContentFillResult[] = [];

  for (const mod of modules) {
    onProgress?.(`Processing module: ${mod}`);
    const modResults = await fillModuleUnknowns(projectRoot, mod, projectName, projectIdea, onProgress);
    results.push(...modResults);
  }

  return {
    totalFilesFilled: results.filter(r => r.status === 'filled').length,
    totalFilesSkipped: results.filter(r => r.status === 'skipped').length,
    totalFilesErrored: results.filter(r => r.status === 'error').length,
    results,
  };
}
