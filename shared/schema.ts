export interface PipelineCommand {
  id: string;
  label: string;
  description: string;
  script: string;
  args: string[];
  requiresWorkspace: boolean;
}

export interface RunRequest {
  command: string;
  workspacePath?: string;
  projectName?: string;
  extraArgs?: string[];
}

export interface RunResult {
  status: 'success' | 'error';
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
}

export interface WorkspaceInfo {
  path: string;
  projectName: string;
  exists: boolean;
  hasManifest: boolean;
  hasRegistry: boolean;
  hasDomains: boolean;
  hasApp: boolean;
}

export interface ReleaseCheckResult {
  id: string;
  name: string;
  required: boolean;
  passed: boolean;
  skipped: boolean;
  duration_ms: number;
  exit_code: number | null;
  test_count?: number;
  log_path: string;
  error_summary?: string;
}

export interface ReleaseGateReport {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  duration_ms: number;
  passed: boolean;
  logs_dir: string;
  checks: ReleaseCheckResult[];
  failures: Array<{
    check_id: string;
    reason_code: string;
    summary: string;
    log_path: string;
  }>;
  next_commands: string[];
}
