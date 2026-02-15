import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LayoutList,
  Workflow,
  FolderTree,
  FileText,
  Search,
  RefreshCw,
  ShieldCheck,
  Package,
  Layers,
  GitBranch,
  ArrowUpCircle,
  Bot,
  Sparkles,
  Lock,
  Hammer,
  Import,
  IterationCw,
  ClipboardCheck,
  Monitor,
  Play,
  FlaskConical,
  HeartPulse,
  ScrollText,
  BookOpen,
  HardDrive,
  FileArchive,
  Palette,
  Zap,
  Timer,
  WifiOff,
  Upload,
  Eye,
  Cpu,
  Shield,
  Settings,
  Gauge,
  TestTube2,
  Paintbrush,
  Wrench,
  ExternalLink,
  FileCode,
  Link2,
  ChevronRight,
} from "lucide-react";
import type { ElementType } from "react";

type FeatureSource = "system" | "dashboard";

interface Feature {
  title: string;
  description: string;
  icon: ElementType;
  tag: string;
  source: FeatureSource;
  keyFiles: string[];
  pageUrl?: string;
  pipelineSteps?: string[];
  relatedFeatures: string[];
}

const axionSystemFeatures: Feature[] = [
  {
    title: "Full Pipeline Orchestration",
    description:
      "Automated chaining of all pipeline steps from project idea to packaged Agent Kit: kit-create, seed, generate, review, draft, verify, lock, build-plan, build-exec, and package. The orchestrator reads stage plans from axion/config/presets.json and supports --plan, --steps, --start-from, --modules, --dry-run, and --list-plans flags.",
    icon: Workflow,
    tag: "Core",
    source: "system",
    keyFiles: [
      "axion/scripts/axion-orchestrate.ts",
      "axion/config/presets.json",
      "axion/config/domains.json",
    ],
    pipelineSteps: ["kit-create", "seed", "generate", "review", "draft", "verify", "lock", "build-plan", "build-exec", "package"],
    relatedFeatures: ["Gate Enforcement", "Per-Module Iteration", "Assembly Control Room"],
  },
  {
    title: "Assembly Upgrade Layers",
    description:
      "Iterative assembly upgrades via revision system. Add new ideas or critiques after initial pipeline pass, bump revision, and re-run the pipeline non-destructively to produce versioned upgrade kits. The draft and seed scripts are upgrade-aware, reading AXION_REVISION, AXION_UPGRADE_NOTES, and AXION_KIT_TYPE environment variables.",
    icon: ArrowUpCircle,
    tag: "Core",
    source: "system",
    keyFiles: [
      "axion/scripts/draft.mjs",
      "axion/scripts/seed.mjs",
      "axion/scripts/upgrade.ts",
    ],
    pipelineSteps: ["draft", "seed"],
    relatedFeatures: ["Full Pipeline Orchestration", "UNKNOWN Revision Flow"],
  },
  {
    title: "Import & Reconcile",
    description:
      "axion-import is a read-only analysis tool for existing repositories that produces import reports and documentation seeds without modifying source code. axion-reconcile then deterministically compares imported facts against build-authoritative outputs to detect drift and report mismatches.",
    icon: Import,
    tag: "Pipeline",
    source: "system",
    keyFiles: [
      "axion/scripts/import.ts",
      "axion/scripts/reconcile.ts",
    ],
    pipelineSteps: ["import", "reconcile"],
    relatedFeatures: ["Full Pipeline Orchestration", "Individual Pipeline Actions"],
  },
  {
    title: "Gate Enforcement",
    description:
      "Strict stage execution order with module dependency enforcement. Pipeline steps enforce prerequisite gates before proceeding. The orchestrator ensures that each step's prerequisites are satisfied via ensurePrereqs before allowing execution.",
    icon: Lock,
    tag: "Pipeline",
    source: "system",
    keyFiles: [
      "axion/scripts/axion-orchestrate.ts",
    ],
    pipelineSteps: ["all stages"],
    relatedFeatures: ["Full Pipeline Orchestration", "Per-Module Iteration"],
  },
  {
    title: "Per-Module Iteration",
    description:
      "Review, draft, verify, and lock steps use per-module iteration to satisfy dependency ordering. The axion-iterate script orchestrates chaining of AXION primitives, enforcing gates and producing next_commands for remediation. It operates deterministically, requiring explicit --allow-apply for changes.",
    icon: IterationCw,
    tag: "Pipeline",
    source: "system",
    keyFiles: [
      "axion/scripts/iterate.ts",
      "axion/scripts/axion-orchestrate.ts",
    ],
    pipelineSteps: ["review", "draft", "verify", "lock"],
    relatedFeatures: ["Gate Enforcement", "Full Pipeline Orchestration"],
  },
  {
    title: "Build Plan & Execution",
    description:
      "Generates a build plan from documentation artifacts, then executes it to produce a manifest and apply file operations for application scaffolding. The build-plan step analyzes docs to determine what needs to be built, and build-exec carries out the plan.",
    icon: Hammer,
    tag: "Pipeline",
    source: "system",
    keyFiles: [
      "axion/scripts/build-plan.ts",
      "axion/scripts/build-exec.ts",
      "axion/scripts/build.ts",
    ],
    pipelineSteps: ["build-plan", "build-exec"],
    relatedFeatures: ["Full Pipeline Orchestration", "Kit Packaging"],
  },
  {
    title: "Kit Packaging",
    description:
      "Package completed Agent Kits into distributable zip bundles. axion-package.mjs creates domain-based zip bundles while axion-package.ts creates workspace-scoped packages used by the dashboard routes.",
    icon: Package,
    tag: "Pipeline",
    source: "system",
    keyFiles: [
      "axion/scripts/axion-package.mjs",
      "axion/scripts/package.ts",
    ],
    pipelineSteps: ["package"],
    relatedFeatures: ["Build Plan & Execution", "Kit Export"],
  },
  {
    title: "Two-Root Architecture",
    description:
      "Strict isolation between immutable AXION system code (axion/ directory) and generated project workspaces (sibling directories at repo root). This prevents system pollution and ensures generated kits never modify the AXION engine itself.",
    icon: GitBranch,
    tag: "Architecture",
    source: "system",
    keyFiles: [
      "axion/config/domains.json",
    ],
    relatedFeatures: ["Full Pipeline Orchestration", "Workspaces Management"],
  },
  {
    title: "Stack Profile Contract",
    description:
      "Authoritative source for stack configuration within a kit workspace. The registry/stack_profile.json file defines the technology stack (language, framework, database, etc.) that all downstream pipeline steps reference.",
    icon: FileText,
    tag: "Architecture",
    source: "system",
    keyFiles: [
      "axion/templates/registry/stack_profile.json",
    ],
    relatedFeatures: ["Build Plan & Execution", "Two-Root Architecture"],
  },
  {
    title: "Anchor Convention",
    description:
      "Uses HTML comment-like anchors (<!-- AXION:ANCHOR:<ID> -->) for dynamic content injection during code generation. These anchors mark precise locations in templates where generated content should be inserted.",
    icon: Layers,
    tag: "Architecture",
    source: "system",
    keyFiles: [
      "axion/templates/",
    ],
    relatedFeatures: ["Build Plan & Execution", "UNKNOWN Detection & Content Fill"],
  },
  {
    title: "UNKNOWN Detection & Content Fill",
    description:
      "Automatic scanning for UNKNOWN placeholder content across all .md template files in every domain module. Supports document priority ordering (DOC_PRIORITY_ORDER), template-type-aware AI prompting (DOC_TYPE_MAP with 13 document types), and cascading fills where higher-level docs provide context to downstream templates.",
    icon: Search,
    tag: "AI",
    source: "system",
    keyFiles: [
      "axion/scripts/axion-content-fill.ts",
      "server/ai-content-fill.ts",
    ],
    pipelineSteps: ["content-fill"],
    relatedFeatures: ["UNKNOWN Revision Flow", "Document Inventory & Upgrade", "Anchor Convention"],
  },
  {
    title: "Atomic Writer Library",
    description:
      "Crash-resilient file writing using a write-to-tmp then atomic rename pattern. All pipeline file operations use this library to ensure data integrity even if the process crashes mid-write.",
    icon: ShieldCheck,
    tag: "Reliability",
    source: "system",
    keyFiles: [
      "axion/scripts/_axion_module_mode.mjs",
    ],
    relatedFeatures: ["Full Pipeline Orchestration", "Transient Failure Retry"],
  },
  {
    title: "Transient Failure Retry",
    description:
      "Shared retry utility with exponential backoff for transient failures: ENOENT (file not found), ETIMEDOUT, ECONNRESET, and OOM-kill (exit code 137) errors. Used across all pipeline steps to handle temporary infrastructure issues.",
    icon: RefreshCw,
    tag: "Reliability",
    source: "system",
    keyFiles: [
      "axion/scripts/lib/retry.ts",
    ],
    relatedFeatures: ["Atomic Writer Library", "SSE Interruption Handling"],
  },
  {
    title: "Doctor & Preflight Checks",
    description:
      "System validation scripts that verify environment health, dependencies, and configuration before pipeline execution. The doctor script diagnoses issues while preflight performs pre-run checks.",
    icon: ClipboardCheck,
    tag: "Reliability",
    source: "system",
    keyFiles: [
      "axion/scripts/doctor.ts",
      "axion/scripts/preflight.ts",
    ],
    relatedFeatures: ["System Health Monitoring", "Full Pipeline Orchestration"],
  },
  {
    title: "Path Traversal Protection",
    description:
      "Hardened workspace delete endpoint with input validation to prevent directory traversal attacks. Ensures that workspace operations cannot escape the designated workspace root directory.",
    icon: ShieldCheck,
    tag: "Security",
    source: "system",
    keyFiles: [
      "server/routes.ts",
    ],
    relatedFeatures: ["Workspaces Management", "Two-Root Architecture"],
  },
  {
    title: "Knowledge Base Mapping",
    description:
      "Comprehensive knowledge-map.json maps stack profiles, domains, pipeline stages, and doc types to curated knowledge files. The knowledge resolver injects relevant context into AI prompts during content-fill and draft stages. Each kit gets a custom knowledge/INDEX.md tailored to its stack and active domains.",
    icon: BookOpen,
    tag: "AI",
    source: "system",
    keyFiles: [
      "axion/config/knowledge-map.json",
      "axion/scripts/lib/knowledge-resolver.ts",
      "axion/knowledge/",
    ],
    pipelineSteps: ["content-fill", "draft"],
    relatedFeatures: ["UNKNOWN Detection & Content Fill", "Knowledge Coverage Analysis", "Kit Preview & Validation"],
  },
  {
    title: "Knowledge Coverage Analysis",
    description:
      "Cross-references knowledge-map.json against actual knowledge files. Reports dead references (mapped but missing), unmapped files, and coverage percentages broken down by domain, stack, and stage. Ensures the knowledge base stays consistent as new files are added or removed.",
    icon: Search,
    tag: "Reliability",
    source: "system",
    keyFiles: [
      "axion/scripts/axion-knowledge-coverage.ts",
      "axion/config/knowledge-map.json",
    ],
    pipelineSteps: ["knowledge-coverage"],
    relatedFeatures: ["Knowledge Base Mapping", "Template Validation Guardrail"],
  },
  {
    title: "Template Validation Guardrail",
    description:
      "Scans all template files for orphaned anchors, duplicate anchor IDs, surviving UNKNOWN placeholders, and missing required document types. Produces a structured JSON report with per-check PASS/FAIL status. Supports --strict mode to promote warnings to failures.",
    icon: ShieldCheck,
    tag: "Reliability",
    source: "system",
    keyFiles: [
      "axion/scripts/axion-validate-templates.ts",
    ],
    pipelineSteps: ["validate-templates"],
    relatedFeatures: ["Knowledge Coverage Analysis", "Doctor & Preflight Checks"],
  },
  {
    title: "Kit Preview & Validation",
    description:
      "Pre-package dry-run and post-package integrity validation. Kit preview simulates packaging to show projected file trees, domain completeness, and readiness status. Kit validate inspects packaged kits for required docs, cross-references, knowledge INDEX validity, and stack profile consistency.",
    icon: Eye,
    tag: "Pipeline",
    source: "system",
    keyFiles: [
      "axion/scripts/axion-kit-preview.ts",
      "axion/scripts/axion-kit-validate.ts",
    ],
    pipelineSteps: ["kit-preview", "kit-validate"],
    relatedFeatures: ["Kit Packaging", "Knowledge Base Mapping", "Template Validation Guardrail"],
  },
];

const dashboardUIFeatures: Feature[] = [
  {
    title: "Assembly Control Room",
    description:
      "Real-time SSE streaming of pipeline execution with step-level timing, progress tracking, and log display. Shows a visual stepper for each pipeline step with completion status, duration, and error messages. Supports retry from failed step and individual action triggers.",
    icon: Monitor,
    tag: "Core",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/assembly.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/assembly/:id",
    pipelineSteps: ["all stages"],
    relatedFeatures: ["Full Pipeline Orchestration", "Pipeline Retry from Failed Step", "Step-Level Timing"],
  },
  {
    title: "4-Step Assembly Wizard",
    description:
      "Guided new assembly creation with four steps: Vision (project idea and context), Stack (technology choices), Modules (domain selection), and Review (summary before creation). The Vision step includes zip context upload for importing existing project files.",
    icon: Sparkles,
    tag: "Core",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/new-assembly.tsx",
      "server/routes.ts",
      "shared/schema.ts",
    ],
    pageUrl: "/new",
    relatedFeatures: ["Zip Context Upload", "Assembly Control Room"],
  },
  {
    title: "Zip Context Upload",
    description:
      "Paperclip icon on the New Assembly form uploads a zip file, extracts ALL text files recursively, and populates the context textarea with full project contents. Includes zip bomb protection (file count and total size limits), path traversal sanitization, and per-file size limits.",
    icon: Upload,
    tag: "Core",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/new-assembly.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/new",
    relatedFeatures: ["4-Step Assembly Wizard"],
  },
  {
    title: "Pipeline Retry from Failed Step",
    description:
      "Resume pipeline execution from the exact step that failed, skipping previously successful steps. When a pipeline fails or is interrupted, the Control Room shows retry controls that let you restart from the failure point rather than re-running everything.",
    icon: Play,
    tag: "Orchestration",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/assembly.tsx",
      "server/routes.ts",
    ],
    relatedFeatures: ["Assembly Control Room", "SSE Interruption Handling", "Full Pipeline Orchestration"],
  },
  {
    title: "Individual Pipeline Actions",
    description:
      "Trigger any pipeline step independently from the Assembly Control Room: import, reconcile, iterate, build-plan, build-exec, deploy, clean, status, next, activate, validate-templates, knowledge-coverage, kit-preview, and kit-validate. Each action runs as a standalone operation with SSE streaming output.",
    icon: Zap,
    tag: "Orchestration",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/assembly.tsx",
      "server/routes.ts",
    ],
    relatedFeatures: ["Assembly Control Room", "Full Pipeline Orchestration"],
  },
  {
    title: "Document Inventory & Upgrade",
    description:
      "Interactive ReactFlow node graph (doc-hierarchy-map.tsx) showing document cascade hierarchy: System, Source, Template, and Generated document layers. Click-to-scroll navigation. AI-powered doc upgrade at per-file, per-section, and global levels via the POST /api/doc-upgrade SSE endpoint.",
    icon: BookOpen,
    tag: "AI",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/doc-inventory.tsx",
      "client/src/components/doc-hierarchy-map.tsx",
      "server/ai-content-fill.ts",
      "server/routes.ts",
    ],
    pageUrl: "/docs",
    relatedFeatures: ["UNKNOWN Detection & Content Fill", "UNKNOWN Revision Flow", "Document Inventory Dialogs"],
  },
  {
    title: "UNKNOWN Revision Flow",
    description:
      "Interactive revision system in the Assembly Control Room: 1) Scans all docs and finds the highest-priority doc with UNKNOWNs. 2) Generates targeted questions about UNKNOWN sections. 3) User answers questions, then 'Fill & Cascade' fills the target doc and runs a full pass across ALL docs. 4) Drops to the next doc and repeats until all resolved.",
    icon: Bot,
    tag: "AI",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/assembly.tsx",
      "server/ai-content-fill.ts",
      "server/routes.ts",
    ],
    relatedFeatures: ["UNKNOWN Detection & Content Fill", "Assembly Control Room", "Document Inventory & Upgrade"],
  },
  {
    title: "SSE Interruption Handling",
    description:
      "Graceful handling of dropped SSE connections during pipeline runs. When a browser connection drops mid-pipeline (e.g., due to HMR restart), the abort handler updates the assembly state to 'interrupted' with step-level error messages. The Control Room shows amber status with retry controls.",
    icon: WifiOff,
    tag: "Reliability",
    source: "dashboard",
    keyFiles: [
      "server/routes.ts",
      "client/src/pages/assembly.tsx",
    ],
    relatedFeatures: ["Assembly Control Room", "Pipeline Retry from Failed Step", "Transient Failure Retry"],
  },
  {
    title: "Workspaces Management",
    description:
      "Dedicated page listing all workspaces with on-disk status indicators (Registry, Domains, App directories), delete functionality with confirmation, expandable file tree browser via lazy-loaded workspace-tree API, and orphaned record cleanup for workspaces that exist in the database but not on disk.",
    icon: HardDrive,
    tag: "Management",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/workspaces.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/workspaces",
    relatedFeatures: ["Two-Root Architecture", "File Browser", "Path Traversal Protection"],
  },
  {
    title: "Kit Export",
    description:
      "Package and download completed Agent Kits as zip bundles directly from the dashboard. Select a workspace, trigger packaging, and download the resulting zip file.",
    icon: FileArchive,
    tag: "Management",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/export.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/export",
    relatedFeatures: ["Kit Packaging", "Workspaces Management"],
  },
  {
    title: "File Browser",
    description:
      "Browse workspace files with directory navigation, breadcrumb trail, and file content viewing. Select a workspace, navigate through directories, and view file contents with size information.",
    icon: FolderTree,
    tag: "Management",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/files.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/files",
    relatedFeatures: ["Workspaces Management", "Two-Root Architecture"],
  },
  {
    title: "Pipeline Logs Viewer",
    description:
      "Browse and inspect logs from all pipeline runs. Filter by status, search log content, and expand individual run details to see full output with timestamps and step information.",
    icon: ScrollText,
    tag: "Monitoring",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/logs.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/logs",
    relatedFeatures: ["Assembly Control Room", "Full Pipeline Orchestration"],
  },
  {
    title: "System Health Monitoring",
    description:
      "Health check page showing API status, workspace summary (count and disk presence), and release gate results with pass/fail indicators for each gate check.",
    icon: HeartPulse,
    tag: "Monitoring",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/health.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/health",
    relatedFeatures: ["Doctor & Preflight Checks"],
  },
  {
    title: "Step-Level Timing",
    description:
      "Per-step duration tracking displayed in the Assembly Control Room stepper. Each pipeline step shows exactly how long it took to complete, helping identify slow steps and optimize pipeline performance.",
    icon: Timer,
    tag: "Monitoring",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/assembly.tsx",
      "server/routes.ts",
    ],
    relatedFeatures: ["Assembly Control Room", "Full Pipeline Orchestration"],
  },
  {
    title: "Document Inventory Dialogs",
    description:
      "Three specialized dialogs for the Document Inventory page: UpgradeDialog (AI suggestions with custom instructions input), FileViewerDialog (markdown rendering of document content), and AddDocDialog (create new files per-section and per-domain).",
    icon: Eye,
    tag: "Docs",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/doc-inventory.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/docs",
    relatedFeatures: ["Document Inventory & Upgrade", "UNKNOWN Detection & Content Fill"],
  },
  {
    title: "Test Suite Runner",
    description:
      "Execute Vitest test suites directly from the dashboard with color-coded results (pass/fail/skip), file picker for selecting test files, live streaming output during test execution, and console log display.",
    icon: FlaskConical,
    tag: "Testing",
    source: "dashboard",
    keyFiles: [
      "client/src/pages/tests.tsx",
      "server/routes.ts",
    ],
    pageUrl: "/tests",
    relatedFeatures: ["System Health Monitoring"],
  },
  {
    title: "Dark/Light Theme",
    description:
      "Full theme support across the entire dashboard using CSS custom properties with Tailwind v4. Persistent preference stored in localStorage with one-click toggle. All pages and components adapt to the selected theme.",
    icon: Palette,
    tag: "UX",
    source: "dashboard",
    keyFiles: [
      "client/src/components/theme-provider.tsx",
      "client/src/index.css",
    ],
    relatedFeatures: [],
  },
];

const TAG_ORDER: string[] = [
  "Core",
  "Pipeline",
  "Architecture",
  "AI",
  "Orchestration",
  "Reliability",
  "Security",
  "Management",
  "Monitoring",
  "Docs",
  "Testing",
  "UX",
];

const TAG_META: Record<string, { icon: ElementType; colorClasses: string }> = {
  Core: {
    icon: Cpu,
    colorClasses: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent",
  },
  Pipeline: {
    icon: Workflow,
    colorClasses: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-transparent",
  },
  Architecture: {
    icon: Layers,
    colorClasses: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border-transparent",
  },
  AI: {
    icon: Bot,
    colorClasses: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-transparent",
  },
  Orchestration: {
    icon: Settings,
    colorClasses: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-transparent",
  },
  Reliability: {
    icon: Shield,
    colorClasses: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent",
  },
  Security: {
    icon: Lock,
    colorClasses: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent",
  },
  Management: {
    icon: Wrench,
    colorClasses: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-transparent",
  },
  Monitoring: {
    icon: Gauge,
    colorClasses: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-transparent",
  },
  Docs: {
    icon: BookOpen,
    colorClasses: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-transparent",
  },
  Testing: {
    icon: TestTube2,
    colorClasses: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent",
  },
  UX: {
    icon: Paintbrush,
    colorClasses: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 border-transparent",
  },
};

const allFeatures: Feature[] = [...axionSystemFeatures, ...dashboardUIFeatures];

function featureSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function groupByTag(features: Feature[]): { tag: string; features: Feature[] }[] {
  const map = new Map<string, Feature[]>();
  for (const f of features) {
    if (!map.has(f.tag)) map.set(f.tag, []);
    map.get(f.tag)!.push(f);
  }
  const result: { tag: string; features: Feature[] }[] = [];
  for (const tag of TAG_ORDER) {
    const items = map.get(tag);
    if (items && items.length > 0) result.push({ tag, features: items });
  }
  map.forEach((items, tag) => {
    if (!TAG_ORDER.includes(tag)) result.push({ tag, features: items });
  });
  return result;
}

function FeatureDetailDialog({
  feature,
  open,
  onOpenChange,
  onSelectFeature,
}: {
  feature: Feature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFeature: (title: string) => void;
}) {
  const [, navigate] = useLocation();
  const Icon = feature.icon;
  const tagMeta = TAG_META[feature.tag];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col" data-testid="dialog-feature-detail">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted shrink-0">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-base leading-tight font-semibold" data-testid="text-dialog-title">
                {feature.title}
              </DialogTitle>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tagMeta?.colorClasses ?? ""}`}>
                  {feature.tag}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 border-transparent ${
                    feature.source === "system"
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
                      : "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300"
                  }`}
                >
                  {feature.source === "system" ? "System" : "Dashboard"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-5 pb-2">
            <DialogDescription className="text-sm leading-relaxed" data-testid="text-dialog-description">
              {feature.description}
            </DialogDescription>

            {feature.pageUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide">Dashboard Page</span>
                </div>
                {feature.pageUrl.includes(":") ? (
                  <p className="text-xs text-muted-foreground px-2 py-1.5 rounded-md bg-muted/50">
                    This feature is available on each assembly's page. Navigate to an assembly from the dashboard to access it.
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    data-testid="button-go-to-page"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(feature.pageUrl!);
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Go to {feature.pageUrl}
                  </Button>
                )}
              </div>
            )}

            {feature.keyFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide">Key Files</span>
                </div>
                <div className="space-y-1">
                  {feature.keyFiles.map((file) => (
                    <div
                      key={file}
                      className="flex items-center gap-2 text-sm text-muted-foreground py-1 px-2 rounded-md bg-muted/50"
                      data-testid={`text-keyfile-${file.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="font-mono text-xs break-all">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feature.pipelineSteps && feature.pipelineSteps.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide">Pipeline Steps</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {feature.pipelineSteps.map((step) => (
                    <Badge key={step} variant="secondary" className="text-xs font-mono" data-testid={`badge-step-${step}`}>
                      {step}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {feature.relatedFeatures.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide">Related Features</span>
                </div>
                <div className="space-y-1">
                  {feature.relatedFeatures.map((title) => {
                    const related = allFeatures.find((f) => f.title === title);
                    if (!related) return null;
                    const RelIcon = related.icon;
                    return (
                      <button
                        key={title}
                        className="flex items-center gap-2 w-full text-left text-sm py-1.5 px-2 rounded-md hover-elevate active-elevate-2 cursor-pointer"
                        data-testid={`button-related-${featureSlug(title)}`}
                        onClick={() => onSelectFeature(title)}
                      >
                        <RelIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{title}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FeatureCard({ feature, onClick }: { feature: Feature; onClick: () => void }) {
  const Icon = feature.icon;
  const slug = featureSlug(feature.title);
  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2"
      data-testid={`card-feature-${slug}`}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      role="button"
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-1 min-w-0">
          <CardTitle className="text-sm leading-tight" data-testid={`text-feature-title-${slug}`}>
            {feature.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2" data-testid={`text-feature-desc-${slug}`}>
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

function TagSubGroup({
  tag,
  features,
  sectionPrefix,
  onSelectFeature,
}: {
  tag: string;
  features: Feature[];
  sectionPrefix: string;
  onSelectFeature: (feature: Feature) => void;
}) {
  const meta = TAG_META[tag];
  const TagIcon = meta?.icon ?? LayoutList;
  const tagSlug = tag.toLowerCase();
  return (
    <div className="space-y-3" data-testid={`${sectionPrefix}-tag-${tagSlug}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <h4 className="text-sm font-medium" data-testid={`text-${sectionPrefix}-tag-${tagSlug}`}>
          {tag}
        </h4>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta?.colorClasses ?? ""}`} data-testid={`badge-${sectionPrefix}-tag-count-${tagSlug}`}>
          {features.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((f) => (
          <FeatureCard key={f.title} feature={f} onClick={() => onSelectFeature(f)} />
        ))}
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const axionGroups = useMemo(() => groupByTag(axionSystemFeatures), []);
  const dashboardGroups = useMemo(() => groupByTag(dashboardUIFeatures), []);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const handleSelectByTitle = (title: string) => {
    const found = allFeatures.find((f) => f.title === title);
    if (found) setSelectedFeature(found);
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto" data-testid="features-page">
      <div className="flex items-center gap-2 flex-wrap">
        <LayoutList className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-features-header">
          Features
        </h2>
        <Badge variant="secondary" className="ml-auto" data-testid="badge-total-count">
          {axionSystemFeatures.length + dashboardUIFeatures.length} features
        </Badge>
      </div>

      <section data-testid="section-axion-system">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Workflow className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-semibold" data-testid="text-section-axion">
            AXION System
          </h3>
          <Badge variant="outline" className="text-xs" data-testid="badge-axion-count">
            {axionSystemFeatures.length}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-5" data-testid="text-axion-description">
          Core pipeline engine, architecture guarantees, and system-level capabilities.
        </p>
        <div className="space-y-6">
          {axionGroups.map(({ tag, features }) => (
            <TagSubGroup key={tag} tag={tag} features={features} sectionPrefix="axion" onSelectFeature={setSelectedFeature} />
          ))}
        </div>
      </section>

      <section data-testid="section-dashboard-ui">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-semibold" data-testid="text-section-dashboard">
            Dashboard UI
          </h3>
          <Badge variant="outline" className="text-xs" data-testid="badge-dashboard-count">
            {dashboardUIFeatures.length}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-5" data-testid="text-dashboard-description">
          Web dashboard pages, interactive controls, and user-facing tools.
        </p>
        <div className="space-y-6">
          {dashboardGroups.map(({ tag, features }) => (
            <TagSubGroup key={tag} tag={tag} features={features} sectionPrefix="dashboard" onSelectFeature={setSelectedFeature} />
          ))}
        </div>
      </section>

      {selectedFeature && (
        <FeatureDetailDialog
          feature={selectedFeature}
          open={!!selectedFeature}
          onOpenChange={(open) => { if (!open) setSelectedFeature(null); }}
          onSelectFeature={handleSelectByTitle}
        />
      )}
    </div>
  );
}
