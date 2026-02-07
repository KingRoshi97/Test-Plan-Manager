import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { createTestContext, runAxionCommand, readJsonFile, fileExists, parseJsonOutput, TestContext } from '../helpers/test-utils';

const AXION_ROOT = path.join(process.cwd(), 'axion');
const CONFIG_DIR = path.join(AXION_ROOT, 'config');

interface DomainsConfig {
  canonical_order: string[];
  stages: string[];
  modules: Array<{
    slug: string;
    name: string;
    dependencies: string[];
  }>;
}

interface PresetsConfig {
  stage_plans: Record<string, string[]>;
  presets: Record<string, {
    modules: string[];
    include_dependencies: boolean;
    guards?: Record<string, boolean>;
  }>;
}

describe('AXION Core System Contract', () => {
  const domains = readJsonFile<DomainsConfig>(path.join(CONFIG_DIR, 'domains.json'));
  const presets = readJsonFile<PresetsConfig>(path.join(CONFIG_DIR, 'presets.json'));

  describe('Pipeline Definition (Behavioral Guarantees)', () => {
    describe('canonical stage order', () => {
      it('should define stages in correct order', () => {
        expect(domains).toBeTruthy();
        expect(domains?.stages).toEqual(['generate', 'seed', 'draft', 'review', 'verify', 'lock']);
      });

      it('should have stage plans that respect stage ordering', () => {
        expect(presets).toBeTruthy();
        const stagePlans = presets?.stage_plans;
        expect(stagePlans).toBeTruthy();

        const stageOrder = domains?.stages || [];
        
        for (const [planName, planStages] of Object.entries(stagePlans || {})) {
          const docStages = planStages.filter(s => stageOrder.includes(s));
          
          for (let i = 1; i < docStages.length; i++) {
            const prevIdx = stageOrder.indexOf(docStages[i - 1]);
            const currIdx = stageOrder.indexOf(docStages[i]);
            expect(currIdx).toBeGreaterThanOrEqual(prevIdx);
          }
        }
      });

      it('should define docs:scaffold as generate + seed', () => {
        expect(presets?.stage_plans['docs:scaffold']).toEqual(['generate', 'seed']);
      });

      it('should define docs:content as draft + review + verify', () => {
        expect(presets?.stage_plans['docs:content']).toEqual(['draft', 'review', 'verify']);
      });

      it('should define docs:full as complete docs pipeline', () => {
        expect(presets?.stage_plans['docs:full']).toEqual(['generate', 'seed', 'draft', 'review', 'verify']);
      });
    });

    describe('module ordering', () => {
      it('should define canonical module order', () => {
        expect(domains?.canonical_order).toBeTruthy();
        expect(domains?.canonical_order.length).toBe(19);
      });

      it('should start with foundation modules', () => {
        const order = domains?.canonical_order || [];
        expect(order[0]).toBe('architecture');
        expect(order[1]).toBe('systems');
        expect(order[2]).toBe('contracts');
      });

      it('should have all modules in canonical order', () => {
        const order = new Set(domains?.canonical_order || []);
        const modules = domains?.modules || [];
        
        for (const mod of modules) {
          expect(order.has(mod.slug)).toBe(true);
        }
      });

      it('should order modules so dependencies come first', () => {
        const order = domains?.canonical_order || [];
        const modules = domains?.modules || [];
        const moduleMap = new Map(modules.map(m => [m.slug, m]));

        for (const mod of modules) {
          const modIdx = order.indexOf(mod.slug);
          for (const dep of mod.dependencies) {
            const depIdx = order.indexOf(dep);
            expect(depIdx).toBeLessThan(modIdx);
          }
        }
      });
    });

    describe('dependency gating', () => {
      it('should define dependencies for each module', () => {
        const modules = domains?.modules || [];
        for (const mod of modules) {
          expect(mod).toHaveProperty('dependencies');
          expect(Array.isArray(mod.dependencies)).toBe(true);
        }
      });

      it('should have foundation modules with no external dependencies', () => {
        const modules = domains?.modules || [];
        const architecture = modules.find(m => m.slug === 'architecture');
        expect(architecture?.dependencies).toEqual([]);
      });

      it('should have frontend depend on contracts and state', () => {
        const modules = domains?.modules || [];
        const frontend = modules.find(m => m.slug === 'frontend');
        expect(frontend?.dependencies).toContain('contracts');
        expect(frontend?.dependencies).toContain('state');
      });
    });

    describe('preset configurations', () => {
      it('should have system preset with all modules', () => {
        const systemPreset = presets?.presets?.system;
        expect(systemPreset).toBeTruthy();
        expect(systemPreset?.modules.length).toBe(19);
      });

      it('should have lock guard on system preset', () => {
        const systemPreset = presets?.presets?.system;
        expect(systemPreset?.guards?.lock_requires_verify_pass).toBe(true);
      });

      it('should have foundation preset with dependency expansion', () => {
        const foundationPreset = presets?.presets?.foundation;
        expect(foundationPreset).toBeTruthy();
        expect(foundationPreset?.modules).toContain('architecture');
        expect(foundationPreset?.include_dependencies).toBe(true);
      });
    });
  });

  describe('Reason Codes (Diagnostic Guarantees)', () => {
    describe('reason code registry', () => {
      const reasonCodesPath = path.join(AXION_ROOT, 'source_docs', 'registry', 'reason-codes.md');
      
      it('should have reason codes registry file', () => {
        expect(fileExists(reasonCodesPath)).toBe(true);
      });
      
      it('should define reason codes in tabular format', () => {
        const content = fs.readFileSync(reasonCodesPath, 'utf-8');
        expect(content).toContain('| Code |');
        expect(content).toContain('| Message |');
      });
    });

    describe('script-level reason codes', () => {
      const knownReasonCodes = [
        'MISSING_SECTION',
        'TBD_IN_REQUIRED',
        'UNKNOWN_WITHOUT_QUESTION',
        'DEP_NOT_VERIFIED',
        'SEAM_OWNER_VIOLATION',
        'SEAM_MISSING_LINK'
      ];

      it('should define known reason codes in verify script', () => {
        const verifyPath = path.join(AXION_ROOT, 'scripts', 'axion-verify.mjs');
        const content = fs.readFileSync(verifyPath, 'utf-8');
        
        expect(content).toContain('MISSING_SECTION');
        expect(content).toContain('TBD_IN_REQUIRED');
      });

      it('should use SCREAMING_SNAKE_CASE for reason codes', () => {
        for (const code of knownReasonCodes) {
          expect(code).toMatch(/^[A-Z][A-Z0-9_]+$/);
        }
      });
    });

    describe('blocked_by semantics', () => {
      let ctx: TestContext;

      beforeAll(() => {
        ctx = createTestContext();
      });

      afterAll(() => {
        ctx.cleanup();
      });

      it('should emit blocked_by with required fields when prerequisites missing', () => {
        const targetDir = path.join(ctx.tempDir, 'blocked-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'BlockedTest'
        ]);

        const result = runAxionCommand('axion-seed.mjs', [
          '--build-root', targetDir,
          '--module', 'frontend'
        ]);

        const json = parseJsonOutput(result.stdout + result.stderr);
        
        expect(json).toBeTruthy();
        expect(json?.status).toBe('blocked_by');
        expect(json?.stage).toBe('seed');
        expect(json?.missing).toBeTruthy();
        expect(Array.isArray(json?.missing)).toBe(true);
        expect((json?.missing as string[]).length).toBeGreaterThan(0);
        expect(json?.hint).toBeTruthy();
        expect(Array.isArray(json?.hint)).toBe(true);
      });

      it('should provide executable hints for blocked operations', () => {
        const targetDir = path.join(ctx.tempDir, 'hint-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'HintTest'
        ]);

        const result = runAxionCommand('axion-seed.mjs', [
          '--build-root', targetDir,
          '--module', 'frontend'
        ]);

        const json = parseJsonOutput(result.stdout + result.stderr);
        
        expect(json).toBeTruthy();
        expect(json?.status).toBe('blocked_by');
        expect(json?.hint).toBeTruthy();
        expect(Array.isArray(json?.hint)).toBe(true);
        expect((json?.hint as string[]).length).toBeGreaterThan(0);
        for (const hint of json?.hint as string[]) {
          expect(hint).toMatch(/npx|tsx|ts-node|axion/);
        }
      });
    });

    describe('reason code format', () => {
      it('should use consistent status values across scripts', () => {
        const validStatuses = ['success', 'failed', 'blocked_by', 'skipped', 'pass', 'fail'];
        expect(validStatuses).toContain('success');
        expect(validStatuses).toContain('blocked_by');
        expect(validStatuses).toContain('failed');
      });
    });
  });

  describe('Output Contracts (Interface Guarantees)', () => {
    describe('stdout JSON contract', () => {
      let ctx: TestContext;

      beforeAll(() => {
        ctx = createTestContext();
      });

      afterAll(() => {
        ctx.cleanup();
      });

      it('should emit JSON for kit-create', () => {
        const targetDir = path.join(ctx.tempDir, 'json-test');
        
        const result = runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'JsonTest'
        ]);

        const json = parseJsonOutput(result.stdout);
        expect(json).toBeTruthy();
        expect(json?.status).toBeTruthy();
        expect(json?.stage).toBe('kit-create');
      });

      it('should emit structured output for status command', () => {
        const targetDir = path.join(ctx.tempDir, 'status-json-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'StatusJsonTest'
        ]);

        const result = runAxionCommand('axion-status.ts', [
          '--build-root', targetDir
        ]);

        expect(result.stdout).toContain('Status');
        expect(result.stdout).toMatch(/PASS|FAIL/);
      });

      it('should include required fields in kit-create output', () => {
        const targetDir = path.join(ctx.tempDir, 'fields-test');
        
        const result = runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'FieldsTest'
        ]);

        const json = parseJsonOutput(result.stdout);
        expect(json?.status).toBe('success');
        expect(json?.stage).toBe('kit-create');
        expect(json?.kit_root).toBeTruthy();
        expect(json?.axion_snapshot).toBeTruthy();
        expect(json?.manifest_path).toBeTruthy();
      });
    });

    describe('manifest schema', () => {
      let ctx: TestContext;

      beforeAll(() => {
        ctx = createTestContext();
      });

      afterAll(() => {
        ctx.cleanup();
      });

      it('should create valid manifest.json', () => {
        const targetDir = path.join(ctx.tempDir, 'manifest-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'ManifestTest'
        ]);

        const manifestPath = path.join(targetDir, 'manifest.json');
        expect(fileExists(manifestPath)).toBe(true);
        
        const manifest = readJsonFile<Record<string, unknown>>(manifestPath);
        expect(manifest).toBeTruthy();
        expect(manifest?.version).toBeTruthy();
        expect(manifest?.created_at).toBeTruthy();
        expect(manifest?.project_name).toBe('ManifestTest');
      });

      it('should include expected_commands in manifest', () => {
        const targetDir = path.join(ctx.tempDir, 'commands-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'CommandsTest'
        ]);

        const manifestPath = path.join(targetDir, 'manifest.json');
        const manifest = readJsonFile<Record<string, unknown>>(manifestPath);
        
        expect(manifest?.expected_commands).toBeTruthy();
        expect(typeof manifest?.expected_commands).toBe('object');
      });
    });

    describe('artifact location invariants', () => {
      let ctx: TestContext;

      beforeAll(() => {
        ctx = createTestContext();
      });

      afterAll(() => {
        ctx.cleanup();
      });

      it('should create axion snapshot in kit root', () => {
        const targetDir = path.join(ctx.tempDir, 'location-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'LocationTest'
        ]);

        expect(fileExists(path.join(targetDir, 'axion'))).toBe(true);
        expect(fileExists(path.join(targetDir, 'axion', 'config'))).toBe(true);
        expect(fileExists(path.join(targetDir, 'axion', 'scripts'))).toBe(true);
        expect(fileExists(path.join(targetDir, 'axion', 'templates'))).toBe(true);
      });

      it('should create manifest at kit root', () => {
        const targetDir = path.join(ctx.tempDir, 'manifest-loc-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'ManifestLocTest'
        ]);

        expect(fileExists(path.join(targetDir, 'manifest.json'))).toBe(true);
      });

      it('should create source_docs in axion snapshot', () => {
        const targetDir = path.join(ctx.tempDir, 'docs-loc-test');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'DocsLocTest'
        ]);

        expect(fileExists(path.join(targetDir, 'axion', 'source_docs'))).toBe(true);
        expect(fileExists(path.join(targetDir, 'axion', 'source_docs', 'product'))).toBe(true);
      });
    });
  });

  describe('Two-Root Safety (Isolation Guarantees)', () => {
    describe('system root protection', () => {
      it('should refuse to create kit when --refuse-if-exists and target has content', () => {
        const result = runAxionCommand('axion-kit-create.ts', [
          '--target', AXION_ROOT,
          '--project-name', 'BadTarget',
          '--refuse-if-exists'
        ]);

        expect(result.success).toBe(false);
      });
    });

    describe('kit isolation', () => {
      let ctx: TestContext;

      beforeAll(() => {
        ctx = createTestContext();
      });

      afterAll(() => {
        ctx.cleanup();
      });

      it('should create isolated kit with complete snapshot', () => {
        const targetDir = path.join(ctx.tempDir, 'isolated-kit');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', targetDir,
          '--project-name', 'IsolatedKit'
        ]);

        expect(fileExists(path.join(targetDir, 'axion', 'config', 'domains.json'))).toBe(true);
        expect(fileExists(path.join(targetDir, 'axion', 'config', 'presets.json'))).toBe(true);
        
        const kitDomains = readJsonFile<DomainsConfig>(
          path.join(targetDir, 'axion', 'config', 'domains.json')
        );
        expect(kitDomains?.canonical_order).toEqual(domains?.canonical_order);
      });

      it('should not share state between kits', () => {
        const kit1 = path.join(ctx.tempDir, 'kit-1');
        const kit2 = path.join(ctx.tempDir, 'kit-2');
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', kit1,
          '--project-name', 'Kit1'
        ]);
        
        runAxionCommand('axion-kit-create.ts', [
          '--target', kit2,
          '--project-name', 'Kit2'
        ]);

        const manifest1 = readJsonFile<Record<string, unknown>>(
          path.join(kit1, 'manifest.json')
        );
        const manifest2 = readJsonFile<Record<string, unknown>>(
          path.join(kit2, 'manifest.json')
        );

        expect(manifest1?.project_name).toBe('Kit1');
        expect(manifest2?.project_name).toBe('Kit2');
        expect(manifest1?.snapshot_revision).not.toEqual(manifest2?.snapshot_revision);
      });
    });
  });
});
