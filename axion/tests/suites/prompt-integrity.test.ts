import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { describe, it } from '../helpers/test-runner';
import {
  createTestWorkspace,
  runAxionCommand,
  assertExitCode,
  assertContains,
  readFile,
} from '../helpers/test-utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractAgentPromptFromZip(zipPath: string): string {
  return execSync(`unzip -p "${zipPath}" AGENT_PROMPT.md`, { encoding: 'utf-8' });
}

function normalize(content: string): string {
  return content
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.-]+Z?/g, '__TIMESTAMP__')
    .replace(/[a-f0-9]{64}/g, '__SHA256__')
    .replace(/[a-f0-9]{16}\.\.\./g, '__SHA_SHORT__');
}

describe('Prompt Integrity & Golden Fixture Tests', () => {

  it('1. docs mode: zero unresolved placeholders', () => {
    const ctx = createTestWorkspace('prompt-integrity-docs');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed in docs mode');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      if (zips.length === 0) throw new Error('No zip produced');

      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));
      const unresolved = prompt.match(/\{\{\s*[A-Z0-9_]+\s*\}\}/g);
      if (unresolved) {
        throw new Error(`Unresolved placeholders in docs mode: ${[...new Set(unresolved)].join(', ')}`);
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('2. scaffold mode: zero unresolved placeholders', () => {
    const ctx = createTestWorkspace('prompt-integrity-scaffold');
    try {
      const appDir = path.join(ctx.workspacePath, 'app');
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, 'index.ts'), '// scaffold placeholder');

      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'scaffold', '--skip-validation',
        '--app-path', appDir,
        '--output', path.join(ctx.workspacePath, 'dist'),
      ]);

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      if (zips.length === 0) throw new Error('No zip produced');

      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));
      const unresolved = prompt.match(/\{\{\s*[A-Z0-9_]+\s*\}\}/g);
      if (unresolved) {
        throw new Error(`Unresolved placeholders in scaffold mode: ${[...new Set(unresolved)].join(', ')}`);
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('3. full mode: zero unresolved placeholders', () => {
    const ctx = createTestWorkspace('prompt-integrity-full');
    try {
      const appDir = path.join(ctx.workspacePath, 'app');
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, 'index.ts'), '// full app placeholder');

      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'full', '--skip-validation',
        '--app-path', appDir,
        '--output', path.join(ctx.workspacePath, 'dist'),
      ]);

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      if (zips.length === 0) throw new Error('No zip produced');

      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));
      const unresolved = prompt.match(/\{\{\s*[A-Z0-9_]+\s*\}\}/g);
      if (unresolved) {
        throw new Error(`Unresolved placeholders in full mode: ${[...new Set(unresolved)].join(', ')}`);
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('4. docs mode: allowed paths include app/** with "(you create this)"', () => {
    const ctx = createTestWorkspace('prompt-paths-docs');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      assertContains(prompt, 'you create this', 'Docs mode allowed paths should say "you create this"');
    } finally {
      ctx.cleanup();
    }
  });

  it('5. scaffold mode: allowed paths include "extend the scaffold"', () => {
    const ctx = createTestWorkspace('prompt-paths-scaffold');
    try {
      const appDir = path.join(ctx.workspacePath, 'app');
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, 'index.ts'), '// scaffold');

      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'scaffold', '--skip-validation',
        '--app-path', appDir,
        '--output', path.join(ctx.workspacePath, 'dist'),
      ]);

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      if (zips.length === 0) throw new Error('No zip produced');
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      assertContains(prompt, 'extend the scaffold', 'Scaffold mode allowed paths should say "extend the scaffold"');
    } finally {
      ctx.cleanup();
    }
  });

  it('6. forbidden paths include all protected directories', () => {
    const ctx = createTestWorkspace('prompt-forbidden-paths');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      const requiredForbidden = ['docs/**', 'domains/**', 'registry/**', 'knowledge/**', 'config/**', 'AGENT_PROMPT.md'];
      for (const forbidden of requiredForbidden) {
        assertContains(prompt, forbidden, `Forbidden paths should include "${forbidden}"`);
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('7. verification commands table includes all 6 required gates', () => {
    const ctx = createTestWorkspace('prompt-verification-gates');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      const requiredRows = ['| Install |', '| Typecheck |', '| Lint |', '| Unit Tests |', '| Build |', '| Smoke Test |'];
      for (const row of requiredRows) {
        assertContains(prompt, row, `Verification table should include row "${row}"`);
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('8. required sections exist in correct order', () => {
    const ctx = createTestWorkspace('prompt-section-order');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      const orderedSections = [
        '## Operating Contract',
        '### File Sandboxing',
        '### Contract Locks',
        '## Verification Gates',
        '## Drift Report',
        '## Output Discipline',
      ];

      let lastIdx = -1;
      for (const section of orderedSections) {
        const idx = prompt.indexOf(section);
        if (idx === -1) {
          throw new Error(`Required section "${section}" not found in prompt`);
        }
        if (idx <= lastIdx) {
          throw new Error(`Section "${section}" is out of order — expected after index ${lastIdx}, found at ${idx}`);
        }
        lastIdx = idx;
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('9. contract locks section includes stop-and-ask protocol with "Stopping here"', () => {
    const ctx = createTestWorkspace('prompt-contract-locks');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      assertContains(prompt, 'Stopping here. No code changes made.', 'Contract locks should include stop-and-ask protocol');
      assertContains(prompt, 'State which contract type', 'Should require stating contract type');
      assertContains(prompt, 'exact diff plan', 'Should require exact diff plan');
      assertContains(prompt, 'Cite the doc and section', 'Should require doc citation');
    } finally {
      ctx.cleanup();
    }
  });

  it('10. drift report template has all 6 required subsections', () => {
    const ctx = createTestWorkspace('prompt-drift-report');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      const requiredDriftSections = [
        '### Touched Files',
        '### Contracts Changed',
        '### New Dependencies Added',
        '### Verification Results',
        '### Acceptance Checks',
        '### Known Risks / Open Items',
      ];
      for (const section of requiredDriftSections) {
        assertContains(prompt, section, `Drift report should include "${section}"`);
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('11. prompt output is stable across repeated runs (normalized)', () => {
    const ctx = createTestWorkspace('prompt-stability');
    try {
      const run = () => {
        const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
          '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
        ]);
        assertExitCode(result, 0, 'Packaging should succeed');
        const distDir = path.join(ctx.workspacePath, 'dist');
        const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip')).sort();
        const prompt = extractAgentPromptFromZip(path.join(distDir, zips[zips.length - 1]));
        return normalize(prompt);
      };

      const run1 = run();
      const run2 = run();

      if (run1 !== run2) {
        const lines1 = run1.split('\n');
        const lines2 = run2.split('\n');
        for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
          if (lines1[i] !== lines2[i]) {
            throw new Error(`Output differs at line ${i + 1}:\n  Run1: ${lines1[i]}\n  Run2: ${lines2[i]}`);
          }
        }
        throw new Error('Outputs differ (could not identify specific line)');
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('12. allowed paths have minimum required line count (>= 3)', () => {
    const ctx = createTestWorkspace('prompt-allowed-min');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      const allowedMatch = prompt.match(/\*\*Allowed edit paths:\*\*\n([\s\S]*?)(?=\n\*\*Forbidden)/);
      if (!allowedMatch) throw new Error('Allowed paths block not found');
      const lineCount = allowedMatch[1].trim().split('\n').filter((l: string) => l.trim().length > 0).length;
      if (lineCount < 3) throw new Error(`Allowed paths has only ${lineCount} lines, expected >= 3`);
    } finally {
      ctx.cleanup();
    }
  });

  it('13. forbidden paths have minimum required line count (>= 5)', () => {
    const ctx = createTestWorkspace('prompt-forbidden-min');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-package', [
        '--mode', 'docs', '--skip-validation', '--output', path.join(ctx.workspacePath, 'dist'),
      ]);
      assertExitCode(result, 0, 'Packaging should succeed');

      const distDir = path.join(ctx.workspacePath, 'dist');
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
      const prompt = extractAgentPromptFromZip(path.join(distDir, zips[0]));

      const forbiddenMatch = prompt.match(/\*\*Forbidden paths \(do not modify\):\*\*\n([\s\S]*?)(?=\nIf you need to edit)/);
      if (!forbiddenMatch) throw new Error('Forbidden paths block not found');
      const lineCount = forbiddenMatch[1].trim().split('\n').filter((l: string) => l.trim().length > 0).length;
      if (lineCount < 5) throw new Error(`Forbidden paths has only ${lineCount} lines, expected >= 5`);
    } finally {
      ctx.cleanup();
    }
  });
});
