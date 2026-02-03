#!/usr/bin/env node
/**
 * AXION Test Runner (ESM)
 * 
 * Runs the test suite with clear pass/fail reporting.
 * Uses dynamic import() for ESM compatibility.
 * 
 * Usage:
 *   node --import tsx axion/tests/helpers/test-runner.ts --all
 *   node --import tsx axion/tests/helpers/test-runner.ts --suite must-have
 *   node --import tsx axion/tests/helpers/test-runner.ts --suite governance --filter seam
 *   node --import tsx axion/tests/helpers/test-runner.ts --suite must-have --suite governance
 */

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
}

const suites: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

export function describe(name: string, fn: () => void): void {
  currentSuite = { name, tests: [] };
  suites.push(currentSuite);
  fn();
  currentSuite = null;
}

export function it(name: string, fn: () => void | Promise<void>): void {
  if (!currentSuite) {
    throw new Error('it() must be called inside describe()');
  }
  currentSuite.tests.push({ name, fn });
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...await walk(full));
    } else if (e.isFile() && e.name.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

async function loadSuites(): Promise<void> {
  const suiteDir = path.resolve(__dirname, '..', 'suites');
  const files = await walk(suiteDir);
  files.sort();
  
  for (const file of files) {
    await import(pathToFileURL(file).href);
  }
}

function matchSuite(suiteName: string, selected: string[]): boolean {
  const n = suiteName.toLowerCase();
  return selected.some(s => n.includes(s.toLowerCase()));
}

interface RunOptions {
  suiteFilters: string[];
  testFilter?: string;
  runAll: boolean;
}

function parseArgs(args: string[]): RunOptions {
  const suiteFilters: string[] = [];
  let testFilter: string | undefined;
  let runAll = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') {
      runAll = true;
    } else if (arg === '--suite' && args[i + 1]) {
      suiteFilters.push(args[i + 1]);
      i++;
    } else if (arg === '--filter' && args[i + 1]) {
      testFilter = args[i + 1];
      i++;
    }
  }
  
  if (suiteFilters.length === 0 && !runAll) {
    runAll = true;
  }
  
  return { suiteFilters, testFilter, runAll };
}

export async function runTests(options: RunOptions): Promise<void> {
  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  let skippedSuites = 0;
  let skippedTests = 0;
  
  console.log('\n[AXION] Test Runner\n');
  console.log('='.repeat(60));
  
  const suitesToRun = options.runAll 
    ? suites 
    : suites.filter(s => matchSuite(s.name, options.suiteFilters));
  
  skippedSuites = suites.length - suitesToRun.length;
  
  for (const suite of suitesToRun) {
    console.log(`\n[SUITE] ${suite.name}\n`);
    
    for (const test of suite.tests) {
      if (options.testFilter && !test.name.toLowerCase().includes(options.testFilter.toLowerCase())) {
        skippedTests++;
        continue;
      }
      
      const startTime = Date.now();
      let testPassed = true;
      let error: string | undefined;
      
      try {
        await test.fn();
      } catch (e: any) {
        testPassed = false;
        error = e.message || String(e);
      }
      
      const duration = Date.now() - startTime;
      
      if (testPassed) {
        console.log(`  [PASS] ${test.name} (${duration}ms)`);
        passed++;
      } else {
        console.log(`  [FAIL] ${test.name} (${duration}ms)`);
        console.log(`         Error: ${error}`);
        failed++;
      }
      
      results.push({
        name: `${suite.name} > ${test.name}`,
        passed: testPassed,
        duration,
        error,
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n[SUMMARY] ${passed} passed, ${failed} failed, ${passed + failed} total`);
  
  if (skippedSuites > 0 || skippedTests > 0) {
    console.log(`         (${skippedSuites} suites skipped, ${skippedTests} tests filtered)`);
  }
  console.log('');
  
  if (failed > 0) {
    console.log('[FAILED TESTS]:');
    for (const result of results) {
      if (!result.passed) {
        console.log(`  - ${result.name}`);
        if (result.error) {
          console.log(`    ${result.error.split('\n')[0]}`);
        }
      }
    }
    console.log('');
    process.exit(1);
  }
  
  process.exit(0);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  loadSuites()
    .then(() => runTests(options))
    .catch(err => {
      console.error('[FATAL] Test runner error:', err);
      process.exit(1);
    });
}
