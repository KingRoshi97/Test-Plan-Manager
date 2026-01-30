#!/usr/bin/env node
/**
 * roshi-consolidate.mjs v2.1
 * 
 * Purpose: Consolidate scattered documentation and attached assets into 
 * a stable evidence library at docs/legacy/**
 * 
 * Required outputs:
 * - docs/legacy/INDEX.md
 * - docs/legacy/attached_assets.md
 * - docs/legacy/repo_docs/** (categorized)
 */

import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join, resolve, extname, basename, dirname, relative } from 'path';
import { loadProtectedPaths, isProtected, assertNoProtectedTouches } from './lib/protected-paths.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

const LEGACY_ROOT = 'docs/legacy';
const ATTACHED_ASSETS_DIR = 'attached_assets';

const DOC_EXTENSIONS = new Set(['.md', '.txt', '.pdf', '.doc', '.docx', '.rst']);
const ASSET_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico']);

const CATEGORY_RULES = [
  { pattern: /readme/i, category: 'readme' },
  { pattern: /changelog|history/i, category: 'changelog' },
  { pattern: /license|licence/i, category: 'license' },
  { pattern: /contributing/i, category: 'contributing' },
  { pattern: /api|swagger|openapi/i, category: 'api' },
  { pattern: /architecture|design|adr/i, category: 'architecture' },
  { pattern: /guide|tutorial|howto/i, category: 'guides' },
  { pattern: /spec|requirement|prd/i, category: 'specs' },
  { pattern: /roshi|axiom/i, category: 'roshi' }
];

function log(msg, level = 'info') {
  const prefix = {
    info: '  ',
    success: '✓ ',
    warn: '⚠ ',
    error: '✗ ',
    skip: '○ '
  };
  console.log(`${prefix[level] || '  '}${msg}`);
}

function categorizeDoc(filename) {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(filename)) {
      return rule.category;
    }
  }
  return 'misc';
}

function walkDir(dir, fileList = [], baseDir = dir) {
  if (!existsSync(dir)) return fileList;
  
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = relative(baseDir, fullPath);
    
    if (isProtected(fullPath) || isProtected(relativePath)) {
      continue;
    }
    
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git' || entry === '_archive') {
        continue;
      }
      walkDir(fullPath, fileList, baseDir);
    } else {
      fileList.push({
        path: fullPath,
        relativePath,
        name: entry,
        ext: extname(entry).toLowerCase(),
        size: stat.size
      });
    }
  }
  
  return fileList;
}

function collectScatteredDocs() {
  const docs = [];
  const root = process.cwd();
  
  const rootFiles = readdirSync(root);
  for (const file of rootFiles) {
    const fullPath = join(root, file);
    const stat = statSync(fullPath);
    
    if (stat.isFile() && DOC_EXTENSIONS.has(extname(file).toLowerCase())) {
      if (!isProtected(file)) {
        docs.push({
          path: fullPath,
          relativePath: file,
          name: file,
          ext: extname(file).toLowerCase(),
          size: stat.size,
          source: 'root'
        });
      }
    }
  }
  
  return docs;
}

function collectAttachedAssets() {
  if (!existsSync(ATTACHED_ASSETS_DIR)) {
    return [];
  }
  
  return walkDir(ATTACHED_ASSETS_DIR).map(f => ({
    ...f,
    source: 'attached_assets'
  }));
}

function generateIndexMd(docs, assets) {
  const docsByCategory = {};
  for (const doc of docs) {
    const category = categorizeDoc(doc.name);
    if (!docsByCategory[category]) {
      docsByCategory[category] = [];
    }
    docsByCategory[category].push(doc);
  }
  
  let content = `# Legacy Documentation Index

**Generated:** ${new Date().toISOString()}  
**Total Documents:** ${docs.length}  
**Total Assets:** ${assets.length}

## Documents by Category

`;

  for (const [category, categoryDocs] of Object.entries(docsByCategory).sort()) {
    content += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    for (const doc of categoryDocs) {
      content += `- [${doc.name}](repo_docs/${category}/${doc.name})\n`;
    }
    content += '\n';
  }
  
  content += `## Attached Assets

See [attached_assets.md](attached_assets.md) for the complete list.

Total: ${assets.length} files
`;

  return content;
}

function generateAttachedAssetsMd(assets) {
  let content = `# Attached Assets Index

**Generated:** ${new Date().toISOString()}  
**Total Files:** ${assets.length}

## Files

`;

  const byExt = {};
  for (const asset of assets) {
    const ext = asset.ext || 'unknown';
    if (!byExt[ext]) {
      byExt[ext] = [];
    }
    byExt[ext].push(asset);
  }
  
  for (const [ext, extAssets] of Object.entries(byExt).sort()) {
    content += `### ${ext || 'No Extension'} (${extAssets.length})\n\n`;
    for (const asset of extAssets) {
      content += `- \`${asset.relativePath}\` (${(asset.size / 1024).toFixed(1)} KB)\n`;
    }
    content += '\n';
  }
  
  return content;
}

async function main() {
  console.log('\n📚 ROSHI CONSOLIDATE v2.1\n');
  
  if (DRY_RUN) {
    console.log('   [DRY RUN MODE - No changes will be made]\n');
  }
  
  try {
    loadProtectedPaths();
  } catch (err) {
    log(`Failed to load protected paths: ${err.message}`, 'error');
    process.exit(1);
  }
  
  const scatteredDocs = collectScatteredDocs();
  const attachedAssets = collectAttachedAssets();
  
  log(`Found ${scatteredDocs.length} scattered docs`, 'info');
  log(`Found ${attachedAssets.length} attached assets`, 'info');
  
  const operations = [
    ...scatteredDocs.map(d => ({ type: 'copy', path: d.path })),
    ...attachedAssets.map(a => ({ type: 'copy', path: a.path }))
  ];
  
  try {
    assertNoProtectedTouches(operations);
  } catch (err) {
    console.log('\n');
    log(err.message, 'error');
    process.exit(1);
  }
  
  const created = [];
  const copied = [];
  const skipped = [];
  const failed = [];
  
  if (!DRY_RUN) {
    mkdirSync(LEGACY_ROOT, { recursive: true });
    mkdirSync(join(LEGACY_ROOT, 'repo_docs'), { recursive: true });
  }
  
  for (const doc of scatteredDocs) {
    const category = categorizeDoc(doc.name);
    const targetDir = join(LEGACY_ROOT, 'repo_docs', category);
    const targetPath = join(targetDir, doc.name);
    
    if (DRY_RUN) {
      log(`Would copy: ${doc.relativePath} → ${targetPath}`, 'info');
      copied.push({ source: doc.relativePath, target: targetPath });
    } else {
      try {
        mkdirSync(targetDir, { recursive: true });
        copyFileSync(doc.path, targetPath);
        log(`Copied: ${doc.relativePath} → ${targetPath}`, 'success');
        copied.push({ source: doc.relativePath, target: targetPath });
      } catch (err) {
        log(`Failed to copy ${doc.relativePath}: ${err.message}`, 'error');
        failed.push({ path: doc.relativePath, error: err.message });
      }
    }
  }
  
  const indexMd = generateIndexMd(scatteredDocs, attachedAssets);
  const attachedAssetsMd = generateAttachedAssetsMd(attachedAssets);
  
  if (!DRY_RUN) {
    writeFileSync(join(LEGACY_ROOT, 'INDEX.md'), indexMd);
    created.push(join(LEGACY_ROOT, 'INDEX.md'));
    log(`Created: ${join(LEGACY_ROOT, 'INDEX.md')}`, 'success');
    
    writeFileSync(join(LEGACY_ROOT, 'attached_assets.md'), attachedAssetsMd);
    created.push(join(LEGACY_ROOT, 'attached_assets.md'));
    log(`Created: ${join(LEGACY_ROOT, 'attached_assets.md')}`, 'success');
  } else {
    log(`Would create: ${join(LEGACY_ROOT, 'INDEX.md')}`, 'info');
    log(`Would create: ${join(LEGACY_ROOT, 'attached_assets.md')}`, 'info');
  }
  
  console.log('\n📊 ROSHI_REPORT');
  console.log(`   Created: ${DRY_RUN ? 0 : created.length}`);
  console.log(`   Copied: ${copied.length}`);
  console.log(`   Skipped: ${skipped.length}`);
  console.log(`   Failed: ${failed.length}\n`);
  
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
