export interface CapturedOutput {
  stdout_path: string;
  stderr_path: string;
  combined_path: string;
}

export async function captureOutput(
  _actionId: string,
  _stdout: string,
  _stderr: string
): Promise<CapturedOutput> {
  throw new Error('not implemented');
}
