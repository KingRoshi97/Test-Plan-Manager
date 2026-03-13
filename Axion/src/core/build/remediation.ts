import * as path from "path";
import * as fs from "fs";
import type {
  GenerationStrategyPlan, BuildUnit, GenerationStrategy,
  RemediationFileContext, FixFileResult, FixUnitResult,
  GenerateCodeFn, ProgressCallback,
} from "./types.js";

interface RemediationPatch {
  startLine: number;
  endLine: number;
  replacement: string;
}

interface FixResult {
  content: string;
  method: "patch" | "fallback_full_rewrite";
  patchCount?: number;
  diffStats: { linesAdded: number; linesRemoved: number; linesUnchanged: number };
}

interface PreservationGateResult {
  gate_id: string;
  passed: boolean;
  message: string;
}

export function computeSimpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export function buildFileInventoryBlock(filePath: string, repoFileList?: string[]): string {
  if (!repoFileList || repoFileList.length === 0) return "";
  const dirOfFile = path.dirname(filePath);
  const nearbyFiles = repoFileList.filter(f => {
    const fDir = path.dirname(f);
    return fDir === dirOfFile || fDir.startsWith(dirOfFile + "/") || dirOfFile.startsWith(fDir + "/") || fDir.split("/").slice(0, 2).join("/") === dirOfFile.split("/").slice(0, 2).join("/");
  });
  const otherDirs = new Set(repoFileList.map(f => path.dirname(f)));
  const relevantFiles = nearbyFiles.length > 200 ? nearbyFiles.slice(0, 200) : nearbyFiles;
  const fullListCap = 500;
  const showFullList = repoFileList.length <= fullListCap;

  return `

PROJECT FILE INVENTORY (${repoFileList.length} total files):
When fixing imports or references, ONLY use paths that match files in this list. Do NOT invent or guess file names.

Files near ${filePath}:
${relevantFiles.map(f => "  " + f).join("\n")}

All project directories:
${[...otherDirs].sort().map(d => "  " + d + "/").join("\n")}
${showFullList ? `\nFull file list:\n${repoFileList.map(f => "  " + f).join("\n")}` : ""}`;
}

export function parsePatches(raw: string): RemediationPatch[] | null {
  let cleaned = raw.trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) cleaned = jsonMatch[1].trim();
  const braceStart = cleaned.indexOf("{");
  const braceEnd = cleaned.lastIndexOf("}");
  if (braceStart === -1 || braceEnd === -1) return null;
  cleaned = cleaned.slice(braceStart, braceEnd + 1);

  try {
    const parsed = JSON.parse(cleaned);
    const patches: RemediationPatch[] = parsed.patches;
    if (!Array.isArray(patches)) return null;
    for (const p of patches) {
      if (typeof p.startLine !== "number" || typeof p.endLine !== "number" || typeof p.replacement !== "string") return null;
      if (p.startLine < 1 || p.endLine < p.startLine) return null;
    }
    return patches;
  } catch {
    return null;
  }
}

export function applyPatches(originalLines: string[], patches: RemediationPatch[]): { content: string; valid: boolean; error?: string } {
  if (patches.length === 0) return { content: originalLines.join("\n"), valid: true };

  const sorted = [...patches].sort((a, b) => b.startLine - a.startLine);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].startLine <= sorted[i + 1].endLine) {
      return { content: "", valid: false, error: `Overlapping patches at lines ${sorted[i + 1].startLine}-${sorted[i + 1].endLine} and ${sorted[i].startLine}-${sorted[i].endLine}` };
    }
  }

  const lines = [...originalLines];
  for (const patch of sorted) {
    const startIdx = patch.startLine - 1;
    const endIdx = patch.endLine - 1;
    if (startIdx >= lines.length) {
      return { content: "", valid: false, error: `Patch startLine ${patch.startLine} exceeds file length ${lines.length}` };
    }
    const clampedEnd = Math.min(endIdx, lines.length - 1);
    const replacementLines = patch.replacement === "" ? [] : patch.replacement.split("\n");
    lines.splice(startIdx, clampedEnd - startIdx + 1, ...replacementLines);
  }

  return { content: lines.join("\n"), valid: true };
}

export function computeDiffStats(originalLines: string[], fixedLines: string[]): { linesAdded: number; linesRemoved: number; linesUnchanged: number } {
  let linesUnchanged = 0;
  const minLen = Math.min(originalLines.length, fixedLines.length);
  for (let i = 0; i < minLen; i++) {
    if (originalLines[i] === fixedLines[i]) linesUnchanged++;
  }
  const linesRemoved = Math.max(0, originalLines.length - fixedLines.length);
  const linesAdded = Math.max(0, fixedLines.length - originalLines.length);
  return { linesAdded, linesRemoved, linesUnchanged };
}

export function runPreservationGates(originalContent: string, fixedContent: string): PreservationGateResult[] {
  const gates: PreservationGateResult[] = [];
  const origLen = originalContent.length;
  const fixLen = fixedContent.length;

  if (origLen > 0) {
    const sizeRatio = fixLen / origLen;
    gates.push({
      gate_id: "PG-SIZE",
      passed: sizeRatio >= 0.25 && sizeRatio <= 4.0,
      message: sizeRatio < 0.25 ? `File shrunk to ${(sizeRatio * 100).toFixed(1)}% of original (min 25%)` :
               sizeRatio > 4.0 ? `File grew to ${(sizeRatio * 100).toFixed(1)}% of original (max 400%)` :
               `Size ratio ${(sizeRatio * 100).toFixed(1)}% within bounds`,
    });
  }

  const origLines = originalContent.split("\n");
  const fixLines = fixedContent.split("\n");
  let changedLines = 0;
  const maxLen = Math.max(origLines.length, fixLines.length);
  for (let i = 0; i < maxLen; i++) {
    if ((origLines[i] ?? "") !== (fixLines[i] ?? "")) changedLines++;
  }
  const diffRatio = maxLen > 0 ? changedLines / maxLen : 0;
  gates.push({
    gate_id: "PG-DIFF-RATIO",
    passed: diffRatio <= 0.40,
    message: diffRatio > 0.40 ? `${(diffRatio * 100).toFixed(1)}% of lines changed (max 40%) — fix is too broad` :
             `${(diffRatio * 100).toFixed(1)}% of lines changed — within surgical threshold`,
  });

  const structureKeywords = ["export ", "export default", "function ", "class ", "const ", "interface ", "type ", "enum "];
  const origStructCount = structureKeywords.reduce((sum, kw) => sum + (originalContent.split(kw).length - 1), 0);
  const fixStructCount = structureKeywords.reduce((sum, kw) => sum + (fixedContent.split(kw).length - 1), 0);
  if (origStructCount > 0) {
    const structRatio = fixStructCount / origStructCount;
    gates.push({
      gate_id: "PG-STRUCTURE",
      passed: structRatio >= 0.5,
      message: structRatio < 0.5 ? `Lost ${((1 - structRatio) * 100).toFixed(0)}% of structural declarations (exports/functions/classes)` :
               `Structural declarations preserved (${fixStructCount}/${origStructCount})`,
    });
  }

  const preamblePatterns = [/^```/, /^Here is/, /^Here's/, /^The fixed/, /^Below is/, /^I've fixed/, /^I have fixed/];
  const firstLine = fixedContent.trimStart().split("\n")[0] || "";
  const hasPreamble = preamblePatterns.some(p => p.test(firstLine));
  gates.push({
    gate_id: "PG-PREAMBLE",
    passed: !hasPreamble,
    message: hasPreamble ? `Output starts with LLM preamble: "${firstLine.slice(0, 60)}..."` :
             "No LLM preamble detected",
  });

  const hasNullBytes = fixedContent.includes("\0");
  gates.push({
    gate_id: "PG-ENCODING",
    passed: !hasNullBytes,
    message: hasNullBytes ? "Fixed content contains null bytes — possible binary corruption" :
             "Encoding check passed",
  });

  return gates;
}

function extractCodeBlock(text: string): string {
  const fencePattern = /```(?:[a-zA-Z0-9]*)\s*\n([\s\S]*?)```/g;
  let best = "";
  let match;
  while ((match = fencePattern.exec(text)) !== null) {
    if (match[1].length > best.length) {
      best = match[1];
    }
  }
  if (best) {
    return best.replace(/^```[a-zA-Z0-9]*\s*$/gm, "").trim();
  }
  return text.replace(/^```[a-zA-Z0-9]*\s*$/gm, "").trim();
}

async function fixFileFromFindings(
  existingContent: string,
  filePath: string,
  findings: RemediationFileContext[],
  generateCodeFn: GenerateCodeFn,
  model: string = "claude-sonnet-4-6",
  repoFileList?: string[],
): Promise<FixResult | null> {
  const findingsBlock = findings.map((f, i) => {
    let block = `  ${i + 1}. [${f.severity.toUpperCase()}] ${f.findingTitle}`;
    if (f.fileSpecificDetail) {
      block += `\n     FILE-SPECIFIC ISSUE:\n${f.fileSpecificDetail.split("\n").map(l => "       " + l).join("\n")}`;
    } else {
      block += `\n     Description: ${f.findingDescription}`;
    }
    block += `\n     Fix guidance: ${f.remediationGuidance}`;
    return block;
  }).join("\n\n");

  const fileInventoryBlock = buildFileInventoryBlock(filePath, repoFileList);
  const originalLines = existingContent.split("\n");
  const numberedContent = originalLines.map((line, i) => `${String(i + 1).padStart(5)}| ${line}`).join("\n");

  const systemPrompt = `You are a senior software engineer performing SURGICAL code remediation. You will receive a source file with line numbers, a list of specific AVCS certification findings, and the project file inventory.

YOUR TASK: Return a JSON patch object that fixes ONLY the identified issues. Every line not explicitly patched stays EXACTLY as-is — byte-for-byte identical.

OUTPUT FORMAT — return ONLY this JSON, no markdown fences, no explanations:
{
  "patches": [
    { "startLine": 12, "endLine": 14, "replacement": "const x = sanitize(input);\\nconst y = validate(x);" },
    { "startLine": 47, "endLine": 47, "replacement": "import { helper } from './utils/helper';" }
  ]
}

PATCH RULES:
- startLine and endLine are 1-based inclusive line numbers from the original file
- replacement is the new code that replaces lines startLine through endLine (use \\n for newlines within the replacement)
- Patches MUST NOT overlap
- If a finding requires adding new lines, replace the nearest relevant line and include the additions in the replacement
- If a finding requires removing lines, set replacement to "" (empty string)
- If no changes are needed, return { "patches": [] }
- MINIMIZE the number of lines touched — only patch the exact lines that need to change
- Do NOT reformat, restyle, or reorganize code outside the patch regions

IMPORT PATH RULES:
- When fixing import paths, ONLY use paths from the PROJECT FILE INVENTORY
- Do NOT guess or invent file paths`;

  const userPrompt = `FILE: ${filePath}

FINDINGS TO FIX:
${findingsBlock}
${fileInventoryBlock}

FILE CONTENT (with line numbers):
${numberedContent}

Return the JSON patch object:`;

  const maxTokens = Math.min(Math.max(findings.length * 500, 2048), 8192);
  const result = await generateCodeFn(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens,
    "REMEDIATION_PATCH",
    model,
  );

  if (!result) return null;

  const patches = parsePatches(result);
  if (patches && patches.length >= 0) {
    if (patches.length === 0) {
      return {
        content: existingContent,
        method: "patch",
        patchCount: 0,
        diffStats: { linesAdded: 0, linesRemoved: 0, linesUnchanged: originalLines.length },
      };
    }

    const applied = applyPatches(originalLines, patches);
    if (applied.valid) {
      const fixedLines = applied.content.split("\n");
      return {
        content: applied.content,
        method: "patch",
        patchCount: patches.length,
        diffStats: computeDiffStats(originalLines, fixedLines),
      };
    }
    console.log(`    [BA-FIX] Patch application failed: ${applied.error} — falling back to full rewrite`);
  } else {
    console.log(`    [BA-FIX] Patch parse failed — falling back to full rewrite`);
  }

  const fallbackSystemPrompt = `You are a senior software engineer performing targeted code remediation. Fix ONLY the identified issues. Preserve ALL existing code exactly as-is for lines that don't need changes.

CRITICAL: Output ONLY the complete fixed file content — no explanations, no markdown fences, no comments about changes. The output must be a drop-in replacement. Do NOT reformat, restyle, or change any line that isn't directly related to a finding.`;

  const fallbackUserPrompt = `FILE: ${filePath}

FINDINGS TO FIX:
${findingsBlock}
${fileInventoryBlock}

EXISTING FILE CONTENT:
${existingContent}

Output the complete fixed file:`;

  const fallbackMaxTokens = Math.min(Math.max(originalLines.length * 20, 4096), 16384);
  const fallbackResult = await generateCodeFn(
    [
      { role: "system", content: fallbackSystemPrompt },
      { role: "user", content: fallbackUserPrompt },
    ],
    fallbackMaxTokens,
    "REMEDIATION_FIX_FALLBACK",
    model,
  );

  if (!fallbackResult) return null;
  const extracted = extractCodeBlock(fallbackResult);
  if (!extracted) return null;

  const fixedLines = extracted.split("\n");
  return {
    content: extracted,
    method: "fallback_full_rewrite",
    diffStats: computeDiffStats(originalLines, fixedLines),
  };
}

export async function fixUnitsFromFindings(
  repoDir: string,
  buildDir: string,
  gsePlan: GenerationStrategyPlan,
  unitIds: string[],
  fileRemediationContext: Map<string, RemediationFileContext[]>,
  generateCodeFn: GenerateCodeFn,
  onProgress?: ProgressCallback,
): Promise<{ success: boolean; filesFixed: number; filesUnchanged: number; filesFailed: number; errors: string[]; unitResults: FixUnitResult[]; backupDir?: string }> {
  const unitIdSet = new Set(unitIds);
  const strategyMap = new Map<string, GenerationStrategy>();
  for (const s of gsePlan.strategies) strategyMap.set(s.build_unit_id, s);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(buildDir, "remediation_backups", timestamp);
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`  [BA-REMEDIATION] Backup directory created: ${backupDir}`);

  const fileIdToPath = new Map<string, string>();
  const blueprintPath = path.join(buildDir, "repo_blueprint.json");
  try {
    const bp = JSON.parse(fs.readFileSync(blueprintPath, "utf-8"));
    for (const entry of (bp.file_inventory ?? [])) {
      fileIdToPath.set(entry.file_id, entry.path);
    }
    console.log(`  [BA-REMEDIATION] Loaded blueprint: ${fileIdToPath.size} file_id → path mappings`);
  } catch {
    console.log(`  [BA-REMEDIATION] Warning: Could not load blueprint, falling back to file_id as path`);
    for (const unit of gsePlan.build_units) {
      for (const fid of unit.file_ids) {
        fileIdToPath.set(fid, fid);
      }
    }
  }

  const resolvedRepoDir = path.resolve(repoDir);

  const repoFileList: string[] = [];
  function walkRepo(dir: string, base: string): void {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walkRepo(fullPath, relPath);
        } else if (entry.isFile()) {
          repoFileList.push(relPath);
        }
      }
    } catch (err: any) {
      console.log(`  [BA-REMEDIATION] Warning: walkRepo error in ${dir}: ${err.message}`);
    }
  }
  walkRepo(resolvedRepoDir, "");
  console.log(`  [BA-REMEDIATION] Built repo file inventory: ${repoFileList.length} files`);

  let filesFixed = 0;
  let filesUnchanged = 0;
  let filesFailed = 0;
  const errors: string[] = [];
  const unitResults: FixUnitResult[] = [];
  let totalProcessed = 0;

  let unitsToProcess = gsePlan.build_units.filter(u => unitIdSet.has(u.id));

  if (unitsToProcess.length === 0 && fileRemediationContext.size > 0) {
    console.log(`  [BA-REMEDIATION] No GSE build units matched — constructing synthetic units from affected files`);

    const filesByUnit = new Map<string, string[]>();
    for (const uid of unitIds) {
      filesByUnit.set(uid, []);
    }
    const unitIdList = unitIds.length > 0 ? unitIds : ["remediation-direct-files"];
    let roundRobinIdx = 0;
    for (const filePath of fileRemediationContext.keys()) {
      const assignedUnit = unitIdList[roundRobinIdx % unitIdList.length];
      const existing = filesByUnit.get(assignedUnit) || [];
      existing.push(filePath);
      filesByUnit.set(assignedUnit, existing);
      roundRobinIdx++;
    }

    for (const [unitId, filePaths] of filesByUnit) {
      if (filePaths.length === 0) continue;
      unitsToProcess.push({
        id: unitId,
        unit_type: "remediation" as any,
        name: `Remediation: ${unitId}`,
        file_ids: filePaths,
        dependency_unit_ids: [],
        source_refs: [],
        context_capsule: undefined as any,
      });
      for (const fp of filePaths) {
        fileIdToPath.set(fp, fp);
      }
    }
  }

  const totalFiles = unitsToProcess.reduce((sum, u) => sum + u.file_ids.length, 0);
  console.log(`  [BA-REMEDIATION] Processing ${unitsToProcess.length} units (${totalFiles} files) for targeted fix`);

  for (const unit of unitsToProcess) {
    const strategy = strategyMap.get(unit.id);
    const modelName = strategy
      ? (strategy.model_tier === "mini" ? "claude-haiku-4-5" : "claude-sonnet-4-6")
      : "claude-sonnet-4-6";

    const unitResult: FixUnitResult = {
      unitId: unit.id,
      unitName: unit.name,
      files: [],
      success: true,
    };

    console.log(`  [BA-REMEDIATION] Unit: ${unit.name} (${unit.file_ids.length} files)`);

    for (const fileId of unit.file_ids) {
      const filePath = fileIdToPath.get(fileId) || fileId;
      const fullPath = path.resolve(repoDir, filePath);
      totalProcessed++;

      if (!fullPath.startsWith(resolvedRepoDir + path.sep) && fullPath !== resolvedRepoDir) {
        unitResult.files.push({
          filePath,
          status: "failed",
          beforeHash: "",
          afterHash: "",
          findingsAddressed: [],
          error: "Path traversal rejected — target escapes repo directory",
        });
        filesFailed++;
        errors.push(`Path traversal blocked for ${filePath}`);
        unitResult.success = false;
        continue;
      }

      const findings = fileRemediationContext.get(filePath);
      if (!findings || findings.length === 0) {
        unitResult.files.push({
          filePath,
          status: "unchanged",
          beforeHash: "",
          afterHash: "",
          findingsAddressed: [],
        });
        filesUnchanged++;
        continue;
      }

      let existingContent: string;
      try {
        existingContent = fs.readFileSync(fullPath, "utf-8");
      } catch {
        unitResult.files.push({
          filePath,
          status: "failed",
          beforeHash: "",
          afterHash: "",
          findingsAddressed: findings.map(f => f.findingTitle),
          error: "File not found on disk — cannot fix nonexistent file",
        });
        filesFailed++;
        errors.push(`Cannot read ${filePath} for fixing — file not found`);
        unitResult.success = false;
        continue;
      }

      const beforeHash = computeSimpleHash(existingContent);
      console.log(`    [BA-FIX] Fixing ${filePath} (${findings.length} findings, ${existingContent.split("\n").length} lines)`);

      try {
        const fixResult = await fixFileFromFindings(existingContent, filePath, findings, generateCodeFn, modelName, repoFileList);

        if (!fixResult) {
          unitResult.files.push({
            filePath,
            status: "failed",
            beforeHash,
            afterHash: beforeHash,
            findingsAddressed: findings.map(f => f.findingTitle),
            error: "LLM returned empty result",
          });
          filesFailed++;
          errors.push(`Fix failed for ${filePath}: LLM returned empty`);
          unitResult.success = false;
          continue;
        }

        const gates = runPreservationGates(existingContent, fixResult.content);
        const failedGates = gates.filter(g => !g.passed);
        if (failedGates.length > 0) {
          const gateMsg = failedGates.map(g => `[${g.gate_id}] ${g.message}`).join("; ");
          console.log(`    [BA-FIX] BLOCKED by preservation gates for ${filePath}: ${gateMsg}`);
          unitResult.files.push({
            filePath,
            status: "failed",
            beforeHash,
            afterHash: beforeHash,
            findingsAddressed: findings.map(f => f.findingTitle),
            error: `Preservation gate violation: ${gateMsg}`,
            preservationGates: gates,
          });
          filesFailed++;
          errors.push(`Preservation gate blocked fix for ${filePath}: ${gateMsg}`);
          unitResult.success = false;
          continue;
        }

        console.log(`    [BA-FIX] Preservation gates passed (${gates.length} checks) for ${filePath} [method: ${fixResult.method}${fixResult.patchCount != null ? `, ${fixResult.patchCount} patches` : ""}]`);

        const afterHash = computeSimpleHash(fixResult.content);

        try {
          const backupFilePath = path.join(backupDir, filePath);
          fs.mkdirSync(path.dirname(backupFilePath), { recursive: true });
          fs.copyFileSync(fullPath, backupFilePath);
        } catch (backupErr: any) {
          console.log(`    [BA-FIX] BLOCKED: Could not backup ${filePath}: ${backupErr.message} — skipping write to preserve rollback safety`);
          unitResult.files.push({
            filePath,
            status: "failed",
            beforeHash,
            afterHash: beforeHash,
            findingsAddressed: findings.map(f => f.findingTitle),
            error: `Backup failed — write blocked for rollback safety: ${backupErr.message}`,
            preservationGates: gates,
          });
          filesFailed++;
          errors.push(`Backup failed for ${filePath} — write blocked`);
          unitResult.success = false;
          continue;
        }

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, fixResult.content, "utf-8");

        unitResult.files.push({
          filePath,
          status: afterHash !== beforeHash ? "fixed" : "unchanged",
          beforeHash,
          afterHash,
          findingsAddressed: findings.map(f => f.findingTitle),
          preservationGates: gates,
          fixMethod: fixResult.method,
          diffStats: fixResult.diffStats,
        });

        if (afterHash !== beforeHash) {
          filesFixed++;
          console.log(`    [BA-FIX] Fixed ${filePath} (hash ${beforeHash} → ${afterHash}, ${fixResult.diffStats.linesAdded} added, ${fixResult.diffStats.linesRemoved} removed, ${fixResult.diffStats.linesUnchanged} unchanged)`);
        } else {
          filesUnchanged++;
          console.log(`    [BA-FIX] ${filePath} unchanged after fix attempt`);
        }

        onProgress?.({
          sliceId: unit.id,
          sliceName: unit.name,
          fileIndex: totalProcessed,
          totalFiles,
          filePath,
          status: "generated",
        });
      } catch (err: any) {
        unitResult.files.push({
          filePath,
          status: "failed",
          beforeHash,
          afterHash: beforeHash,
          findingsAddressed: findings.map(f => f.findingTitle),
          error: err.message,
        });
        filesFailed++;
        errors.push(`Fix error for ${filePath}: ${err.message}`);
        unitResult.success = false;
      }
    }

    unitResults.push(unitResult);
  }

  console.log(`  [BA-REMEDIATION] Complete: ${filesFixed} fixed, ${filesUnchanged} unchanged, ${filesFailed} failed`);
  return { success: filesFailed === 0, filesFixed, filesUnchanged, filesFailed, errors, unitResults, backupDir };
}
