/**
 * Migration 001: Initial Schema
 * 
 * Establishes baseline schema versions. This is the "zero state" migration
 * that marks a workspace as having the initial AXION 1.0.0 schema.
 */

import * as fs from 'fs';
import * as path from 'path';

export const id = '001_initial_schema';
export const version = '1.0.0';
export const description = 'Establish initial AXION 1.0.0 schema baseline';

export interface MigrationResult {
  applied: boolean;
  changes: string[];
  errors: string[];
}

export function shouldApply(axionRoot: string): boolean {
  const versionPath = path.join(axionRoot, 'registry', 'system_version.json');
  
  if (!fs.existsSync(versionPath)) {
    return true;
  }
  
  try {
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    return !version.axion_version || version.upgrade_count === 0;
  } catch {
    return true;
  }
}

export function apply(axionRoot: string): MigrationResult {
  const changes: string[] = [];
  const errors: string[] = [];
  
  const versionPath = path.join(axionRoot, 'registry', 'system_version.json');
  const registryDir = path.join(axionRoot, 'registry');
  
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
    changes.push('Created registry directory');
  }
  
  const initialVersion = {
    axion_version: '1.0.0',
    schema_versions: {
      verify_report: '1.0.0',
      stage_markers: '1.0.0',
      seams: '1.0.0',
      template_hashes: '1.0.0',
    },
    last_upgraded: new Date().toISOString(),
    upgrade_count: 1,
  };
  
  fs.writeFileSync(versionPath, JSON.stringify(initialVersion, null, 2));
  changes.push('Created system_version.json with 1.0.0 baseline');
  
  const markersPath = path.join(registryDir, 'stage_markers.json');
  if (!fs.existsSync(markersPath)) {
    fs.writeFileSync(markersPath, JSON.stringify({ version: '1.0.0', markers: {} }, null, 2));
    changes.push('Created stage_markers.json');
  }
  
  return { applied: true, changes, errors };
}
