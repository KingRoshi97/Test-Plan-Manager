import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = path.resolve(__dirname, '..', '..');
const KNOWLEDGE_DIR = path.join(AXION_ROOT, 'knowledge');
const KNOWLEDGE_MAP_PATH = path.join(AXION_ROOT, 'config', 'knowledge-map.json');

export interface KnowledgeMap {
  version: string;
  description: string;
  domain_knowledge: Record<string, {
    primary: string[];
    secondary: string[];
    purpose: string;
  }>;
  stack_knowledge: Record<string, {
    always: string[];
    recommended: string[];
    optional: string[];
  }>;
  stage_knowledge: Record<string, {
    description: string;
    inject?: string[];
    inject_from_domain?: boolean;
    inject_from_stack?: boolean;
    inject_global?: string[];
  }>;
  doc_type_knowledge: Record<string, string[]>;
}

export interface ResolvedKnowledge {
  files: ResolvedFile[];
  summary: string;
}

export interface ResolvedFile {
  filename: string;
  priority: 'primary' | 'secondary' | 'global' | 'stack-always' | 'stack-recommended';
  reason: string;
  excerpt: string;
}

let cachedMap: KnowledgeMap | null = null;

function loadMap(): KnowledgeMap {
  if (cachedMap) return cachedMap;
  const raw = fs.readFileSync(KNOWLEDGE_MAP_PATH, 'utf-8');
  cachedMap = JSON.parse(raw) as KnowledgeMap;
  return cachedMap;
}

function readExcerpt(filename: string, maxLines: number = 60): string {
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  if (!fs.existsSync(filePath)) return '';
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const excerptLines: string[] = [];
  let inSection = false;
  let sectionDepth = 0;
  let collected = 0;

  for (const line of lines) {
    if (collected >= maxLines) break;

    const headingMatch = line.match(/^(#{1,3})\s/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      if (depth <= 2) {
        inSection = true;
        sectionDepth = depth;
      }
    }

    if (inSection || collected < 10) {
      excerptLines.push(line);
      collected++;
    }
  }

  return excerptLines.join('\n').trim();
}

function readFullContent(filename: string): string {
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

export function resolveForDomain(domainSlug: string): ResolvedKnowledge {
  const map = loadMap();
  const domainEntry = map.domain_knowledge[domainSlug];
  if (!domainEntry) {
    return { files: [], summary: `No knowledge mapping found for domain: ${domainSlug}` };
  }

  const files: ResolvedFile[] = [];
  const seen = new Set<string>();

  for (const f of domainEntry.primary) {
    if (seen.has(f)) continue;
    seen.add(f);
    files.push({
      filename: f,
      priority: 'primary',
      reason: `Primary reference for ${domainSlug} domain`,
      excerpt: readExcerpt(f),
    });
  }

  for (const f of domainEntry.secondary) {
    if (seen.has(f)) continue;
    seen.add(f);
    files.push({
      filename: f,
      priority: 'secondary',
      reason: `Secondary reference for ${domainSlug} domain`,
      excerpt: readExcerpt(f, 30),
    });
  }

  return {
    files,
    summary: `Resolved ${files.length} knowledge files for domain "${domainSlug}": ${domainEntry.purpose}`,
  };
}

export function resolveForStack(stackId: string): ResolvedKnowledge {
  const map = loadMap();
  const stackEntry = map.stack_knowledge[stackId];
  if (!stackEntry) {
    return { files: [], summary: `No knowledge mapping found for stack: ${stackId}` };
  }

  const files: ResolvedFile[] = [];
  const seen = new Set<string>();

  for (const f of stackEntry.always) {
    if (seen.has(f)) continue;
    seen.add(f);
    files.push({
      filename: f,
      priority: 'stack-always',
      reason: `Required for ${stackId} stack`,
      excerpt: readExcerpt(f),
    });
  }

  for (const f of stackEntry.recommended) {
    if (seen.has(f)) continue;
    seen.add(f);
    files.push({
      filename: f,
      priority: 'stack-recommended',
      reason: `Recommended for ${stackId} stack`,
      excerpt: readExcerpt(f, 30),
    });
  }

  return {
    files,
    summary: `Resolved ${files.length} knowledge files for stack "${stackId}"`,
  };
}

export function resolveForDocType(docType: string): ResolvedKnowledge {
  const map = loadMap();
  const docEntry = map.doc_type_knowledge[docType];
  if (!docEntry) {
    return { files: [], summary: `No knowledge mapping found for doc type: ${docType}` };
  }

  const files: ResolvedFile[] = [];
  for (const f of docEntry) {
    files.push({
      filename: f,
      priority: 'primary',
      reason: `Reference for ${docType} document type`,
      excerpt: readExcerpt(f),
    });
  }

  return {
    files,
    summary: `Resolved ${files.length} knowledge files for doc type "${docType}"`,
  };
}

export function resolveForStage(
  stage: string,
  domainSlug?: string,
  stackId?: string,
): ResolvedKnowledge {
  const map = loadMap();
  const stageEntry = map.stage_knowledge[stage];
  if (!stageEntry) {
    return { files: [], summary: `No knowledge mapping found for stage: ${stage}` };
  }

  const files: ResolvedFile[] = [];
  const seen = new Set<string>();

  if (stageEntry.inject) {
    for (const f of stageEntry.inject) {
      if (seen.has(f)) continue;
      seen.add(f);
      files.push({
        filename: f,
        priority: 'global',
        reason: `Stage-level reference for ${stage}`,
        excerpt: readExcerpt(f, 40),
      });
    }
  }

  if (stageEntry.inject_global) {
    for (const f of stageEntry.inject_global) {
      if (seen.has(f)) continue;
      seen.add(f);
      files.push({
        filename: f,
        priority: 'global',
        reason: `Global reference for ${stage} stage`,
        excerpt: readExcerpt(f, 30),
      });
    }
  }

  if (stageEntry.inject_from_domain && domainSlug) {
    const domainResolved = resolveForDomain(domainSlug);
    for (const rf of domainResolved.files) {
      if (seen.has(rf.filename)) continue;
      seen.add(rf.filename);
      files.push(rf);
    }
  }

  if (stageEntry.inject_from_stack && stackId) {
    const stackResolved = resolveForStack(stackId);
    for (const rf of stackResolved.files) {
      if (seen.has(rf.filename)) continue;
      seen.add(rf.filename);
      files.push(rf);
    }
  }

  return {
    files,
    summary: `Resolved ${files.length} knowledge files for stage "${stage}"` +
      (domainSlug ? ` (domain: ${domainSlug})` : '') +
      (stackId ? ` (stack: ${stackId})` : ''),
  };
}

export function buildPromptContext(resolved: ResolvedKnowledge, maxTokenEstimate: number = 8000): string {
  const charLimit = maxTokenEstimate * 4;
  let output = '--- KNOWLEDGE BASE CONTEXT ---\n\n';
  let currentLen = output.length;

  const primaryFiles = resolved.files.filter(f => f.priority === 'primary' || f.priority === 'stack-always');
  const secondaryFiles = resolved.files.filter(f => f.priority !== 'primary' && f.priority !== 'stack-always');

  for (const file of [...primaryFiles, ...secondaryFiles]) {
    const section = `### ${file.filename} (${file.priority})\n${file.excerpt}\n\n`;
    if (currentLen + section.length > charLimit) break;
    output += section;
    currentLen += section.length;
  }

  output += '--- END KNOWLEDGE BASE CONTEXT ---\n';
  return output;
}

export function generateKitIndex(
  stackId: string,
  activeDomains: string[],
): string {
  const map = loadMap();
  let md = '# Knowledge Base Index\n\n';
  md += 'This index maps each domain and task in your project to the relevant knowledge files.\n';
  md += 'When building a domain, read the **primary** files first, then consult **secondary** files as needed.\n\n';

  md += '## Stack: ' + stackId + '\n\n';
  const stackEntry = map.stack_knowledge[stackId];
  if (stackEntry) {
    md += '### Required Reading\n';
    md += 'These files contain best practices essential for your stack:\n\n';
    for (const f of stackEntry.always) {
      md += `- \`${f}\`\n`;
    }
    md += '\n### Recommended Reading\n';
    md += 'These files provide additional guidance relevant to your stack:\n\n';
    for (const f of stackEntry.recommended) {
      md += `- \`${f}\`\n`;
    }
    md += '\n';
  }

  md += '## Per-Domain Knowledge Map\n\n';
  md += 'When building each domain, consult these knowledge files:\n\n';
  md += '| Domain | Primary Files | Secondary Files | Focus |\n';
  md += '|--------|--------------|-----------------|-------|\n';

  for (const slug of activeDomains) {
    const entry = map.domain_knowledge[slug];
    if (!entry) continue;
    const primary = entry.primary.map(f => `\`${f}\``).join(', ');
    const secondary = entry.secondary.map(f => `\`${f}\``).join(', ');
    md += `| ${slug} | ${primary} | ${secondary} | ${entry.purpose} |\n`;
  }

  md += '\n## Document Type References\n\n';
  md += 'When writing or reviewing specific document types, consult:\n\n';
  md += '| Document Type | Knowledge Files |\n';
  md += '|--------------|----------------|\n';

  for (const [docType, files] of Object.entries(map.doc_type_knowledge)) {
    md += `| ${docType} | ${files.map(f => `\`${f}\``).join(', ')} |\n`;
  }

  md += '\n## How to Use This Index\n\n';
  md += '1. **Before building a domain**: Read the primary knowledge files listed for that domain\n';
  md += '2. **When writing documentation**: Check the document type references for relevant best practices\n';
  md += '3. **When making architecture decisions**: Consult `software-architecture.md` and `stacks.md`\n';
  md += '4. **When implementing security**: Always reference `security.md` and domain-specific security guides\n';
  md += '5. **When uncertain**: Check the secondary files — they often contain patterns and anti-patterns\n';

  return md;
}

export function listAllKnowledgeFiles(): string[] {
  if (!fs.existsSync(KNOWLEDGE_DIR)) return [];
  return fs.readdirSync(KNOWLEDGE_DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .sort();
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--domain') {
    const slug = args[1];
    if (!slug) { console.error('Usage: --domain <slug>'); process.exit(1); }
    const result = resolveForDomain(slug);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === '--stack') {
    const stackId = args[1];
    if (!stackId) { console.error('Usage: --stack <stack_id>'); process.exit(1); }
    const result = resolveForStack(stackId);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === '--stage') {
    const stage = args[1];
    const domain = args[2];
    const stack = args[3];
    if (!stage) { console.error('Usage: --stage <stage> [domain] [stack]'); process.exit(1); }
    const result = resolveForStage(stage, domain, stack);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === '--index') {
    const stackId = args[1] || 'default-web-saas';
    const domains = args.slice(2);
    if (domains.length === 0) {
      const domainsConfig = JSON.parse(fs.readFileSync(path.join(AXION_ROOT, 'config', 'domains.json'), 'utf-8'));
      domains.push(...domainsConfig.canonical_order);
    }
    console.log(generateKitIndex(stackId, domains));
  } else {
    console.log('Knowledge Resolver CLI');
    console.log('  --domain <slug>              Resolve knowledge for a domain');
    console.log('  --stack <stack_id>           Resolve knowledge for a stack profile');
    console.log('  --stage <stage> [domain] [stack]  Resolve knowledge for a pipeline stage');
    console.log('  --index [stack_id] [domains...]   Generate kit INDEX.md');
  }
}
