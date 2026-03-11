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

  const pkgPath = path.join(targetDir, "package.json");
  const pkgExists = fileExists(pkgPath);
  const pkgValid = pkgExists && isValidJson(pkgPath);
  checks.push({
    check_id: "bi-001",
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

  const tsconfigPath = path.join(targetDir, "tsconfig.json");
  const tsconfigExists = fileExists(tsconfigPath);
  checks.push({
    check_id: "bi-002",
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
      check_id: `bi-003-${cfg.name.replace(/[^a-z0-9]/gi, "_")}`,
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
    check_id: "bi-004",
    description: "Environment template present (.env.example)",
    result: envTemplateExists ? "pass" : "warn",
    detail: envTemplateExists ? undefined : "No .env.example, .env.template, or .env.sample found",
    affected_files: envTemplateExists ? undefined : [".env.example"],
  });
  if (!envTemplateExists) {
    findings.push(makeFinding(ctx, "build_integrity", "low", "observation",
      "No environment template file",
      "No .env.example or .env.template found for developer onboarding",
      "project_config", [".env.example"],
      "Environment template was not included in build output",
      "Add .env.example listing required environment variables with placeholder values"));
  }

  const entryPoints = [
    { paths: ["src/main.tsx", "src/main.ts", "src/index.tsx", "src/index.ts", "src/App.tsx"], label: "Frontend entry" },
    { paths: ["src/server/index.ts", "server/index.ts", "src/server.ts"], label: "Server entry" },
  ];
  for (const ep of entryPoints) {
    const found = ep.paths.find(p => fileExists(path.join(targetDir, p)));
    checks.push({
      check_id: `bi-005-${ep.label.replace(/\s+/g, "_").toLowerCase()}`,
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
      check_id: "bi-006",
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
      check_id: "fn-001",
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
      check_id: "fn-001",
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
    check_id: "fn-002",
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
    check_id: "fn-003",
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
    check_id: "fn-004",
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
    check_id: "fn-005",
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
    check_id: "sec-001",
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
    check_id: "sec-002",
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
      check_id: "sec-003",
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
      check_id: "sec-003",
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
    check_id: "sec-004",
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
    check_id: "sec-005",
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
    check_id: "sec-006",
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
    check_id: "sec-007",
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
    check_id: "perf-001",
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
    check_id: "perf-002",
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
    check_id: "perf-003",
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
      check_id: "perf-004",
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
      check_id: "perf-004",
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
    check_id: "perf-005",
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
