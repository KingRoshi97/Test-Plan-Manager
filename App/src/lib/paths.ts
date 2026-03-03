export const ROUTES = {
  DASHBOARD: '/',
  RUNS: '/runs',
  RUN_DETAIL: '/runs/:runId',
  GATE_FAILURES: '/runs/:runId/gates',
  VERIFY: '/runs/:runId/verify',
  KITS: '/runs/:runId/kits',
  PROOFS: '/runs/:runId/proofs',
  REGISTRIES: '/registries',
  COMMANDS: '/commands',
  KNOWLEDGE: '/knowledge',
  SETTINGS: '/settings',
} as const;

export function runDetailPath(runId: string): string {
  return `/runs/${encodeURIComponent(runId)}`;
}

export function gateFailuresPath(runId: string): string {
  return `/runs/${encodeURIComponent(runId)}/gates`;
}

export function verifyPath(runId: string): string {
  return `/runs/${encodeURIComponent(runId)}/verify`;
}

export function kitsPath(runId: string): string {
  return `/runs/${encodeURIComponent(runId)}/kits`;
}

export function proofsPath(runId: string): string {
  return `/runs/${encodeURIComponent(runId)}/proofs`;
}

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Runs', path: ROUTES.RUNS },
  { label: 'Gate Failures', path: ROUTES.GATE_FAILURES },
  { label: 'Verify', path: ROUTES.VERIFY },
  { label: 'Kits', path: ROUTES.KITS },
  { label: 'Registries', path: ROUTES.REGISTRIES },
  { label: 'Proofs', path: ROUTES.PROOFS },
  { label: 'Knowledge', path: ROUTES.KNOWLEDGE },
  { label: 'Settings', path: ROUTES.SETTINGS },
] as const;
