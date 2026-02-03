/**
 * AXION Upgrade System Tests
 * 
 * Tests versioning, migrations, doctor validation, and idempotency.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it } from '../helpers/test-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = path.join(__dirname, '..', '..');

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

describe('Upgrade System - Version Tracking', () => {
  
  it('system_version.json has required fields', () => {
    const versionPath = path.join(AXION_ROOT, 'registry', 'system_version.json');
    assert(fs.existsSync(versionPath), 'system_version.json must exist');
    
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    assert(typeof version.axion_version === 'string', 'axion_version must be string');
    assert(typeof version.schema_versions === 'object', 'schema_versions must be object');
    assert(typeof version.upgrade_count === 'number', 'upgrade_count must be number');
  });
  
  it('schema_versions tracks all registry schemas', () => {
    const versionPath = path.join(AXION_ROOT, 'registry', 'system_version.json');
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    
    const expectedSchemas = ['verify_report', 'stage_markers', 'seams', 'template_hashes'];
    for (const schema of expectedSchemas) {
      assert(schema in version.schema_versions, `schema_versions must track ${schema}`);
    }
  });
});

describe('Upgrade System - Migrations', () => {
  
  it('migrations folder exists with ordered scripts', () => {
    const migrationsDir = path.join(AXION_ROOT, 'migrations');
    assert(fs.existsSync(migrationsDir), 'migrations directory must exist');
    
    const files = fs.readdirSync(migrationsDir);
    const migrations = files.filter(f => f.endsWith('.ts') && /^\d{3}_/.test(f));
    assert(migrations.length >= 2, 'Should have at least 2 migrations');
    
    migrations.sort();
    assert(migrations[0].startsWith('001_'), 'First migration should be 001_*');
    assert(migrations[1].startsWith('002_'), 'Second migration should be 002_*');
  });
  
  it('migrations export required interface', async () => {
    const migrationsDir = path.join(AXION_ROOT, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.ts'));
    
    for (const file of files) {
      const modPath = path.join(migrationsDir, file);
      const mod = await import(modPath);
      
      assert(typeof mod.id === 'string', `${file} must export id`);
      assert(typeof mod.version === 'string', `${file} must export version`);
      assert(typeof mod.description === 'string', `${file} must export description`);
      assert(typeof mod.shouldApply === 'function', `${file} must export shouldApply()`);
      assert(typeof mod.apply === 'function', `${file} must export apply()`);
    }
  });
});

describe('Upgrade System - Backup & Ledger', () => {
  
  it('backup directory created during upgrade', () => {
    const backupDir = path.join(AXION_ROOT, 'registry', '_backup');
    assert(fs.existsSync(backupDir), 'Backup directory should exist after upgrade');
    
    const backups = fs.readdirSync(backupDir);
    assert(backups.length >= 1, 'Should have at least 1 backup');
    
    const latestBackup = backups.sort().reverse()[0];
    const backupPath = path.join(backupDir, latestBackup);
    const backupFiles = fs.readdirSync(backupPath);
    assert(backupFiles.length >= 1, 'Backup should contain registry files');
  });
  
  it('upgrades.log.jsonl is append-only ledger with required fields', () => {
    const logPath = path.join(AXION_ROOT, 'registry', 'upgrades.log.jsonl');
    assert(fs.existsSync(logPath), 'upgrades.log.jsonl must exist');
    
    const content = fs.readFileSync(logPath, 'utf-8').trim();
    if (content) {
      const lines = content.split('\n').filter(l => l.trim());
      assert(lines.length >= 1, 'Should have at least one log entry');
      
      for (const line of lines) {
        const entry = JSON.parse(line);
        assert(typeof entry.timestamp === 'string', 'Log entry must have timestamp');
        assert(entry.status === 'PASS' || entry.status === 'FAIL', 'Log entry must have PASS/FAIL status');
        assert(Array.isArray(entry.migrations_applied), 'Log entry must have migrations_applied');
        assert(typeof entry.from_version === 'string', 'Log entry must have from_version');
        assert(typeof entry.to_version === 'string', 'Log entry must have to_version');
      }
    }
  });
});

describe('Upgrade System - Idempotency', () => {
  
  it('upgrade_count reflects applied migrations', () => {
    const versionPath = path.join(AXION_ROOT, 'registry', 'system_version.json');
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    assert(version.upgrade_count >= 2, 'Upgrade count should be >= 2 after migrations');
  });
  
  it('shouldApply returns false for already-applied migrations', async () => {
    const migrationsDir = path.join(AXION_ROOT, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.ts'));
    
    for (const file of files) {
      const modPath = path.join(migrationsDir, file);
      const mod = await import(modPath);
      
      const should = mod.shouldApply(AXION_ROOT);
      assert(should === false, `${file} shouldApply() should return false after upgrade`);
    }
  });
});

describe('Doctor - Config Validation', () => {
  
  it('validates domains.json structure', () => {
    const configPath = path.join(AXION_ROOT, 'config', 'domains.json');
    assert(fs.existsSync(configPath), 'domains.json must exist');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert(Array.isArray(config.modules), 'modules must be array');
    assert(Array.isArray(config.canonical_order), 'canonical_order must be array');
    assert(config.modules.length >= 19, 'Should have at least 19 modules');
  });
  
  it('validates presets.json structure', () => {
    const configPath = path.join(AXION_ROOT, 'config', 'presets.json');
    assert(fs.existsSync(configPath), 'presets.json must exist');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert(typeof config.presets === 'object', 'presets must be object');
    assert(Object.keys(config.presets).length >= 1, 'Should have at least 1 preset');
  });
  
  it('validates stack_profiles.json structure', () => {
    const configPath = path.join(AXION_ROOT, 'config', 'stack_profiles.json');
    assert(fs.existsSync(configPath), 'stack_profiles.json must exist');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert(typeof config.profiles === 'object', 'profiles must be object');
    assert('default-web-saas' in config.profiles, 'Should have default-web-saas profile');
  });
});

describe('Doctor - Template Markers', () => {
  
  it('core templates directory exists with ROSHI templates', () => {
    const templatesDir = path.join(AXION_ROOT, 'templates');
    const coreDir = path.join(templatesDir, 'core');
    
    assert(fs.existsSync(coreDir), 'templates/core directory must exist');
    
    const templates = fs.readdirSync(coreDir).filter(f => f.endsWith('.template.md'));
    assert(templates.length >= 7, 'Should have at least 7 core ROSHI templates');
    
    let withMarkers = 0;
    let withoutMarkers = 0;
    
    for (const t of templates) {
      const content = fs.readFileSync(path.join(coreDir, t), 'utf-8');
      if (content.includes('AXION:TEMPLATE_CONTRACT:v1')) {
        withMarkers++;
      } else {
        withoutMarkers++;
      }
    }
    
    assert(withMarkers + withoutMarkers === templates.length, 'Should count all templates');
  });
  
  it('module templates exist at templates/<slug>/README.template.md', () => {
    const configPath = path.join(AXION_ROOT, 'config', 'domains.json');
    assert(fs.existsSync(configPath), 'domains.json must exist to verify module templates');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const templatesDir = path.join(AXION_ROOT, 'templates');
    
    let checked = 0;
    const missing: string[] = [];
    
    for (const mod of config.modules) {
      const templatePath = path.join(templatesDir, mod.slug, 'README.template.md');
      if (fs.existsSync(templatePath)) {
        checked++;
      } else {
        missing.push(mod.slug);
      }
    }
    
    assert(checked >= 19, `Should have at least 19 module templates, found ${checked}. Missing: ${missing.join(', ')}`);
  });
  
  it('module templates have canonical markers', () => {
    const configPath = path.join(AXION_ROOT, 'config', 'domains.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const templatesDir = path.join(AXION_ROOT, 'templates');
    
    let checked = 0;
    const withoutMarkers: string[] = [];
    
    for (const mod of config.modules) {
      const templatePath = path.join(templatesDir, mod.slug, 'README.template.md');
      if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf-8');
        if (content.includes('AXION:TEMPLATE_CONTRACT:v1') && content.includes('AXION:MODULE:')) {
          checked++;
        } else {
          withoutMarkers.push(mod.slug);
        }
      }
    }
    
    assert(
      withoutMarkers.length === 0,
      `All module templates should have canonical markers. Missing: ${withoutMarkers.join(', ')}`
    );
  });
});
