export interface KitManifest {
  kit_id: string;
  run_id: string;
  version: string;
  created_at: string;
  artifacts: KitArtifactEntry[];
  metadata: Record<string, unknown>;
}

export interface KitArtifactEntry {
  artifact_id: string;
  path: string;
  type: string;
  hash: string;
}

export interface Entrypoint {
  kit_id: string;
  run_id: string;
  entry_type: string;
  created_at: string;
  instructions: string[];
}

export interface VersionStamp {
  kit_id: string;
  run_id: string;
  version: string;
  created_at: string;
  content_hash: string;
  source_run_hash: string;
}
