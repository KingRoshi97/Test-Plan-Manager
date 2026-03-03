export interface ManifestData {
  run_id: string;
  [key: string]: unknown;
}

export async function readRunManifest(_runId: string): Promise<ManifestData> {
  throw new Error('not implemented');
}
