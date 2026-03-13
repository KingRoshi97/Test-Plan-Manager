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

const COMPILATION_TIMEOUT_MS = 8 * 60 * 1000;

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

function ensureTsconfigNode(repoDir: string): void {
  const tsconfigPath = path.join(repoDir, "tsconfig.json");
  const tsconfigNodePath = path.join(repoDir, "tsconfig.node.json");
  if (fs.existsSync(tsconfigNodePath)) return;

  try {
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
      const refs = tsconfig.references || [];
      const needsNodeConfig = refs.some((r: any) => r.path === "./tsconfig.node.json");
      if (needsNodeConfig) {
        const nodeConfig = {
          compilerOptions: {
            composite: true,
            skipLibCheck: true,
            module: "ESNext",
            moduleResolution: "bundler",
            allowSyntheticDefaultImports: true,
          },
          include: ["vite.config.ts", "vite.config.js", "postcss.config.js", "tailwind.config.ts", "tailwind.config.js"],
        };
        fs.writeFileSync(tsconfigNodePath, JSON.stringify(nodeConfig, null, 2) + "\n", "utf-8");
      }
    }
  } catch {}
}

function relaxTsconfig(repoDir: string): void {
  const tsconfigPath = path.join(repoDir, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return;

  try {
    const raw = fs.readFileSync(tsconfigPath, "utf-8");
    const tsconfig = JSON.parse(raw);

    const backupPath = path.join(repoDir, "tsconfig.json.bak");
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, raw, "utf-8");
    }

    if (tsconfig.compilerOptions) {
      tsconfig.compilerOptions.noUnusedLocals = false;
      tsconfig.compilerOptions.noUnusedParameters = false;
      tsconfig.compilerOptions.skipLibCheck = true;
    }

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n", "utf-8");
  } catch {}
}

function detectMissingBuildDeps(repoDir: string): Record<string, string> {
  const missing: Record<string, string> = {};
  try {
    const configFiles = ["postcss.config.js", "postcss.config.cjs", "postcss.config.mjs"];
    for (const configFile of configFiles) {
      const configPath = path.join(repoDir, configFile);
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf-8");
        if (content.includes("autoprefixer")) missing["autoprefixer"] = "^10.4.0";
        if (content.includes("cssnano")) missing["cssnano"] = "^6.0.0";
      }
    }

    const globalsPath = path.join(repoDir, "src", "styles", "globals.css");
    const indexCssPath = path.join(repoDir, "src", "index.css");
    for (const cssPath of [globalsPath, indexCssPath]) {
      if (fs.existsSync(cssPath)) {
        const content = fs.readFileSync(cssPath, "utf-8");
        if (content.includes("@tailwind") || content.includes("@apply")) {
          missing["tailwindcss"] = "^3.4.0";
          missing["postcss"] = "^8.4.0";
          missing["autoprefixer"] = "^10.4.0";
        }
      }
    }

    const tailwindConfigs = ["tailwind.config.ts", "tailwind.config.js", "tailwind.config.cjs"];
    for (const tc of tailwindConfigs) {
      if (fs.existsSync(path.join(repoDir, tc))) {
        missing["tailwindcss"] = "^3.4.0";
        missing["postcss"] = "^8.4.0";
        missing["autoprefixer"] = "^10.4.0";
        break;
      }
    }

    const viteConfigs = ["vite.config.ts", "vite.config.js"];
    for (const vc of viteConfigs) {
      const vcPath = path.join(repoDir, vc);
      if (fs.existsSync(vcPath)) {
        const content = fs.readFileSync(vcPath, "utf-8");
        if (content.includes("@vitejs/plugin-react")) {
          missing["@vitejs/plugin-react"] = "^4.2.0";
        }
        missing["vite"] = "^5.0.0";
        break;
      }
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

    const FRONTEND_KEEP = new Set([
      "react", "react-dom", "react-router-dom", "react-hook-form",
      "@tanstack/react-query", "@tanstack/react-table",
      "axios", "clsx", "class-variance-authority", "tailwind-merge",
      "lucide-react", "date-fns", "zod", "zustand", "jotai", "framer-motion",
      "uuid", "@radix-ui", "cmdk", "sonner", "vaul", "recharts",
      "@hookform/resolvers", "embla-carousel-react",
    ]);
    const isFrontendPkg = (name: string) => {
      if (FRONTEND_KEEP.has(name)) return true;
      for (const prefix of FRONTEND_KEEP) {
        if (name.startsWith(prefix + "/")) return true;
      }
      if (name.startsWith("@radix-ui/")) return true;
      return false;
    };
    if (pkg.dependencies) {
      const kept: Record<string, string> = {};
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        if (isFrontendPkg(name)) {
          kept[name] = version as string;
        }
      }
      pkg.dependencies = kept;
    }

    if (pkg.devDependencies) {
      const serverTypes = [
        "@types/express", "@types/cors", "@types/compression",
        "@types/jsonwebtoken", "@types/bcryptjs", "@types/morgan",
        "@types/node",
      ];
      for (const st of serverTypes) {
        delete pkg.devDependencies[st];
      }
      const nonBuildDev = ["nodemon", "ts-node"];
      for (const nbd of nonBuildDev) {
        delete pkg.devDependencies[nbd];
      }
    }

    const nonEssentialScripts = ["prepare", "postinstall", "preinstall", "lint", "lint:fix", "format", "format:check", "type-check", "server", "server:dev", "test", "test:coverage", "test:e2e"];
    if (pkg.scripts) {
      for (const s of nonEssentialScripts) {
        delete pkg.scripts[s];
      }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  } catch {}
}

function patchViteConfig(repoDir: string): void {
  const viteConfigs = ["vite.config.ts", "vite.config.js"];
  for (const vc of viteConfigs) {
    const vcPath = path.join(repoDir, vc);
    if (!fs.existsSync(vcPath)) continue;

    try {
      const content = fs.readFileSync(vcPath, "utf-8");

      const backupPath = vcPath + ".bak";
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, content, "utf-8");
      }

      const aliasBlock: Record<string, string> = {};
      const aliasRegex = /['"]([@~]\w*(?:\/\w+)*)['"]\s*:\s*path\.resolve\(__dirname,\s*['"](.+?)['"]\)/g;
      let aliasMatch;
      while ((aliasMatch = aliasRegex.exec(content)) !== null) {
        aliasBlock[aliasMatch[1]] = aliasMatch[2];
      }
      if (!aliasBlock["@"] && content.includes("'@'") && content.includes("./src")) {
        aliasBlock["@"] = "./src";
      }

      const hasReact = content.includes("plugin-react") || content.includes("@vitejs/plugin-react");

      let newConfig = `import { defineConfig } from 'vite';\n`;
      if (hasReact) {
        newConfig += `import react from '@vitejs/plugin-react';\n`;
      }
      if (Object.keys(aliasBlock).length > 0) {
        newConfig += `import path from 'path';\n`;
      }
      newConfig += `\nexport default defineConfig({\n`;
      if (hasReact) {
        newConfig += `  plugins: [react()],\n`;
      }
      if (Object.keys(aliasBlock).length > 0) {
        newConfig += `  resolve: {\n    alias: {\n`;
        for (const [alias, target] of Object.entries(aliasBlock)) {
          newConfig += `      '${alias}': path.resolve(__dirname, '${target}'),\n`;
        }
        newConfig += `    },\n  },\n`;
      }
      newConfig += `  base: './',\n`;
      newConfig += `  build: {\n    outDir: 'dist',\n    sourcemap: false,\n    chunkSizeWarningLimit: 2000,\n  },\n`;
      newConfig += `});\n`;

      fs.writeFileSync(vcPath, newConfig, "utf-8");
    } catch {}
    break;
  }
}

function removeServerImports(repoDir: string): void {
  const srcDir = path.join(repoDir, "src");
  if (!fs.existsSync(srcDir)) return;

  try {
    const serverDir = path.join(srcDir, "server");
    if (fs.existsSync(serverDir)) {
      const files = getAllTsFiles(serverDir);
      for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const stubbed = content.replace(/import .+ from ['"](?:express|mongoose|jsonwebtoken|bcryptjs|cors|helmet|compression|winston|morgan|ioredis|pino|dotenv|node-cron)['"];?/g, "// [preview-stub] server import removed");
        if (stubbed !== content) {
          fs.writeFileSync(file, stubbed, "utf-8");
        }
      }
    }
  } catch {}
}

function fixEmptyStubs(repoDir: string): void {
  const srcDir = path.join(repoDir, "src");
  if (!fs.existsSync(srcDir)) return;

  try {
    const allFiles = getAllTsFiles(srcDir);
    const exportMap = new Map<string, Set<string>>();

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const trimmed = content.trim();
      const isStub = trimmed === "export {};" || (trimmed.startsWith("//") && content.includes("export {};") && content.split("\n").length <= 6);
      if (isStub) {
        const imports = findImportersOf(file, allFiles, repoDir);
        for (const { importerPath, exportNames } of imports) {
          if (!exportMap.has(file)) exportMap.set(file, new Set());
          exportNames.forEach((n: string) => exportMap.get(file)!.add(n));
        }
      }
    }

    for (const [stubFile, neededExports] of exportMap.entries()) {
      const stubs: string[] = [];
      neededExports.forEach((name: string) => {
        if (name === "default") {
          stubs.push(`const _default = () => null;\nexport default _default;`);
        } else {
          stubs.push(`export const ${name} = (...args: any[]): any => { return args.length > 1 ? args.join(" ") : args[0] ?? ""; };`);
        }
      });
      if (stubs.length > 0) {
        fs.writeFileSync(stubFile, stubs.join("\n") + "\n", "utf-8");
      }
    }
  } catch {}
}

function findImportersOf(targetFile: string, allFiles: string[], repoDir: string): Array<{ importerPath: string; exportNames: string[] }> {
  const results: Array<{ importerPath: string; exportNames: string[] }> = [];
  const targetRel = path.relative(repoDir, targetFile).replace(/\\/g, "/").replace(/\.(tsx?|jsx?)$/, "");
  const targetAlias = targetRel.replace(/^src\//, "@/");

  for (const file of allFiles) {
    if (file === targetFile) continue;
    try {
      const content = fs.readFileSync(file, "utf-8");
      const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[2];
        if (importPath === targetAlias || importPath.endsWith("/" + path.basename(targetFile).replace(/\.(tsx?|jsx?)$/, ""))) {
          const names = match[1].split(",").map((n: string) => n.trim().split(" as ")[0].trim()).filter(Boolean);
          results.push({ importerPath: file, exportNames: names });
        }
      }
    } catch {}
  }
  return results;
}

function getAllTsFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "dist") {
        results.push(...getAllTsFiles(fullPath));
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
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

  console.log(`[COMPILE] Starting compilation for ${runId} at ${repoDir}`);
  try { pruneDevDependencies(repoDir); console.log(`[COMPILE] pruneDevDependencies done`); } catch (e: any) { console.error(`[COMPILE] pruneDevDependencies error: ${e.message}`); }
  try { ensureEntryScript(repoDir); } catch (e: any) { console.error(`[COMPILE] ensureEntryScript error: ${e.message}`); }
  try { ensureTsconfigNode(repoDir); } catch (e: any) { console.error(`[COMPILE] ensureTsconfigNode error: ${e.message}`); }
  try { relaxTsconfig(repoDir); } catch (e: any) { console.error(`[COMPILE] relaxTsconfig error: ${e.message}`); }
  try { patchViteConfig(repoDir); } catch (e: any) { console.error(`[COMPILE] patchViteConfig error: ${e.message}`); }
  try { removeServerImports(repoDir); } catch (e: any) { console.error(`[COMPILE] removeServerImports error: ${e.message}`); }
  try { fixEmptyStubs(repoDir); console.log(`[COMPILE] fixEmptyStubs done`); } catch (e: any) { console.error(`[COMPILE] fixEmptyStubs error: ${e.message}`); }

  const entry: CompilationEntry = {
    status: { status: "installing", progress: "Preparing project for compilation..." },
    process: null,
    timeout: null,
  };
  runningCompilations.set(runId, entry);

  const outputLines: string[] = [];

  const buildEnv = { ...process.env };
  delete buildEnv.NODE_ENV;

  const buildCmd = [
    "npm install --prefer-offline --no-audit --no-fund --legacy-peer-deps 2>&1",
    "npx vite build --mode production 2>&1",
  ].join(" && ");

  const child = spawn("sh", ["-c", buildCmd], {
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
        error: "Compilation timed out after 8 minutes",
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
      if (lastLine.toLowerCase().includes("vite") || lastLine.toLowerCase().includes("build") || lastLine.includes("dist/")) {
        entry.status = { status: "compiling", progress: lastLine.slice(0, 200) };
      } else if (entry.status.status === "installing") {
        entry.status = { ...entry.status, progress: lastLine.slice(0, 200) };
      }
    }
  });

  child.stderr?.on("data", (data: Buffer) => {
    const text = data.toString().trim();
    if (text) {
      outputLines.push(text);
      const lastLine = text.split("\n").pop() || "";
      if (lastLine.toLowerCase().includes("vite") || lastLine.toLowerCase().includes("build") || lastLine.includes("dist/")) {
        entry.status = { status: "compiling", progress: lastLine.slice(0, 200) };
      }
    }
  });

  child.on("close", (code) => {
    if (entry.timeout) {
      clearTimeout(entry.timeout);
      entry.timeout = null;
    }
    entry.process = null;

    console.log(`[COMPILE] Process exited with code ${code} for ${runId}`);
    if (code === 0) {
      const distDir = path.join(repoDir, "dist");
      if (fs.existsSync(distDir)) {
        console.log(`[COMPILE] Build successful — dist/ exists for ${runId}`);
        entry.status = { status: "ready", progress: "Build completed successfully" };
      } else {
        console.log(`[COMPILE] Build exited 0 but no dist/ for ${runId}`);
        entry.status = {
          status: "failed",
          error: "Build completed but dist/ directory was not created",
        };
      }
    } else {
      const lastLines = outputLines.slice(-20).join("\n");
      console.log(`[COMPILE] Build failed for ${runId}: ${lastLines.slice(0, 300)}`);
      entry.status = {
        status: "failed",
        error: `Build failed with exit code ${code}:\n${lastLines}`.slice(0, 2000),
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
