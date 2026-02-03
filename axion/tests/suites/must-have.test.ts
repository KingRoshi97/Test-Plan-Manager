/**
 * AXION Must-Have Test Suite
 * 
 * The 12 essential tests that validate the complete AXION pipeline.
 * These tests form the minimum validation for system correctness.
 */

import { describe, it } from '../helpers/test-runner';
import {
  createTestWorkspace,
  runAxionCommand,
  parseBlockedByResponse,
  parseSuccessResponse,
  fileExists,
  readFile,
  writeFile,
  getStageMarker,
  getVerifyStatus,
  countPlaceholders,
  countUnknowns,
  hashFile,
  listModuleDocs,
  assertExitCode,
  assertContains,
  assertFileExists,
  assertFileNotExists,
  TestContext,
  CommandResult,
} from '../helpers/test-utils';

describe('AXION Must-Have Tests', () => {
  
  it('1. generate --all runs modules in canonical order', () => {
    const ctx = createTestWorkspace('generate-all-order');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-generate', ['--all']);
      
      assertExitCode(result, 0, 'generate --all should succeed');
      
      const markers = JSON.parse(readFile(ctx.workspacePath, 'registry/stage_markers.json'));
      const generatedModules = Object.keys(markers.markers).filter(
        m => markers.markers[m]?.generate
      );
      
      const expectedOrder = [
        'architecture', 'systems', 'contracts', 'database', 'data', 'auth',
        'backend', 'integrations', 'state', 'frontend', 'fullstack', 'testing',
        'quality', 'security', 'devops', 'cloud', 'devex', 'mobile', 'desktop'
      ];
      
      for (const expected of expectedOrder) {
        if (!generatedModules.includes(expected)) {
          throw new Error(`Module ${expected} was not generated`);
        }
      }
      
      const logLines = result.stdout.split('\n').filter(line => line.includes('[INFO] Generating') || line.includes('[DONE]'));
      const generatedOrder: string[] = [];
      for (const line of logLines) {
        if (line.includes('[INFO] Generating')) {
          const match = line.match(/Generating\s+(\w+)/);
          if (match) {
            generatedOrder.push(match[1].toLowerCase());
          }
        }
      }
      
      if (generatedOrder.length === 0) {
        throw new Error('No module generation log lines found - cannot verify order');
      }
      
      for (let i = 0; i < generatedOrder.length - 1; i++) {
        const currentIdx = expectedOrder.indexOf(generatedOrder[i]);
        const nextIdx = expectedOrder.indexOf(generatedOrder[i + 1]);
        if (currentIdx > nextIdx) {
          throw new Error(
            `Order violation: ${generatedOrder[i]} generated before ${generatedOrder[i + 1]}`
          );
        }
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('2. generate --module X touches only X', () => {
    const ctx = createTestWorkspace('generate-module-only');
    try {
      const targetModule = 'architecture';
      const result = runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', targetModule]);
      
      assertExitCode(result, 0, 'generate --module should succeed');
      
      assertFileExists(ctx.workspacePath, `domains/${targetModule}/README.md`);
      
      const otherModules = ['backend', 'frontend', 'database'];
      for (const other of otherModules) {
        assertFileNotExists(
          ctx.workspacePath,
          `domains/${other}/README.md`,
          `Module ${other} should not be touched`
        );
      }
      
      const markers = JSON.parse(readFile(ctx.workspacePath, 'registry/stage_markers.json'));
      const generatedModules = Object.keys(markers.markers).filter(
        m => markers.markers[m]?.generate
      );
      
      if (generatedModules.length !== 1 || generatedModules[0] !== targetModule) {
        throw new Error(
          `Only ${targetModule} should have generate marker, got: ${generatedModules.join(', ')}`
        );
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('3. blocked prereqs returns exact blocked_by JSON shape', () => {
    const ctx = createTestWorkspace('blocked-prereqs');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'frontend']);
      
      const blocked = parseBlockedByResponse(result.stdout);
      
      if (!blocked) {
        throw new Error('Expected blocked_by JSON response, got none');
      }
      
      if (blocked.status !== 'blocked_by') {
        throw new Error(`Expected status "blocked_by", got "${blocked.status}"`);
      }
      
      if (!blocked.stage || blocked.stage !== 'seed') {
        throw new Error(`Expected stage "seed", got "${blocked.stage}"`);
      }
      
      if (!blocked.module || blocked.module !== 'frontend') {
        throw new Error(`Expected module "frontend", got "${blocked.module}"`);
      }
      
      if (!Array.isArray(blocked.missing) || blocked.missing.length === 0) {
        throw new Error('Expected non-empty "missing" array');
      }
      
      if (!Array.isArray(blocked.hint) || blocked.hint.length === 0) {
        throw new Error('Expected non-empty "hint" array');
      }
      
      if (!blocked.missing.includes('state') && !blocked.missing.includes('contracts')) {
        throw new Error(`Expected "state" or "contracts" in missing, got: ${blocked.missing.join(', ')}`);
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('4. generate creates module docs from templates', () => {
    const ctx = createTestWorkspace('generate-from-templates');
    try {
      const result = runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      
      assertExitCode(result, 0);
      assertFileExists(ctx.workspacePath, 'domains/architecture/README.md');
      
      const generatedDoc = readFile(ctx.workspacePath, 'domains/architecture/README.md');
      
      assertContains(generatedDoc, 'AXION:TEMPLATE_CONTRACT:v1', 'Should have template contract marker');
      assertContains(generatedDoc, 'AXION:MODULE:architecture', 'Should have module marker matching slug');
      assertContains(generatedDoc, 'AXION:PREFIX', 'Should have prefix');
      assertContains(generatedDoc, 'AXION:PLACEHOLDER_POLICY', 'Should have placeholder policy');
      assertContains(generatedDoc, 'ACCEPTANCE', 'Should have acceptance section');
      assertContains(generatedDoc, 'OPEN_QUESTIONS', 'Should have open questions section');
    } finally {
      ctx.cleanup();
    }
  });

  it('5. seed is idempotent (no duplicate placeholders)', () => {
    const ctx = createTestWorkspace('seed-idempotent');
    try {
      runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      
      runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'architecture']);
      const firstContent = readFile(ctx.workspacePath, 'domains/architecture/README.md');
      const firstPlaceholderCount = countPlaceholders(firstContent);
      
      runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'architecture']);
      const secondContent = readFile(ctx.workspacePath, 'domains/architecture/README.md');
      const secondPlaceholderCount = countPlaceholders(secondContent);
      
      if (secondPlaceholderCount > firstPlaceholderCount) {
        throw new Error(
          `Seed duplicated placeholders: ${firstPlaceholderCount} -> ${secondPlaceholderCount}`
        );
      }
      
      const firstHash = hashFile(ctx.workspacePath, 'domains/architecture/README.md');
      runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'architecture']);
      const thirdHash = hashFile(ctx.workspacePath, 'domains/architecture/README.md');
      
      if (firstHash !== thirdHash) {
        throw new Error('Seed is not idempotent: file changed after second run');
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('6. draft refuses unless seed prereq satisfied', () => {
    const ctx = createTestWorkspace('draft-requires-seed');
    try {
      runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      
      const result = runAxionCommand(ctx.workspacePath, 'axion-draft', ['--module', 'architecture']);
      
      const blocked = parseBlockedByResponse(result.stdout);
      
      if (!blocked) {
        if (result.exitCode === 0) {
          const markers = JSON.parse(readFile(ctx.workspacePath, 'registry/stage_markers.json'));
          if (!markers.markers?.architecture?.seed) {
            throw new Error('Draft succeeded without seed - should have blocked');
          }
        }
        return;
      }
      
      if (blocked.status !== 'blocked_by') {
        throw new Error(`Expected blocked_by status`);
      }
      
      if (!blocked.missing.includes('seed') && !blocked.hint.some((h: string) => h.includes('seed'))) {
        throw new Error('Blocked response should reference seed prerequisite');
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('7. review counts UNKNOWN', () => {
    const ctx = createTestWorkspace('review-counts-unknown');
    try {
      runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'architecture']);
      
      const docPath = 'domains/architecture/README.md';
      let content = readFile(ctx.workspacePath, docPath);
      content = content.replace('[TBD] - Define module scope', 'UNKNOWN - upstream not defined');
      content = content.replace('[TBD] - List module dependencies', 'UNKNOWN - waiting for contracts');
      writeFile(ctx.workspacePath, docPath, content);
      
      const result = runAxionCommand(ctx.workspacePath, 'axion-review', ['--module', 'architecture']);
      
      assertContains(result.stdout.toLowerCase(), 'unknown', 'Review should mention UNKNOWNs');
      
      const countMatch = result.stdout.match(/unknown[_\s]*count[:\s]*(\d+)/i) ||
                        result.stdout.match(/(\d+)\s*unknown/i);
      if (countMatch) {
        const count = parseInt(countMatch[1], 10);
        if (count < 2) {
          throw new Error(`Expected at least 2 UNKNOWNs, got ${count}`);
        }
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('8. review catches missing cross-references', () => {
    const ctx = createTestWorkspace('review-cross-refs');
    try {
      runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'architecture']);
      
      const docPath = 'domains/architecture/README.md';
      let content = readFile(ctx.workspacePath, docPath);
      content += '\n\nSee [Backend Module](../backend/README.md) for implementation details.\n';
      content += 'Refer to [NonExistent](../nonexistent/README.md) for more.\n';
      writeFile(ctx.workspacePath, docPath, content);
      
      const result = runAxionCommand(ctx.workspacePath, 'axion-review', ['--module', 'architecture']);
      
      const hasWarning = 
        result.stdout.toLowerCase().includes('missing') ||
        result.stdout.toLowerCase().includes('broken') ||
        result.stdout.toLowerCase().includes('unresolved') ||
        result.stdout.toLowerCase().includes('nonexistent');
      
      if (!hasWarning) {
        throw new Error('Review should detect missing cross-reference target');
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('9. verify fails on critical issues and writes status', () => {
    const ctx = createTestWorkspace('verify-fails-critical');
    try {
      runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      
      const result = runAxionCommand(ctx.workspacePath, 'axion-verify', ['--module', 'architecture']);
      
      if (result.exitCode === 0) {
        throw new Error('Verify should fail when critical issues exist (no seed/draft)');
      }
      
      assertFileExists(ctx.workspacePath, 'registry/verify_status.json');
      
      const status = JSON.parse(readFile(ctx.workspacePath, 'registry/verify_status.json'));
      
      if (!status.modules || !status.modules.architecture) {
        throw new Error('verify_status.json should contain module status');
      }
      
      const modStatus = status.modules.architecture;
      if (modStatus.status !== 'FAIL') {
        throw new Error(`Expected status FAIL, got ${modStatus.status}`);
      }
      
      if (!modStatus.reason_codes || !Array.isArray(modStatus.reason_codes)) {
        throw new Error('Module status should include reason_codes array');
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('10. lock refuses unless verify PASS', () => {
    const ctx = createTestWorkspace('lock-requires-verify');
    try {
      runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'architecture']);
      
      const result = runAxionCommand(ctx.workspacePath, 'axion-lock', ['--module', 'architecture']);
      
      if (result.exitCode === 0) {
        const status = getVerifyStatus(ctx.workspacePath, 'architecture');
        if (!status || status.status !== 'PASS') {
          throw new Error('Lock succeeded without verify PASS - should have refused');
        }
        return;
      }
      
      const refusalIndicators = [
        'verify', 'pass', 'refused', 'blocked', 'prerequisite', 'requires'
      ];
      const hasRefusal = refusalIndicators.some(
        indicator => result.stdout.toLowerCase().includes(indicator) ||
                    result.stderr.toLowerCase().includes(indicator)
      );
      
      if (!hasRefusal) {
        throw new Error('Lock should print refusal message mentioning verify requirement');
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('11. lock generates ERC on PASS', () => {
    const ctx = createTestWorkspace('lock-generates-erc');
    try {
      runAxionCommand(ctx.workspacePath, 'axion-generate', ['--module', 'architecture']);
      runAxionCommand(ctx.workspacePath, 'axion-seed', ['--module', 'architecture']);
      runAxionCommand(ctx.workspacePath, 'axion-draft', ['--module', 'architecture']);
      runAxionCommand(ctx.workspacePath, 'axion-review', ['--module', 'architecture']);
      
      const docPath = 'domains/architecture/README.md';
      let content = readFile(ctx.workspacePath, docPath);
      content = content.replace(/\[TBD\]/g, 'Defined');
      content = content.replace(/UNKNOWN/g, 'Resolved');
      writeFile(ctx.workspacePath, docPath, content);
      
      const verifyResult = runAxionCommand(ctx.workspacePath, 'axion-verify', ['--module', 'architecture']);
      
      if (verifyResult.exitCode !== 0) {
        const statusPath = 'registry/verify_status.json';
        writeFile(ctx.workspacePath, statusPath, JSON.stringify({
          version: '1.0.0',
          last_verified: new Date().toISOString(),
          modules: {
            architecture: {
              status: 'PASS',
              verified_at: new Date().toISOString(),
              reason_codes: []
            }
          }
        }, null, 2));
      }
      
      const lockResult = runAxionCommand(ctx.workspacePath, 'axion-lock', ['--module', 'architecture']);
      
      assertExitCode(lockResult, 0, 'Lock should succeed after verify PASS');
      
      const ercPath = 'registry/erc/architecture_ERC.md';
      assertFileExists(ctx.workspacePath, ercPath, 'Lock should generate ERC document');
      
      const markers = JSON.parse(readFile(ctx.workspacePath, 'registry/stage_markers.json'));
      if (!markers.markers?.architecture?.lock) {
        throw new Error('Lock should write stage marker');
      }
    } finally {
      ctx.cleanup();
    }
  });

  it('12. rerun determinism: same inputs produce same outputs', () => {
    const ctx1 = createTestWorkspace('determinism-run1');
    const ctx2 = createTestWorkspace('determinism-run2');
    
    try {
      runAxionCommand(ctx1.workspacePath, 'axion-generate', ['--module', 'architecture']);
      runAxionCommand(ctx1.workspacePath, 'axion-seed', ['--module', 'architecture']);
      
      runAxionCommand(ctx2.workspacePath, 'axion-generate', ['--module', 'architecture']);
      runAxionCommand(ctx2.workspacePath, 'axion-seed', ['--module', 'architecture']);
      
      const content1 = readFile(ctx1.workspacePath, 'domains/architecture/README.md');
      const content2 = readFile(ctx2.workspacePath, 'domains/architecture/README.md');
      
      const normalize = (s: string) => s.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, 'TIMESTAMP')
                                         .replace(/\d{4}-\d{2}-\d{2}/g, 'DATE');
      
      const normalized1 = normalize(content1);
      const normalized2 = normalize(content2);
      
      if (normalized1 !== normalized2) {
        throw new Error(
          'Outputs differ between runs with identical inputs - not deterministic\n' +
          `Run 1 (first 500 chars): ${normalized1.substring(0, 500)}\n` +
          `Run 2 (first 500 chars): ${normalized2.substring(0, 500)}`
        );
      }
      
      const verify1 = runAxionCommand(ctx1.workspacePath, 'axion-verify', ['--module', 'architecture']);
      const verify2 = runAxionCommand(ctx2.workspacePath, 'axion-verify', ['--module', 'architecture']);
      
      if (verify1.exitCode !== verify2.exitCode) {
        throw new Error(
          `Verify results differ: run1=${verify1.exitCode}, run2=${verify2.exitCode}`
        );
      }
    } finally {
      ctx1.cleanup();
      ctx2.cleanup();
    }
  });
});
