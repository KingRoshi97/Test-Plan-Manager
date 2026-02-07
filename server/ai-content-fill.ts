import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface FillResult {
  module: string;
  file: string;
  unknownsBefore: number;
  unknownsAfter: number;
  success: boolean;
  error?: string;
}

function countUnknowns(content: string): number {
  return (content.match(/UNKNOWN/g) || []).length;
}

function buildSystemPrompt(projectDescription: string): string {
  return `You are a software architecture documentation expert. You are filling in a BELS (Business Entity Logic Specification) document for a software project.

PROJECT DESCRIPTION:
${projectDescription}

INSTRUCTIONS:
- Replace every "UNKNOWN" placeholder with realistic, specific, and appropriate content based on the project description.
- For Policy Rules: provide real rule descriptions, conditions, actions, and source references relevant to the project domain.
- For State Machines: define real entity names, states, events, transitions, and deny codes.
- For Validation Rules: define real field names, validation rules, and error codes.
- For Reason Codes: provide real error/status codes with messages and severity levels.
- For Open Questions: replace UNKNOWN with specific technical details or mark as "N/A" if not applicable.
- Keep the exact same markdown table structure and formatting.
- Do NOT add new sections or remove existing ones.
- Do NOT wrap the output in code fences or add any preamble.
- Return ONLY the complete updated document content, nothing else.
- Make sure ALL UNKNOWNs are replaced — there should be zero remaining.
- Be specific to the project domain. For a "note pad app" the entities would be Notes, Folders, Tags, etc.`;
}

export async function fillBelsContent(
  belsPath: string,
  projectDescription: string,
  onProgress?: (msg: string) => void
): Promise<FillResult> {
  const module = path.basename(path.dirname(belsPath));
  const result: FillResult = {
    module,
    file: belsPath,
    unknownsBefore: 0,
    unknownsAfter: 0,
    success: false,
  };

  try {
    if (!fs.existsSync(belsPath)) {
      result.error = `BELS file not found: ${belsPath}`;
      return result;
    }

    const content = fs.readFileSync(belsPath, 'utf8');
    result.unknownsBefore = countUnknowns(content);

    if (result.unknownsBefore === 0) {
      result.success = true;
      onProgress?.(`Module ${module}: no UNKNOWNs to fill`);
      return result;
    }

    onProgress?.(`Module ${module}: filling ${result.unknownsBefore} UNKNOWNs with AI...`);

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(projectDescription) },
        { role: 'user', content: `Fill in all UNKNOWN placeholders in this BELS document for the "${module}" module:\n\n${content}` },
      ],
      max_completion_tokens: 4096,
    });

    const filledContent = response.choices[0]?.message?.content;
    if (!filledContent) {
      result.error = 'AI returned empty response';
      return result;
    }

    result.unknownsAfter = countUnknowns(filledContent);
    fs.writeFileSync(belsPath, filledContent, 'utf8');
    result.success = true;

    onProgress?.(`Module ${module}: ${result.unknownsBefore} → ${result.unknownsAfter} UNKNOWNs`);
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    onProgress?.(`Module ${module}: AI fill error - ${result.error}`);
    return result;
  }
}

export async function fillOpenQuestionsContent(
  oqPath: string,
  projectDescription: string,
  onProgress?: (msg: string) => void
): Promise<FillResult> {
  const module = path.basename(path.dirname(oqPath));
  const result: FillResult = {
    module,
    file: oqPath,
    unknownsBefore: 0,
    unknownsAfter: 0,
    success: false,
  };

  try {
    if (!fs.existsSync(oqPath)) {
      result.success = true;
      return result;
    }

    const content = fs.readFileSync(oqPath, 'utf8');
    result.unknownsBefore = countUnknowns(content);

    if (result.unknownsBefore === 0) {
      result.success = true;
      return result;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `You are a software architecture expert. Fill in all UNKNOWN placeholders in this Open Questions document for a "${module}" module of the following project:\n\n${projectDescription}\n\nReplace UNKNOWN with specific, realistic answers. Return ONLY the complete updated document.`,
        },
        { role: 'user', content },
      ],
      max_completion_tokens: 2048,
    });

    const filledContent = response.choices[0]?.message?.content;
    if (filledContent) {
      result.unknownsAfter = countUnknowns(filledContent);
      fs.writeFileSync(oqPath, filledContent, 'utf8');
      result.success = true;
    } else {
      result.error = 'AI returned empty response';
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

export async function fillModuleContent(
  projectRoot: string,
  moduleName: string,
  projectDescription: string,
  onProgress?: (msg: string) => void
): Promise<{ bels: FillResult; openQuestions: FillResult }> {
  const domainsDir = path.join(projectRoot, 'axion', 'domains', moduleName);
  const belsPath = path.join(domainsDir, `BELS_${moduleName}.md`);
  const oqPath = path.join(domainsDir, `OPEN_QUESTIONS_${moduleName}.md`);

  const bels = await fillBelsContent(belsPath, projectDescription, onProgress);
  const openQuestions = await fillOpenQuestionsContent(oqPath, projectDescription, onProgress);

  return { bels, openQuestions };
}

export async function fillAllModulesContent(
  buildRoot: string,
  modules: string[],
  projectDescription: string,
  onProgress?: (msg: string) => void
): Promise<FillResult[]> {
  const results: FillResult[] = [];

  for (const mod of modules) {
    const { bels, openQuestions } = await fillModuleContent(buildRoot, mod, projectDescription, onProgress);
    results.push(bels);
    if (openQuestions.unknownsBefore > 0) {
      results.push(openQuestions);
    }
  }

  return results;
}
