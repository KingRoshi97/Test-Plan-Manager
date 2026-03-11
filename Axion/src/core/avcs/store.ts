import * as fs from "fs";
import * as path from "path";
import type {
  CertificationRun,
  CertificationFinding,
  CertificationEvidence,
  CertificationReport,
  FindingStatus,
} from "./types.js";

export class AVCSStore {
  private dataRoot: string;

  constructor(dataRoot: string) {
    this.dataRoot = dataRoot;
    for (const sub of ["runs", "findings", "evidence", "reports"]) {
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

  private nextSequence(prefix: string, dir: string): string {
    if (!fs.existsSync(dir)) return `${prefix}-000001`;
    const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix));
    const maxNum = files.reduce((max, f) => {
      const match = f.match(new RegExp(`^${prefix}-(\\d+)`));
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `${prefix}-${String(maxNum + 1).padStart(6, "0")}`;
  }

  generateRunId(): string {
    return this.nextSequence("CR", path.join(this.dataRoot, "runs"));
  }

  generateFindingId(): string {
    return this.nextSequence("CF", path.join(this.dataRoot, "findings"));
  }

  generateEvidenceId(): string {
    return this.nextSequence("CE", path.join(this.dataRoot, "evidence"));
  }

  createRun(run: CertificationRun): void {
    this.writeJson(path.join(this.dataRoot, "runs", `${run.id}.json`), run);
  }

  getRun(certRunId: string): CertificationRun | null {
    return this.readJson(path.join(this.dataRoot, "runs", `${certRunId}.json`));
  }

  listRuns(): CertificationRun[] {
    const dir = path.join(this.dataRoot, "runs");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.startsWith("CR-") && f.endsWith(".json"))
      .map(f => this.readJson<CertificationRun>(path.join(dir, f)))
      .filter(Boolean) as CertificationRun[];
  }

  listRunsForAssembly(assemblyId: number | string): CertificationRun[] {
    const id = typeof assemblyId === "string" ? Number(assemblyId) : assemblyId;
    return this.listRuns().filter(r => r.assembly_id === id);
  }

  updateRun(run: CertificationRun): void {
    this.writeJson(path.join(this.dataRoot, "runs", `${run.id}.json`), run);
  }

  addFinding(finding: CertificationFinding): void {
    this.writeJson(path.join(this.dataRoot, "findings", `${finding.id}.json`), finding);
  }

  getFindings(certRunId: string): CertificationFinding[] {
    const dir = path.join(this.dataRoot, "findings");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.startsWith("CF-") && f.endsWith(".json"))
      .map(f => this.readJson<CertificationFinding>(path.join(dir, f)))
      .filter(Boolean)
      .filter(f => (f as CertificationFinding).cert_run_id === certRunId) as CertificationFinding[];
  }

  getFinding(findingId: string): CertificationFinding | null {
    return this.readJson(path.join(this.dataRoot, "findings", `${findingId}.json`));
  }

  updateFinding(findingId: string, status: FindingStatus): void {
    const finding = this.getFinding(findingId);
    if (!finding) return;
    finding.status = status;
    this.writeJson(path.join(this.dataRoot, "findings", `${findingId}.json`), finding);
  }

  addEvidence(evidence: CertificationEvidence): void {
    this.writeJson(path.join(this.dataRoot, "evidence", `${evidence.id}.json`), evidence);
  }

  getEvidence(certRunId: string): CertificationEvidence[] {
    const dir = path.join(this.dataRoot, "evidence");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.startsWith("CE-") && f.endsWith(".json"))
      .map(f => this.readJson<CertificationEvidence>(path.join(dir, f)))
      .filter(Boolean)
      .filter(e => (e as CertificationEvidence).cert_run_id === certRunId) as CertificationEvidence[];
  }

  saveReport(report: CertificationReport): void {
    this.writeJson(path.join(this.dataRoot, "reports", `${report.cert_run_id}.json`), report);
  }

  getReport(certRunId: string): CertificationReport | null {
    return this.readJson(path.join(this.dataRoot, "reports", `${certRunId}.json`));
  }
}
