#!/usr/bin/env node
/**
 * AXION Test Runner
 * 
 * Runs the test suite with clear pass/fail reporting.
 * 
 * Usage:
 *   npx ts-node axion/tests/helpers/test-runner.ts
 *   npx ts-node axion/tests/helpers/test-runner.ts --filter <pattern>
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: Array<{
    name: string;
    fn: () => void | Promise<void>;
  }>;
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

export async function runTests(filter?: string): Promise<void> {
  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  
  console.log('\n[AXION] Test Runner\n');
  console.log('='.repeat(60));
  
  for (const suite of suites) {
    if (filter && !suite.name.toLowerCase().includes(filter.toLowerCase())) {
      continue;
    }
    
    console.log(`\n[SUITE] ${suite.name}\n`);
    
    for (const test of suite.tests) {
      if (filter && !test.name.toLowerCase().includes(filter.toLowerCase())) {
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
  console.log(`\n[SUMMARY] ${passed} passed, ${failed} failed, ${passed + failed} total\n`);
  
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

if (require.main === module) {
  const args = process.argv.slice(2);
  const filterIdx = args.indexOf('--filter');
  const filter = filterIdx !== -1 ? args[filterIdx + 1] : undefined;
  
  const testsDir = path.join(__dirname, '..', 'suites');
  const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.ts'));
  
  for (const file of testFiles) {
    require(path.join(testsDir, file));
  }
  
  runTests(filter);
}
