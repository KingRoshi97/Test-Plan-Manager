import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface DocNodeData {
  label: string;
  shortLabel: string;
  category: "system" | "source" | "template" | "generated";
  sectionId?: string;
  [key: string]: unknown;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  system: { bg: "hsl(var(--chart-1) / 0.15)", border: "hsl(var(--chart-1))", text: "hsl(var(--chart-1))" },
  source: { bg: "hsl(var(--chart-2) / 0.15)", border: "hsl(var(--chart-2))", text: "hsl(var(--chart-2))" },
  template: { bg: "hsl(var(--chart-3) / 0.15)", border: "hsl(var(--chart-3))", text: "hsl(var(--chart-3))" },
  generated: { bg: "hsl(var(--chart-4) / 0.15)", border: "hsl(var(--chart-4))", text: "hsl(var(--chart-4))" },
};

function DocNode({ data }: { data: DocNodeData }) {
  const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.system;

  return (
    <div
      className="rounded-md cursor-pointer transition-transform"
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        padding: "8px 14px",
        minWidth: 100,
        textAlign: "center",
      }}
      data-testid={`map-node-${data.shortLabel}`}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border, width: 6, height: 6 }} />
      <div style={{ color: colors.text, fontWeight: 600, fontSize: 11, lineHeight: "1.3" }}>{data.shortLabel}</div>
      <div style={{ color: "var(--muted-foreground)", fontSize: 9, lineHeight: "1.2", marginTop: 2 }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: colors.border, width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  doc: DocNode,
};

const LAYER_Y: Record<string, number> = {
  system: 0,
  source: 140,
  template: 280,
  generated: 420,
};

function buildNodes(): Node[] {
  const nodes: Node[] = [];

  const systemDocs = [
    { id: "sys-readme", short: "README", label: "System Overview", x: 0 },
    { id: "sys-pipeline", short: "PIPELINE", label: "App Pipeline", x: 160 },
    { id: "sys-cli", short: "CLI", label: "CLI Reference", x: 320 },
    { id: "sys-gates", short: "GATES", label: "Gates & Overrides", x: 480 },
    { id: "sys-2root", short: "2-ROOT", label: "Two-Root Arch", x: 640 },
  ];

  for (const d of systemDocs) {
    nodes.push({
      id: d.id,
      type: "doc",
      position: { x: d.x, y: LAYER_Y.system },
      data: { label: d.label, shortLabel: d.short, category: "system", sectionId: "section-system-docs" } as DocNodeData,
    });
  }

  const sourceDocs = [
    { id: "src-rpbs", short: "RPBS", label: "Product Boundaries", x: 0 },
    { id: "src-rebs", short: "REBS", label: "Engineering Boundaries", x: 160 },
    { id: "src-component", short: "COMP SPEC", label: "Component Spec", x: 320 },
    { id: "src-impl", short: "IMPL GUIDE", label: "Implementation Guide", x: 480 },
    { id: "src-schema", short: "SCHEMA", label: "Schema Spec", x: 640 },
  ];

  for (const d of sourceDocs) {
    nodes.push({
      id: d.id,
      type: "doc",
      position: { x: d.x, y: LAYER_Y.source },
      data: { label: d.label, shortLabel: d.short, category: "source", sectionId: "section-product-docs" } as DocNodeData,
    });
  }

  const templateDocs = [
    { id: "tpl-ddes", short: "DDES", label: "Domain Design", x: -80 },
    { id: "tpl-ux", short: "UX", label: "UX Foundations", x: 60 },
    { id: "tpl-ui", short: "UI", label: "UI Constraints", x: 200 },
    { id: "tpl-dim", short: "DIM", label: "Interface Map", x: 320 },
    { id: "tpl-screen", short: "SCREEN", label: "Screen Map", x: 440 },
    { id: "tpl-test", short: "TEST", label: "Test Plan", x: 560 },
    { id: "tpl-bels", short: "BELS", label: "Entity Logic", x: 680 },
    { id: "tpl-comp", short: "COMP LIB", label: "Component Lib", x: 800 },
  ];

  for (const d of templateDocs) {
    nodes.push({
      id: d.id,
      type: "doc",
      position: { x: d.x, y: LAYER_Y.template },
      data: { label: d.label, shortLabel: d.short, category: "template", sectionId: "section-core-templates" } as DocNodeData,
    });
  }

  const genDocs = [
    { id: "gen-domains", short: "DOMAINS", label: "Per-Domain Output", x: 200 },
    { id: "gen-app", short: "APP", label: "App Scaffold", x: 400 },
  ];

  for (const d of genDocs) {
    nodes.push({
      id: d.id,
      type: "doc",
      position: { x: d.x, y: LAYER_Y.generated },
      data: { label: d.label, shortLabel: d.short, category: "generated", sectionId: "section-generated-output" } as DocNodeData,
    });
  }

  return nodes;
}

function buildEdges(): Edge[] {
  return [
    { id: "e-rpbs-rebs", source: "src-rpbs", target: "src-rebs", animated: true },
    { id: "e-rpbs-readme", source: "src-rpbs", target: "sys-readme" },

    { id: "e-rebs-ddes", source: "src-rebs", target: "tpl-ddes", animated: true },
    { id: "e-rebs-comp", source: "src-rebs", target: "src-component" },

    { id: "e-ddes-ux", source: "tpl-ddes", target: "tpl-ux" },
    { id: "e-ux-ui", source: "tpl-ux", target: "tpl-ui" },
    { id: "e-ui-dim", source: "tpl-ui", target: "tpl-dim" },
    { id: "e-dim-screen", source: "tpl-dim", target: "tpl-screen" },
    { id: "e-screen-test", source: "tpl-screen", target: "tpl-test" },
    { id: "e-ddes-bels", source: "tpl-ddes", target: "tpl-bels" },
    { id: "e-ux-comp", source: "tpl-ux", target: "tpl-comp" },

    { id: "e-tpl-gen", source: "tpl-ddes", target: "gen-domains", animated: true },
    { id: "e-bels-gen", source: "tpl-bels", target: "gen-domains" },
    { id: "e-comp-gen", source: "tpl-comp", target: "gen-domains" },

    { id: "e-pipeline-gen", source: "sys-pipeline", target: "gen-app" },
    { id: "e-domains-app", source: "gen-domains", target: "gen-app" },
  ].map((e) => ({
    ...e,
    type: "smoothstep",
    style: { stroke: "hsl(var(--muted-foreground) / 0.4)", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "hsl(var(--muted-foreground) / 0.5)" },
  }));
}

interface DocHierarchyMapProps {
  onNodeClick?: (sectionId: string) => void;
}

function DocHierarchyMapInner({ onNodeClick }: DocHierarchyMapProps) {
  const initialNodes = useMemo(() => buildNodes(), []);
  const initialEdges = useMemo(() => buildEdges(), []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges] = useState(initialEdges);

  const handleNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const sectionId = (node.data as DocNodeData).sectionId;
      if (sectionId && onNodeClick) {
        onNodeClick(sectionId);
      }
    },
    [onNodeClick]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={() => {}}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.4}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
    >
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export default function DocHierarchyMap({ onNodeClick }: DocHierarchyMapProps) {
  return (
    <div
      className="w-full rounded-md border"
      style={{ height: 520, background: "hsl(var(--background))" }}
      data-testid="doc-hierarchy-map"
    >
      <ReactFlowProvider>
        <DocHierarchyMapInner onNodeClick={onNodeClick} />
      </ReactFlowProvider>
      <div className="flex items-center gap-4 px-4 py-2 border-t flex-wrap" data-testid="map-legend">
        {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: colors.border }}
            />
            <span className="text-xs text-muted-foreground capitalize">{cat}</span>
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">Click a node to scroll to its section</span>
      </div>
    </div>
  );
}
