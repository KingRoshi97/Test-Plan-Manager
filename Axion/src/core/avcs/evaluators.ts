import * as fs from "fs";
import * as path from "path";
import type {
  CertificationDomain,
  CertificationFinding,
  DomainResult,
  DomainCheck,
  FindingSeverity,
  FindingImpact,
  FindingStatus,
  CoverageState,
} from "./types.js";

export interface EvaluatorContext {
  certRunId: string;
  buildDir: string;
  planFiles?: string[];
  blueprintFeatures?: string[];
  findingIdGenerator: () => string;
}

export interface EvaluatorOutput {
  result: DomainResult;
  findings: CertificationFinding[];
}

function makeFinding(
  ctx: EvaluatorContext,
  domain: CertificationDomain,
  severity: FindingSeverity,
  impact: FindingImpact,
  title: string,
  description: string,
  affectedSurface: string,
  affectedFiles: string[],
  probableCause: string,
  remediation: string,
  evidenceRefs: string[] = [],
): CertificationFinding {
  return {
    id: ctx.findingIdGenerator(),
    cert_run_id: ctx.certRunId,
    domain,
    severity,
    impact,
    title,
    description,
    affected_surface: affectedSurface,
    affected_files: affectedFiles,
    probable_cause: probableCause,
    evidence_refs: evidenceRefs,
    remediation,
    status: "open" as FindingStatus,
    created_at: new Date().toISOString(),
  };
}

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readFileContent(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function isValidJson(filePath: string): boolean {
  const content = readFileContent(filePath);
  if (!content) return false;
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

function listFilesRecursive(dir: string, base?: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const root = base ?? dir;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        results.push(...listFilesRecursive(fullPath, root));
      } else {
        results.push(path.relative(root, fullPath));
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results;
}

function computeDomainResult(
  domain: CertificationDomain,
  checks: DomainCheck[],
  findingsCount: number,
): DomainResult {
  const failCount = checks.filter(c => c.result === "fail").length;
  const warnCount = checks.filter(c => c.result === "warn").length;
  const passCount = checks.filter(c => c.result === "pass").length;
  const total = checks.filter(c => c.result !== "skip").length;

  let score = 100;
  if (total > 0) {
    score = Math.round(((passCount + warnCount * 0.5) / total) * 100);
  }

  let status: DomainResult["status"] = "pass";
  if (failCount > 0) status = "fail";
  else if (warnCount > 0) status = "warn";

  let coverageState: CoverageState = "covered";
  if (failCount > 0) coverageState = "failed";
  else if (warnCount > 0) coverageState = "partially_covered";

  return {
    domain,
    status,
    checks,
    findings_count: findingsCount,
    coverage_state: coverageState,
    score,
    evidence_refs: [],
  };
}

export function evaluateBuildIntegrity(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;

  const artifactExists = fs.existsSync(targetDir);
  let artifactReadable = false;
  if (artifactExists) {
    try {
      fs.accessSync(targetDir, fs.constants.R_OK);
      artifactReadable = true;
    } catch { /* not readable */ }
  }
  checks.push({
    check_id: "BI-01",
    test_id: "BI-01",
    description: "Artifact location exists and is readable",
    result: artifactExists && artifactReadable ? "pass" : "fail",
    detail: !artifactExists ? "Build artifact directory does not exist" : !artifactReadable ? "Build artifact directory is not readable" : undefined,
    affected_files: !artifactExists ? [targetDir] : undefined,
  });
  if (!artifactExists || !artifactReadable) {
    findings.push(makeFinding(ctx, "build_integrity", "critical", "release_blocker",
      "Build artifact location missing or unreadable",
      !artifactExists ? "Build artifact directory does not exist" : "Build artifact directory exists but is not readable",
      "artifact_location", [targetDir],
      "Build process did not create or left an inaccessible artifact directory",
      "Ensure the build process creates a readable output directory"));
  }

  const pkgPath = path.join(targetDir, "package.json");
  const pkgExists = fileExists(pkgPath);
  const pkgValid = pkgExists && isValidJson(pkgPath);
  const tsconfigPath = path.join(targetDir, "tsconfig.json");
  const tsconfigExists = fileExists(tsconfigPath);

  checks.push({
    check_id: "BI-02-pkg",
    test_id: "BI-02",
    description: "package.json exists and is valid JSON",
    result: pkgValid ? "pass" : "fail",
    detail: !pkgExists ? "package.json not found" : !pkgValid ? "package.json is not valid JSON" : undefined,
    affected_files: pkgValid ? undefined : ["package.json"],
  });
  if (!pkgValid) {
    findings.push(makeFinding(ctx, "build_integrity", "critical", "release_blocker",
      "Missing or invalid package.json",
      pkgExists ? "package.json exists but contains invalid JSON" : "package.json not found in build output",
      "project_config", ["package.json"],
      pkgExists ? "Malformed JSON in package.json" : "Build process did not generate package.json",
      "Ensure package.json is generated with valid JSON content"));
  }

  checks.push({
    check_id: "BI-02-tsconfig",
    test_id: "BI-02",
    description: "tsconfig.json exists",
    result: tsconfigExists ? "pass" : "fail",
    detail: tsconfigExists ? undefined : "tsconfig.json not found",
    affected_files: tsconfigExists ? undefined : ["tsconfig.json"],
  });
  if (!tsconfigExists) {
    findings.push(makeFinding(ctx, "build_integrity", "high", "conditional_blocker",
      "Missing tsconfig.json",
      "TypeScript configuration file not found in build output",
      "project_config", ["tsconfig.json"],
      "Build process did not generate tsconfig.json",
      "Add tsconfig.json with appropriate TypeScript compiler options"));
  }

  const configFiles = [
    { name: "vite.config.ts", alt: "vite.config.js" },
    { name: "tailwind.config.ts", alt: "tailwind.config.js" },
    { name: "postcss.config.js", alt: "postcss.config.cjs" },
    { name: "index.html", alt: null },
  ];
  for (const cfg of configFiles) {
    const exists = fileExists(path.join(targetDir, cfg.name)) ||
      (cfg.alt ? fileExists(path.join(targetDir, cfg.alt)) : false);
    checks.push({
      check_id: `BI-02-${cfg.name.replace(/[^a-z0-9]/gi, "_")}`,
      test_id: "BI-02",
      description: `Config file present: ${cfg.name}`,
      result: exists ? "pass" : "warn",
      detail: exists ? undefined : `${cfg.name} not found${cfg.alt ? ` (also checked ${cfg.alt})` : ""}`,
      affected_files: exists ? undefined : [cfg.name],
    });
    if (!exists) {
      findings.push(makeFinding(ctx, "build_integrity", "medium", "warning",
        `Missing config file: ${cfg.name}`,
        `Required configuration file ${cfg.name} not found in build output`,
        "project_config", [cfg.name],
        "Build process did not generate this config file",
        `Generate ${cfg.name} with appropriate project configuration`));
    }
  }

  const envTemplateExists = fileExists(path.join(targetDir, ".env.example")) ||
    fileExists(path.join(targetDir, ".env.template")) ||
    fileExists(path.join(targetDir, ".env.sample"));
  checks.push({
    check_id: "BI-03",
    test_id: "BI-03",
    description: "Environment contract exists (.env.example or template)",
    result: envTemplateExists ? "pass" : "warn",
    detail: envTemplateExists ? undefined : "No .env.example, .env.template, or .env.sample found",
    affected_files: envTemplateExists ? undefined : [".env.example"],
  });
  if (!envTemplateExists) {
    findings.push(makeFinding(ctx, "build_integrity", "low", "observation",
      "No environment contract file",
      "No .env.example or .env.template found for environment variable documentation",
      "project_config", [".env.example"],
      "Environment contract was not included in build output",
      "Add .env.example listing required environment variables with placeholder values"));
  }

  const pkgContent = readFileContent(pkgPath);
  let hasStartScript = false;
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      hasStartScript = !!(pkg.scripts?.start || pkg.scripts?.dev || pkg.scripts?.build);
    } catch { /* invalid JSON */ }
  }
  const entryPoints = [
    { paths: ["src/main.tsx", "src/main.ts", "src/index.tsx", "src/index.ts", "src/App.tsx"], label: "Frontend entry" },
    { paths: ["src/server/index.ts", "server/index.ts", "src/server.ts"], label: "Server entry" },
  ];
  const hasEntryPoint = entryPoints.some(ep => ep.paths.some(p => fileExists(path.join(targetDir, p))));

  checks.push({
    check_id: "BI-04",
    test_id: "BI-04",
    description: "Startup script declared in package.json",
    result: hasStartScript && hasEntryPoint ? "pass" : hasStartScript || hasEntryPoint ? "warn" : "fail",
    detail: !hasStartScript && !hasEntryPoint
      ? "No startup script in package.json and no entry point found"
      : !hasStartScript
        ? "No start/dev/build script in package.json"
        : !hasEntryPoint
          ? "Startup script exists but no entry point file found"
          : undefined,
  });
  if (!hasStartScript) {
    findings.push(makeFinding(ctx, "build_integrity", "high", "conditional_blocker",
      "No startup script declared",
      "package.json does not define start, dev, or build scripts",
      "startup_config", ["package.json"],
      "Build process did not generate startup scripts",
      "Add start/dev/build scripts to package.json"));
  }

  for (const ep of entryPoints) {
    const found = ep.paths.find(p => fileExists(path.join(targetDir, p)));
    checks.push({
      check_id: `BI-04-${ep.label.replace(/\s+/g, "_").toLowerCase()}`,
      test_id: "BI-04",
      description: `Entry point exists: ${ep.label}`,
      result: found ? "pass" : "fail",
      detail: found ? `Found: ${found}` : `None of ${ep.paths.join(", ")} found`,
      affected_files: found ? undefined : ep.paths,
    });
    if (!found) {
      findings.push(makeFinding(ctx, "build_integrity", "critical", "release_blocker",
        `Missing entry point: ${ep.label}`,
        `No entry point found. Checked: ${ep.paths.join(", ")}`,
        "entry_points", ep.paths,
        "Build process did not generate the application entry point",
        `Create the ${ep.label.toLowerCase()} file (e.g., ${ep.paths[0]})`));
    }
  }

  if (ctx.planFiles && ctx.planFiles.length > 0) {
    const missingDirs = new Set<string>();
    for (const pf of ctx.planFiles) {
      const dir = path.dirname(pf);
      if (dir !== "." && !fs.existsSync(path.join(targetDir, dir))) {
        missingDirs.add(dir);
      }
    }
    const missingDirsList = Array.from(missingDirs);
    checks.push({
      check_id: "BI-01-dirs",
      test_id: "BI-01",
      description: "Critical directories from build plan exist",
      result: missingDirsList.length === 0 ? "pass" : "warn",
      detail: missingDirsList.length > 0 ? `Missing directories: ${missingDirsList.slice(0, 5).join(", ")}` : undefined,
      affected_files: missingDirsList.length > 0 ? missingDirsList : undefined,
    });
    if (missingDirsList.length > 0) {
      findings.push(makeFinding(ctx, "build_integrity", "medium", "warning",
        `Missing ${missingDirsList.length} directories from build plan`,
        `Directories expected by build plan are missing: ${missingDirsList.slice(0, 10).join(", ")}`,
        "directory_structure", missingDirsList,
        "Build process did not create all planned directory structures",
        "Ensure all planned directories are created during the build process"));
    }
  }

  return { result: computeDomainResult("build_integrity", checks, findings.length), findings };
}

export function evaluateFunctional(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;

  if (ctx.planFiles && ctx.planFiles.length > 0) {
    const missingFiles: string[] = [];
    for (const pf of ctx.planFiles) {
      if (!fileExists(path.join(targetDir, pf))) {
        missingFiles.push(pf);
      }
    }
    const missingPct = ctx.planFiles.length > 0 ? Math.round((missingFiles.length / ctx.planFiles.length) * 100) : 0;
    const severity: FindingSeverity = missingPct > 50 ? "critical" : missingPct > 20 ? "high" : missingPct > 0 ? "medium" : "info";
    checks.push({
      check_id: "FUNC-01-files",
      test_id: "FUNC-01",
      description: "All planned files exist on disk",
      result: missingFiles.length === 0 ? "pass" : missingPct > 50 ? "fail" : "warn",
      detail: missingFiles.length > 0 ? `${missingFiles.length}/${ctx.planFiles.length} planned files missing (${missingPct}%)` : "All planned files present",
      affected_files: missingFiles.length > 0 ? missingFiles.slice(0, 20) : undefined,
    });
    if (missingFiles.length > 0) {
      findings.push(makeFinding(ctx, "functional", severity,
        missingPct > 50 ? "release_blocker" : missingPct > 20 ? "conditional_blocker" : "warning",
        `${missingFiles.length} planned files missing (${missingPct}%)`,
        `The following planned files were not generated: ${missingFiles.slice(0, 10).join(", ")}${missingFiles.length > 10 ? ` and ${missingFiles.length - 10} more` : ""}`,
        "planned_files", missingFiles,
        "Build generation did not produce all files specified in the build plan",
        "Re-run generation for the missing files or update the build plan"));
    }
  } else {
    checks.push({
      check_id: "FUNC-01-files",
      test_id: "FUNC-01",
      description: "All planned files exist on disk",
      result: "skip",
      detail: "No plan files provided for comparison",
    });
  }

  const allFiles = listFilesRecursive(targetDir);
  const zeroByteFiles = allFiles.filter(f => {
    try {
      const stat = fs.statSync(path.join(targetDir, f));
      return stat.size === 0;
    } catch { return false; }
  });
  checks.push({
    check_id: "FUNC-03-zerobyte",
    test_id: "FUNC-03",
    description: "No zero-byte generated files",
    result: zeroByteFiles.length === 0 ? "pass" : "warn",
    detail: zeroByteFiles.length > 0 ? `${zeroByteFiles.length} zero-byte files found` : undefined,
    affected_files: zeroByteFiles.length > 0 ? zeroByteFiles.slice(0, 20) : undefined,
  });
  if (zeroByteFiles.length > 0) {
    findings.push(makeFinding(ctx, "functional", "medium", "warning",
      `${zeroByteFiles.length} zero-byte files detected`,
      `Empty files found: ${zeroByteFiles.slice(0, 10).join(", ")}`,
      "file_content", zeroByteFiles,
      "Build generation produced empty files that likely should have content",
      "Regenerate the empty files to include proper implementation"));
  }

  const sourceFiles = allFiles.filter(f =>
    f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")
  );

  const highTodoFiles: string[] = [];
  const moderateTodoFiles: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    const todoMatches = content.match(/TODO|FIXME|HACK|XXX/gi);
    const todoCount = todoMatches ? todoMatches.length : 0;
    if (todoCount > 10) {
      highTodoFiles.push(f);
    } else if (todoCount > 3) {
      moderateTodoFiles.push(f);
    }
  }
  const allTodoFiles = [...highTodoFiles, ...moderateTodoFiles];
  checks.push({
    check_id: "FUNC-04-todos",
    test_id: "FUNC-04",
    description: "Placeholder/TODO density within acceptable limits",
    result: highTodoFiles.length > 0 ? "fail" : moderateTodoFiles.length > 0 ? "warn" : "pass",
    detail: allTodoFiles.length > 0 ? `${highTodoFiles.length} files with >10 TODOs, ${moderateTodoFiles.length} with >3 TODOs` : undefined,
    affected_files: allTodoFiles.length > 0 ? allTodoFiles.slice(0, 20) : undefined,
  });
  if (highTodoFiles.length > 0) {
    findings.push(makeFinding(ctx, "functional", "high", "conditional_blocker",
      `${highTodoFiles.length} files have excessive TODOs (>10 each)`,
      `Files with very high placeholder density: ${highTodoFiles.slice(0, 5).join(", ")}`,
      "code_completeness", highTodoFiles,
      "Generated code contains too many TODO/FIXME markers indicating incomplete implementation",
      "Replace TODO markers with actual implementation code"));
  }
  if (moderateTodoFiles.length > 0) {
    findings.push(makeFinding(ctx, "functional", "medium", "warning",
      `${moderateTodoFiles.length} files have elevated TODOs (>3 each)`,
      `Files with moderate placeholder density: ${moderateTodoFiles.slice(0, 5).join(", ")}`,
      "code_completeness", moderateTodoFiles,
      "Generated code contains several TODO/FIXME markers",
      "Review and resolve TODO markers before deployment"));
  }

  const brokenImports: string[] = [];
  const importPattern = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (!importPath) continue;
      if (!importPath.startsWith(".") && !importPath.startsWith("/")) continue;
      const fileDir = path.dirname(path.join(targetDir, f));
      const resolved = path.resolve(fileDir, importPath);
      const extensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"];
      const found = extensions.some(ext => fileExists(resolved + ext));
      if (!found) {
        brokenImports.push(f);
        break;
      }
    }
  }
  checks.push({
    check_id: "FUNC-02-imports",
    test_id: "FUNC-02",
    description: "Import resolution (no broken local imports)",
    result: brokenImports.length === 0 ? "pass" : brokenImports.length > 5 ? "fail" : "warn",
    detail: brokenImports.length > 0 ? `${brokenImports.length} files with unresolvable imports` : undefined,
    affected_files: brokenImports.length > 0 ? brokenImports.slice(0, 20) : undefined,
  });
  if (brokenImports.length > 0) {
    findings.push(makeFinding(ctx, "functional",
      brokenImports.length > 5 ? "high" : "medium",
      brokenImports.length > 5 ? "conditional_blocker" : "warning",
      `${brokenImports.length} files have broken import paths`,
      `Files importing non-existent local modules: ${brokenImports.slice(0, 5).join(", ")}`,
      "import_resolution", brokenImports,
      "Generated files reference modules that were not created or have incorrect paths",
      "Fix import paths to reference existing modules or generate the missing modules"));
  }

  const routeFiles = sourceFiles.filter(f =>
    f.includes("route") || f.includes("page") || f.includes("endpoint") || f.includes("api/")
  );
  const nonEmptyRouteFiles = routeFiles.filter(f => {
    const content = readFileContent(path.join(targetDir, f));
    return content && content.length > 50;
  });
  checks.push({
    check_id: "FUNC-02-routes",
    test_id: "FUNC-02",
    description: "Route/endpoint files have substantive content",
    result: routeFiles.length === 0 ? "skip" :
      nonEmptyRouteFiles.length === routeFiles.length ? "pass" : "warn",
    detail: routeFiles.length > 0 && nonEmptyRouteFiles.length < routeFiles.length
      ? `${routeFiles.length - nonEmptyRouteFiles.length} route files appear empty or minimal`
      : undefined,
    affected_files: routeFiles.length > nonEmptyRouteFiles.length
      ? routeFiles.filter(f => !nonEmptyRouteFiles.includes(f))
      : undefined,
  });

  return { result: computeDomainResult("functional", checks, findings.length), findings };
}

export function evaluateSecurity(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;
  const allFiles = listFilesRecursive(targetDir);
  const sourceFiles = allFiles.filter(f =>
    f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")
  );

  const secretPattern = /['"](?:sk-|pk-|api[_-]?key|password|secret|token|auth)['"]\s*[:=]/i;
  const hardcodedSecretPattern = /(?:apiKey|api_key|password|secret|token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{8,}['"]/i;
  const filesWithSecrets: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    if (secretPattern.test(content) || hardcodedSecretPattern.test(content)) {
      if (!f.includes(".example") && !f.includes(".sample") && !f.includes(".test") && !f.includes(".spec")) {
        filesWithSecrets.push(f);
      }
    }
  }
  checks.push({
    check_id: "SEC-02-secrets",
    test_id: "SEC-02",
    description: "No hardcoded secrets or API keys",
    result: filesWithSecrets.length === 0 ? "pass" : "fail",
    detail: filesWithSecrets.length > 0 ? `${filesWithSecrets.length} files contain potential hardcoded secrets` : undefined,
    affected_files: filesWithSecrets.length > 0 ? filesWithSecrets : undefined,
  });
  if (filesWithSecrets.length > 0) {
    findings.push(makeFinding(ctx, "security", "critical", "release_blocker",
      `Hardcoded secrets detected in ${filesWithSecrets.length} files`,
      `Potential secrets/API keys found in: ${filesWithSecrets.slice(0, 5).join(", ")}`,
      "secrets", filesWithSecrets,
      "Generated code contains hardcoded credentials instead of environment variable references",
      "Replace hardcoded secrets with environment variable references (process.env.*)"));
  }

  const dangerousPatterns = /\b(eval|Function)\s*\(/;
  const filesWithDangerousCode: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    if (dangerousPatterns.test(content)) {
      filesWithDangerousCode.push(f);
    }
  }
  checks.push({
    check_id: "SEC-05-eval",
    test_id: "SEC-05",
    description: "No eval(), Function(), or dangerous dynamic code",
    result: filesWithDangerousCode.length === 0 ? "pass" : "fail",
    detail: filesWithDangerousCode.length > 0 ? `${filesWithDangerousCode.length} files use eval/Function` : undefined,
    affected_files: filesWithDangerousCode.length > 0 ? filesWithDangerousCode : undefined,
  });
  if (filesWithDangerousCode.length > 0) {
    findings.push(makeFinding(ctx, "security", "high", "conditional_blocker",
      `Dangerous dynamic code execution in ${filesWithDangerousCode.length} files`,
      `Files using eval() or Function(): ${filesWithDangerousCode.slice(0, 5).join(", ")}`,
      "dynamic_code", filesWithDangerousCode,
      "Generated code uses eval() or Function() which enables code injection attacks",
      "Replace eval/Function with safe alternatives (JSON.parse, structured data processing)"));
  }

  const hasRbac = ctx.blueprintFeatures?.some(f =>
    f.toLowerCase().includes("rbac") || f.toLowerCase().includes("auth") || f.toLowerCase().includes("role")
  );
  if (hasRbac) {
    const authFiles = sourceFiles.filter(f =>
      f.includes("auth") || f.includes("guard") || f.includes("middleware") || f.includes("protect")
    );
    checks.push({
      check_id: "SEC-03-auth",
      test_id: "SEC-03",
      description: "Auth guard/middleware present (RBAC in blueprint)",
      result: authFiles.length > 0 ? "pass" : "fail",
      detail: authFiles.length > 0 ? `Found auth files: ${authFiles.slice(0, 3).join(", ")}` : "No auth guard/middleware files found despite RBAC in blueprint",
      affected_files: authFiles.length === 0 ? ["src/middleware/auth.ts"] : undefined,
    });
    if (authFiles.length === 0) {
      findings.push(makeFinding(ctx, "security", "high", "conditional_blocker",
        "Missing auth guard/middleware for RBAC",
        "Blueprint specifies RBAC but no auth middleware or guard files were generated",
        "authentication", ["src/middleware/auth.ts"],
        "Build generation did not create authentication/authorization middleware despite RBAC being required",
        "Generate auth middleware with role-based access control checks"));
    }
  } else {
    checks.push({
      check_id: "SEC-03-auth",
      test_id: "SEC-03",
      description: "Auth guard/middleware present (RBAC in blueprint)",
      result: "skip",
      detail: "RBAC not specified in blueprint",
    });
  }

  const serverFiles = sourceFiles.filter(f =>
    f.includes("server") || f.includes("api/") || f.includes("routes")
  );
  const corsPresent = serverFiles.some(f => {
    const content = readFileContent(path.join(targetDir, f));
    return content ? /cors/i.test(content) : false;
  });
  checks.push({
    check_id: "SEC-05-cors",
    test_id: "SEC-05",
    description: "CORS configuration present",
    result: serverFiles.length === 0 ? "skip" : corsPresent ? "pass" : "warn",
    detail: !corsPresent && serverFiles.length > 0 ? "No CORS configuration found in server files" : undefined,
    affected_files: !corsPresent && serverFiles.length > 0 ? serverFiles.slice(0, 3) : undefined,
  });
  if (!corsPresent && serverFiles.length > 0) {
    findings.push(makeFinding(ctx, "security", "medium", "warning",
      "Missing CORS configuration",
      "No CORS setup found in server files which may cause cross-origin request issues",
      "cors", serverFiles.slice(0, 3),
      "Server code does not configure CORS headers",
      "Add CORS middleware with appropriate origin whitelist configuration"));
  }

  const routeHandlerFiles = serverFiles.filter(f =>
    f.includes("route") || f.includes("handler") || f.includes("controller")
  );
  const validationPresent = routeHandlerFiles.some(f => {
    const content = readFileContent(path.join(targetDir, f));
    return content ? /(?:zod|joi|yup|validate|schema\.parse|\.safeParse)/i.test(content) : false;
  });
  checks.push({
    check_id: "SEC-05-validation",
    test_id: "SEC-05",
    description: "Input validation in route handlers",
    result: routeHandlerFiles.length === 0 ? "skip" : validationPresent ? "pass" : "warn",
    detail: !validationPresent && routeHandlerFiles.length > 0 ? "No input validation library usage found in route handlers" : undefined,
    affected_files: !validationPresent && routeHandlerFiles.length > 0 ? routeHandlerFiles.slice(0, 5) : undefined,
  });
  if (!validationPresent && routeHandlerFiles.length > 0) {
    findings.push(makeFinding(ctx, "security", "medium", "warning",
      "No input validation in route handlers",
      "Route handler files don't appear to use input validation (zod/joi/yup)",
      "input_validation", routeHandlerFiles.slice(0, 5),
      "Generated route handlers accept input without validation",
      "Add input validation using zod, joi, or yup for all route handler inputs"));
  }

  const sensitiveLogPattern = /console\.log\s*\(.*(?:password|secret|token|key|credential|auth)/i;
  const filesWithSensitiveLogs: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    if (sensitiveLogPattern.test(content)) {
      filesWithSensitiveLogs.push(f);
    }
  }
  checks.push({
    check_id: "SEC-02-logging",
    test_id: "SEC-02",
    description: "No console.log of sensitive data patterns",
    result: filesWithSensitiveLogs.length === 0 ? "pass" : "warn",
    detail: filesWithSensitiveLogs.length > 0 ? `${filesWithSensitiveLogs.length} files log potentially sensitive data` : undefined,
    affected_files: filesWithSensitiveLogs.length > 0 ? filesWithSensitiveLogs : undefined,
  });
  if (filesWithSensitiveLogs.length > 0) {
    findings.push(makeFinding(ctx, "security", "medium", "warning",
      `Sensitive data logging in ${filesWithSensitiveLogs.length} files`,
      `Files that may log sensitive information: ${filesWithSensitiveLogs.slice(0, 5).join(", ")}`,
      "logging", filesWithSensitiveLogs,
      "Generated code logs potentially sensitive data (passwords, tokens, keys) to console",
      "Remove or redact sensitive data from console.log statements"));
  }

  const gitignorePath = path.join(targetDir, ".gitignore");
  const gitignoreContent = readFileContent(gitignorePath);
  const envIgnored = gitignoreContent ? /\.env(?:\s|$)/m.test(gitignoreContent) : false;
  checks.push({
    check_id: "SEC-02-gitignore",
    test_id: "SEC-02",
    description: ".env not committed (check .gitignore)",
    result: !gitignoreContent ? "warn" : envIgnored ? "pass" : "warn",
    detail: !gitignoreContent ? "No .gitignore found" : !envIgnored ? ".env not listed in .gitignore" : undefined,
    affected_files: !envIgnored ? [".gitignore"] : undefined,
  });
  if (!envIgnored) {
    findings.push(makeFinding(ctx, "security", "high", "conditional_blocker",
      ".env file not in .gitignore",
      gitignoreContent ? ".gitignore exists but does not exclude .env files" : "No .gitignore file found",
      "env_exposure", [".gitignore"],
      "Missing .gitignore entry for .env could lead to secret exposure in version control",
      "Add .env to .gitignore to prevent committing environment secrets"));
  }

  return { result: computeDomainResult("security", checks, findings.length), findings };
}

export function evaluatePerformance(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;
  const allFiles = listFilesRecursive(targetDir);
  const sourceFiles = allFiles.filter(f =>
    f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")
  );

  const routeFiles = sourceFiles.filter(f =>
    f.includes("page") || f.includes("route") || (f.includes("views/") && (f.endsWith(".tsx") || f.endsWith(".jsx")))
  );
  const lazyLoadPresent = routeFiles.some(f => {
    const content = readFileContent(path.join(targetDir, f));
    return content ? /(?:React\.lazy|lazy\s*\(|import\s*\()/i.test(content) : false;
  }) || sourceFiles.some(f => {
    if (!f.includes("App") && !f.includes("router") && !f.includes("Router")) return false;
    const content = readFileContent(path.join(targetDir, f));
    return content ? /(?:React\.lazy|lazy\s*\(|import\s*\()/i.test(content) : false;
  });
  checks.push({
    check_id: "PERF-01-lazy",
    test_id: "PERF-01",
    description: "Lazy loading patterns for routes",
    result: routeFiles.length === 0 ? "skip" : lazyLoadPresent ? "pass" : "warn",
    detail: !lazyLoadPresent && routeFiles.length > 0 ? "No lazy loading or dynamic imports found for route components" : undefined,
    affected_files: !lazyLoadPresent && routeFiles.length > 0 ? routeFiles.slice(0, 5) : undefined,
  });
  if (!lazyLoadPresent && routeFiles.length > 0) {
    findings.push(makeFinding(ctx, "performance", "low", "observation",
      "No lazy loading for route components",
      "Route components are not using React.lazy or dynamic imports for code splitting",
      "code_splitting", routeFiles.slice(0, 5),
      "All route components are eagerly loaded which increases initial bundle size",
      "Use React.lazy() and dynamic import() for route-level code splitting"));
  }

  const indexFiles = sourceFiles.filter(f => path.basename(f) === "index.ts" || path.basename(f) === "index.tsx");
  const barrelReexportFiles: string[] = [];
  for (const f of indexFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    const exportMatches = content.match(/export\s+/g);
    if (exportMatches && exportMatches.length > 20) {
      barrelReexportFiles.push(f);
    }
  }
  checks.push({
    check_id: "PERF-02-barrel",
    test_id: "PERF-02",
    description: "No barrel re-exports with >20 exports",
    result: barrelReexportFiles.length === 0 ? "pass" : "warn",
    detail: barrelReexportFiles.length > 0 ? `${barrelReexportFiles.length} index files with >20 re-exports` : undefined,
    affected_files: barrelReexportFiles.length > 0 ? barrelReexportFiles : undefined,
  });
  if (barrelReexportFiles.length > 0) {
    findings.push(makeFinding(ctx, "performance", "medium", "warning",
      `${barrelReexportFiles.length} barrel files with excessive re-exports`,
      `Index files with >20 re-exports that may cause bundle bloat: ${barrelReexportFiles.join(", ")}`,
      "bundle_size", barrelReexportFiles,
      "Barrel exports import and re-export many modules which can prevent tree-shaking",
      "Use direct imports instead of barrel re-exports, or split into smaller barrel files"));
  }

  const oversizedFiles: string[] = [];
  const veryOversizedFiles: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    const lineCount = content.split("\n").length;
    if (lineCount > 1000) {
      veryOversizedFiles.push(f);
    } else if (lineCount > 500) {
      oversizedFiles.push(f);
    }
  }
  checks.push({
    check_id: "PERF-03-filesize",
    test_id: "PERF-03",
    description: "Individual file size within budget (warn >500, high >1000 lines)",
    result: veryOversizedFiles.length > 0 ? "fail" : oversizedFiles.length > 0 ? "warn" : "pass",
    detail: (veryOversizedFiles.length + oversizedFiles.length) > 0
      ? `${veryOversizedFiles.length} files >1000 lines, ${oversizedFiles.length} files >500 lines`
      : undefined,
    affected_files: [...veryOversizedFiles, ...oversizedFiles].length > 0
      ? [...veryOversizedFiles, ...oversizedFiles].slice(0, 20)
      : undefined,
  });
  if (veryOversizedFiles.length > 0) {
    findings.push(makeFinding(ctx, "performance", "high", "conditional_blocker",
      `${veryOversizedFiles.length} files exceed 1000 lines`,
      `Very large files: ${veryOversizedFiles.slice(0, 5).join(", ")}`,
      "file_size", veryOversizedFiles,
      "Generated files are excessively large which impacts maintainability and load times",
      "Split large files into smaller, focused modules following single responsibility principle"));
  }
  if (oversizedFiles.length > 0) {
    findings.push(makeFinding(ctx, "performance", "medium", "warning",
      `${oversizedFiles.length} files exceed 500 lines`,
      `Large files: ${oversizedFiles.slice(0, 5).join(", ")}`,
      "file_size", oversizedFiles,
      "Generated files are larger than recommended which may impact maintainability",
      "Consider splitting files >500 lines into smaller, focused modules"));
  }

  if (ctx.planFiles) {
    const actualCount = allFiles.length;
    const plannedCount = ctx.planFiles.length;
    const drift = plannedCount > 0 ? Math.abs(actualCount - plannedCount) / plannedCount : 0;
    checks.push({
      check_id: "PERF-03-drift",
      test_id: "PERF-03",
      description: "File count vs plan (drift detection)",
      result: drift < 0.1 ? "pass" : drift < 0.3 ? "warn" : "fail",
      detail: `Planned: ${plannedCount}, Actual: ${actualCount} (${Math.round(drift * 100)}% drift)`,
    });
    if (drift >= 0.3) {
      findings.push(makeFinding(ctx, "performance", "medium", "warning",
        `Significant file count drift (${Math.round(drift * 100)}%)`,
        `Planned ${plannedCount} files but found ${actualCount} files (${Math.round(drift * 100)}% drift)`,
        "file_drift", [],
        "Build output contains significantly more or fewer files than planned",
        "Review the build plan and reconcile the file count discrepancy"));
    }
  } else {
    checks.push({
      check_id: "PERF-03-drift",
      test_id: "PERF-03",
      description: "File count vs plan (drift detection)",
      result: "skip",
      detail: "No plan files provided for comparison",
    });
  }

  const serverSourceFiles = sourceFiles.filter(f =>
    f.includes("server") || f.includes("api/") || f.includes("backend")
  );
  const syncIoPattern = /(?:readFileSync|writeFileSync|appendFileSync|mkdirSync|rmdirSync|unlinkSync|existsSync)\s*\(/;
  const filesWithSyncIo: string[] = [];
  for (const f of serverSourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    if (syncIoPattern.test(content)) {
      filesWithSyncIo.push(f);
    }
  }
  checks.push({
    check_id: "PERF-03-syncio",
    test_id: "PERF-03",
    description: "No synchronous file I/O in server files",
    result: filesWithSyncIo.length === 0 ? "pass" : "warn",
    detail: filesWithSyncIo.length > 0 ? `${filesWithSyncIo.length} server files use synchronous I/O` : undefined,
    affected_files: filesWithSyncIo.length > 0 ? filesWithSyncIo : undefined,
  });
  if (filesWithSyncIo.length > 0) {
    findings.push(makeFinding(ctx, "performance", "medium", "warning",
      `Synchronous I/O in ${filesWithSyncIo.length} server files`,
      `Server files using blocking I/O operations: ${filesWithSyncIo.slice(0, 5).join(", ")}`,
      "sync_io", filesWithSyncIo,
      "Synchronous file operations block the event loop and degrade server performance",
      "Replace synchronous I/O (readFileSync, writeFileSync) with async equivalents (readFile, writeFile)"));
  }

  return { result: computeDomainResult("performance", checks, findings.length), findings };
}

export function evaluateDeploymentReadiness(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;

  const envContractFiles = [".env.example", ".env.template", ".env.sample", "env.contract.json", ".env.schema.json"];
  const foundEnvContract = envContractFiles.find(f => fileExists(path.join(targetDir, f)));

  const allFiles = listFilesRecursive(targetDir);
  const sourceFiles = allFiles.filter(f =>
    f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")
  );

  const envVarUsages = new Set<string>();
  const envVarPattern = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    let match;
    while ((match = envVarPattern.exec(content)) !== null) {
      envVarUsages.add(match[1]);
    }
  }

  let envContractVars = new Set<string>();
  if (foundEnvContract) {
    const contractContent = readFileContent(path.join(targetDir, foundEnvContract));
    if (contractContent) {
      if (foundEnvContract.endsWith(".json")) {
        try {
          const parsed = JSON.parse(contractContent);
          if (Array.isArray(parsed)) {
            parsed.forEach((v: any) => envContractVars.add(v.name || v));
          } else if (typeof parsed === "object") {
            Object.keys(parsed).forEach(k => envContractVars.add(k));
          }
        } catch { /* not valid JSON */ }
      } else {
        const lines = contractContent.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const varName = trimmed.split("=")[0]?.trim();
            if (varName) envContractVars.add(varName);
          }
        }
      }
    }
  }

  const undocumentedVars = Array.from(envVarUsages).filter(v =>
    !envContractVars.has(v) && !["NODE_ENV", "PORT", "HOST"].includes(v)
  );

  checks.push({
    check_id: "DEP-01",
    test_id: "DEP-01",
    description: "Environment variables declared in contract",
    result: !foundEnvContract ? "fail" : undocumentedVars.length === 0 ? "pass" : undocumentedVars.length <= 3 ? "warn" : "fail",
    detail: !foundEnvContract
      ? "No environment contract file found"
      : undocumentedVars.length > 0
        ? `${undocumentedVars.length} env vars used in code but not in contract: ${undocumentedVars.slice(0, 5).join(", ")}`
        : `${envVarUsages.size} env vars documented in ${foundEnvContract}`,
    affected_files: !foundEnvContract ? envContractFiles : undocumentedVars.length > 0 ? [foundEnvContract] : undefined,
  });
  if (!foundEnvContract) {
    findings.push(makeFinding(ctx, "deployment_readiness", "high", "conditional_blocker",
      "No environment contract file",
      "No .env.example, .env.template, or env.contract.json found to document required environment variables",
      "env_contract", envContractFiles,
      "Build did not include an environment variable contract",
      "Add .env.example or env.contract.json listing all required environment variables"));
  } else if (undocumentedVars.length > 3) {
    findings.push(makeFinding(ctx, "deployment_readiness", "medium", "warning",
      `${undocumentedVars.length} undocumented environment variables`,
      `Environment variables used in code but not in contract: ${undocumentedVars.join(", ")}`,
      "env_contract", [foundEnvContract],
      "Code references environment variables not listed in the contract file",
      "Add missing variables to the environment contract file"));
  }

  const pkgPath = path.join(targetDir, "package.json");
  const pkgContent = readFileContent(pkgPath);
  let hasStartScript = false;
  let hasDevScript = false;
  let startupScriptName = "";
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      hasStartScript = !!pkg.scripts?.start;
      hasDevScript = !!pkg.scripts?.dev;
      startupScriptName = hasStartScript ? "start" : hasDevScript ? "dev" : "";
    } catch { /* invalid */ }
  }

  const entryPaths = [
    "src/main.tsx", "src/main.ts", "src/index.tsx", "src/index.ts",
    "src/server/index.ts", "server/index.ts", "src/server.ts", "index.ts", "index.js",
  ];
  const foundEntry = entryPaths.find(p => fileExists(path.join(targetDir, p)));

  checks.push({
    check_id: "DEP-02",
    test_id: "DEP-02",
    description: "Startup path works (script + entry point)",
    result: (hasStartScript || hasDevScript) && foundEntry ? "pass"
      : (hasStartScript || hasDevScript) || foundEntry ? "warn"
        : "fail",
    detail: !(hasStartScript || hasDevScript) && !foundEntry
      ? "No startup script and no entry point found"
      : !(hasStartScript || hasDevScript)
        ? `Entry point found (${foundEntry}) but no start/dev script in package.json`
        : !foundEntry
          ? `Script '${startupScriptName}' exists but no entry point file found`
          : `Startup: npm run ${startupScriptName}, entry: ${foundEntry}`,
  });
  if (!(hasStartScript || hasDevScript)) {
    findings.push(makeFinding(ctx, "deployment_readiness", "high", "conditional_blocker",
      "No startup script in package.json",
      "Neither 'start' nor 'dev' script defined in package.json",
      "startup_path", ["package.json"],
      "Build did not generate startup scripts",
      "Add start or dev script to package.json scripts"));
  }
  if (!foundEntry) {
    findings.push(makeFinding(ctx, "deployment_readiness", "high", "conditional_blocker",
      "No application entry point found",
      `Checked: ${entryPaths.join(", ")}`,
      "startup_path", entryPaths,
      "Build did not generate an application entry point file",
      "Create an entry point file (e.g., src/main.tsx or server/index.ts)"));
  }

  const healthPatterns = [
    /app\.(get|use)\s*\(\s*['"]\/health['"z]?/,
    /app\.(get|use)\s*\(\s*['"]\/api\/health['"]/,
    /router\.(get|use)\s*\(\s*['"]\/health['"z]?/,
    /['"]\/health['"]|['"]\/healthz['"]|['"]\/api\/health['"]/,
  ];

  const serverFiles = sourceFiles.filter(f =>
    f.includes("server") || f.includes("api/") || f.includes("routes") || f.includes("app")
  );

  let healthEndpointFound = false;
  let healthFile = "";
  for (const f of serverFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (!content) continue;
    if (healthPatterns.some(p => p.test(content))) {
      healthEndpointFound = true;
      healthFile = f;
      break;
    }
  }

  checks.push({
    check_id: "DEP-03",
    test_id: "DEP-03",
    description: "Health endpoint exists (/health, /healthz, /api/health)",
    result: healthEndpointFound ? "pass" : "warn",
    detail: healthEndpointFound
      ? `Health endpoint found in ${healthFile}`
      : "No health/readiness endpoint detected in server files",
    affected_files: healthEndpointFound ? undefined : serverFiles.slice(0, 3),
  });
  if (!healthEndpointFound && serverFiles.length > 0) {
    findings.push(makeFinding(ctx, "deployment_readiness", "medium", "warning",
      "No health endpoint detected",
      "No /health, /healthz, or /api/health endpoint found in server files",
      "health_endpoint", serverFiles.slice(0, 3),
      "Server does not expose a health check endpoint for deployment monitoring",
      "Add a /health or /healthz endpoint that returns 200 OK when the service is ready"));
  }

  return { result: computeDomainResult("deployment_readiness", checks, findings.length), findings };
}

export function evaluateUI(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;
  const allFiles = listFilesRecursive(targetDir);
  const uiFiles = allFiles.filter(f =>
    f.endsWith(".tsx") || f.endsWith(".jsx") || f.endsWith(".css") || f.endsWith(".scss")
  );
  const componentFiles = uiFiles.filter(f => f.endsWith(".tsx") || f.endsWith(".jsx"));

  const hasStyleSystem = allFiles.some(f =>
    f.includes("tailwind") || f.includes("globals.css") || f.includes("theme") || f.includes("styles")
  );
  checks.push({
    check_id: "UI-01-style-system",
    test_id: "UI-01",
    description: "Style system present (CSS/Tailwind/theme)",
    result: hasStyleSystem ? "pass" : "warn",
    detail: hasStyleSystem ? undefined : "No style system (tailwind config, globals.css, or theme) detected",
  });
  if (!hasStyleSystem) {
    findings.push(makeFinding(ctx, "ui", "medium", "warning",
      "No style system detected",
      "No tailwind config, globals.css, or theme directory found — UI consistency may be compromised",
      "style_system", [],
      "Build did not include a centralized style system",
      "Add a CSS framework (e.g., Tailwind) or global stylesheet for consistent UI"));
  }

  const layoutFiles = componentFiles.filter(f =>
    f.includes("layout") || f.includes("Layout") || f.includes("shell") || f.includes("Shell")
  );
  checks.push({
    check_id: "UI-01-layout",
    test_id: "UI-01",
    description: "Layout/shell component exists",
    result: layoutFiles.length > 0 ? "pass" : "warn",
    detail: layoutFiles.length > 0 ? `Found: ${layoutFiles.slice(0, 3).join(", ")}` : "No layout or shell component found",
    affected_files: layoutFiles.length === 0 ? ["src/components/Layout.tsx"] : undefined,
  });

  const responsivePatterns = /(?:@media|useMediaQuery|breakpoint|responsive|sm:|md:|lg:|xl:)/;
  let responsiveCount = 0;
  for (const f of uiFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && responsivePatterns.test(content)) responsiveCount++;
  }
  const responsiveRatio = uiFiles.length > 0 ? responsiveCount / uiFiles.length : 0;
  checks.push({
    check_id: "UI-02-responsive",
    test_id: "UI-02",
    description: "Responsive patterns present in UI files",
    result: uiFiles.length === 0 ? "skip" : responsiveRatio > 0.1 ? "pass" : responsiveRatio > 0 ? "warn" : "fail",
    detail: uiFiles.length > 0 ? `${responsiveCount}/${uiFiles.length} UI files use responsive patterns (${Math.round(responsiveRatio * 100)}%)` : undefined,
  });
  if (responsiveRatio === 0 && uiFiles.length > 0) {
    findings.push(makeFinding(ctx, "ui", "medium", "warning",
      "No responsive design patterns detected",
      "No @media queries, breakpoint utilities, or responsive class patterns found in UI files",
      "responsive_design", uiFiles.slice(0, 5),
      "Generated UI code does not include responsive layout patterns",
      "Add responsive breakpoints using media queries or utility classes (sm:/md:/lg:)"));
  }

  return { result: computeDomainResult("ui", checks, findings.length), findings };
}

export function evaluateUX(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;
  const allFiles = listFilesRecursive(targetDir);
  const componentFiles = allFiles.filter(f => f.endsWith(".tsx") || f.endsWith(".jsx"));

  const loadingStatePattern = /(?:loading|isLoading|Spinner|Skeleton|Loading|CircularProgress)/;
  const filesWithLoading: string[] = [];
  for (const f of componentFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && loadingStatePattern.test(content)) filesWithLoading.push(f);
  }
  checks.push({
    check_id: "UX-01-loading",
    test_id: "UX-01",
    description: "Loading states present in components",
    result: componentFiles.length === 0 ? "skip" : filesWithLoading.length > 0 ? "pass" : "warn",
    detail: filesWithLoading.length > 0 ? `${filesWithLoading.length} components handle loading states` : "No loading state patterns found",
  });

  const errorBoundaryPattern = /(?:ErrorBoundary|error[Bb]oundary|onError|isError|ErrorFallback|catch\s*\()/;
  const filesWithErrorHandling: string[] = [];
  for (const f of componentFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && errorBoundaryPattern.test(content)) filesWithErrorHandling.push(f);
  }
  checks.push({
    check_id: "UX-02-error-recovery",
    test_id: "UX-02",
    description: "Error recovery patterns in components",
    result: componentFiles.length === 0 ? "skip" : filesWithErrorHandling.length > 0 ? "pass" : "warn",
    detail: filesWithErrorHandling.length > 0 ? `${filesWithErrorHandling.length} components have error handling` : "No error boundary or error handling patterns found",
  });
  if (filesWithErrorHandling.length === 0 && componentFiles.length > 0) {
    findings.push(makeFinding(ctx, "ux", "medium", "warning",
      "No error recovery patterns detected",
      "No ErrorBoundary, error fallback, or error handling patterns found in components",
      "error_recovery", componentFiles.slice(0, 5),
      "Generated components do not include error recovery paths",
      "Add ErrorBoundary components and error state handling for user-facing flows"));
  }

  const emptyStatePattern = /(?:empty|no[- ]?results|no[- ]?data|no[- ]?items|EmptyState|placeholder)/i;
  const filesWithEmptyState: string[] = [];
  for (const f of componentFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && emptyStatePattern.test(content)) filesWithEmptyState.push(f);
  }
  checks.push({
    check_id: "UX-03-empty-state",
    test_id: "UX-03",
    description: "Empty state handling in list/data components",
    result: componentFiles.length === 0 ? "skip" : filesWithEmptyState.length > 0 ? "pass" : "warn",
    detail: filesWithEmptyState.length > 0 ? `${filesWithEmptyState.length} components handle empty states` : "No empty state patterns found",
  });

  return { result: computeDomainResult("ux", checks, findings.length), findings };
}

export function evaluateAccessibility(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;
  const allFiles = listFilesRecursive(targetDir);
  const componentFiles = allFiles.filter(f => f.endsWith(".tsx") || f.endsWith(".jsx"));

  const ariaPattern = /(?:aria-|role=|tabIndex|onKeyDown|onKeyPress|onKeyUp)/;
  const filesWithAria: string[] = [];
  for (const f of componentFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && ariaPattern.test(content)) filesWithAria.push(f);
  }
  const ariaRatio = componentFiles.length > 0 ? filesWithAria.length / componentFiles.length : 0;
  checks.push({
    check_id: "ACC-01-keyboard",
    test_id: "ACC-01",
    description: "Keyboard navigation support (aria/role/tabIndex/key handlers)",
    result: componentFiles.length === 0 ? "skip" : ariaRatio > 0.1 ? "pass" : filesWithAria.length > 0 ? "warn" : "fail",
    detail: `${filesWithAria.length}/${componentFiles.length} components use aria/keyboard attributes (${Math.round(ariaRatio * 100)}%)`,
    affected_files: filesWithAria.length === 0 ? componentFiles.slice(0, 5) : undefined,
  });
  if (filesWithAria.length === 0 && componentFiles.length > 0) {
    findings.push(makeFinding(ctx, "accessibility", "high", "conditional_blocker",
      "No keyboard navigation support detected",
      "No aria attributes, role attributes, tabIndex, or keyboard event handlers found in any components",
      "keyboard_nav", componentFiles.slice(0, 10),
      "Generated components lack keyboard navigation support",
      "Add aria-label, role, tabIndex, and keyboard event handlers to interactive elements"));
  }

  const focusPattern = /(?:focus-visible|:focus|outline|focus-ring|FocusTrap)/;
  let focusCount = 0;
  for (const f of componentFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && focusPattern.test(content)) focusCount++;
  }
  const cssFiles = allFiles.filter(f => f.endsWith(".css") || f.endsWith(".scss"));
  for (const f of cssFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && focusPattern.test(content)) focusCount++;
  }
  checks.push({
    check_id: "ACC-02-focus",
    test_id: "ACC-02",
    description: "Focus visibility styles present",
    result: componentFiles.length === 0 ? "skip" : focusCount > 0 ? "pass" : "warn",
    detail: focusCount > 0 ? `${focusCount} files include focus visibility styles` : "No focus-visible or outline styles detected",
  });

  const labelPattern = /(?:htmlFor=|<label|aria-label=|aria-labelledby=|aria-describedby=)/;
  const formFiles = componentFiles.filter(f => {
    const content = readFileContent(path.join(targetDir, f));
    return content ? /<(?:input|select|textarea|Input|Select|Textarea)/i.test(content) : false;
  });
  const labeledFormFiles = formFiles.filter(f => {
    const content = readFileContent(path.join(targetDir, f));
    return content ? labelPattern.test(content) : false;
  });
  checks.push({
    check_id: "ACC-03-labels",
    test_id: "ACC-03",
    description: "Form controls have accessible labels",
    result: formFiles.length === 0 ? "skip" : labeledFormFiles.length === formFiles.length ? "pass" : labeledFormFiles.length > 0 ? "warn" : "fail",
    detail: formFiles.length > 0 ? `${labeledFormFiles.length}/${formFiles.length} form files have accessible labels` : "No form controls found",
    affected_files: formFiles.length > labeledFormFiles.length ? formFiles.filter(f => !labeledFormFiles.includes(f)).slice(0, 10) : undefined,
  });
  if (formFiles.length > 0 && labeledFormFiles.length < formFiles.length) {
    const unlabeledCount = formFiles.length - labeledFormFiles.length;
    findings.push(makeFinding(ctx, "accessibility",
      unlabeledCount > formFiles.length / 2 ? "high" : "medium",
      unlabeledCount > formFiles.length / 2 ? "conditional_blocker" : "warning",
      `${unlabeledCount} form files missing accessible labels`,
      `Form controls without htmlFor, aria-label, or aria-labelledby in ${unlabeledCount} files`,
      "accessible_labels", formFiles.filter(f => !labeledFormFiles.includes(f)),
      "Generated form components lack accessible labels for screen readers",
      "Add htmlFor, aria-label, or aria-labelledby to all form controls"));
  }

  const contrastPattern = /(?:contrast|a11y|wcag|color.*theme|dark.*mode|theme.*color)/i;
  const hasContrastAwareness = allFiles.some(f => {
    const content = readFileContent(path.join(targetDir, f));
    return content ? contrastPattern.test(content) : false;
  });
  checks.push({
    check_id: "ACC-04-contrast",
    test_id: "ACC-04",
    description: "Color contrast awareness (theme/contrast/a11y references)",
    result: componentFiles.length === 0 ? "skip" : hasContrastAwareness ? "pass" : "warn",
    detail: hasContrastAwareness ? "Color contrast or accessibility-aware theming detected" : "No contrast or a11y-aware theming patterns found",
  });

  return { result: computeDomainResult("accessibility", checks, findings.length), findings };
}

export function evaluateEnterprise(ctx: EvaluatorContext): EvaluatorOutput {
  const checks: DomainCheck[] = [];
  const findings: CertificationFinding[] = [];
  const repoDir = path.join(ctx.buildDir, "repo");
  const targetDir = fs.existsSync(repoDir) ? repoDir : ctx.buildDir;
  const allFiles = listFilesRecursive(targetDir);
  const sourceFiles = allFiles.filter(f =>
    f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")
  );

  const auditPattern = /(?:audit[Ll]og|auditTrail|createAuditEntry|logAction|actionLog|activity[Ll]og)/;
  const filesWithAudit: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && auditPattern.test(content)) filesWithAudit.push(f);
  }
  checks.push({
    check_id: "ENT-01-audit",
    test_id: "ENT-01",
    description: "Audit trail implementation present",
    result: filesWithAudit.length > 0 ? "pass" : "warn",
    detail: filesWithAudit.length > 0 ? `Audit logging found in: ${filesWithAudit.slice(0, 3).join(", ")}` : "No audit trail implementation detected",
    affected_files: filesWithAudit.length === 0 ? ["src/services/audit.ts"] : undefined,
  });

  const structuredLogPattern = /(?:winston|pino|bunyan|structuredLog|logger\.|log\.info|log\.error|log\.warn|createLogger)/;
  const filesWithStructuredLogging: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && structuredLogPattern.test(content)) filesWithStructuredLogging.push(f);
  }
  const consoleLogCount = sourceFiles.reduce((sum, f) => {
    const content = readFileContent(path.join(targetDir, f));
    return sum + (content ? (content.match(/console\.(log|warn|error)/g) || []).length : 0);
  }, 0);
  checks.push({
    check_id: "ENT-02-logging",
    test_id: "ENT-02",
    description: "Structured logging (vs raw console.log)",
    result: filesWithStructuredLogging.length > 0 ? "pass" : consoleLogCount > 20 ? "fail" : "warn",
    detail: filesWithStructuredLogging.length > 0
      ? `Structured logging in ${filesWithStructuredLogging.length} files`
      : `No structured logger; ${consoleLogCount} raw console.log calls found`,
  });
  if (filesWithStructuredLogging.length === 0 && consoleLogCount > 20) {
    findings.push(makeFinding(ctx, "enterprise", "medium", "warning",
      `${consoleLogCount} unstructured console.log calls, no structured logger`,
      "Application uses raw console.log instead of a structured logging library (winston/pino/bunyan)",
      "structured_logging", sourceFiles.filter(f => {
        const c = readFileContent(path.join(targetDir, f));
        return c ? /console\.(log|warn|error)/.test(c) : false;
      }).slice(0, 10),
      "Generated code uses unstructured console output instead of a proper logging framework",
      "Add a structured logger (e.g., pino or winston) and replace console.log calls"));
  }

  const observabilityPattern = /(?:healthCheck|metrics|prometheus|opentelemetry|otel|tracing|Histogram|Counter|Gauge)/;
  const filesWithObservability: string[] = [];
  for (const f of sourceFiles) {
    const content = readFileContent(path.join(targetDir, f));
    if (content && observabilityPattern.test(content)) filesWithObservability.push(f);
  }
  checks.push({
    check_id: "ENT-03-observability",
    test_id: "ENT-03",
    description: "Observability signals (metrics/tracing/health)",
    result: filesWithObservability.length > 0 ? "pass" : "warn",
    detail: filesWithObservability.length > 0 ? `Observability patterns in: ${filesWithObservability.slice(0, 3).join(", ")}` : "No metrics, tracing, or observability patterns detected",
  });

  return { result: computeDomainResult("enterprise", checks, findings.length), findings };
}
