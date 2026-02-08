import type { ElementType, ReactNode } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Loader2,
  BookOpen,
  FolderOpen,
  Layers,
  LayoutTemplate,
  Boxes,
  Cog,
} from "lucide-react";

interface DocFile {
  name: string;
  path: string;
  exists: boolean;
}

interface DomainTemplate extends DocFile {
  domain: string;
}

interface GeneratedDomain {
  domain: string;
  files: DocFile[];
}

interface DocInventory {
  systemDocs: DocFile[];
  productSourceDocs: DocFile[];
  registrySourceDocs: DocFile[];
  coreTemplates: DocFile[];
  domainTemplates: DomainTemplate[];
  generatedDomains: GeneratedDomain[];
  totals: {
    systemDocs: number;
    productSourceDocs: number;
    registrySourceDocs: number;
    coreTemplates: number;
    domainTemplates: number;
    generatedDomains: number;
  };
}

const DOC_DESCRIPTIONS: Record<string, string> = {
  "README.md": "AXION System Overview",
  "INDEX.md": "Documentation Index",
  "APP_PIPELINE.md": "Application Build Pipeline",
  "CLI_REFERENCE.md": "CLI Command Reference",
  "GATES_AND_OVERRIDES.md": "Quality Gates & Overrides",
  "RUN_ORCHESTRATOR.md": "Run Orchestrator Guide",
  "STAGE_MARKERS.md": "Stage Marker Conventions",
  "TWO_ROOT_ARCHITECTURE.md": "Two-Root Architecture Model",
  "CHANGE_CONTRACT_TEMPLATE.md": "Change Contract Template",
  "SYSTEM_UPGRADE_LOG.md": "System Upgrade Log",
  "RPBS_Product.md": "Requirements & Product Boundaries Specification",
  "REBS_Product.md": "Requirements & Engineering Boundaries Specification",
  "COMPONENT_SPEC.md": "Component Specification",
  "IMPLEMENTATION_GUIDE.md": "Implementation Guide",
  "SCHEMA_SPEC.md": "Schema Specification",
  "action-vocabulary.md": "Action Vocabulary",
  "domain-build-order.md": "Domain Build Order",
  "domain-map.md": "Domain Map",
  "fullstack-coverage-map.md": "Fullstack Coverage Map",
  "glossary.md": "Glossary",
  "module-index.md": "Module Index",
  "reason-codes.md": "Reason Codes",
  "run-sequences.md": "Run Sequences",
  "ALRP.template.md": "Agent Launch & Reasoning Protocol",
  "BELS.template.md": "Business Entity Logic Specification",
  "COMPONENT_LIBRARY.template.md": "Component Library",
  "COPY_GUIDE.template.md": "Copy Guide",
  "DDES.template.md": "Domain Design & Entity Specification",
  "DIM.template.md": "Domain Interface Map",
  "ERC.template.md": "Execution Readiness Contract",
  "SCREENMAP.template.md": "Screen Map",
  "SROL.template.md": "System Refinement & Optimization Loop",
  "TESTPLAN.template.md": "Test Plan",
  "TIES.template.md": "Technical Implementation Execution Specification",
  "UI_Constraints.template.md": "UI Constraints",
  "UX_Foundations.template.md": "UX Foundations",
};

function getDescription(filename: string): string {
  return DOC_DESCRIPTIONS[filename] || filename.replace(/\.template\.md$/, "").replace(/\.md$/, "").replace(/_/g, " ");
}

function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  count,
  defaultOpen = false,
  children,
  testId,
}: {
  title: string;
  subtitle: string;
  icon: ElementType;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
  testId: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <div
          className="flex w-full items-center gap-3 cursor-pointer rounded-md hover-elevate"
          onClick={() => setOpen(!open)}
          data-testid={`button-toggle-${testId}`}
        >
          {open ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
          <Icon className="w-5 h-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{title}</CardTitle>
              <Badge variant="secondary" data-testid={`badge-count-${testId}`}>{count} files</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-normal">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

function FileRow({ file, showPath = true }: { file: DocFile; showPath?: boolean }) {
  const desc = getDescription(file.name);
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-md hover-elevate"
      data-testid={`file-row-${file.name}`}
    >
      <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium truncate">{desc}</span>
        {showPath && (
          <span className="text-xs text-muted-foreground font-mono truncate">{file.path}</span>
        )}
      </div>
    </div>
  );
}

function DomainGroup({
  domain,
  files,
  testId,
}: {
  domain: string;
  files: DocFile[];
  testId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div data-testid={testId}>
      <div
        className="flex w-full items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md hover-elevate"
        onClick={() => setOpen(!open)}
        data-testid={`button-toggle-${testId}`}
      >
        {open ? <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />}
        <FolderOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium">{domain}</span>
        <Badge variant="outline" className="ml-auto" data-testid={`badge-count-${testId}`}>{files.length}</Badge>
      </div>
      {open && (
        <div className="ml-6 border-l pl-3 mt-1">
          {files.map((f) => (
            <FileRow key={f.path} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocInventoryPage() {
  const { data, isLoading } = useQuery<DocInventory>({
    queryKey: ["/api/doc-inventory"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-doc-inventory">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="error-doc-inventory">
        <p className="text-muted-foreground" data-testid="text-error-message">Failed to load document inventory</p>
      </div>
    );
  }

  const grandTotal =
    data.totals.systemDocs +
    data.totals.productSourceDocs +
    data.totals.registrySourceDocs +
    data.totals.coreTemplates +
    data.totals.domainTemplates +
    data.totals.generatedDomains;

  const sourceTotal = data.totals.systemDocs + data.totals.productSourceDocs + data.totals.registrySourceDocs + data.totals.coreTemplates + data.totals.domainTemplates;

  const domainsByName = data.domainTemplates.reduce<Record<string, DomainTemplate[]>>((acc, t) => {
    if (!acc[t.domain]) acc[t.domain] = [];
    acc[t.domain].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto" data-testid="page-doc-inventory">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Document Inventory</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete catalog of all AXION documents across the system. Source documents (Categories 1-4) are the files you upgrade directly.
          Generated output (Category 5) gets regenerated automatically from the templates.
        </p>
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Badge variant="secondary" data-testid="badge-grand-total">{grandTotal} total documents</Badge>
          <Badge variant="outline" data-testid="badge-source-total">{sourceTotal} source files</Badge>
          <Badge variant="outline" data-testid="badge-generated-total">{data.totals.generatedDomains} generated</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <CollapsibleSection
          title="1. System Docs"
          subtitle="How AXION works — pipeline instructions, tooling, and architecture references"
          icon={Cog}
          count={data.totals.systemDocs}
          defaultOpen
          testId="section-system-docs"
        >
          <div className="space-y-0.5">
            {data.systemDocs.map((f) => (
              <FileRow key={f.path} file={f} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="2. Source Docs — Product"
          subtitle="High-level product specifications that drive the pipeline"
          icon={Layers}
          count={data.totals.productSourceDocs}
          defaultOpen
          testId="section-product-docs"
        >
          <div className="space-y-0.5">
            {data.productSourceDocs.map((f) => (
              <FileRow key={f.path} file={f} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="2b. Source Docs — Registry"
          subtitle="System reference tables, indexes, and vocabularies used for validation and ordering"
          icon={Layers}
          count={data.totals.registrySourceDocs}
          defaultOpen
          testId="section-registry-docs"
        >
          <div className="space-y-0.5">
            {data.registrySourceDocs.map((f) => (
              <FileRow key={f.path} file={f} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="3. Core Templates"
          subtitle="Blank spec blueprints cloned into every project workspace — define WHAT the project needs"
          icon={LayoutTemplate}
          count={data.totals.coreTemplates}
          defaultOpen
          testId="section-core-templates"
        >
          <div className="space-y-0.5">
            {data.coreTemplates.map((f) => (
              <FileRow key={f.path} file={f} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="4. Domain Module Templates"
          subtitle="Domain scope definitions — define HOW each technical area should be built"
          icon={Boxes}
          count={data.totals.domainTemplates}
          testId="section-domain-templates"
        >
          <div className="space-y-1">
            {Object.entries(domainsByName)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([domain, files]) => (
                <DomainGroup
                  key={domain}
                  domain={domain}
                  files={files}
                  testId={`domain-template-${domain}`}
                />
              ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="5. Generated Output"
          subtitle="Pipeline output — core templates stamped and filled per domain. Regenerated when templates change."
          icon={FolderOpen}
          count={data.totals.generatedDomains}
          testId="section-generated-output"
        >
          <div className="space-y-1">
            {data.generatedDomains
              .sort((a, b) => a.domain.localeCompare(b.domain))
              .map((d) => (
                <DomainGroup
                  key={d.domain}
                  domain={d.domain}
                  files={d.files}
                  testId={`generated-domain-${d.domain}`}
                />
              ))}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
