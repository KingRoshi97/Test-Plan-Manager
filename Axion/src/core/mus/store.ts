import * as fs from "fs";
import * as path from "path";
import type {
  MusRun, MusFinding, MusProposalPack, MusBlastRadius,
  MusChangeSet, MusApprovalEvent, MusSuppressionRule, MusProofBundle,
} from "./types.js";

export class MusStore {
  private dataRoot: string;

  constructor(dataRoot: string) {
    this.dataRoot = dataRoot;
    for (const sub of ["runs", "findings", "proposals", "changesets", "approvals", "suppressions", "logs"]) {
      const dir = path.join(dataRoot, sub);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readJson<T>(filePath: string): T | null {
    try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return null; }
  }

  private writeJson(filePath: string, data: unknown): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  generateRunId(): string {
    const d = new Date();
    const date = d.toISOString().slice(0, 10).replace(/-/g, "");
    const seq = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
    return `RUN-${date}-${seq}`;
  }

  generateId(prefix: string): string {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    return `${prefix}-${ts}-${rand}`;
  }

  saveRun(run: MusRun): void {
    const runDir = path.join(this.dataRoot, "runs", run.run_id);
    this.writeJson(path.join(runDir, "run.json"), run);
  }

  getRun(runId: string): MusRun | null {
    return this.readJson(path.join(this.dataRoot, "runs", runId, "run.json"));
  }

  listRuns(): MusRun[] {
    const runsDir = path.join(this.dataRoot, "runs");
    if (!fs.existsSync(runsDir)) return [];
    return fs.readdirSync(runsDir)
      .filter(d => d.startsWith("RUN-"))
      .map(d => this.readJson<MusRun>(path.join(runsDir, d, "run.json")))
      .filter(Boolean) as MusRun[];
  }

  saveFindings(runId: string, findings: MusFinding[]): void {
    const runDir = path.join(this.dataRoot, "runs", runId);
    this.writeJson(path.join(runDir, "findings.json"), findings);
    for (const f of findings) {
      this.writeJson(path.join(this.dataRoot, "findings", `${f.finding_id}.json`), f);
    }
  }

  getRunFindings(runId: string): MusFinding[] {
    return this.readJson(path.join(this.dataRoot, "runs", runId, "findings.json")) ?? [];
  }

  getFinding(findingId: string): MusFinding | null {
    return this.readJson(path.join(this.dataRoot, "findings", `${findingId}.json`));
  }

  updateFinding(finding: MusFinding): void {
    this.writeJson(path.join(this.dataRoot, "findings", `${finding.finding_id}.json`), finding);
  }

  saveProposals(runId: string, proposals: MusProposalPack[]): void {
    const runDir = path.join(this.dataRoot, "runs", runId);
    this.writeJson(path.join(runDir, "proposal_packs.json"), proposals);
    for (const p of proposals) {
      this.writeJson(path.join(this.dataRoot, "proposals", `${p.proposal_pack_id}.json`), p);
    }
  }

  getRunProposals(runId: string): MusProposalPack[] {
    return this.readJson(path.join(this.dataRoot, "runs", runId, "proposal_packs.json")) ?? [];
  }

  listProposals(): MusProposalPack[] {
    const dir = path.join(this.dataRoot, "proposals");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .map(f => this.readJson<MusProposalPack>(path.join(dir, f)))
      .filter(Boolean) as MusProposalPack[];
  }

  getProposal(id: string): MusProposalPack | null {
    return this.readJson(path.join(this.dataRoot, "proposals", `${id}.json`));
  }

  saveBlastRadius(runId: string, br: MusBlastRadius): void {
    this.writeJson(path.join(this.dataRoot, "runs", runId, "blast_radius.json"), br);
  }

  getBlastRadius(runId: string): MusBlastRadius | null {
    return this.readJson(path.join(this.dataRoot, "runs", runId, "blast_radius.json"));
  }

  saveProofBundle(runId: string, proof: MusProofBundle): void {
    this.writeJson(path.join(this.dataRoot, "runs", runId, "proof_bundle.json"), proof);
  }

  getProofBundle(runId: string): MusProofBundle | null {
    return this.readJson(path.join(this.dataRoot, "runs", runId, "proof_bundle.json"));
  }

  saveChangeSet(cs: MusChangeSet): void {
    this.writeJson(path.join(this.dataRoot, "changesets", `${cs.changeset_id}.json`), cs);
  }

  getChangeSet(id: string): MusChangeSet | null {
    return this.readJson(path.join(this.dataRoot, "changesets", `${id}.json`));
  }

  listChangeSets(): MusChangeSet[] {
    const dir = path.join(this.dataRoot, "changesets");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .map(f => this.readJson<MusChangeSet>(path.join(dir, f)))
      .filter(Boolean) as MusChangeSet[];
  }

  saveApproval(approval: MusApprovalEvent): void {
    this.writeJson(path.join(this.dataRoot, "approvals", `${approval.approval_id}.json`), approval);
  }

  listApprovals(targetId?: string): MusApprovalEvent[] {
    const dir = path.join(this.dataRoot, "approvals");
    if (!fs.existsSync(dir)) return [];
    let all = fs.readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .map(f => this.readJson<MusApprovalEvent>(path.join(dir, f)))
      .filter(Boolean) as MusApprovalEvent[];
    if (targetId) all = all.filter(a => a.target_id === targetId);
    return all;
  }

  saveSuppression(rule: MusSuppressionRule): void {
    this.writeJson(path.join(this.dataRoot, "suppressions", `${rule.suppression_id}.json`), rule);
  }

  listSuppressions(): MusSuppressionRule[] {
    const dir = path.join(this.dataRoot, "suppressions");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .map(f => this.readJson<MusSuppressionRule>(path.join(dir, f)))
      .filter(Boolean) as MusSuppressionRule[];
  }
}
