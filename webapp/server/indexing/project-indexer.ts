import * as fs from "fs";
import * as path from "path";
import type { ProjectSummary, ProjectWarning } from "@shared/schema";

export interface IndexResult {
  summary: ProjectSummary;
  projectTree: string;
  dependencySnapshot: Record<string, string>;
  warnings: ProjectWarning[];
}

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".output",
  ".cache",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  "vendor",
  ".idea",
  ".vscode",
]);

const MAX_TREE_DEPTH = 6;
const MAX_TREE_FILES = 500;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function detectPackageManager(dir: string): Promise<string | undefined> {
  if (await fileExists(path.join(dir, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (await fileExists(path.join(dir, "yarn.lock"))) {
    return "yarn";
  }
  if (await fileExists(path.join(dir, "bun.lockb"))) {
    return "bun";
  }
  if (await fileExists(path.join(dir, "package-lock.json"))) {
    return "npm";
  }
  return undefined;
}

async function detectFramework(
  dir: string,
  packageJson: Record<string, unknown> | null
): Promise<string | undefined> {
  const deps = {
    ...(packageJson?.dependencies as Record<string, string> || {}),
    ...(packageJson?.devDependencies as Record<string, string> || {}),
  };

  if (deps.next) {
    if (
      (await fileExists(path.join(dir, "next.config.js"))) ||
      (await fileExists(path.join(dir, "next.config.mjs"))) ||
      (await fileExists(path.join(dir, "next.config.ts")))
    ) {
      return "next";
    }
    if (
      (await fileExists(path.join(dir, "app"))) ||
      (await fileExists(path.join(dir, "pages")))
    ) {
      return "next";
    }
  }

  if (deps.vite) {
    if (
      (await fileExists(path.join(dir, "vite.config.js"))) ||
      (await fileExists(path.join(dir, "vite.config.ts"))) ||
      (await fileExists(path.join(dir, "vite.config.mjs")))
    ) {
      return "vite";
    }
  }

  if (deps.expo || (await fileExists(path.join(dir, "app.json")))) {
    const appJson = await readJsonFile(path.join(dir, "app.json"));
    if (appJson?.expo) {
      return "expo";
    }
  }

  if (deps["react-native"]) {
    return "react-native";
  }

  if (deps.nuxt || deps["@nuxt/core"]) {
    return "nuxt";
  }

  if (deps.svelte || deps["@sveltejs/kit"]) {
    return deps["@sveltejs/kit"] ? "sveltekit" : "svelte";
  }

  if (deps.vue) {
    return "vue";
  }

  if (deps.react) {
    return "react";
  }

  if (deps.express) {
    return "express";
  }

  if (deps.fastify) {
    return "fastify";
  }

  if (deps.koa) {
    return "koa";
  }

  if (deps.hono) {
    return "hono";
  }

  if (await fileExists(path.join(dir, "requirements.txt"))) {
    return "python";
  }

  if (await fileExists(path.join(dir, "Cargo.toml"))) {
    return "rust";
  }

  if (await fileExists(path.join(dir, "go.mod"))) {
    return "go";
  }

  return undefined;
}

async function buildProjectTree(
  dir: string,
  prefix = "",
  depth = 0,
  fileCount = { count: 0 }
): Promise<string> {
  if (depth > MAX_TREE_DEPTH || fileCount.count > MAX_TREE_FILES) {
    return "";
  }

  let tree = "";
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  
  const sorted = entries
    .filter((e) => !SKIP_DIRS.has(e.name) && !e.name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (let i = 0; i < sorted.length; i++) {
    if (fileCount.count > MAX_TREE_FILES) {
      tree += `${prefix}... (truncated)\n`;
      break;
    }

    const entry = sorted[i];
    const isLast = i === sorted.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const newPrefix = prefix + (isLast ? "    " : "│   ");

    tree += `${prefix}${connector}${entry.name}${entry.isDirectory() ? "/" : ""}\n`;
    fileCount.count++;

    if (entry.isDirectory()) {
      const subTree = await buildProjectTree(
        path.join(dir, entry.name),
        newPrefix,
        depth + 1,
        fileCount
      );
      tree += subTree;
    }
  }

  return tree;
}

async function findEntryPoints(dir: string): Promise<string[]> {
  const entryPoints: string[] = [];
  const candidates = [
    "src/index.ts",
    "src/index.tsx",
    "src/index.js",
    "src/main.ts",
    "src/main.tsx",
    "src/main.js",
    "src/App.tsx",
    "src/App.js",
    "app/layout.tsx",
    "app/page.tsx",
    "pages/index.tsx",
    "pages/index.js",
    "pages/_app.tsx",
    "index.ts",
    "index.js",
    "server/index.ts",
    "server/index.js",
    "server.ts",
    "server.js",
    "app.ts",
    "app.js",
  ];

  for (const candidate of candidates) {
    if (await fileExists(path.join(dir, candidate))) {
      entryPoints.push(candidate);
    }
  }

  return entryPoints;
}

async function countFilesAndSize(
  dir: string,
  depth = 0
): Promise<{ fileCount: number; totalSize: number }> {
  if (depth > 10) {
    return { fileCount: 0, totalSize: 0 };
  }

  let fileCount = 0;
  let totalSize = 0;

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const sub = await countFilesAndSize(fullPath, depth + 1);
      fileCount += sub.fileCount;
      totalSize += sub.totalSize;
    } else {
      fileCount++;
      try {
        const stat = await fs.promises.stat(fullPath);
        totalSize += stat.size;
      } catch {
      }
    }
  }

  return { fileCount, totalSize };
}

export async function indexProject(extractedDir: string): Promise<IndexResult> {
  const warnings: ProjectWarning[] = [];
  
  const packageJsonPath = path.join(extractedDir, "package.json");
  const packageJson = await readJsonFile(packageJsonPath);

  const summary: ProjectSummary = {};

  summary.packageManager = await detectPackageManager(extractedDir);
  summary.framework = await detectFramework(extractedDir, packageJson);

  if (packageJson?.scripts) {
    summary.scripts = packageJson.scripts as Record<string, string>;
  }

  summary.hasTypeScript =
    (await fileExists(path.join(extractedDir, "tsconfig.json"))) ||
    (await fileExists(path.join(extractedDir, "tsconfig.base.json")));

  summary.hasEslint =
    (await fileExists(path.join(extractedDir, ".eslintrc"))) ||
    (await fileExists(path.join(extractedDir, ".eslintrc.js"))) ||
    (await fileExists(path.join(extractedDir, ".eslintrc.json"))) ||
    (await fileExists(path.join(extractedDir, "eslint.config.js"))) ||
    (await fileExists(path.join(extractedDir, "eslint.config.mjs")));

  summary.hasPrettier =
    (await fileExists(path.join(extractedDir, ".prettierrc"))) ||
    (await fileExists(path.join(extractedDir, ".prettierrc.json"))) ||
    (await fileExists(path.join(extractedDir, "prettier.config.js")));

  summary.entryPoints = await findEntryPoints(extractedDir);

  const { fileCount, totalSize } = await countFilesAndSize(extractedDir);
  summary.fileCount = fileCount;
  summary.totalSize = totalSize;

  const projectTree = await buildProjectTree(extractedDir);

  const dependencySnapshot: Record<string, string> = {};
  if (packageJson) {
    const deps = packageJson.dependencies as Record<string, string> || {};
    const devDeps = packageJson.devDependencies as Record<string, string> || {};
    Object.assign(dependencySnapshot, deps, devDeps);
  }

  if (fileCount > 5000) {
    warnings.push({
      code: "LARGE_REPO",
      message: `Large repository with ${fileCount} files`,
    });
  }

  if (!summary.framework) {
    warnings.push({
      code: "UNKNOWN_FRAMEWORK",
      message: "Could not detect project framework",
    });
  }

  return {
    summary,
    projectTree,
    dependencySnapshot,
    warnings,
  };
}
