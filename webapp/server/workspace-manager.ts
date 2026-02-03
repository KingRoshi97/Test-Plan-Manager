import fs from "fs";
import path from "path";
import { generateAllDocs, type GenerateDocsOptions } from "./ai-generator";
import type { AssemblyInput } from "@shared/schema";
import type { PipelineContext } from "./presets";
import { getRecommendedBuildOrder } from "./presets";

const WORKSPACES_DIR = "workspaces";
const TEMPLATES_DIR = "docs/assembler_v1/01_templates";

export interface WorkspaceConfig {
  assemblyId: string;
  projectName: string;
  idea: string;
  context?: string;
  domains: string[];
  pipelineContext?: PipelineContext;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src: string, dest: string) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function createWorkspace(config: WorkspaceConfig): Promise<string> {
  const workspaceRoot = path.join(WORKSPACES_DIR, config.assemblyId);
  const docsRoot = path.join(workspaceRoot, "docs/assembler_v1");
  
  ensureDir(workspaceRoot);
  ensureDir(docsRoot);
  ensureDir(path.join(docsRoot, "00_product"));
  ensureDir(path.join(docsRoot, "00_registry"));
  ensureDir(path.join(docsRoot, "01_templates"));
  ensureDir(path.join(docsRoot, "02_domains"));
  ensureDir(path.join(docsRoot, "03_workflows"));
  ensureDir(path.join(workspaceRoot, "assembler"));
  
  if (fs.existsSync(TEMPLATES_DIR)) {
    copyDir(TEMPLATES_DIR, path.join(docsRoot, "01_templates"));
  }
  
  const domainsConfig = {
    assembler_root: "docs/assembler_v1",
    domains_dir: "02_domains",
    templates_dir: "01_templates",
    domains: config.domains.map((slug, i) => ({
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
      slug: slug,
      prefix: slug.replace(/-/g, "_"),
      type: i === 0 ? "business" : "crosscutting"
    }))
  };
  
  fs.writeFileSync(
    path.join(workspaceRoot, "assembler/domains.json"),
    JSON.stringify(domainsConfig, null, 2)
  );
  
  const sourcesConfig = {
    assembler_root: "docs/assembler_v1",
    sources: [
      "00_product/RPBS_Product.md",
      "00_product/REBS_Product.md",
      "00_product/PROJECT_OVERVIEW.md",
      "00_registry/domain-map.md",
      "00_registry/reason-codes.md",
      "00_registry/action-vocabulary.md",
      "00_registry/glossary.md"
    ],
    domain_notes: {
      enabled: false,
      dir: "notes/domains",
      pattern: "{slug}.md"
    },
    sourceref: {
      required: true,
      format: "HeadingPath",
      example: "RPBS > Hard Rules Catalog > Feature"
    }
  };
  
  fs.writeFileSync(
    path.join(workspaceRoot, "assembler/sources.json"),
    JSON.stringify(sourcesConfig, null, 2)
  );
  
  console.log(`[Workspace] Created workspace structure for assembly ${config.assemblyId}`);
  
  return workspaceRoot;
}

export async function populateWorkspaceWithAI(config: WorkspaceConfig, workspaceRoot: string, assemblyInput?: AssemblyInput): Promise<void> {
  const docsRoot = path.join(workspaceRoot, "docs/assembler_v1");
  const deliveryDir = path.join(workspaceRoot, "delivery");
  
  ensureDir(deliveryDir);
  
  console.log(`[AI] Generating documentation for "${config.projectName || config.idea.substring(0, 50)}..."`);
  
  const aiContext = {
    projectName: assemblyInput?.projectName || config.projectName,
    description: assemblyInput?.description || config.idea,
    features: assemblyInput?.features || [],
    users: assemblyInput?.users || [],
    techStack: assemblyInput?.techStack || {},
    preset: assemblyInput?.preset || config.domains?.[0] || "default",
    domains: config.domains,
    uploadedContext: assemblyInput?.uploadedContext || null,
    uploadedFiles: assemblyInput?.uploadedFiles?.map(f => ({
      id: f.id,
      filename: f.filename,
      mimeType: f.mimeType,
      size: f.size,
      extractedLength: f.extractedText.length,
    })) || [],
  };
  
  fs.writeFileSync(
    path.join(deliveryDir, "input.json"),
    JSON.stringify(assemblyInput || {}, null, 2)
  );
  
  fs.writeFileSync(
    path.join(deliveryDir, "ai_context.json"),
    JSON.stringify(aiContext, null, 2)
  );
  
  const genOptions: GenerateDocsOptions = {
    idea: config.idea,
    projectName: config.projectName,
    context: config.context,
    domains: config.domains,
    structuredInput: assemblyInput ? {
      projectName: assemblyInput.projectName,
      description: assemblyInput.description,
      features: assemblyInput.features,
      users: assemblyInput.users,
      techStack: assemblyInput.techStack,
      preset: assemblyInput.preset,
      uploadedContext: assemblyInput.uploadedContext,
    } : undefined,
    pipelineContext: config.pipelineContext,
  };
  
  const docs = await generateAllDocs(genOptions);
  
  if (docs.modeArtifacts && Object.keys(docs.modeArtifacts).length > 0) {
    const modeDir = path.join(docsRoot, "mode");
    ensureDir(modeDir);
    
    for (const [filename, content] of Object.entries(docs.modeArtifacts)) {
      fs.writeFileSync(path.join(modeDir, filename), content);
      console.log(`[Workspace] Wrote mode artifact: ${filename}`);
    }
  }
  
  fs.writeFileSync(
    path.join(docsRoot, "00_product/PROJECT_OVERVIEW.md"),
    docs.projectOverview
  );
  
  fs.writeFileSync(
    path.join(docsRoot, "00_product/RPBS_Product.md"),
    docs.rpbs
  );
  
  fs.writeFileSync(
    path.join(docsRoot, "00_product/REBS_Product.md"),
    docs.rebs
  );
  
  fs.writeFileSync(
    path.join(docsRoot, "00_registry/domain-map.md"),
    docs.domainMap
  );
  
  fs.writeFileSync(
    path.join(docsRoot, "00_registry/reason-codes.md"),
    docs.reasonCodes
  );
  
  fs.writeFileSync(
    path.join(docsRoot, "00_registry/action-vocabulary.md"),
    docs.actionVocabulary
  );
  
  fs.writeFileSync(
    path.join(docsRoot, "00_registry/glossary.md"),
    docs.glossary
  );
  
  const featuresSection = assemblyInput?.features?.length 
    ? `## Features\n\n${assemblyInput.features.map(f => `- **${f.name}** (${f.priority}): ${f.description}`).join("\n")}\n`
    : "";
  
  const usersSection = assemblyInput?.users?.length
    ? `## User Types\n\n${assemblyInput.users.map(u => `- **${u.type}**: ${u.goal}`).join("\n")}\n`
    : "";
  
  const techSection = assemblyInput?.techStack
    ? `## Tech Stack\n\n${Object.entries(assemblyInput.techStack).filter(([_, v]) => v).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}\n`
    : "";
  
  const pipelineSection = config.pipelineContext ? `## Pipeline Context

- **Category**: ${config.pipelineContext.category}
- **Mode**: ${config.pipelineContext.mode}
${config.pipelineContext.presetId ? `- **Preset**: ${config.pipelineContext.presetId}` : ""}

### Domain Weights (Build Priority)

${getRecommendedBuildOrder(config.pipelineContext.domainWeights)
  .map((d, i) => `${i + 1}. **${d}** (weight: ${config.pipelineContext?.domainWeights[d]?.toFixed(1) || "0.5"})`)
  .join("\n")}

` : "";

  const modeArtifactsSection = docs.modeArtifacts && Object.keys(docs.modeArtifacts).length > 0
    ? `- \`mode/\` - Mode-specific artifacts
${Object.keys(docs.modeArtifacts).map(f => `  - ${f}`).join("\n")}
` : "";
  
  const readme = `# ${config.projectName || "Project"} - Axiom Documentation

Generated by Axiom Assembler from idea:
> ${config.idea}

${pipelineSection}
${featuresSection}
${usersSection}
${techSection}

## Structure

- \`00_product/\` - Product and engineering specifications
  - PROJECT_OVERVIEW.md - Project summary
  - RPBS_Product.md - Product requirements
  - REBS_Product.md - Engineering specifications
- \`00_registry/\` - Shared definitions
  - domain-map.md - Domain boundaries
  - reason-codes.md - Error code catalog
  - action-vocabulary.md - Standardized actions
  - glossary.md - Term definitions
- \`01_templates/\` - Domain doc templates
- \`02_domains/\` - Per-domain documentation (generated by pipeline)
- \`03_workflows/\` - Workflow documentation
${modeArtifactsSection}- \`delivery/\` - Delivery artifacts
  - input.json - Original structured input
  - ai_context.json - Normalized AI context

## Next Steps

1. Review generated documentation
2. Run \`npm run assembler:gen\` to generate domain packs
3. Run \`npm run assembler:seed\` to seed starter content
4. Run \`npm run assembler:draft\` to extract truth from sources
5. Resolve any UNKNOWN items
6. Run \`npm run assembler:verify\` to validate
7. Run \`npm run assembler:lock\` to finalize

## Domains

${config.domains.map(d => `- ${d}`).join("\n")}
`;
  
  fs.writeFileSync(path.join(docsRoot, "README.md"), readme);
  
  const manifest = {
    version: "1.0.0",
    projectName: config.projectName,
    assemblyId: config.assemblyId,
    generatedAt: new Date().toISOString(),
    category: config.pipelineContext?.category,
    mode: config.pipelineContext?.mode,
    presetId: config.pipelineContext?.presetId,
    enabledDomains: config.pipelineContext?.enabledDomains || config.domains,
    domainWeights: config.pipelineContext?.domainWeights || {},
    recommendedBuildOrder: config.pipelineContext 
      ? getRecommendedBuildOrder(config.pipelineContext.domainWeights)
      : config.domains,
    projectPackageRef: config.pipelineContext?.projectPackage?.id,
    modeArtifacts: docs.modeArtifacts ? Object.keys(docs.modeArtifacts) : [],
    sources: [
      "00_product/PROJECT_OVERVIEW.md",
      "00_product/RPBS_Product.md",
      "00_product/REBS_Product.md",
      "00_registry/domain-map.md",
      "00_registry/reason-codes.md",
      "00_registry/action-vocabulary.md",
      "00_registry/glossary.md",
    ],
  };
  
  fs.writeFileSync(
    path.join(deliveryDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log(`[AI] Generated ${Object.keys(docs).length} source documents + delivery artifacts`);
  if (docs.modeArtifacts) {
    console.log(`[AI] Mode artifacts: ${Object.keys(docs.modeArtifacts).join(", ")}`);
  }
}

export function getWorkspacePath(assemblyId: string): string {
  return path.join(WORKSPACES_DIR, assemblyId);
}

export function workspaceExists(assemblyId: string): boolean {
  return fs.existsSync(getWorkspacePath(assemblyId));
}

export function cleanupWorkspace(assemblyId: string): void {
  const workspacePath = getWorkspacePath(assemblyId);
  if (fs.existsSync(workspacePath)) {
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
}
