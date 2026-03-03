export const ROUTES = {
  DASHBOARD: '/',
  RUNS: '/runs',
  RUN_DETAIL: '/runs/:runId',
  REGISTRIES: '/registries',
  TEMPLATES: '/templates',
  PROOFS: '/proofs',
  KITS: '/kits',
} as const;

export function runDetailPath(runId: string): string {
  return `/runs/${encodeURIComponent(runId)}`;
}

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Runs', path: ROUTES.RUNS },
  { label: 'Registries', path: ROUTES.REGISTRIES },
  { label: 'Templates', path: ROUTES.TEMPLATES },
  { label: 'Proofs', path: ROUTES.PROOFS },
  { label: 'Kits', path: ROUTES.KITS },
] as const;
