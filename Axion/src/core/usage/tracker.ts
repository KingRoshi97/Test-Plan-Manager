const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "gpt-4-turbo": { input: 10.00 / 1_000_000, output: 30.00 / 1_000_000 },
};

export interface UsageEntry {
  timestamp: string;
  stage: string;
  template_id?: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface RunUsageSummary {
  run_id: string;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  api_calls: number;
  by_stage: Record<string, {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost_usd: number;
    calls: number;
  }>;
  entries: UsageEntry[];
}

const _runUsage = new Map<string, UsageEntry[]>();

let _activeRunId: string | null = null;

export function setActiveRun(runId: string): void {
  _activeRunId = runId;
  if (!_runUsage.has(runId)) {
    _runUsage.set(runId, []);
  }
}

export function clearRun(runId: string): void {
  _runUsage.delete(runId);
  if (_activeRunId === runId) _activeRunId = null;
}

export function recordUsage(opts: {
  runId?: string;
  stage: string;
  templateId?: string;
  model?: string;
  promptTokens: number;
  completionTokens: number;
}): void {
  const runId = opts.runId ?? _activeRunId;
  if (!runId) return;

  const model = opts.model ?? "gpt-4o";
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["gpt-4o"];
  const cost = (opts.promptTokens * pricing.input) + (opts.completionTokens * pricing.output);

  const entry: UsageEntry = {
    timestamp: new Date().toISOString(),
    stage: opts.stage,
    template_id: opts.templateId,
    model,
    prompt_tokens: opts.promptTokens,
    completion_tokens: opts.completionTokens,
    total_tokens: opts.promptTokens + opts.completionTokens,
    cost_usd: Math.round(cost * 1_000_000) / 1_000_000,
  };

  if (!_runUsage.has(runId)) {
    _runUsage.set(runId, []);
  }
  _runUsage.get(runId)!.push(entry);

  const entries = _runUsage.get(runId)!;
  let cumPrompt = 0, cumCompletion = 0, cumCost = 0;
  const byStage: Record<string, { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_usd: number; calls: number }> = {};
  for (const e of entries) {
    cumPrompt += e.prompt_tokens;
    cumCompletion += e.completion_tokens;
    cumCost += e.cost_usd;
    if (!byStage[e.stage]) {
      byStage[e.stage] = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost_usd: 0, calls: 0 };
    }
    const s = byStage[e.stage];
    s.prompt_tokens += e.prompt_tokens;
    s.completion_tokens += e.completion_tokens;
    s.total_tokens += e.total_tokens;
    s.cost_usd += e.cost_usd;
    s.calls += 1;
  }
  const livePayload = {
    stage: opts.stage,
    model,
    prompt_tokens: opts.promptTokens,
    completion_tokens: opts.completionTokens,
    total_prompt_tokens: cumPrompt,
    total_completion_tokens: cumCompletion,
    total_tokens: cumPrompt + cumCompletion,
    total_cost_usd: Math.round(cumCost * 1_000_000) / 1_000_000,
    api_calls: entries.length,
    by_stage: byStage,
  };
  console.log(`TOKEN_USAGE: ${JSON.stringify(livePayload)}`);
}

export function getRunUsage(runId?: string): RunUsageSummary | null {
  const id = runId ?? _activeRunId;
  if (!id) return null;

  const entries = _runUsage.get(id);
  if (!entries || entries.length === 0) return null;

  const byStage: RunUsageSummary["by_stage"] = {};
  let totalPrompt = 0;
  let totalCompletion = 0;
  let totalCost = 0;

  for (const e of entries) {
    totalPrompt += e.prompt_tokens;
    totalCompletion += e.completion_tokens;
    totalCost += e.cost_usd;

    if (!byStage[e.stage]) {
      byStage[e.stage] = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost_usd: 0, calls: 0 };
    }
    const s = byStage[e.stage];
    s.prompt_tokens += e.prompt_tokens;
    s.completion_tokens += e.completion_tokens;
    s.total_tokens += e.total_tokens;
    s.cost_usd += e.cost_usd;
    s.calls += 1;
  }

  return {
    run_id: id,
    total_prompt_tokens: totalPrompt,
    total_completion_tokens: totalCompletion,
    total_tokens: totalPrompt + totalCompletion,
    total_cost_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
    api_calls: entries.length,
    by_stage: byStage,
    entries,
  };
}
