export const STEP_LABELS: Record<string, string> = {
  generate: "Generate Structure",
  seed: "Seed Content",
  draft: "Draft Documents",
  review: "Review Documents",
  verify: "Verify Quality",
  lock: "Lock Documents",
  "scaffold-app": "Scaffold App",
  build: "Build App",
  test: "Run Tests",
  deploy: "Deploy",
  package: "Package Kit",
  import: "Import Project",
  overhaul: "Overhaul System",
  init: "Initialize Workspace",
};

export function stepLabel(stepId: string): string {
  return STEP_LABELS[stepId] || stepId;
}
