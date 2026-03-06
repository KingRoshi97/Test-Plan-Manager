import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export interface PipelineStatusEntry {
  assemblyId: number;
  runId: string;
  currentStage: string;
  startTime: string;
  lastActivityAt: string;
  elapsedMs: number;
  stalledMs: number;
  stallTimeoutMs: number;
}

export interface PipelineStatusResponse {
  activeRuns: PipelineStatusEntry[];
}

export function usePipelineStatus(enabled: boolean = true) {
  return useQuery<PipelineStatusResponse>({
    queryKey: ["/api/pipeline/status"],
    queryFn: () => apiRequest("/api/pipeline/status"),
    refetchInterval: enabled ? 5000 : false,
    enabled,
  });
}

export function getStallLevel(stalledMs: number): "none" | "warning" | "critical" {
  if (stalledMs >= 240000) return "critical";
  if (stalledMs >= 120000) return "warning";
  return "none";
}

export function formatStallTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function getAutoKillCountdown(stalledMs: number, stallTimeoutMs: number = 300000): number {
  const remaining = stallTimeoutMs - stalledMs;
  return Math.max(0, Math.ceil(remaining / 1000));
}
