export function getRepoRoot(): string {
  const root = process.env['REPO_ROOT'];
  if (!root) throw new Error('REPO_ROOT environment variable is not set');
  return root;
}

export function getRepoToken(): string | undefined {
  return process.env['REPO_TOKEN'];
}
