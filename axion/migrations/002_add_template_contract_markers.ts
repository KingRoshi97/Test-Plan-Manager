/**
 * Migration 002: Add Template Contract Markers
 * 
 * Ensures all templates have canonical AXION contract markers.
 * This migration validates and reports but does not auto-fix templates.
 */

import * as fs from 'fs';
import * as path from 'path';

export const id = '002_add_template_contract_markers';
export const version = '1.0.0';
export const description = 'Validate template contract markers are present';

export interface MigrationResult {
  applied: boolean;
  changes: string[];
  errors: string[];
}

const REQUIRED_MARKERS = [
  'AXION:TEMPLATE_CONTRACT:v1',
  'AXION:MODULE:',
];

export function shouldApply(axionRoot: string): boolean {
  const versionPath = path.join(axionRoot, 'registry', 'system_version.json');
  
  if (!fs.existsSync(versionPath)) {
    return false;
  }
  
  try {
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    return version.upgrade_count < 2;
  } catch {
    return false;
  }
}

export function apply(axionRoot: string): MigrationResult {
  const changes: string[] = [];
  const errors: string[] = [];
  
  const templatesDir = path.join(axionRoot, 'templates');
  
  if (!fs.existsSync(templatesDir)) {
    changes.push('No templates directory found - skipping');
    return { applied: true, changes, errors };
  }
  
  function scanTemplates(dir: string): string[] {
    const templates: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        templates.push(...scanTemplates(fullPath));
      } else if (entry.name.endsWith('.template.md')) {
        templates.push(fullPath);
      }
    }
    return templates;
  }
  
  const templates = scanTemplates(templatesDir);
  let valid = 0;
  let invalid = 0;
  
  for (const templatePath of templates) {
    const content = fs.readFileSync(templatePath, 'utf-8');
    const relativePath = path.relative(axionRoot, templatePath);
    
    const hasContract = content.includes('AXION:TEMPLATE_CONTRACT:v1');
    const hasModule = content.includes('AXION:MODULE:');
    
    if (hasContract && hasModule) {
      valid++;
    } else {
      invalid++;
      const missing: string[] = [];
      if (!hasContract) missing.push('TEMPLATE_CONTRACT');
      if (!hasModule) missing.push('MODULE');
      errors.push(`${relativePath}: missing ${missing.join(', ')}`);
    }
  }
  
  changes.push(`Validated ${templates.length} templates: ${valid} valid, ${invalid} missing markers`);
  
  const versionPath = path.join(axionRoot, 'registry', 'system_version.json');
  if (fs.existsSync(versionPath)) {
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    version.upgrade_count = Math.max(version.upgrade_count || 0, 2);
    version.last_upgraded = new Date().toISOString();
    fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));
  }
  
  return { applied: true, changes, errors };
}
