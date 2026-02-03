#!/usr/bin/env node
/**
 * AXION Review Script
 * 
 * Validates documentation: counts UNKNOWNs, checks cross-references,
 * identifies issues for fixing before verify.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-review.ts --module <name>
 *   npx ts-node axion/scripts/axion-review.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');
const MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');

interface Module {
  name: string;
  slug: string;
}

interface Config {
  modules: Module[];
  canonical_order: string[];
}

interface StageMarkers {
  version: string;
  markers: Record<string, Record<string, any>>;
}

interface ReviewIssue {
  type: string;
  reason_code: string;
  description: string;
  line?: number;
}

interface ReviewResult {
  module: string;
  unknown_count: number;
  tbd_count: number;
  broken_refs: string[];
  issues: ReviewIssue[];
}

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadMarkers(): StageMarkers {
  if (!fs.existsSync(MARKERS_PATH)) {
    return { version: '1.0.0', markers: {} };
  }
  return JSON.parse(fs.readFileSync(MARKERS_PATH, 'utf-8'));
}

function saveMarkers(markers: StageMarkers): void {
  fs.writeFileSync(MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function reviewModule(mod: Module, config: Config): ReviewResult {
  const docPath = path.join(DOMAINS_PATH, mod.slug, 'README.md');
  const result: ReviewResult = {
    module: mod.slug,
    unknown_count: 0,
    tbd_count: 0,
    broken_refs: [],
    issues: [],
  };
  
  if (!fs.existsSync(docPath)) {
    result.issues.push({
      type: 'error',
      reason_code: 'MISSING_DOC',
      description: `Module doc not found: ${docPath}`,
    });
    return result;
  }
  
  const content = fs.readFileSync(docPath, 'utf-8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const unknownMatches = line.match(/UNKNOWN/g);
    if (unknownMatches) {
      result.unknown_count += unknownMatches.length;
    }
    
    const tbdMatches = line.match(/\[TBD\]/g);
    if (tbdMatches) {
      result.tbd_count += tbdMatches.length;
    }
    
    const refMatches = line.matchAll(/\[([^\]]+)\]\(\.\.\/([^\/]+)\/[^\)]+\)/g);
    for (const match of refMatches) {
      const targetModule = match[2];
      const targetPath = path.join(DOMAINS_PATH, targetModule);
      
      if (!fs.existsSync(targetPath)) {
        result.broken_refs.push(targetModule);
        result.issues.push({
          type: 'warning',
          reason_code: 'BROKEN_CROSS_REF',
          description: `Reference to nonexistent module: ${targetModule}`,
          line: i + 1,
        });
      }
    }
  }
  
  const requiredSections = ['## ACCEPTANCE', '## OPEN_QUESTIONS'];
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      result.issues.push({
        type: 'error',
        reason_code: 'MISSING_SECTION',
        description: `Required section missing: ${section}`,
      });
    }
  }
  
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-review.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-review.ts --all');
    process.exit(1);
  }
  
  const config = loadConfig();
  const markers = loadMarkers();
  
  const targetMod = config.modules.find(m => m.slug === targetModule);
  
  if (!runAll && !targetMod) {
    console.error(`[ERROR] Module "${targetModule}" not found`);
    process.exit(1);
  }
  
  const modulesToReview = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [targetMod!];
  
  console.log('\n[AXION] Review\n');
  
  const results: ReviewResult[] = [];
  
  for (const mod of modulesToReview) {
    if (!mod) continue;
    
    console.log(`[INFO] Reviewing ${mod.name}...`);
    const result = reviewModule(mod, config);
    results.push(result);
    
    console.log(`  unknown_count: ${result.unknown_count}`);
    console.log(`  tbd_count: ${result.tbd_count}`);
    console.log(`  broken_refs: ${result.broken_refs.length}`);
    console.log(`  issues: ${result.issues.length}`);
    
    if (!markers.markers[mod.slug]) {
      markers.markers[mod.slug] = {};
    }
    markers.markers[mod.slug].review = {
      completed_at: new Date().toISOString(),
      unknown_count: result.unknown_count,
      tbd_count: result.tbd_count,
      issues: result.issues,
    };
  }
  
  saveMarkers(markers);
  
  const totalUnknowns = results.reduce((sum, r) => sum + r.unknown_count, 0);
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  
  console.log('\n[SUMMARY]');
  console.log(`  Total UNKNOWNs: ${totalUnknowns}`);
  console.log(`  Total Issues: ${totalIssues}`);
  
  const response = {
    status: 'success',
    stage: 'review',
    module: runAll ? 'all' : targetModule,
    unknown_count: totalUnknowns,
    total_issues: totalIssues,
    marker_written: true,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2) + '\n');
  process.exit(0);
}

main();
