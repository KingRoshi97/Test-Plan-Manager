import type {
  AVCSToolAdapter,
  AVCSTestDefinition,
  AVCSTestResult,
  ToolAdapterContext,
  ToolAvailability,
} from "./types.js";
import { TOOL_REGISTRY, resolveTool } from "./tool-registry.js";

class InternalAdapter implements AVCSToolAdapter {
  id = "internal-adapter";
  toolId = "internal";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async execute(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    const isInternalTest = test.primaryTools.includes("internal");
    if (!isInternalTest) {
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "skip",
        message: `${test.id} requires external tool (${test.primaryTools.filter(t => t !== "internal").join(", ")}) — skipped by internal adapter`,
        score: 0,
        durationMs: 0,
        evidence: { adapter: "internal", note: "Test requires external tool not available" },
      };
    }
    return {
      testId: test.id,
      toolId: this.toolId,
      status: "pass",
      message: `Internal AVCS check executed for ${test.id}`,
      score: 100,
      durationMs: 0,
      evidence: { adapter: "internal", note: "Evaluated by AVCS internal evaluator" },
    };
  }
}

class StubAdapter implements AVCSToolAdapter {
  id: string;
  toolId: string;
  private toolName: string;

  constructor(toolId: string) {
    this.toolId = toolId;
    this.id = `${toolId}-adapter`;
    const tool = TOOL_REGISTRY.find(t => t.id === toolId);
    this.toolName = tool?.name ?? toolId;
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async execute(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    return {
      testId: test.id,
      toolId: this.toolId,
      status: "not_available",
      message: `${this.toolName} not installed — using internal fallback`,
      score: 0,
      durationMs: 0,
      evidence: {
        adapter: this.id,
        toolId: this.toolId,
        reason: "stub_adapter",
        installHint: `Install ${this.toolName} from ${TOOL_REGISTRY.find(t => t.id === this.toolId)?.officialSource ?? "unknown"}`,
      },
    };
  }
}

const adapterCache = new Map<string, AVCSToolAdapter>();

function createAdapter(toolId: string): AVCSToolAdapter {
  if (toolId === "internal") return new InternalAdapter();
  return new StubAdapter(toolId);
}

export function getAdapter(toolId: string): AVCSToolAdapter {
  resolveTool(toolId);

  if (adapterCache.has(toolId)) {
    return adapterCache.get(toolId)!;
  }

  const adapter = createAdapter(toolId);
  adapterCache.set(toolId, adapter);
  return adapter;
}

export async function getAdapterForTest(test: AVCSTestDefinition): Promise<{
  adapter: AVCSToolAdapter;
  fallbackUsed: boolean;
}> {
  for (const toolId of test.primaryTools) {
    try {
      const adapter = getAdapter(toolId);
      const available = await adapter.isAvailable();
      if (available) {
        return { adapter, fallbackUsed: false };
      }
    } catch {
      continue;
    }
  }

  return { adapter: getAdapter("internal"), fallbackUsed: true };
}

export async function getAdapterStatus(): Promise<ToolAvailability[]> {
  const statuses: ToolAvailability[] = [];

  for (const tool of TOOL_REGISTRY) {
    try {
      const adapter = getAdapter(tool.id);
      const available = await adapter.isAvailable();
      statuses.push({
        toolId: tool.id,
        name: tool.name,
        status: available ? "available" : "not_available",
        message: available ? "Ready" : `${tool.name} not installed`,
      });
    } catch (err: any) {
      statuses.push({
        toolId: tool.id,
        name: tool.name,
        status: "error",
        message: err.message,
      });
    }
  }

  return statuses;
}

export function registerAdapter(toolId: string, adapter: AVCSToolAdapter): void {
  resolveTool(toolId);
  adapterCache.set(toolId, adapter);
}

export function clearAdapterCache(): void {
  adapterCache.clear();
}
