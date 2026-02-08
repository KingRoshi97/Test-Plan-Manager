#!/usr/bin/env node
/**
 * AXION Retry Utility
 * 
 * Shared transient failure retry with exponential backoff.
 * Handles ENOENT, ETIMEDOUT, ECONNRESET, and OOM-kill (exit 137).
 * 
 * Usage:
 *   import { withRetry, isTransientError } from './lib/retry';
 *   const result = await withRetry(() => doSomething(), { maxRetries: 2, backoffMs: 1000 });
 */

export interface RetryOptions {
  maxRetries: number;
  backoffMs: number;
  onRetry?: (attempt: number, delay: number, error: string) => void;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2,
  backoffMs: 1000,
};

const TRANSIENT_PATTERNS = [
  'ENOENT',
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'EAI_AGAIN',
  'socket hang up',
  'network timeout',
  'fetch failed',
];

const TRANSIENT_EXIT_CODES = [137]; // OOM-kill

export function isTransientError(stderr: string, exitCode?: number): boolean {
  if (exitCode !== undefined && TRANSIENT_EXIT_CODES.includes(exitCode)) {
    return true;
  }
  const lower = stderr.toLowerCase();
  return TRANSIENT_PATTERNS.some(p => lower.includes(p.toLowerCase()));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: Partial<RetryOptions> = {},
): Promise<T> {
  const { maxRetries, backoffMs, onRetry } = { ...DEFAULT_RETRY_OPTIONS, ...opts };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const errMsg = lastError.message;

      if (!isTransientError(errMsg) || attempt >= maxRetries) {
        throw lastError;
      }

      const delay = backoffMs * Math.pow(2, attempt);
      onRetry?.(attempt + 1, delay, errMsg);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError!;
}

export interface ProcessResult {
  status: 'success' | 'error';
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export async function runWithRetry(
  runFn: () => Promise<ProcessResult>,
  opts: Partial<RetryOptions> = {},
): Promise<ProcessResult> {
  const { maxRetries, backoffMs, onRetry } = { ...DEFAULT_RETRY_OPTIONS, ...opts };
  let lastResult: ProcessResult | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    lastResult = await runFn();

    if (lastResult.status === 'success') return lastResult;

    if (!isTransientError(lastResult.stderr, lastResult.exitCode) || attempt >= maxRetries) {
      break;
    }

    const delay = backoffMs * Math.pow(2, attempt);
    onRetry?.(attempt + 1, delay, lastResult.stderr.slice(0, 200));
    await new Promise((r) => setTimeout(r, delay));
  }

  return lastResult!;
}
