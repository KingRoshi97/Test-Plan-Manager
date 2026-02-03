#!/usr/bin/env node
/**
 * AXION Upgrade Script
 * 
 * Applies migrations in order, validates results, logs changes.
 * Idempotent: re-running does nothing if already upgraded.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-upgrade.ts
 *   node --import tsx axion/scripts/axion-upgrade.ts --dry-run
 *   node --import tsx axion/scripts/axion-upgrade.ts --force
 */

import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const VERSION_PATH = path.join(AXION_ROOT, 'registry', 'system_version.json');
const LOG_PATH = path.join(AXION_ROOT, 'registry', 'upgrades.log.jsonl');
const MIGRATIONS_DIR = path.join(AXION_ROOT, 'migrations');
const BACKUP_DIR = path.join(AXION_ROOT, 'registry', '_backup');

interface SystemVersion {
  axion_version: string;
  schema_versions: Record<string, string>;
  last_upgraded: string | null;
  upgrade_count: number;
}

interface MigrationModule {
  id: string;
  version: string;
  description: string;
  shouldApply: (axionRoot: string) => boolean;
  apply: (axionRoot: string) => { applied: boolean; changes: string[]; errors: string[] };
}

interface UpgradeLogEntry {
  timestamp: string;
  from_version: string;
  to_version: string;
  migrations_applied: string[];
  status: 'PASS' | 'FAIL';
  changes: string[];
  errors: string[];
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

function loadVersion(): SystemVersion {
  if (!fs.existsSync(VERSION_PATH)) {
    return {
      axion_version: '0.0.0',
      schema_versions: {},
      last_upgraded: null,
      upgrade_count: 0,
    };
  }
  return JSON.parse(fs.readFileSync(VERSION_PATH, 'utf-8'));
}

function saveVersion(version: SystemVersion): void {
  const dir = path.dirname(VERSION_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(VERSION_PATH, JSON.stringify(version, null, 2));
}

function appendLog(entry: UpgradeLogEntry): void {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
}

function createBackup(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, timestamp);
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  const registryDir = path.join(AXION_ROOT, 'registry');
  if (fs.existsSync(registryDir)) {
    const files = fs.readdirSync(registryDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const src = path.join(registryDir, file);
      const dest = path.join(backupPath, file);
      fs.copyFileSync(src, dest);
    }
  }
  
  return backupPath;
}

async function loadMigrations(): Promise<MigrationModule[]> {
  const migrations: MigrationModule[] = [];
  
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return migrations;
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.ts') && /^\d{3}_/.test(f))
    .sort();
  
  for (const file of files) {
    try {
      const modulePath = path.join(MIGRATIONS_DIR, file);
      const mod = await import(modulePath);
      migrations.push({
        id: mod.id || file.replace('.ts', ''),
        version: mod.version || '1.0.0',
        description: mod.description || '',
        shouldApply: mod.shouldApply,
        apply: mod.apply,
      });
    } catch (e) {
      console.error(`[WARN] Failed to load migration ${file}:`, e);
    }
  }
  
  return migrations;
}

async function main(): Promise<void> {
  console.log('\n[AXION] Upgrade System\n');
  
  if (dryRun) {
    console.log('[MODE] Dry run - no changes will be made\n');
  }
  
  const currentVersion = loadVersion();
  console.log(`[INFO] Current version: ${currentVersion.axion_version}`);
  console.log(`[INFO] Upgrade count: ${currentVersion.upgrade_count}`);
  
  const migrations = await loadMigrations();
  console.log(`[INFO] Found ${migrations.length} migration(s)\n`);
  
  const toApply = migrations.filter(m => {
    if (force) return true;
    try {
      return m.shouldApply(AXION_ROOT);
    } catch {
      return false;
    }
  });
  
  if (toApply.length === 0) {
    console.log('[INFO] No migrations to apply - system is up to date\n');
    const result = {
      status: 'UP_TO_DATE',
      version: currentVersion.axion_version,
      upgrade_count: currentVersion.upgrade_count,
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  
  console.log(`[INFO] Migrations to apply: ${toApply.length}`);
  for (const m of toApply) {
    console.log(`  - ${m.id}: ${m.description}`);
  }
  console.log('');
  
  if (dryRun) {
    console.log('[DRY-RUN] Would apply the above migrations\n');
    return;
  }
  
  console.log('[INFO] Creating backup...');
  const backupPath = createBackup();
  console.log(`[INFO] Backup created at: ${backupPath}\n`);
  
  const allChanges: string[] = [];
  const allErrors: string[] = [];
  const appliedMigrations: string[] = [];
  let overallStatus: 'PASS' | 'FAIL' = 'PASS';
  
  for (const migration of toApply) {
    console.log(`[APPLY] ${migration.id}...`);
    
    try {
      const result = migration.apply(AXION_ROOT);
      
      if (result.applied) {
        appliedMigrations.push(migration.id);
        allChanges.push(...result.changes.map(c => `${migration.id}: ${c}`));
        
        if (result.errors.length > 0) {
          allErrors.push(...result.errors.map(e => `${migration.id}: ${e}`));
          console.log(`  [WARN] Applied with ${result.errors.length} warning(s)`);
        } else {
          console.log('  [OK] Applied successfully');
        }
        
        for (const change of result.changes) {
          console.log(`    - ${change}`);
        }
      } else {
        console.log('  [SKIP] Already applied');
      }
    } catch (e) {
      overallStatus = 'FAIL';
      allErrors.push(`${migration.id}: ${e}`);
      console.log(`  [FAIL] ${e}`);
    }
  }
  
  const newVersion = loadVersion();
  
  const logEntry: UpgradeLogEntry = {
    timestamp: new Date().toISOString(),
    from_version: currentVersion.axion_version,
    to_version: newVersion.axion_version,
    migrations_applied: appliedMigrations,
    status: overallStatus,
    changes: allChanges,
    errors: allErrors,
  };
  
  appendLog(logEntry);
  
  console.log('\n[INFO] Upgrade complete');
  console.log(`[INFO] Applied ${appliedMigrations.length} migration(s)`);
  console.log(`[INFO] Status: ${overallStatus}`);
  
  if (allErrors.length > 0) {
    console.log(`\n[WARN] ${allErrors.length} warning(s):`);
    for (const err of allErrors) {
      console.log(`  - ${err}`);
    }
  }
  
  const result = {
    status: overallStatus,
    from_version: currentVersion.axion_version,
    to_version: newVersion.axion_version,
    migrations_applied: appliedMigrations,
    backup_path: backupPath,
    changes_count: allChanges.length,
    errors_count: allErrors.length,
  };
  
  console.log('\n' + JSON.stringify(result, null, 2) + '\n');
}

main().catch(e => {
  console.error('[ERROR]', e);
  process.exit(1);
});
