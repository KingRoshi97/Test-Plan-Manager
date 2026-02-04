import * as fs from 'fs';
import * as path from 'path';

const FIXTURES_ROOT = path.join(__dirname, '..', 'fixtures');

export interface Fixture {
  name: string;
  path: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  readme?: string;
}

export function loadFixture(fixturePath: string): Fixture {
  const fullPath = path.join(FIXTURES_ROOT, fixturePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }

  const inputDir = path.join(fullPath, 'input');
  const expectedDir = path.join(fullPath, 'expected');
  const readmePath = path.join(fullPath, 'README.md');

  const input: Record<string, unknown> = {};
  const expected: Record<string, unknown> = {};

  if (fs.existsSync(inputDir)) {
    for (const file of fs.readdirSync(inputDir)) {
      const filePath = path.join(inputDir, file);
      if (file.endsWith('.json')) {
        input[file] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else {
        input[file] = fs.readFileSync(filePath, 'utf-8');
      }
    }
  }

  if (fs.existsSync(expectedDir)) {
    for (const file of fs.readdirSync(expectedDir)) {
      const filePath = path.join(expectedDir, file);
      if (file.endsWith('.json')) {
        expected[file] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else {
        expected[file] = fs.readFileSync(filePath, 'utf-8');
      }
    }
  }

  return {
    name: path.basename(fixturePath),
    path: fullPath,
    input,
    expected,
    readme: fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : undefined
  };
}

export function listFixtures(category?: string): string[] {
  const searchPath = category ? path.join(FIXTURES_ROOT, category) : FIXTURES_ROOT;
  
  if (!fs.existsSync(searchPath)) {
    return [];
  }

  const fixtures: string[] = [];
  
  function walkDir(dir: string, prefix: string = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const subPath = path.join(dir, entry.name);
        if (fs.existsSync(path.join(subPath, 'input')) || fs.existsSync(path.join(subPath, 'expected'))) {
          fixtures.push(prefix ? `${prefix}/${entry.name}` : entry.name);
        } else {
          walkDir(subPath, prefix ? `${prefix}/${entry.name}` : entry.name);
        }
      }
    }
  }

  walkDir(searchPath, category || '');
  return fixtures;
}

export function fixtureExists(fixturePath: string): boolean {
  const fullPath = path.join(FIXTURES_ROOT, fixturePath);
  return fs.existsSync(fullPath);
}
