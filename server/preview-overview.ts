import fs from "fs";
import path from "path";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface VerificationStatus {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  overallResult: string;
}

function readPackageJson(repoDir: string): Record<string, any> | null {
  const pkgPath = path.join(repoDir, "package.json");
  try {
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    }
  } catch {}
  return null;
}

function detectFramework(pkg: Record<string, any> | null): string {
  if (!pkg) return "Unknown";
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (allDeps["next"]) return "Next.js";
  if (allDeps["nuxt"]) return "Nuxt";
  if (allDeps["@angular/core"]) return "Angular";
  if (allDeps["svelte"] || allDeps["@sveltejs/kit"]) return "Svelte";
  if (allDeps["vue"]) return "Vue";
  if (allDeps["react"]) return "React";
  if (allDeps["express"]) return "Express";
  return "Node.js";
}

function detectTechStack(pkg: Record<string, any> | null): string[] {
  if (!pkg) return [];
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack: string[] = [];
  const checks: [string, string][] = [
    ["typescript", "TypeScript"],
    ["tailwindcss", "Tailwind CSS"],
    ["vite", "Vite"],
    ["webpack", "Webpack"],
    ["react", "React"],
    ["vue", "Vue"],
    ["@angular/core", "Angular"],
    ["svelte", "Svelte"],
    ["next", "Next.js"],
    ["express", "Express"],
    ["prisma", "Prisma"],
    ["drizzle-orm", "Drizzle"],
    ["mongoose", "Mongoose"],
    ["@tanstack/react-query", "React Query"],
    ["zustand", "Zustand"],
    ["redux", "Redux"],
    ["framer-motion", "Framer Motion"],
    ["three", "Three.js"],
    ["socket.io", "Socket.IO"],
    ["zod", "Zod"],
    ["eslint", "ESLint"],
    ["prettier", "Prettier"],
    ["jest", "Jest"],
    ["vitest", "Vitest"],
    ["playwright", "Playwright"],
    ["shadcn-ui", "shadcn/ui"],
    ["@radix-ui/react-slot", "Radix UI"],
    ["lucide-react", "Lucide"],
    ["wouter", "Wouter"],
    ["react-router-dom", "React Router"],
  ];
  for (const [dep, label] of checks) {
    if (allDeps[dep]) stack.push(label);
  }
  return stack;
}

function countFiles(dir: string, ignorePatterns: string[] = ["node_modules", ".git", "dist", "build"]): { files: number; dirs: number } {
  let files = 0;
  let dirs = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignorePatterns.includes(entry.name)) continue;
      if (entry.isDirectory()) {
        dirs++;
        const sub = countFiles(path.join(dir, entry.name), ignorePatterns);
        files += sub.files;
        dirs += sub.dirs;
      } else {
        files++;
      }
    }
  } catch {}
  return { files, dirs };
}

function getDirectoryStructure(dir: string, depth: number = 2, prefix: string = ""): string[] {
  const lines: string[] = [];
  const ignore = ["node_modules", ".git", "dist", "build", ".cache", ".vite"];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => !ignore.includes(e.name))
      .sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const isLast = i === entries.length - 1;
      const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
      const icon = entry.isDirectory() ? "\uD83D\uDCC1" : "\uD83D\uDCC4";
      lines.push(`${prefix}${connector}${icon} ${entry.name}`);
      if (entry.isDirectory() && depth > 1) {
        const childPrefix = prefix + (isLast ? "    " : "\u2502   ");
        const children = getDirectoryStructure(path.join(dir, entry.name), depth - 1, childPrefix);
        lines.push(...children);
      }
    }
  } catch {}
  return lines;
}

function listDirectory(dir: string): string[] {
  try {
    if (fs.existsSync(dir)) {
      return fs.readdirSync(dir).filter(f => !f.startsWith("."));
    }
  } catch {}
  return [];
}

function readVerificationReport(buildDir: string, repoDir: string): VerificationStatus | null {
  const locations = [
    path.join(buildDir, "verification_report.json"),
    path.join(repoDir, "verification_report.json"),
    path.join(buildDir, "repo", "verification_report.json"),
  ];
  for (const loc of locations) {
    try {
      if (fs.existsSync(loc)) {
        const data = JSON.parse(fs.readFileSync(loc, "utf-8"));
        const results = data.results || data.checks || data.tests || [];
        let passed = 0, failed = 0, skipped = 0;
        if (Array.isArray(results)) {
          for (const r of results) {
            const s = r.status || r.result || "";
            if (s === "passed" || s === "pass" || s === "success") passed++;
            else if (s === "failed" || s === "fail" || s === "error") failed++;
            else skipped++;
          }
        }
        return {
          passed,
          failed,
          skipped,
          total: results.length,
          overallResult: data.overall_result || data.status || (failed > 0 ? "failed" : "passed"),
        };
      }
    } catch {}
  }
  return null;
}

export function generateProjectOverview(runId: string, repoDir: string, buildDir: string): string {
  const pkg = readPackageJson(repoDir);
  const projectName = pkg?.name || runId;
  const framework = detectFramework(pkg);
  const techStack = detectTechStack(pkg);
  const counts = countFiles(repoDir);
  const dirStructure = getDirectoryStructure(repoDir, 2);
  const pages = listDirectory(path.join(repoDir, "src", "pages"));
  const components = listDirectory(path.join(repoDir, "src", "components"));
  const verification = readVerificationReport(buildDir, repoDir);

  const badgeColors: Record<string, string> = {
    "TypeScript": "#3178c6",
    "React": "#61dafb",
    "Vue": "#42b883",
    "Angular": "#dd0031",
    "Svelte": "#ff3e00",
    "Next.js": "#000000",
    "Vite": "#646cff",
    "Tailwind CSS": "#06b6d4",
    "Express": "#000000",
    "Prisma": "#2d3748",
    "Drizzle": "#c5f74f",
    "Zod": "#3068b7",
    "ESLint": "#4b32c3",
    "Wouter": "#61dafb",
  };

  const techBadgesHtml = techStack.map(tech => {
    const bg = badgeColors[tech] || "#475569";
    return `<span style="display:inline-block;padding:3px 10px;margin:2px 4px;border-radius:12px;font-size:11px;font-weight:600;background:${bg};color:#fff;letter-spacing:0.3px;">${escapeHtml(tech)}</span>`;
  }).join("");

  const dirTreeHtml = dirStructure.length > 0
    ? `<pre style="margin:0;padding:12px;background:#0f172a;border-radius:8px;font-size:12px;line-height:1.6;color:#94a3b8;overflow-x:auto;max-height:300px;">${dirStructure.map(l => escapeHtml(l)).join("\n")}</pre>`
    : `<p style="color:#64748b;font-style:italic;">No directory structure available</p>`;

  const pagesHtml = pages.length > 0
    ? pages.map(p => `<div style="padding:6px 12px;margin:2px 0;background:#0f172a;border-radius:6px;font-size:13px;color:#e2e8f0;display:flex;align-items:center;gap:8px;"><span style="color:#22d3ee;">\u25B8</span> ${escapeHtml(p)}</div>`).join("")
    : `<p style="color:#64748b;font-style:italic;font-size:13px;">No pages directory found</p>`;

  const componentsHtml = components.length > 0
    ? components.map(c => `<div style="padding:6px 12px;margin:2px 0;background:#0f172a;border-radius:6px;font-size:13px;color:#e2e8f0;display:flex;align-items:center;gap:8px;"><span style="color:#4ade80;">\u25AA</span> ${escapeHtml(c)}</div>`).join("")
    : `<p style="color:#64748b;font-style:italic;font-size:13px;">No components directory found</p>`;

  let verificationHtml = "";
  if (verification) {
    const statusColor = verification.overallResult === "passed" ? "#4ade80" : verification.overallResult === "failed" ? "#f87171" : "#fbbf24";
    const statusIcon = verification.overallResult === "passed" ? "\u2713" : verification.overallResult === "failed" ? "\u2717" : "\u26A0";
    verificationHtml = `
      <div style="margin-top:24px;">
        <h2 style="font-size:16px;font-weight:600;color:#e2e8f0;margin:0 0 12px 0;display:flex;align-items:center;gap:8px;">
          <span style="color:${statusColor};font-size:20px;">${statusIcon}</span>
          Verification Status
        </h2>
        <div style="background:#0f172a;border-radius:8px;padding:16px;border-left:3px solid ${statusColor};">
          <div style="font-size:14px;color:${statusColor};font-weight:600;margin-bottom:8px;text-transform:uppercase;">${verification.overallResult}</div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <div style="color:#4ade80;font-size:13px;">\u2713 ${verification.passed} passed</div>
            <div style="color:#f87171;font-size:13px;">\u2717 ${verification.failed} failed</div>
            <div style="color:#64748b;font-size:13px;">\u2212 ${verification.skipped} skipped</div>
            <div style="color:#94a3b8;font-size:13px;">Total: ${verification.total}</div>
          </div>
        </div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(projectName)} - Project Overview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0c1222;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 32px;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .compile-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      background: linear-gradient(135deg, #06b6d4, #22d3ee);
      color: #0c1222;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }
    .compile-btn:hover {
      background: linear-gradient(135deg, #22d3ee, #67e8f9);
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(34, 211, 238, 0.3);
    }
    .section {
      background: #1e293b;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid #334155;
    }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:linear-gradient(135deg,#06b6d4,#4ade80);border-radius:14px;margin-bottom:16px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0c1222" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
      <h1 style="font-size:28px;font-weight:700;color:#f1f5f9;margin-bottom:4px;">${escapeHtml(projectName)}</h1>
      <p style="font-size:14px;color:#64748b;">Run: ${escapeHtml(runId)}</p>
    </div>

    <div class="section">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <div>
          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Framework</span>
          <div style="font-size:20px;font-weight:700;color:#22d3ee;margin-top:2px;">${escapeHtml(framework)}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Files</span>
          <div style="font-size:20px;font-weight:700;color:#4ade80;margin-top:2px;">${counts.files}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Directories</span>
          <div style="font-size:20px;font-weight:700;color:#fbbf24;margin-top:2px;">${counts.dirs}</div>
        </div>
      </div>
      ${techBadgesHtml ? `<div style="margin-top:8px;">${techBadgesHtml}</div>` : ""}
    </div>

    <div class="section">
      <h2 style="font-size:16px;font-weight:600;color:#e2e8f0;margin-bottom:12px;">Directory Structure</h2>
      ${dirTreeHtml}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="section">
        <h2 style="font-size:16px;font-weight:600;color:#e2e8f0;margin-bottom:12px;">Pages</h2>
        <div style="max-height:250px;overflow-y:auto;">${pagesHtml}</div>
      </div>
      <div class="section">
        <h2 style="font-size:16px;font-weight:600;color:#e2e8f0;margin-bottom:12px;">Components</h2>
        <div style="max-height:250px;overflow-y:auto;">${componentsHtml}</div>
      </div>
    </div>

    ${verificationHtml}

    <div style="text-align:center;margin-top:32px;padding:24px;background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:12px;border:1px solid #334155;">
      <p style="color:#94a3b8;font-size:14px;margin-bottom:16px;">This project contains uncompiled source code. Compile it to see the live preview.</p>
      <button class="compile-btn" id="compile-btn" onclick="window.parent.postMessage({type:'axion-compile-preview'},'*')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Compile &amp; Preview
      </button>
    </div>

    <div style="text-align:center;margin-top:16px;color:#475569;font-size:11px;">
      AXION Lab OS &middot; Project Overview
    </div>
  </div>
</body>
</html>`;
}
