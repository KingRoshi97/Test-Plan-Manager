import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { createTestContext, runAxionCommand, readJsonFile, readTextFile, TestContext } from '../helpers/test-utils';

const AXION_ROOT = path.join(process.cwd(), 'axion');

describe('Knowledge Pipeline Integration', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    ctx.cleanup();
  });

  describe('knowledge resolver', () => {
    it('should resolve domain knowledge with primary and secondary files', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', ['--domain', 'backend']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.files).toBeDefined();
      expect(parsed.files.length).toBeGreaterThan(0);

      const primaries = parsed.files.filter((f: { priority: string }) => f.priority === 'primary');
      const secondaries = parsed.files.filter((f: { priority: string }) => f.priority === 'secondary');
      expect(primaries.length).toBeGreaterThan(0);
      expect(secondaries.length).toBeGreaterThan(0);

      expect(primaries[0].filename).toBe('backend-development.md');
      expect(primaries[0].excerpt.length).toBeGreaterThan(100);
    });

    it('should resolve stack knowledge with always and recommended tiers', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', ['--stack', 'default-web-saas']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.files.length).toBeGreaterThan(0);

      const always = parsed.files.filter((f: { priority: string }) => f.priority === 'stack-always');
      const recommended = parsed.files.filter((f: { priority: string }) => f.priority === 'stack-recommended');
      expect(always.length).toBeGreaterThan(0);
      expect(recommended.length).toBeGreaterThan(0);
    });

    it('should resolve stage knowledge with domain injection', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', [
        '--stage', 'content-fill', 'frontend', 'default-web-saas'
      ]);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.files.length).toBeGreaterThan(0);
      expect(parsed.summary).toContain('content-fill');
      expect(parsed.summary).toContain('frontend');
    });

    it('should return empty for unknown domain', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', ['--domain', 'nonexistent-domain']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.files).toEqual([]);
      expect(parsed.summary).toContain('No knowledge mapping');
    });

    it('should return empty for unknown stack', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', ['--stack', 'nonexistent-stack']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.files).toEqual([]);
    });
  });

  describe('INDEX.md generation', () => {
    it('should generate INDEX.md with stack-specific content', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', ['--index', 'default-web-saas']);
      expect(result.success).toBe(true);

      const index = result.stdout;
      expect(index).toContain('# Knowledge Base Index');
      expect(index).toContain('## Stack: default-web-saas');
      expect(index).toContain('### Required Reading');
      expect(index).toContain('### Recommended Reading');
      expect(index).toContain('## Per-Domain Knowledge Map');
      expect(index).toContain('## Document Type References');
      expect(index).toContain('## How to Use This Index');
    });

    it('should generate different INDEX.md for different stacks', () => {
      const webResult = runAxionCommand('lib/knowledge-resolver.ts', ['--index', 'default-web-saas']);
      const goResult = runAxionCommand('lib/knowledge-resolver.ts', ['--index', 'go-microservices']);

      expect(webResult.success).toBe(true);
      expect(goResult.success).toBe(true);

      expect(webResult.stdout).toContain('default-web-saas');
      expect(goResult.stdout).toContain('go-microservices');

      expect(goResult.stdout).toContain('systems-engineering.md');
    });

    it('should include all mapped domains in INDEX', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', ['--index', 'default-web-saas']);
      expect(result.success).toBe(true);

      const expectedDomains = ['architecture', 'backend', 'frontend', 'database', 'auth', 'testing'];
      for (const domain of expectedDomains) {
        expect(result.stdout).toContain(`| ${domain} |`);
      }
    });

    it('should include all doc type references in INDEX', () => {
      const result = runAxionCommand('lib/knowledge-resolver.ts', ['--index', 'default-web-saas']);
      expect(result.success).toBe(true);

      const expectedDocTypes = ['RPBS', 'DDES', 'BELS', 'DIM', 'SCREENMAP', 'TESTPLAN'];
      for (const docType of expectedDocTypes) {
        expect(result.stdout).toContain(`| ${docType} |`);
      }
    });
  });

  describe('knowledge-map.json integrity', () => {
    it('should be valid JSON with all required sections', () => {
      const mapPath = path.join(AXION_ROOT, 'config', 'knowledge-map.json');
      const map = readJsonFile<Record<string, unknown>>(mapPath);

      expect(map).toBeTruthy();
      expect(map).toHaveProperty('domain_knowledge');
      expect(map).toHaveProperty('stack_knowledge');
      expect(map).toHaveProperty('stage_knowledge');
      expect(map).toHaveProperty('doc_type_knowledge');
    });

    it('should reference only files that exist in knowledge directory', () => {
      const mapPath = path.join(AXION_ROOT, 'config', 'knowledge-map.json');
      const map = readJsonFile<Record<string, Record<string, unknown>>>(mapPath);
      const knowledgeDir = path.join(AXION_ROOT, 'knowledge');

      expect(map).toBeTruthy();
      if (!map) return;

      const allReferencedFiles = new Set<string>();

      const domainKnowledge = map.domain_knowledge as Record<string, { primary: string[]; secondary: string[] }>;
      for (const domain of Object.values(domainKnowledge)) {
        for (const f of [...domain.primary, ...domain.secondary]) {
          allReferencedFiles.add(f);
        }
      }

      const stackKnowledge = map.stack_knowledge as Record<string, { always: string[]; recommended: string[]; optional: string[] }>;
      for (const stack of Object.values(stackKnowledge)) {
        for (const f of [...stack.always, ...stack.recommended, ...stack.optional]) {
          allReferencedFiles.add(f);
        }
      }

      const stageKnowledge = map.stage_knowledge as Record<string, { inject?: string[]; inject_global?: string[] }>;
      for (const stage of Object.values(stageKnowledge)) {
        if (stage.inject) {
          for (const f of stage.inject) allReferencedFiles.add(f);
        }
        if (stage.inject_global) {
          for (const f of stage.inject_global) allReferencedFiles.add(f);
        }
      }

      const docTypeKnowledge = map.doc_type_knowledge as Record<string, string[]>;
      for (const files of Object.values(docTypeKnowledge)) {
        for (const f of files) allReferencedFiles.add(f);
      }

      for (const file of allReferencedFiles) {
        expect(fs.existsSync(path.join(knowledgeDir, file)),
          `Referenced knowledge file missing: ${file}`
        ).toBe(true);
      }
    });

    it('should have all knowledge files mapped somewhere', () => {
      const mapPath = path.join(AXION_ROOT, 'config', 'knowledge-map.json');
      const map = readJsonFile<Record<string, Record<string, unknown>>>(mapPath);
      const knowledgeDir = path.join(AXION_ROOT, 'knowledge');

      expect(map).toBeTruthy();
      if (!map) return;

      const actualFiles = fs.readdirSync(knowledgeDir)
        .filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'INDEX.md');

      const allReferencedFiles = new Set<string>();
      const domainKnowledge = map.domain_knowledge as Record<string, { primary: string[]; secondary: string[] }>;
      for (const domain of Object.values(domainKnowledge)) {
        for (const f of [...domain.primary, ...domain.secondary]) allReferencedFiles.add(f);
      }
      const stackKnowledge = map.stack_knowledge as Record<string, { always: string[]; recommended: string[]; optional: string[] }>;
      for (const stack of Object.values(stackKnowledge)) {
        for (const f of [...stack.always, ...stack.recommended, ...stack.optional]) allReferencedFiles.add(f);
      }
      const stageKnowledge = map.stage_knowledge as Record<string, { inject?: string[]; inject_global?: string[] }>;
      for (const stage of Object.values(stageKnowledge)) {
        if (stage.inject) for (const f of stage.inject) allReferencedFiles.add(f);
        if (stage.inject_global) for (const f of stage.inject_global) allReferencedFiles.add(f);
      }
      const docTypeKnowledge = map.doc_type_knowledge as Record<string, string[]>;
      for (const files of Object.values(docTypeKnowledge)) {
        for (const f of files) allReferencedFiles.add(f);
      }

      for (const file of actualFiles) {
        expect(allReferencedFiles.has(file),
          `Knowledge file not mapped anywhere: ${file}`
        ).toBe(true);
      }
    });
  });

  describe('template validation guardrail', () => {
    it('should run template validation and produce structured output', () => {
      const result = runAxionCommand('axion-validate-templates.ts', ['--json']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.stage).toBe('validate-templates');
      expect(parsed.checks).toBeDefined();
      expect(parsed.checks.duplicate_anchors).toBeDefined();
      expect(parsed.checks.orphaned_anchors).toBeDefined();
      expect(parsed.checks.unknown_placeholders).toBeDefined();
      expect(parsed.checks.missing_doc_types).toBeDefined();
    });

    it('should detect no duplicate anchors in clean templates', () => {
      const result = runAxionCommand('axion-validate-templates.ts', ['--json']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.checks.duplicate_anchors.status).toBe('PASS');
    });
  });

  describe('knowledge coverage analysis', () => {
    it('should run coverage analysis and report full coverage', () => {
      const result = runAxionCommand('axion-knowledge-coverage.ts', ['--json']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.stage).toBe('knowledge-coverage');
      expect(parsed.total_knowledge_files).toBeGreaterThan(0);
      expect(parsed.coverage_pct).toBeGreaterThan(90);
      expect(parsed.checks.dead_references.status).toBe('PASS');
    });

    it('should validate stack-specific coverage', () => {
      const result = runAxionCommand('axion-knowledge-coverage.ts', ['--stack', 'default-web-saas', '--json']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.checks.stack_coverage).toBeDefined();
      expect(parsed.checks.stack_coverage.stack_id).toBe('default-web-saas');
    });

    it('should handle unknown stack gracefully', () => {
      const result = runAxionCommand('axion-knowledge-coverage.ts', ['--stack', 'nonexistent', '--json']);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.checks.stack_coverage).toBeDefined();
      expect(parsed.checks.stack_coverage.status).not.toBe('PASS');
    });
  });

  describe('kit preview / dry-run', () => {
    it('should produce a preview without creating files', () => {
      const result = runAxionCommand('axion-kit-preview.ts', ['--json']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.stage).toBe('kit-preview');
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.total_files).toBeGreaterThan(0);
      expect(parsed.stats.domain_count).toBeGreaterThan(0);
      expect(parsed.stats.knowledge_files).toBeGreaterThan(0);
      expect(parsed.domains).toBeDefined();
      expect(parsed.knowledge_index_preview).toBeDefined();
      expect(parsed.knowledge_index_preview.length).toBeGreaterThan(0);
    });

    it('should report domain completeness', () => {
      const result = runAxionCommand('axion-kit-preview.ts', ['--json']);
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.stdout);
      for (const domain of parsed.domains) {
        expect(domain.name).toBeTruthy();
        expect(domain.docs_present).toBeDefined();
        expect(typeof domain.completeness_pct).toBe('number');
      }
    });
  });

  describe('kit integrity validation', () => {
    it('should validate kit structure and produce structured output', () => {
      const result = runAxionCommand('axion-kit-validate.ts', ['--kit', AXION_ROOT, '--json']);

      const output = result.success ? result.stdout : result.stdout || result.stderr;
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      expect(jsonMatch).toBeTruthy();

      const parsed = JSON.parse(jsonMatch![0]);
      expect(parsed.stage).toBe('kit-validate');
      expect(parsed.checks).toBeDefined();
      expect(parsed.checks.required_structure).toBeDefined();
      expect(parsed.checks.domain_completeness).toBeDefined();
      expect(parsed.checks.cross_references).toBeDefined();
      expect(parsed.checks.knowledge_index).toBeDefined();
    });

    it('should detect missing kit directory', () => {
      const result = runAxionCommand('axion-kit-validate.ts', [
        '--kit', '/tmp/nonexistent-kit-dir',
        '--json'
      ]);

      const output = result.stdout || result.stderr;
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      expect(jsonMatch).toBeTruthy();

      const parsed = JSON.parse(jsonMatch![0]);
      expect(parsed.status).toBe('FAIL');
    });
  });

  describe('AGENT_PROMPT template knowledge section', () => {
    it('should include knowledge base section in AGENT_PROMPT template', () => {
      const templatePath = path.join(AXION_ROOT, 'templates', 'AGENT_PROMPT.template.md');
      const content = readTextFile(templatePath);

      expect(content).toBeTruthy();
      expect(content).toContain('### Knowledge Base (Best Practice References)');
      expect(content).toContain('INDEX.md');
      expect(content).toContain('knowledge/');
    });

    it('should include knowledge directory in kit structure diagram', () => {
      const templatePath = path.join(AXION_ROOT, 'templates', 'AGENT_PROMPT.template.md');
      const content = readTextFile(templatePath);

      expect(content).toBeTruthy();
      expect(content).toContain('├── knowledge/');
      expect(content).toContain('│   ├── INDEX.md');
    });
  });
});
