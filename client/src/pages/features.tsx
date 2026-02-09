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

type FeatureSource = "AXION System" | "Dashboard UI";

interface Feature {
  title: string;
  description: string;
  icon: ElementType;
  tags: string[];
  source: FeatureSource;
}

const allFeatures: Feature[] = [
  {
    title: "Full Pipeline Orchestration",
    description:
      "Automated chaining of all pipeline steps from project idea to packaged Agent Kit: kit-create, seed, generate, review, draft, verify, lock, build-plan, build-exec, and package.",
    icon: Workflow,
    tags: ["Core"],
    source: "AXION System",
  },
  {
    title: "Two-Root Architecture",
    description:
      "Strict isolation between immutable AXION system code and generated project workspaces, preventing system pollution.",
    icon: GitBranch,
    tags: ["Architecture"],
    source: "AXION System",
  },
  {
    title: "Import & Reconcile",
    description:
      "Read-only analysis of existing repositories to produce import reports and documentation seeds. Reconcile compares imported facts against build outputs to detect drift.",
    icon: Import,
    tags: ["Pipeline"],
    source: "AXION System",
  },
  {
    title: "UNKNOWN Detection & Content Fill",
    description:
      "Automatic scanning for placeholder content in documentation with AI-driven content filling, document priority ordering, and template-type-aware prompting.",
    icon: Search,
    tags: ["AI"],
    source: "AXION System",
  },
  {
    title: "Assembly Upgrade Layers",
    description:
      "Iterative assembly upgrades via revision system. Add new ideas or critiques after initial pipeline pass, bump revision, and re-run non-destructively to produce versioned upgrade kits.",
    icon: ArrowUpCircle,
    tags: ["Core"],
    source: "AXION System",
  },
  {
    title: "Atomic Writer Library",
    description:
      "Crash-resilient file writing using a write-to-tmp then atomic rename pattern, ensuring data integrity across all pipeline operations.",
    icon: ShieldCheck,
    tags: ["Reliability"],
    source: "AXION System",
  },
  {
    title: "Transient Failure Retry",
    description:
      "Exponential backoff for ENOENT, ETIMEDOUT, ECONNRESET, and OOM-kill errors across all pipeline steps.",
    icon: RefreshCw,
    tags: ["Reliability"],
    source: "AXION System",
  },
  {
    title: "Gate Enforcement",
    description:
      "Strict stage execution order with module dependency enforcement. Pipeline steps enforce prerequisite gates before proceeding.",
    icon: Lock,
    tags: ["Pipeline"],
    source: "AXION System",
  },
  {
    title: "Per-Module Iteration",
    description:
      "Review, draft, verify, and lock steps use per-module iteration to satisfy dependency ordering via ensurePrereqs.",
    icon: IterationCw,
    tags: ["Pipeline"],
    source: "AXION System",
  },
  {
    title: "Stack Profile Contract",
    description:
      "Authoritative source for stack configuration within a kit workspace via registry/stack_profile.json.",
    icon: FileText,
    tags: ["Architecture"],
    source: "AXION System",
  },
  {
    title: "Anchor Convention",
    description:
      "HTML comment-like anchors for dynamic content injection during code generation, enabling precise template-based scaffolding.",
    icon: Layers,
    tags: ["Architecture"],
    source: "AXION System",
  },
  {
    title: "Build Plan & Execution",
    description:
      "Generates a build plan from documentation, then executes it to produce a manifest and apply file operations for application scaffolding.",
    icon: Hammer,
    tags: ["Pipeline"],
    source: "AXION System",
  },
  {
    title: "Kit Packaging",
    description:
      "Package completed Agent Kits into distributable zip bundles, supporting both domain-based and workspace-scoped packages.",
    icon: Package,
    tags: ["Pipeline"],
    source: "AXION System",
  },
  {
    title: "Path Traversal Protection",
    description:
      "Hardened workspace delete endpoint with input validation to prevent directory traversal attacks.",
    icon: ShieldCheck,
    tags: ["Security"],
    source: "AXION System",
  },
  {
    title: "Doctor & Preflight Checks",
    description:
      "System validation scripts that verify environment health, dependencies, and configuration before pipeline execution.",
    icon: ClipboardCheck,
    tags: ["Reliability"],
    source: "AXION System",
  },
  {
    title: "Assembly Control Room",
    description:
      "Real-time SSE streaming of pipeline execution with step-level timing, progress tracking, log display, and retry from failed step.",
    icon: Monitor,
    tags: ["Core"],
    source: "Dashboard UI",
  },
  {
    title: "4-Step Assembly Wizard",
    description:
      "Guided new assembly creation with Vision, Stack, Modules, and Review steps. Includes zip context upload with bomb protection.",
    icon: Sparkles,
    tags: ["Core"],
    source: "Dashboard UI",
  },
  {
    title: "Pipeline Retry from Failed Step",
    description:
      "Resume pipeline execution from the exact step that failed, skipping previously successful steps. Supports interrupted state recovery.",
    icon: Play,
    tags: ["Orchestration"],
    source: "Dashboard UI",
  },
  {
    title: "Individual Pipeline Actions",
    description:
      "Trigger any pipeline step independently (import, reconcile, iterate, build-plan, build-exec, deploy, clean, status, next, activate) from the Control Room.",
    icon: Zap,
    tags: ["Orchestration"],
    source: "Dashboard UI",
  },
  {
    title: "Workspaces Management",
    description:
      "Dedicated page listing all workspaces with on-disk status indicators (Registry, Domains, App), delete functionality, expandable file tree browser, and orphaned record cleanup.",
    icon: HardDrive,
    tags: ["Management"],
    source: "Dashboard UI",
  },
  {
    title: "Document Inventory & Upgrade",
    description:
      "Interactive ReactFlow node graph showing document cascade hierarchy. AI-powered doc upgrade at per-file, per-section, and global levels.",
    icon: BookOpen,
    tags: ["AI"],
    source: "Dashboard UI",
  },
  {
    title: "UNKNOWN Revision Flow",
    description:
      "Interactive revision system: scan docs for UNKNOWNs, generate targeted questions, accept user answers, then fill and cascade content across all documents.",
    icon: Bot,
    tags: ["AI"],
    source: "Dashboard UI",
  },
  {
    title: "Test Suite Runner",
    description:
      "Execute Vitest test suites directly from the dashboard with color-coded results, file picker, live streaming output, and console log display.",
    icon: FlaskConical,
    tags: ["Testing"],
    source: "Dashboard UI",
  },
  {
    title: "Pipeline Logs Viewer",
    description:
      "Browse and inspect logs from all pipeline runs with status filtering, search, and expandable run details.",
    icon: ScrollText,
    tags: ["Monitoring"],
    source: "Dashboard UI",
  },
  {
    title: "System Health Monitoring",
    description:
      "Health check page showing API status, workspace summary, and release gate results with pass/fail indicators.",
    icon: HeartPulse,
    tags: ["Monitoring"],
    source: "Dashboard UI",
  },
  {
    title: "Kit Export",
    description:
      "Package and download completed Agent Kits as zip bundles directly from the dashboard.",
    icon: FileArchive,
    tags: ["Management"],
    source: "Dashboard UI",
  },
  {
    title: "Zip Context Upload",
    description:
      "Upload a zip file on the New Assembly form to extract all text files and populate the context textarea. Includes zip bomb protection and path sanitization.",
    icon: Upload,
    tags: ["Core"],
    source: "Dashboard UI",
  },
  {
    title: "File Browser",
    description:
      "Browse workspace files with directory navigation and syntax-highlighted file content viewing.",
    icon: FolderTree,
    tags: ["Management"],
    source: "Dashboard UI",
  },
  {
    title: "Document Inventory Dialogs",
    description:
      "UpgradeDialog for AI suggestions and custom instructions, FileViewerDialog with markdown rendering, and AddDocDialog for per-section and per-domain file creation.",
    icon: Eye,
    tags: ["Docs"],
    source: "Dashboard UI",
  },
  {
    title: "Dark/Light Theme",
    description:
      "Full theme support across the entire dashboard with persistent preference and one-click toggle.",
    icon: Palette,
    tags: ["UX"],
    source: "Dashboard UI",
  },
  {
    title: "SSE Interruption Handling",
    description:
      "Graceful handling of dropped SSE connections during pipeline runs. Assemblies are marked as interrupted with retry controls.",
    icon: WifiOff,
    tags: ["Reliability"],
    source: "Dashboard UI",
  },
  {
    title: "Step-Level Timing",
    description:
      "Per-step duration tracking displayed in the Assembly Control Room stepper, showing exactly how long each pipeline step takes.",
    icon: Timer,
    tags: ["Monitoring"],
    source: "Dashboard UI",
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

const TAG_META: Record<string, { icon: ElementType; description: string; colorClasses: string }> = {
  Core: {
    icon: Cpu,
    description: "Foundational capabilities that define the system.",
    colorClasses: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent",
  },
  Pipeline: {
    icon: Workflow,
    description: "Pipeline stages, step execution, and build processes.",
    colorClasses: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-transparent",
  },
  Architecture: {
    icon: Layers,
    description: "Structural patterns, contracts, and system design decisions.",
    colorClasses: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border-transparent",
  },
  AI: {
    icon: Bot,
    description: "AI-driven content generation, document filling, and intelligent upgrades.",
    colorClasses: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-transparent",
  },
  Orchestration: {
    icon: Settings,
    description: "Pipeline control, retry logic, and individual action triggers.",
    colorClasses: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-transparent",
  },
  Reliability: {
    icon: Shield,
    description: "Crash resilience, data integrity, and fault tolerance mechanisms.",
    colorClasses: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent",
  },
  Security: {
    icon: Lock,
    description: "Input validation, path protection, and hardened endpoints.",
    colorClasses: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent",
  },
  Management: {
    icon: Wrench,
    description: "Workspace, file, and export management tools.",
    colorClasses: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-transparent",
  },
  Monitoring: {
    icon: Gauge,
    description: "Health checks, log viewing, and step-level timing.",
    colorClasses: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-transparent",
  },
  Docs: {
    icon: BookOpen,
    description: "Document inventory, viewing, and creation tools.",
    colorClasses: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-transparent",
  },
  Testing: {
    icon: TestTube2,
    description: "Test suite execution and result visualization.",
    colorClasses: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent",
  },
  UX: {
    icon: Paintbrush,
    description: "Theme support, visual polish, and user experience enhancements.",
    colorClasses: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 border-transparent",
  },
};

function featureSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sourceBadge(source: FeatureSource) {
  if (source === "AXION System") {
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 border-transparent"
      >
        System
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border-transparent"
    >
      Dashboard
    </Badge>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const slug = featureSlug(feature.title);
  return (
    <Card className="hover-elevate" data-testid={`card-feature-${slug}`}>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CardTitle className="text-sm leading-tight" data-testid={`text-feature-title-${slug}`}>
              {feature.title}
            </CardTitle>
            {sourceBadge(feature.source)}
          </div>
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

export default function FeaturesPage() {
  const grouped = useMemo(() => {
    const map = new Map<string, Feature[]>();
    for (const f of allFeatures) {
      const primaryTag = f.tags[0];
      if (!map.has(primaryTag)) map.set(primaryTag, []);
      map.get(primaryTag)!.push(f);
    }
    const sorted: { tag: string; features: Feature[] }[] = [];
    for (const tag of TAG_ORDER) {
      const features = map.get(tag);
      if (features && features.length > 0) {
        sorted.push({ tag, features });
      }
    }
    map.forEach((features, tag) => {
      if (!TAG_ORDER.includes(tag)) {
        sorted.push({ tag, features });
      }
    });
    return sorted;
  }, []);

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto" data-testid="features-page">
      <div className="flex items-center gap-2">
        <LayoutList className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-features-header">
          Features
        </h2>
        <Badge variant="secondary" className="ml-auto" data-testid="badge-total-count">
          {allFeatures.length} features
        </Badge>
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        <span>Legend:</span>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 border-transparent">
            System
          </Badge>
          <span>AXION System</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border-transparent">
            Dashboard
          </Badge>
          <span>Dashboard UI</span>
        </div>
      </div>

      {grouped.map(({ tag, features }) => {
        const meta = TAG_META[tag];
        const TagIcon = meta?.icon ?? LayoutList;
        const tagSlug = tag.toLowerCase();
        return (
          <section key={tag} data-testid={`section-tag-${tagSlug}`}>
            <div className="flex items-center gap-2 mb-1">
              <TagIcon className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-semibold" data-testid={`text-section-${tagSlug}`}>
                {tag}
              </h3>
              <Badge variant="outline" className={`text-xs ${meta?.colorClasses ?? ""}`}>
                {features.length}
              </Badge>
            </div>
            {meta?.description && (
              <p className="text-sm text-muted-foreground mb-4 ml-6">
                {meta.description}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid={`grid-tag-${tagSlug}`}>
              {features.map((f) => (
                <FeatureCard key={f.title} feature={f} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
