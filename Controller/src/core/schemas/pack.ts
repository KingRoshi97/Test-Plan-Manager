import type { ActionRef, Pointer, ExecutorType } from './common.js';

export interface PackRequest {
  run_id: string;
  kit_variant: ExecutorType;
}

export interface PackResponse {
  action: ActionRef;
  kit: { kit_id: string; variant: ExecutorType };
  kit_manifest: Pointer;
  kit_entrypoint: Pointer;
  bundle_metadata: Pointer;
  bundle_export: Pointer;
  logs: Pointer[];
}
