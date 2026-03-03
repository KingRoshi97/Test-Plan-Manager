export interface ArtifactContent {
  path: string;
  content_type: string;
  content: unknown;
}

export interface LogContent {
  path: string;
  content_type: string;
  tail: boolean;
  content: string;
}

export async function loadArtifact(
  _path: string,
  _maxSizeBytes?: number
): Promise<ArtifactContent> {
  throw new Error('not implemented');
}

export async function loadLog(
  _path: string,
  _options?: { tail?: boolean; full?: boolean; maxSizeBytes?: number }
): Promise<LogContent> {
  throw new Error('not implemented');
}
