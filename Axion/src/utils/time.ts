export function isoNow(): string {
  return new Date().toISOString();
}

export function compactTimestamp(): string {
  return new Date().toISOString().replace(/[-:.]/g, "").replace("T", "T").slice(0, 15) + "Z";
}
