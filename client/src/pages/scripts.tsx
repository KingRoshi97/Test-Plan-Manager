import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Terminal,
  Workflow,
  FileText,
  Search,
  RefreshCw,
  ShieldCheck,
  Package,
  Layers,
  ArrowUpCircle,
  Bot,
  Lock,
  Hammer,
  Import,
  IterationCw,
  ClipboardCheck,
  Play,
  HeartPulse,
  BookOpen,
  Zap,
  WrenchIcon,
  Eye,
  Cpu,
  Shield,
  Settings,
  Gauge,
  TestTube2,
  Paintbrush,
  FileCode,
  Link2,
  ChevronRight,
  Rocket,
  Trash2,
  Hash,
  GitBranch,
  FolderOpen,
  Cog,
  CircleDot,
  AlertTriangle,
  CheckCircle2,
  Code2,
} from "lucide-react";
import type { ElementType } from "react";

type ScriptType = "pipeline" | "system" | "library";

interface Script {
  name: string;
  file: string;
  description: string;
  icon: ElementType;
  tag: string;
  type: ScriptType;
  flags?: string[];
  usage?: string;
  relatedScripts: string[];
  pipelineStage?: string;
}

const scripts: Script[] = [
  {
    name: "orchestrate",
    file: "axion/scripts/axion-orchestrate.ts",
    description:
      "Main pipeline orchestrator with step chaining, retry, gate enforcement, and per-module iteration. Reads stage plans from axion/config/presets.json. Supports plan selection, step filtering, start-from for recovery, module targeting, and dry-run mode.",
    icon: Workflow,
    tag: "Orchestration",
    type: "system",
    flags: ["--plan", "--steps", "--start-from", "--modules", "--dry-run", "--list-plans"],
    usage: "npx tsx axion/scripts/axion-orchestrate.ts --plan full --start-from review",
    relatedScripts: ["run", "iterate"],
    pipelineStage: "orchestrator",
  },
  {
    name: "run",
    file: "axion/scripts/axion-run.ts",
    description:
      "Alternative pipeline orchestrator that chains stages (verify, build-exec, test, activate) with gates, retries, and module-specific execution. The heavyweight runner for full pipeline passes.",
    icon: Play,
    tag: "Orchestration",
    type: "system",
    flags: ["--build-root", "--project-name", "--dry-run", "--json"],
    usage: "npx tsx axion/scripts/axion-run.ts --build-root ./kits/build-001 --project-name myapp",
    relatedScripts: ["orchestrate", "iterate"],
  },
  {
    name: "iterate",
    file: "axion/scripts/axion-iterate.ts",
    description:
      "Orchestration wrapper that chains AXION primitives (doctor, reconcile, plan, manifest, apply, test, activate), enforcing gates and producing next_commands for remediation. Operates deterministically, requiring explicit --allow-apply for changes.",
    icon: IterationCw,
    tag: "Orchestration",
    type: "system",
    flags: ["--build-root", "--project-name", "--allow-apply", "--dry-run", "--json"],
    usage: "npx tsx axion/scripts/axion-iterate.ts --build-root . --project-name myapp --allow-apply",
    relatedScripts: ["orchestrate", "run", "doctor", "reconcile"],
  },
  {
    name: "kit-create",
    file: "axion/scripts/axion-kit-create.ts",
    description:
      "Creates a new build root (kit) by snapshotting the AXION system files and seeding initial project documentation (RPBS, REBS). Sets up an isolated build environment for a new project.",
    icon: FolderOpen,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--build-root", "--project-name", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-kit-create.ts --build-root ./kits --project-name myapp",
    relatedScripts: ["init", "prepare-root", "seed"],
    pipelineStage: "kit-create",
  },
  {
    name: "init",
    file: "axion/scripts/axion-init.mjs",
    description:
      "Initializes a new AXION workspace by creating the necessary directory structure and baseline configuration files (domains.json, sources.json).",
    icon: Zap,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--dry-run"],
    usage: "node axion/scripts/axion-init.mjs",
    relatedScripts: ["kit-create", "prepare-root"],
    pipelineStage: "init",
  },
  {
    name: "prepare-root",
    file: "axion/scripts/axion-prepare-root.ts",
    description:
      "Creates the project workspace root directory before other stages run. Handles safety checks, archiving of existing content, and setting up the necessary directory structure.",
    icon: FolderOpen,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--build-root", "--project-name", "--archive", "--force", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-prepare-root.ts --build-root . --project-name myapp",
    relatedScripts: ["kit-create", "init"],
    pipelineStage: "prepare-root",
  },
  {
    name: "seed",
    file: "axion/scripts/axion-seed.mjs",
    description:
      "Seeds module documentation structures from templates. Upgrade-aware: reads AXION_REVISION, AXION_UPGRADE_NOTES, and AXION_KIT_TYPE environment variables for iterative upgrades.",
    icon: CircleDot,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--all", "--module", "--dry-run"],
    usage: "node axion/scripts/axion-seed.mjs --all",
    relatedScripts: ["generate", "kit-create", "draft"],
    pipelineStage: "seed",
  },
  {
    name: "generate",
    file: "axion/scripts/axion-generate.mjs",
    description:
      "Generates documentation content for all AXION_DOC_TYPES (DDES, UX_Foundations, UI_Constraints, DIM, SCREENMAP, TESTPLAN, COMPONENT_LIBRARY, COPY_GUIDE) per module. Uses AI to fill templates with project-specific content.",
    icon: Bot,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--all", "--module", "--dry-run"],
    usage: "node axion/scripts/axion-generate.mjs --all",
    relatedScripts: ["seed", "review"],
    pipelineStage: "generate",
  },
  {
    name: "review",
    file: "axion/scripts/axion-review.mjs",
    description:
      "Reviews generated documentation for completeness and required sections. Checks each doc type against its required section list and reports missing or incomplete content.",
    icon: Eye,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--all", "--module", "--dry-run"],
    usage: "node axion/scripts/axion-review.mjs --all",
    relatedScripts: ["generate", "draft"],
    pipelineStage: "review",
  },
  {
    name: "draft",
    file: "axion/scripts/axion-draft.mjs",
    description:
      "Creates BELS (Business Entity Logic Specification) documents from reviewed docs. Upgrade-aware: reads AXION_REVISION, AXION_UPGRADE_NOTES, and AXION_KIT_TYPE for iterative assembly upgrades.",
    icon: FileText,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--all", "--module", "--dry-run"],
    usage: "node axion/scripts/axion-draft.mjs --all",
    relatedScripts: ["review", "verify"],
    pipelineStage: "draft",
  },
  {
    name: "verify",
    file: "axion/scripts/axion-verify.mjs",
    description:
      "Gatekeeper for the release process. Checks for required documentation, verifies module statuses, and ensures no critical UNKNOWN placeholders remain in locked artifacts.",
    icon: CheckCircle2,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--all", "--module", "--dry-run"],
    usage: "node axion/scripts/axion-verify.mjs --all",
    relatedScripts: ["draft", "lock"],
    pipelineStage: "verify",
  },
  {
    name: "lock",
    file: "axion/scripts/axion-lock.mjs",
    description:
      "Creates an Execution Readiness Contract (ERC) when a domain is ready. Checks for critical UNKNOWN placeholders and ensures all necessary documentation sections are complete before locking. Requires verify to have passed first.",
    icon: Lock,
    tag: "Pipeline",
    type: "pipeline",
    flags: ["--module", "--version", "--dry-run"],
    usage: "node axion/scripts/axion-lock.mjs --module auth --version v1",
    relatedScripts: ["verify", "build-plan"],
    pipelineStage: "lock",
  },
  {
    name: "build-plan",
    file: "axion/scripts/axion-build-plan.ts",
    description:
      "Reads locked documentation and generates an ordered task graph (build_plan.json) for coding agents to implement. Refuses unless the application scaffold exists (app_scaffold_report.json).",
    icon: Hammer,
    tag: "Build",
    type: "pipeline",
    flags: ["--build-root", "--project-name", "--force", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-build-plan.ts --build-root . --project-name myapp",
    relatedScripts: ["lock", "build-exec", "scaffold-app"],
    pipelineStage: "build-plan",
  },
  {
    name: "build-exec",
    file: "axion/scripts/axion-build-exec.ts",
    description:
      "Executes a build plan by applying file operations (create, patch) to the workspace. Supports dry-run mode for manifest generation and verifies the plan against safety guards (target within workspace, no duplicate targets, anchor existence).",
    icon: Rocket,
    tag: "Build",
    type: "pipeline",
    flags: ["--dry-run", "--apply", "--manifest", "--build-root", "--project-name"],
    usage: "npx tsx axion/scripts/axion-build-exec.ts --apply --manifest build_plan.json --build-root . --project-name myapp",
    relatedScripts: ["build-plan", "build", "test"],
    pipelineStage: "build-exec",
  },
  {
    name: "build",
    file: "axion/scripts/axion-build.ts",
    description:
      "Invokes AI to implement code based on locked documentation. Requires the application scaffold to be complete. Generates a build_prompt.md for AI agents to follow.",
    icon: Code2,
    tag: "Build",
    type: "pipeline",
    flags: ["--build-root", "--project-name", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-build.ts --build-root . --project-name myapp",
    relatedScripts: ["build-plan", "build-exec"],
    pipelineStage: "build",
  },
  {
    name: "scaffold-app",
    file: "axion/scripts/axion-scaffold-app.ts",
    description:
      "Creates the actual application skeleton from locked documentation and selected stack profile. Generates package.json, tsconfig.json, and basic server/client structure. Supports both two-root and legacy mode.",
    icon: Layers,
    tag: "Build",
    type: "pipeline",
    flags: ["--build-root", "--project-name", "--output", "--override", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-scaffold-app.ts --build-root . --project-name myapp",
    relatedScripts: ["build-plan", "build-exec"],
    pipelineStage: "scaffold-app",
  },
  {
    name: "package-workspace (.mjs)",
    file: "axion/scripts/axion-package-workspace.mjs",
    description:
      "Bundles AXION workspace outputs into distributable Agent Kit zip files. Supports different modes (docs, scaffold, full) and includes a manifest and agent prompt. Creates domain-based workspace zip bundles.",
    icon: Package,
    tag: "Distribution",
    type: "pipeline",
    flags: ["--domain", "--dry-run", "--force"],
    usage: "node axion/scripts/axion-package-workspace.mjs --domain auth",
    relatedScripts: ["package (.ts)", "build-exec"],
    pipelineStage: "package",
  },
  {
    name: "package (.ts)",
    file: "axion/scripts/axion-package.ts",
    description:
      "Creates workspace-scoped packages used by the dashboard routes. Packages the entire workspace into a zip bundle for export from the web dashboard.",
    icon: Package,
    tag: "Distribution",
    type: "system",
    flags: ["--build-root", "--project-name", "--output"],
    usage: "npx tsx axion/scripts/axion-package.ts --build-root . --project-name myapp",
    relatedScripts: ["package (.mjs)"],
  },
  {
    name: "package-workspace",
    file: "axion/scripts/axion-package-workspace.mjs",
    description:
      "Workspace-level packaging script that bundles all workspace artifacts into a single distributable package.",
    icon: Package,
    tag: "Distribution",
    type: "system",
    flags: ["--dry-run"],
    usage: "node axion/scripts/axion-package-workspace.mjs",
    relatedScripts: ["package (.mjs)", "package (.ts)"],
  },
  {
    name: "content-fill",
    file: "axion/scripts/axion-content-fill.ts",
    description:
      "AI-driven content generation and upgrading. Scans for UNKNOWN placeholders, fills them based on project context, generates clarification questions, and upgrades existing documents. Supports --scan, --fill, --cascade, --find-next, and --upgrade modes.",
    icon: Bot,
    tag: "Documentation",
    type: "system",
    flags: ["--scan", "--fill", "--cascade", "--find-next", "--upgrade", "--build-root", "--project-name"],
    usage: "npx tsx axion/scripts/axion-content-fill.ts --scan --build-root . --project-name myapp",
    relatedScripts: ["docs-check", "verify"],
  },
  {
    name: "docs-check",
    file: "axion/scripts/axion-docs-check.ts",
    description:
      "Documentation validation script that checks for completeness, required sections, and consistency across all documentation files in a workspace.",
    icon: BookOpen,
    tag: "Documentation",
    type: "system",
    flags: ["--build-root", "--project-name", "--json"],
    usage: "npx tsx axion/scripts/axion-docs-check.ts --build-root . --project-name myapp",
    relatedScripts: ["content-fill", "verify"],
  },
  {
    name: "import",
    file: "axion/scripts/axion-import.ts",
    description:
      "Read-only analysis tool for existing repositories. Detects languages, frameworks, routes, and potential stack candidates. Produces import reports and document seeds without modifying source code.",
    icon: Import,
    tag: "Analysis",
    type: "system",
    flags: ["--repo", "--build-root", "--project-name", "--dry-run", "--json"],
    usage: "npx tsx axion/scripts/axion-import.ts --repo /path/to/repo --build-root . --project-name myapp",
    relatedScripts: ["reconcile"],
  },
  {
    name: "reconcile",
    file: "axion/scripts/axion-reconcile.ts",
    description:
      "Deterministically compares imported facts (import_facts.json) against build-authoritative outputs (stack_profile.json, build_plan.json) to detect drift and report mismatches.",
    icon: GitBranch,
    tag: "Analysis",
    type: "system",
    flags: ["--build-root", "--project-name", "--json"],
    usage: "npx tsx axion/scripts/axion-reconcile.ts --build-root . --project-name myapp",
    relatedScripts: ["import", "iterate"],
  },
  {
    name: "doctor",
    file: "axion/scripts/axion-doctor.ts",
    description:
      "Self-diagnosis for the AXION system. Checks environment, configuration integrity, template presence, and build state. Reports issues with suggestions for fixes.",
    icon: HeartPulse,
    tag: "Diagnostics",
    type: "system",
    flags: ["--build-root", "--project-name", "--fix", "--json"],
    usage: "npx tsx axion/scripts/axion-doctor.ts --build-root . --project-name myapp",
    relatedScripts: ["preflight", "repair"],
  },
  {
    name: "preflight",
    file: "axion/scripts/axion-preflight.ts",
    description:
      "Pre-run validation that checks environment health, dependencies, and configuration before pipeline execution. Lighter than doctor, focused on blocking issues.",
    icon: ClipboardCheck,
    tag: "Diagnostics",
    type: "system",
    flags: ["--build-root", "--project-name"],
    usage: "npx tsx axion/scripts/axion-preflight.ts --build-root . --project-name myapp",
    relatedScripts: ["doctor"],
  },
  {
    name: "repair",
    file: "axion/scripts/axion-repair.ts",
    description:
      "Analyzes verification failures and generates actionable repair plans. Identifies issues like missing sections, [TBD] placeholders, and UNKNOWNs without questions.",
    icon: WrenchIcon,
    tag: "Diagnostics",
    type: "system",
    flags: ["--build-root", "--project-name", "--apply", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-repair.ts --build-root . --project-name myapp",
    relatedScripts: ["doctor", "verify"],
  },
  {
    name: "status",
    file: "axion/scripts/axion-status.ts",
    description:
      "Displays the current status of modules and stages by reading stage_markers.json and verify_report.json. Provides a summary of the project's pipeline state.",
    icon: Gauge,
    tag: "Diagnostics",
    type: "system",
    flags: ["--build-root", "--project-name", "--json"],
    usage: "npx tsx axion/scripts/axion-status.ts --build-root . --project-name myapp",
    relatedScripts: ["next", "verify"],
  },
  {
    name: "next",
    file: "axion/scripts/axion-next.ts",
    description:
      "Reads verify_report.json and provides human-readable or JSON output about the next recommended actions or necessary fixes.",
    icon: ArrowUpCircle,
    tag: "Diagnostics",
    type: "system",
    flags: ["--build-root", "--project-name", "--json"],
    usage: "npx tsx axion/scripts/axion-next.ts --build-root . --project-name myapp",
    relatedScripts: ["status", "verify"],
  },
  {
    name: "test",
    file: "axion/scripts/axion-test.ts",
    description:
      "Runs test suites, linting, type checking, and smoke tests for the application. Enforces gates like passing tests before proceeding to activation.",
    icon: TestTube2,
    tag: "Testing",
    type: "system",
    flags: ["--build-root", "--project-name", "--app-path", "--dry-run", "--json"],
    usage: "npx tsx axion/scripts/axion-test.ts --build-root . --project-name myapp",
    relatedScripts: ["build-exec", "activate"],
  },
  {
    name: "activate",
    file: "axion/scripts/axion-activate.ts",
    description:
      "Sets the active build pointer (ACTIVE_BUILD.json) to route runtime/deploy to a specific build root. Gate checks: docs must be locked, verify must pass, tests must pass.",
    icon: Zap,
    tag: "Deployment",
    type: "system",
    flags: ["--build-root", "--project-name", "--pointer-path", "--allow-no-tests", "--force", "--json"],
    usage: "npx tsx axion/scripts/axion-activate.ts --build-root . --project-name myapp",
    relatedScripts: ["test", "deploy", "active"],
  },
  {
    name: "active",
    file: "axion/scripts/axion-active.ts",
    description:
      "Read-only script that displays information about the currently active build by reading the ACTIVE_BUILD.json pointer.",
    icon: Eye,
    tag: "Deployment",
    type: "system",
    flags: ["--json"],
    usage: "npx tsx axion/scripts/axion-active.ts",
    relatedScripts: ["activate"],
  },
  {
    name: "deploy",
    file: "axion/scripts/axion-deploy.ts",
    description:
      "Deploys the active build to a target environment. Reads the active build pointer and executes deployment steps.",
    icon: Rocket,
    tag: "Deployment",
    type: "system",
    flags: ["--build-root", "--project-name", "--target", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-deploy.ts --build-root . --project-name myapp",
    relatedScripts: ["activate", "run-app"],
  },
  {
    name: "run-app",
    file: "axion/scripts/axion-run-app.ts",
    description:
      "Starts the application from the active build using ACTIVE_BUILD.json. Performs preflight checks and can optionally run npm install before starting.",
    icon: Play,
    tag: "Deployment",
    type: "system",
    flags: ["--build-root", "--project-name", "--install", "--port", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-run-app.ts --build-root . --project-name myapp",
    relatedScripts: ["activate", "active"],
  },
  {
    name: "clean",
    file: "axion/scripts/axion-clean.ts",
    description:
      "Cleans up build artifacts (node_modules, dist, caches) to reclaim disk space. Supports safe and aggressive cleaning modes with options for age filtering and dry runs.",
    icon: Trash2,
    tag: "Maintenance",
    type: "system",
    flags: ["--build-root", "--project-name", "--aggressive", "--max-age", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-clean.ts --build-root . --project-name myapp --aggressive",
    relatedScripts: ["doctor"],
  },
  {
    name: "overhaul",
    file: "axion/scripts/axion-overhaul.ts",
    description:
      "Major workspace restructuring tool. Performs comprehensive updates to workspace layout, configuration, and documentation structure.",
    icon: RefreshCw,
    tag: "Maintenance",
    type: "system",
    flags: ["--build-root", "--project-name", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-overhaul.ts --build-root . --project-name myapp",
    relatedScripts: ["clean", "repair"],
  },
  {
    name: "upgrade",
    file: "axion/scripts/axion-upgrade.ts",
    description:
      "Handles assembly upgrade layer operations. Bumps revision, applies upgrade notes, and prepares the workspace for iterative pipeline re-runs.",
    icon: ArrowUpCircle,
    tag: "Maintenance",
    type: "system",
    flags: ["--build-root", "--project-name", "--notes", "--dry-run"],
    usage: "npx tsx axion/scripts/axion-upgrade.ts --build-root . --project-name myapp --notes 'Add auth module'",
    relatedScripts: ["seed", "draft"],
  },
  {
    name: "hash-templates",
    file: "axion/scripts/axion-hash-templates.ts",
    description:
      "Generates and verifies file hashes for templates and registry documents to detect unauthorized changes. Maintains integrity of the AXION system files.",
    icon: Hash,
    tag: "Security",
    type: "system",
    flags: ["--verify", "--update", "--json"],
    usage: "npx tsx axion/scripts/axion-hash-templates.ts --verify",
    relatedScripts: ["release-check", "verify-seams"],
  },
  {
    name: "verify-seams",
    file: "axion/scripts/axion-verify-seams.ts",
    description:
      "Verifies seam ownership, ensuring that modules link to seam owners rather than redefining content. Checks for violations using the seams.json registry.",
    icon: ShieldCheck,
    tag: "Security",
    type: "system",
    flags: ["--build-root", "--project-name", "--json"],
    usage: "npx tsx axion/scripts/axion-verify-seams.ts --build-root . --project-name myapp",
    relatedScripts: ["hash-templates", "release-check"],
  },
  {
    name: "release-check",
    file: "axion/scripts/axion-release-check.ts",
    description:
      "Lightweight documentation validation. Checks for script existence, mapping consistency, and required document presence. Outputs a JSON report detailing issues.",
    icon: ClipboardCheck,
    tag: "Security",
    type: "system",
    flags: ["--build-root", "--project-name", "--json"],
    usage: "npx tsx axion/scripts/axion-release-check.ts --build-root . --project-name myapp",
    relatedScripts: ["hash-templates", "verify-seams"],
  },
  {
    name: "validate-templates",
    file: "axion/scripts/axion-validate-templates.ts",
    description:
      "Template validation guardrail. Scans all template files for orphaned anchors, duplicate anchor IDs, surviving UNKNOWN placeholders, and missing required document types. Outputs a structured JSON report with per-check PASS/FAIL status. Supports --strict mode to promote warnings to failures.",
    icon: ShieldCheck,
    tag: "Diagnostics",
    type: "system",
    flags: ["--json", "--strict"],
    usage: "npx tsx axion/scripts/axion-validate-templates.ts --json",
    relatedScripts: ["knowledge-coverage", "docs-check", "verify"],
    pipelineStage: "validate-templates",
  },
  {
    name: "knowledge-coverage",
    file: "axion/scripts/axion-knowledge-coverage.ts",
    description:
      "Cross-references knowledge-map.json against actual knowledge files. Reports dead references (mapped but missing), unmapped files, coverage percentages by domain, stack, and stage. Supports --stack filtering for stack-specific analysis.",
    icon: BookOpen,
    tag: "Diagnostics",
    type: "system",
    flags: ["--json", "--stack"],
    usage: "npx tsx axion/scripts/axion-knowledge-coverage.ts --json --stack default-web-saas",
    relatedScripts: ["validate-templates", "kit-preview", "docs-check"],
    pipelineStage: "knowledge-coverage",
  },
  {
    name: "kit-preview",
    file: "axion/scripts/axion-kit-preview.ts",
    description:
      "Simulates kit packaging without writing files. Outputs the projected file tree, per-domain completeness percentages, a knowledge INDEX.md preview, missing required docs, and an overall readiness status (READY / READY_WITH_WARNINGS / NOT_READY).",
    icon: Eye,
    tag: "Distribution",
    type: "system",
    flags: ["--json"],
    usage: "npx tsx axion/scripts/axion-kit-preview.ts --json",
    relatedScripts: ["kit-validate", "package (.ts)", "knowledge-coverage"],
    pipelineStage: "kit-preview",
  },
  {
    name: "kit-validate",
    file: "axion/scripts/axion-kit-validate.ts",
    description:
      "Post-package integrity validator. Checks required directory structure, domain document completeness (including empty files and surviving UNKNOWNs), cross-references, knowledge INDEX link validity, stack profile consistency, and manifest integrity.",
    icon: CheckCircle2,
    tag: "Distribution",
    type: "system",
    flags: ["--kit", "--json", "--strict"],
    usage: "npx tsx axion/scripts/axion-kit-validate.ts --kit ./workspace --json",
    relatedScripts: ["kit-preview", "package (.ts)", "validate-templates"],
    pipelineStage: "kit-validate",
  },
  {
    name: "_axion_module_mode",
    file: "axion/scripts/_axion_module_mode.mjs",
    description:
      "Shared module providing core constants and utility functions used by all pipeline scripts. Defines AXION_DOC_TYPES, AXION_REQUIRED_DOC_TYPES, AXION_MODULE_ORDER, and exports helpers for argument parsing, prerequisite loading, stage markers, and error handling.",
    icon: Cog,
    tag: "Library",
    type: "library",
    relatedScripts: ["seed", "generate", "review", "draft", "verify", "lock"],
  },
  {
    name: "lib/retry",
    file: "axion/scripts/lib/retry.ts",
    description:
      "Shared transient failure retry utility with exponential backoff. Handles ENOENT, ETIMEDOUT, ECONNRESET, and OOM-kill (exit code 137) errors. Used across all pipeline steps.",
    icon: RefreshCw,
    tag: "Library",
    type: "library",
    relatedScripts: ["orchestrate", "run"],
  },
  {
    name: "lib/path-safety",
    file: "axion/scripts/lib/path-safety.ts",
    description:
      "Path traversal protection utilities. Validates and sanitizes file paths to prevent directory traversal attacks in workspace operations.",
    icon: Shield,
    tag: "Library",
    type: "library",
    relatedScripts: ["hash-templates", "verify-seams"],
  },
  {
    name: "lib/knowledge-resolver",
    file: "axion/scripts/lib/knowledge-resolver.ts",
    description:
      "Knowledge base resolution engine. Resolves domain, stack, stage, and doc-type knowledge mappings from knowledge-map.json. Builds prompt context for AI content generation and generates per-kit INDEX.md files mapping knowledge files to domains and tasks.",
    icon: BookOpen,
    tag: "Library",
    type: "library",
    relatedScripts: ["knowledge-coverage", "kit-preview", "content-fill"],
  },
];

const TAG_ORDER: string[] = [
  "Orchestration",
  "Pipeline",
  "Build",
  "Distribution",
  "Documentation",
  "Analysis",
  "Diagnostics",
  "Testing",
  "Deployment",
  "Maintenance",
  "Security",
  "Library",
];

const TAG_META: Record<string, { icon: ElementType; colorClasses: string }> = {
  Orchestration: {
    icon: Settings,
    colorClasses: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-transparent",
  },
  Pipeline: {
    icon: Workflow,
    colorClasses: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-transparent",
  },
  Build: {
    icon: Hammer,
    colorClasses: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-transparent",
  },
  Distribution: {
    icon: Package,
    colorClasses: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent",
  },
  Documentation: {
    icon: BookOpen,
    colorClasses: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-transparent",
  },
  Analysis: {
    icon: Search,
    colorClasses: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border-transparent",
  },
  Diagnostics: {
    icon: HeartPulse,
    colorClasses: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent",
  },
  Testing: {
    icon: TestTube2,
    colorClasses: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent",
  },
  Deployment: {
    icon: Rocket,
    colorClasses: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent",
  },
  Maintenance: {
    icon: WrenchIcon,
    colorClasses: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-transparent",
  },
  Security: {
    icon: Shield,
    colorClasses: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent",
  },
  Library: {
    icon: Cpu,
    colorClasses: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-transparent",
  },
};

const TYPE_LABELS: Record<ScriptType, { label: string; colorClasses: string }> = {
  pipeline: {
    label: "Pipeline",
    colorClasses: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-transparent",
  },
  system: {
    label: "System",
    colorClasses: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 border-transparent",
  },
  library: {
    label: "Library",
    colorClasses: "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300 border-transparent",
  },
};

function scriptSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function groupByTag(items: Script[]): { tag: string; scripts: Script[] }[] {
  const map = new Map<string, Script[]>();
  for (const s of items) {
    if (!map.has(s.tag)) map.set(s.tag, []);
    map.get(s.tag)!.push(s);
  }
  const result: { tag: string; scripts: Script[] }[] = [];
  for (const tag of TAG_ORDER) {
    const items = map.get(tag);
    if (items && items.length > 0) result.push({ tag, scripts: items });
  }
  map.forEach((items, tag) => {
    if (!TAG_ORDER.includes(tag)) result.push({ tag, scripts: items });
  });
  return result;
}

function ScriptDetailDialog({
  script,
  open,
  onOpenChange,
  onSelectScript,
}: {
  script: Script;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectScript: (name: string) => void;
}) {
  const Icon = script.icon;
  const tagMeta = TAG_META[script.tag];
  const typeMeta = TYPE_LABELS[script.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col" data-testid="dialog-script-detail">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted shrink-0">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-base leading-tight font-semibold font-mono" data-testid="text-dialog-title">
                {script.name}
              </DialogTitle>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tagMeta?.colorClasses ?? ""}`}>
                  {script.tag}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeMeta.colorClasses}`}>
                  {typeMeta.label}
                </Badge>
                {script.pipelineStage && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                    stage: {script.pipelineStage}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-5 pb-2">
            <DialogDescription className="text-sm leading-relaxed" data-testid="text-dialog-description">
              {script.description}
            </DialogDescription>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wide">File</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-1 px-2 rounded-md bg-muted/50" data-testid="text-script-file">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="font-mono text-xs break-all">{script.file}</span>
              </div>
            </div>

            {script.usage && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide">Usage</span>
                </div>
                <div className="py-2 px-3 rounded-md bg-muted/50 overflow-x-auto" data-testid="text-script-usage">
                  <code className="text-xs font-mono text-muted-foreground whitespace-pre">{script.usage}</code>
                </div>
              </div>
            )}

            {script.flags && script.flags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide">Flags</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {script.flags.map((flag) => (
                    <Badge key={flag} variant="secondary" className="text-xs font-mono" data-testid={`badge-flag-${flag.replace(/^--/, "")}`}>
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {script.relatedScripts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide">Related Scripts</span>
                </div>
                <div className="space-y-1">
                  {script.relatedScripts.map((name) => {
                    const related = scripts.find((s) => s.name === name);
                    if (!related) return null;
                    const RelIcon = related.icon;
                    return (
                      <button
                        key={name}
                        className="flex items-center gap-2 w-full text-left text-sm py-1.5 px-2 rounded-md hover-elevate active-elevate-2 cursor-pointer"
                        data-testid={`button-related-${scriptSlug(name)}`}
                        onClick={() => onSelectScript(name)}
                      >
                        <RelIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate font-mono text-xs">{name}</span>
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

function ScriptCard({ script, onClick }: { script: Script; onClick: () => void }) {
  const Icon = script.icon;
  const slug = scriptSlug(script.name);
  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2"
      data-testid={`card-script-${slug}`}
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
          <CardTitle className="text-sm leading-tight font-mono" data-testid={`text-script-title-${slug}`}>
            {script.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2" data-testid={`text-script-desc-${slug}`}>
          {script.description}
        </p>
      </CardContent>
    </Card>
  );
}

function TagSubGroup({
  tag,
  items,
  onSelectScript,
}: {
  tag: string;
  items: Script[];
  onSelectScript: (script: Script) => void;
}) {
  const meta = TAG_META[tag];
  const TagIcon = meta?.icon ?? Terminal;
  const tagSlug = tag.toLowerCase();
  return (
    <div className="space-y-3" data-testid={`scripts-tag-${tagSlug}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <h4 className="text-sm font-medium" data-testid={`text-scripts-tag-${tagSlug}`}>
          {tag}
        </h4>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta?.colorClasses ?? ""}`} data-testid={`badge-scripts-tag-count-${tagSlug}`}>
          {items.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((s) => (
          <ScriptCard key={s.name} script={s} onClick={() => onSelectScript(s)} />
        ))}
      </div>
    </div>
  );
}

export default function ScriptsPage() {
  const groups = useMemo(() => groupByTag(scripts), []);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const handleSelectByName = (name: string) => {
    const found = scripts.find((s) => s.name === name);
    if (found) setSelectedScript(found);
  };

  const pipelineCount = scripts.filter((s) => s.type === "pipeline").length;
  const systemCount = scripts.filter((s) => s.type === "system").length;
  const libraryCount = scripts.filter((s) => s.type === "library").length;

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto" data-testid="scripts-page">
      <div className="flex items-center gap-2 flex-wrap">
        <Terminal className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-scripts-header">
          Scripts
        </h2>
        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" data-testid="badge-total-count">
            {scripts.length} scripts
          </Badge>
          <Badge variant="outline" className={`text-xs ${TYPE_LABELS.pipeline.colorClasses}`}>
            {pipelineCount} pipeline
          </Badge>
          <Badge variant="outline" className={`text-xs ${TYPE_LABELS.system.colorClasses}`}>
            {systemCount} system
          </Badge>
          <Badge variant="outline" className={`text-xs ${TYPE_LABELS.library.colorClasses}`}>
            {libraryCount} library
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" data-testid="text-scripts-description">
        All AXION CLI scripts organized by category. Pipeline scripts execute as part of the automated pipeline, system scripts handle orchestration and utilities, and library modules provide shared functionality.
      </p>

      <div className="space-y-6">
        {groups.map(({ tag, scripts: items }) => (
          <TagSubGroup key={tag} tag={tag} items={items} onSelectScript={setSelectedScript} />
        ))}
      </div>

      {selectedScript && (
        <ScriptDetailDialog
          script={selectedScript}
          open={!!selectedScript}
          onOpenChange={(open) => { if (!open) setSelectedScript(null); }}
          onSelectScript={handleSelectByName}
        />
      )}
    </div>
  );
}
