export class NotImplementedError extends Error {
  constructor(functionName: string) {
    super(`NotImplementedError: ${functionName} is not yet implemented.`);
    this.name = "NotImplementedError";
  }
}
