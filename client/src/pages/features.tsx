import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import type { ElementType } from "react";

interface Feature {
  title: string;
  description: string;
  icon: ElementType;
  tag: string;
}

const axionSystemFeatures: Feature[] = [
  {
    title: "Full Pipeline Orchestration",
    description:
      "Automated chaining of all pipeline steps from project idea to packaged Agent Kit: kit-create, seed, generate, review, draft, verify, lock, build-plan, build-exec, and package.",
    icon: Workflow,
    tag: "Core",
  },
  {
    title: "Assembly Upgrade Layers",
    description:
      "Iterative assembly upgrades via revision system. Add new ideas or critiques after initial pipeline pass, bump revision, and re-run non-destructively to produce versioned upgrade kits.",
    icon: ArrowUpCircle,
    tag: "Core",
  },
  {
    title: "Import & Reconcile",
    description:
      "Read-only analysis of existing repositories to produce import reports and documentation seeds. Reconcile compares imported facts against build outputs to detect drift.",
    icon: Import,
    tag: "Pipeline",
  },
  {
    title: "Gate Enforcement",
    description:
      "Strict stage execution order with module dependency enforcement. Pipeline steps enforce prerequisite gates before proceeding.",
    icon: Lock,
    tag: "Pipeline",
  },
  {
    title: "Per-Module Iteration",
    description:
      "Review, draft, verify, and lock steps use per-module iteration to satisfy dependency ordering via ensurePrereqs.",
    icon: IterationCw,
    tag: "Pipeline",
  },
  {
    title: "Build Plan & Execution",
    description:
      "Generates a build plan from documentation, then executes it to produce a manifest and apply file operations for application scaffolding.",
    icon: Hammer,
    tag: "Pipeline",
  },
  {
    title: "Kit Packaging",
    description:
      "Package completed Agent Kits into distributable zip bundles, supporting both domain-based and workspace-scoped packages.",
    icon: Package,
    tag: "Pipeline",
  },
  {
    title: "Two-Root Architecture",
    description:
      "Strict isolation between immutable AXION system code and generated project workspaces, preventing system pollution.",
    icon: GitBranch,
    tag: "Architecture",
  },
  {
    title: "Stack Profile Contract",
    description:
      "Authoritative source for stack configuration within a kit workspace via registry/stack_profile.json.",
    icon: FileText,
    tag: "Architecture",
  },
  {
    title: "Anchor Convention",
    description:
      "HTML comment-like anchors for dynamic content injection during code generation, enabling precise template-based scaffolding.",
    icon: Layers,
    tag: "Architecture",
  },
  {
    title: "UNKNOWN Detection & Content Fill",
    description:
      "Automatic scanning for placeholder content in documentation with AI-driven content filling, document priority ordering, and template-type-aware prompting.",
    icon: Search,
    tag: "AI",
  },
  {
    title: "Atomic Writer Library",
    description:
      "Crash-resilient file writing using a write-to-tmp then atomic rename pattern, ensuring data integrity across all pipeline operations.",
    icon: ShieldCheck,
    tag: "Reliability",
  },
  {
    title: "Transient Failure Retry",
    description:
      "Exponential backoff for ENOENT, ETIMEDOUT, ECONNRESET, and OOM-kill errors across all pipeline steps.",
    icon: RefreshCw,
    tag: "Reliability",
  },
  {
    title: "Doctor & Preflight Checks",
    description:
      "System validation scripts that verify environment health, dependencies, and configuration before pipeline execution.",
    icon: ClipboardCheck,
    tag: "Reliability",
  },
  {
    title: "Path Traversal Protection",
    description:
      "Hardened workspace delete endpoint with input validation to prevent directory traversal attacks.",
    icon: ShieldCheck,
    tag: "Security",
  },
];

const dashboardUIFeatures: Feature[] = [
  {
    title: "Assembly Control Room",
    description:
      "Real-time SSE streaming of pipeline execution with step-level timing, progress tracking, log display, and retry from failed step.",
    icon: Monitor,
    tag: "Core",
  },
  {
    title: "4-Step Assembly Wizard",
    description:
      "Guided new assembly creation with Vision, Stack, Modules, and Review steps. Includes zip context upload with bomb protection.",
    icon: Sparkles,
    tag: "Core",
  },
  {
    title: "Zip Context Upload",
    description:
      "Upload a zip file on the New Assembly form to extract all text files and populate the context textarea. Includes zip bomb protection and path sanitization.",
    icon: Upload,
    tag: "Core",
  },
  {
    title: "Pipeline Retry from Failed Step",
    description:
      "Resume pipeline execution from the exact step that failed, skipping previously successful steps. Supports interrupted state recovery.",
    icon: Play,
    tag: "Orchestration",
  },
  {
    title: "Individual Pipeline Actions",
    description:
      "Trigger any pipeline step independently (import, reconcile, iterate, build-plan, build-exec, deploy, clean, status, next, activate) from the Control Room.",
    icon: Zap,
    tag: "Orchestration",
  },
  {
    title: "Document Inventory & Upgrade",
    description:
      "Interactive ReactFlow node graph showing document cascade hierarchy. AI-powered doc upgrade at per-file, per-section, and global levels.",
    icon: BookOpen,
    tag: "AI",
  },
  {
    title: "UNKNOWN Revision Flow",
    description:
      "Interactive revision system: scan docs for UNKNOWNs, generate targeted questions, accept user answers, then fill and cascade content across all documents.",
    icon: Bot,
    tag: "AI",
  },
  {
    title: "SSE Interruption Handling",
    description:
      "Graceful handling of dropped SSE connections during pipeline runs. Assemblies are marked as interrupted with retry controls.",
    icon: WifiOff,
    tag: "Reliability",
  },
  {
    title: "Workspaces Management",
    description:
      "Dedicated page listing all workspaces with on-disk status indicators (Registry, Domains, App), delete functionality, expandable file tree browser, and orphaned record cleanup.",
    icon: HardDrive,
    tag: "Management",
  },
  {
    title: "Kit Export",
    description:
      "Package and download completed Agent Kits as zip bundles directly from the dashboard.",
    icon: FileArchive,
    tag: "Management",
  },
  {
    title: "File Browser",
    description:
      "Browse workspace files with directory navigation and syntax-highlighted file content viewing.",
    icon: FolderTree,
    tag: "Management",
  },
  {
    title: "Pipeline Logs Viewer",
    description:
      "Browse and inspect logs from all pipeline runs with status filtering, search, and expandable run details.",
    icon: ScrollText,
    tag: "Monitoring",
  },
  {
    title: "System Health Monitoring",
    description:
      "Health check page showing API status, workspace summary, and release gate results with pass/fail indicators.",
    icon: HeartPulse,
    tag: "Monitoring",
  },
  {
    title: "Step-Level Timing",
    description:
      "Per-step duration tracking displayed in the Assembly Control Room stepper, showing exactly how long each pipeline step takes.",
    icon: Timer,
    tag: "Monitoring",
  },
  {
    title: "Document Inventory Dialogs",
    description:
      "UpgradeDialog for AI suggestions and custom instructions, FileViewerDialog with markdown rendering, and AddDocDialog for per-section and per-domain file creation.",
    icon: Eye,
    tag: "Docs",
  },
  {
    title: "Test Suite Runner",
    description:
      "Execute Vitest test suites directly from the dashboard with color-coded results, file picker, live streaming output, and console log display.",
    icon: FlaskConical,
    tag: "Testing",
  },
  {
    title: "Dark/Light Theme",
    description:
      "Full theme support across the entire dashboard with persistent preference and one-click toggle.",
    icon: Palette,
    tag: "UX",
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

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const slug = featureSlug(feature.title);
  return (
    <Card data-testid={`card-feature-${slug}`}>
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
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-feature-desc-${slug}`}>
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

function TagSubGroup({ tag, features, sectionPrefix }: { tag: string; features: Feature[]; sectionPrefix: string }) {
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
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const axionGroups = useMemo(() => groupByTag(axionSystemFeatures), []);
  const dashboardGroups = useMemo(() => groupByTag(dashboardUIFeatures), []);

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
            <TagSubGroup key={tag} tag={tag} features={features} sectionPrefix="axion" />
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
            <TagSubGroup key={tag} tag={tag} features={features} sectionPrefix="dashboard" />
          ))}
        </div>
      </section>
    </div>
  );
}
