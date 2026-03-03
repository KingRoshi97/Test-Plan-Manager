import type {
  DoctorResponse,
  StartRunRequest,
  StartRunResponse,
  AdvanceRunRequest,
  AdvanceRunResponse,
  RunStageRequest,
  RunStageResponse,
  RerunStageRequest,
  CloseRunRequest,
  VerifyRequest,
  VerifyResponse,
  PackRequest,
  PackResponse,
  ReproRequest,
  ReproResponse,
  RunsListResponse,
  RunDetailResponse,
  ArtifactReadResponse,
  LogReadResponse,
} from './types';

const BASE_URL = import.meta.env.VITE_AXION_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('axion_repo_token');
}

async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['X-Repo-Token'] = token;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<TRes>;
}

async function get<TRes>(path: string): Promise<TRes> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<TRes>;
}

export function doctor(): Promise<DoctorResponse> {
  return post('/api/doctor', {});
}

export function startRun(req: StartRunRequest): Promise<StartRunResponse> {
  return post('/api/run/start', req);
}

export function advanceRun(req: AdvanceRunRequest): Promise<AdvanceRunResponse> {
  return post('/api/run/advance', req);
}

export function runStage(req: RunStageRequest): Promise<RunStageResponse> {
  return post('/api/run/stage', req);
}

export function rerunStage(req: RerunStageRequest): Promise<RunStageResponse> {
  return post('/api/run/rerun-stage', req);
}

export function closeRun(req: CloseRunRequest): Promise<void> {
  return post('/api/run/close', req);
}

export function verify(req: VerifyRequest): Promise<VerifyResponse> {
  return post('/api/verify', req);
}

export function pack(req: PackRequest): Promise<PackResponse> {
  return post('/api/pack', req);
}

export function repro(req: ReproRequest): Promise<ReproResponse> {
  return post('/api/repro', req);
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
  opts?: { tail?: boolean; full?: boolean }
): Promise<LogReadResponse> {
  const params = new URLSearchParams({ path });
  if (opts?.tail) params.set('tail', 'true');
  if (opts?.full) params.set('full', 'true');
  return get(`/api/log?${params.toString()}`);
}
