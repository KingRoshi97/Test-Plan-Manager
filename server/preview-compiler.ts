import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";

export interface CompilationStatus {
  status: "idle" | "installing" | "compiling" | "ready" | "failed";
  progress?: string;
  error?: string;
}

interface CompilationEntry {
  status: CompilationStatus;
  process: ChildProcess | null;
  timeout: ReturnType<typeof setTimeout> | null;
}

const runningCompilations = new Map<string, CompilationEntry>();

const COMPILATION_TIMEOUT_MS = 5 * 60 * 1000;

const NON_ESSENTIAL_PATTERNS = [
  /^vitest/,
  /^@vitest\//,
  /^jest/,
  /^@jest\//,
  /^@testing-library\//,
  /^cypress/,
  /^playwright/,
  /^eslint/,
  /^@eslint\//,
  /^@typescript-eslint\//,
  /^prettier/,
  /^stylelint/,
  /^husky/,
  /^lint-staged/,
  /^commitlint/,
  /^@commitlint\//,
  /^storybook/,
  /^@storybook\//,
  /^chromatic/,
  /^nyc$/,
  /^c8$/,
  /^@cucumber\//,
  /^mocha$/,
  /^chai$/,
  /^sinon/,
  /^msw$/,
  /^nock$/,
  /^supertest$/,
  /^eslint-plugin-/,
  /^eslint-config-/,
];

function ensureEntryScript(repoDir: string): void {
  const indexPath = path.join(repoDir, "index.html");
  if (!fs.existsSync(indexPath)) return;

  try {
    let html = fs.readFileSync(indexPath, "utf-8");
    if (/<script\s+type\s*=\s*["']module["']/i.test(html)) return;

    const entryFiles = ["src/main.tsx", "src/main.ts", "src/main.jsx", "src/main.js", "src/index.tsx", "src/index.ts", "src/index.jsx", "src/index.js"];
    let entryFile: string | null = null;
    for (const ef of entryFiles) {
      if (fs.existsSync(path.join(repoDir, ef))) {
        entryFile = ef;
        break;
      }
    }
    if (!entryFile) return;

    const scriptTag = `    <script type="module" src="/${entryFile}"></script>\n  `;
    const replaced = html.replace(/<\/body>/i, scriptTag + "</body>");
    if (replaced !== html) {
      fs.writeFileSync(indexPath, replaced, "utf-8");
    }
  } catch {}
}

function detectMissingBuildDeps(repoDir: string): Record<string, string> {
  const missing: Record<string, string> = {};
  try {
    const postcssPath = path.join(repoDir, "postcss.config.js");
    if (fs.existsSync(postcssPath)) {
      const content = fs.readFileSync(postcssPath, "utf-8");
      if (content.includes("autoprefixer")) missing["autoprefixer"] = "^10.4.0";
      if (content.includes("cssnano")) missing["cssnano"] = "^6.0.0";
    }
    const postcssPathCjs = path.join(repoDir, "postcss.config.cjs");
    if (fs.existsSync(postcssPathCjs)) {
      const content = fs.readFileSync(postcssPathCjs, "utf-8");
      if (content.includes("autoprefixer")) missing["autoprefixer"] = "^10.4.0";
      if (content.includes("cssnano")) missing["cssnano"] = "^6.0.0";
    }
  } catch {}
  return missing;
}

function pruneDevDependencies(repoDir: string): void {
  const pkgPath = path.join(repoDir, "package.json");
  if (!fs.existsSync(pkgPath)) return;

  try {
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(raw);

    const backupPath = path.join(repoDir, "package.json.bak");
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, raw, "utf-8");
    }

    if (pkg.devDependencies && typeof pkg.devDependencies === "object") {
      const pruned: Record<string, string> = {};
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        if (!NON_ESSENTIAL_PATTERNS.some(pattern => pattern.test(name))) {
          pruned[name] = version as string;
        }
      }
      pkg.devDependencies = pruned;
    }

    const missingDeps = detectMissingBuildDeps(repoDir);
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, version] of Object.entries(missingDeps)) {
      if (!allDeps[name]) {
        if (!pkg.devDependencies) pkg.devDependencies = {};
        pkg.devDependencies[name] = version;
      }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  } catch {}
}

export function getCompilationStatus(runId: string): CompilationStatus {
  const entry = runningCompilations.get(runId);
  if (!entry) {
    return { status: "idle" };
  }
  return { ...entry.status };
}

export function startCompilation(runId: string, repoDir: string): CompilationStatus {
  const existing = runningCompilations.get(runId);
  if (existing && (existing.status.status === "installing" || existing.status.status === "compiling")) {
    return { ...existing.status };
  }

  if (!fs.existsSync(repoDir)) {
    return { status: "failed", error: "Repository directory not found" };
  }

  pruneDevDependencies(repoDir);
  ensureEntryScript(repoDir);

  const entry: CompilationEntry = {
    status: { status: "installing", progress: "Installing dependencies..." },
    process: null,
    timeout: null,
  };
  runningCompilations.set(runId, entry);

  const outputLines: string[] = [];

  const buildEnv = { ...process.env };
  delete buildEnv.NODE_ENV;
  const child = spawn("sh", ["-c", "npm install --prefer-offline --no-audit --no-fund && npx vite build --mode production"], {
    cwd: repoDir,
    env: buildEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });

  entry.process = child;

  entry.timeout = setTimeout(() => {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      entry.status = {
        status: "failed",
        error: "Compilation timed out after 5 minutes",
      };
      entry.process = null;
      entry.timeout = null;
    }
  }, COMPILATION_TIMEOUT_MS);

  child.stdout?.on("data", (data: Buffer) => {
    const text = data.toString().trim();
    if (text) {
      outputLines.push(text);
      const lastLine = text.split("\n").pop() || "";
      if (entry.status.status === "installing" && lastLine.includes("vite")) {
        entry.status = { status: "compiling", progress: lastLine.slice(0, 200) };
      } else {
        entry.status = { ...entry.status, progress: lastLine.slice(0, 200) };
      }
    }
  });

  child.stderr?.on("data", (data: Buffer) => {
    const text = data.toString().trim();
    if (text) {
      outputLines.push(text);
      if (text.toLowerCase().includes("vite") || text.toLowerCase().includes("build")) {
        entry.status = { status: "compiling", progress: text.split("\n").pop()?.slice(0, 200) };
      }
    }
  });

  child.on("close", (code) => {
    if (entry.timeout) {
      clearTimeout(entry.timeout);
      entry.timeout = null;
    }
    entry.process = null;

    if (code === 0) {
      const distDir = path.join(repoDir, "dist");
      if (fs.existsSync(distDir)) {
        entry.status = { status: "ready", progress: "Build completed successfully" };
      } else {
        entry.status = {
          status: "failed",
          error: "Build completed but dist/ directory was not created",
        };
      }
    } else {
      const lastLines = outputLines.slice(-10).join("\n");
      entry.status = {
        status: "failed",
        error: `Build failed with exit code ${code}:\n${lastLines}`.slice(0, 1000),
      };
    }
  });

  child.on("error", (err) => {
    if (entry.timeout) {
      clearTimeout(entry.timeout);
      entry.timeout = null;
    }
    entry.process = null;
    entry.status = {
      status: "failed",
      error: `Failed to start build process: ${err.message}`,
    };
  });

  return { ...entry.status };
}
