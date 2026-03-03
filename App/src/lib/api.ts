import type {
  RunsListResponse,
  RunDetailResponse,
  ArtifactReadResponse,
  LogReadResponse,
} from './types';

async function post<TRes>(path: string, body: Record<string, unknown> = {}): Promise<TRes> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as Record<string, string>).error || `API error ${res.status}`);
  }
  return res.json() as Promise<TRes>;
}

async function get<TRes>(path: string): Promise<TRes> {
  const res = await fetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as Record<string, string>).error || `API error ${res.status}`);
  }
  return res.json() as Promise<TRes>;
}

export interface ActionResult {
  action: {
    action_id: string;
    timestamp: string;
    action_type: string;
    outcome: string;
  };
  stdout: string;
  stderr: string;
  run?: {
    run_id: string;
    status: string;
    risk_class?: string;
    current_stage?: string;
    updated_at: string;
  };
  run_id?: string;
  manifest?: { kind: string; path: string } | null;
  stage_reports?: { kind: string; path: string }[];
  gate_reports?: { kind: string; path: string }[];
  stage_report?: { kind: string; path: string };
  report?: { kind: string; path: string };
  logs?: { kind: string; path: string }[];
}

export function doctor(): Promise<ActionResult> {
  return post('/api/doctor');
}

export function startRun(): Promise<ActionResult> {
  return post('/api/run/start');
}

export function advanceRun(runId: string): Promise<ActionResult> {
  return post('/api/run/advance', { run_id: runId });
}

export function runStage(runId: string, stageId: string): Promise<ActionResult> {
  return post('/api/run/stage', { run_id: runId, stage_id: stageId });
}

export function runGates(runId: string, stageId: string): Promise<ActionResult> {
  return post('/api/run/gates', { run_id: runId, stage_id: stageId });
}

export function fullRun(): Promise<ActionResult> {
  return post('/api/run/full');
}

export function runsList(): Promise<RunsListResponse> {
  return get('/api/runs');
}

export function runDetail(runId: string): Promise<RunDetailResponse> {
  return get(`/api/runs/${encodeURIComponent(runId)}`);
}

export function readArtifact(path: string): Promise<ArtifactReadResponse> {
  return get(`/api/artifact?path=${encodeURIComponent(path)}`);
}

export function readLog(
  path: string,
  opts?: { tail?: boolean }
): Promise<LogReadResponse> {
  const params = new URLSearchParams({ path });
  if (opts?.tail) params.set('tail', 'true');
  return get(`/api/log?${params.toString()}`);
}

export function getStages(): Promise<{ stages: string[] }> {
  return get('/api/stages');
}
