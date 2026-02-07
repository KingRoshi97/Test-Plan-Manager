import * as fs from 'fs';
import * as path from 'path';

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
