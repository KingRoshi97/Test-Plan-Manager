import path from 'node:path';
import { getRepoRoot } from './env.js';

export const ALLOWED_READ_ROOTS = [
  'runs/',
  'registries/',
  'bundles/',
  'knowledge/',
] as const;

export const WRAPPER_STORAGE_ROOT = 'Controller/storage/';

export function isAllowedReadPath(requestedPath: string): boolean {
  if (requestedPath.includes('..')) return false;
  if (path.isAbsolute(requestedPath)) return false;

  const isRepoPath = ALLOWED_READ_ROOTS.some((root) => requestedPath.startsWith(root));
  const isWrapperPath = requestedPath.startsWith(WRAPPER_STORAGE_ROOT);
  return isRepoPath || isWrapperPath;
}

export function resolveSafePath(requestedPath: string): string {
  if (!isAllowedReadPath(requestedPath)) {
    throw new Error(`Path not allowed: ${requestedPath}`);
  }
  const repoRoot = getRepoRoot();
  return path.resolve(repoRoot, requestedPath);
}
