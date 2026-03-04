import type { Run, GateReport, ProofEntry, KitManifest, RegistryEntry, Template } from './types';

const BASE_URL = import.meta.env.VITE_AXION_API_URL || '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchRuns(): Promise<Run[]> {
  return get<Run[]>('/api/runs');
}

export async function fetchRun(runId: string): Promise<Run> {
  return get<Run>(`/api/runs/${encodeURIComponent(runId)}`);
}

export async function fetchGateReports(runId: string): Promise<GateReport[]> {
  return get<GateReport[]>(`/api/runs/${encodeURIComponent(runId)}/gates`);
}

export async function fetchRegistries(): Promise<RegistryEntry[]> {
  return get<RegistryEntry[]>('/api/registries');
}

export async function fetchTemplates(): Promise<Template[]> {
  return get<Template[]>('/api/templates');
}

export async function fetchProofs(): Promise<ProofEntry[]> {
  return get<ProofEntry[]>('/api/proofs');
}

export async function fetchKits(): Promise<KitManifest[]> {
  return get<KitManifest[]>('/api/kits');
}
