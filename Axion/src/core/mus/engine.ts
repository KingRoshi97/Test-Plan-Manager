import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import type {
  RegistryEnvelope, MusValidationResult, MusValidationError,
  MusFinding, MusProposalPack, MusPatch, MusBlastRadius, MusProofBundle,
  MusBudgets, MusScope, MusRun,
  AgentDefinition, TaskDefinition, TaskRun, Insight, BottleneckReport, Recommendation,
} from "./types.js";
import { MusStore } from "./store.js";
import { appendLedger } from "./ledger.js";

function readJson<T>(filePath: string): T | null {
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return null; }
}

function listRegistryFiles(root: string): string[] {
  const regDir = path.join(root, "registries");
  if (!fs.existsSync(regDir)) return [];
  return fs.readdirSync(regDir).filter(f => f.startsWith("REG-") && f.endsWith(".json")).map(f => path.join(regDir, f));
}

function loadRegistries(root: string): Map<string, RegistryEnvelope> {
  const map = new Map<string, RegistryEnvelope>();
  for (const fp of listRegistryFiles(root)) {
    const reg = readJson<RegistryEnvelope>(fp);
    if (reg?.registry_id) map.set(reg.registry_id, reg);
  }
  return map;
}

function fileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
  } catch { return "unknown"; }
}

export function validateRegistries(root: string): MusValidationResult {
  const errors: MusValidationError[] = [];
  const regFiles = listRegistryFiles(root);
  let itemsChecked = 0;

  for (const fp of regFiles) {
    const fileName = path.basename(fp);
    const reg = readJson<RegistryEnvelope>(fp);

    if (!reg) {
      errors.push({ file: fileName, json_pointer: "/", message: "Failed to parse JSON" });
      continue;
    }

    if (!reg.registry_id) {
      errors.push({ file: fileName, json_pointer: "/registry_id", message: "Missing registry_id" });
    }
    if (!reg.schema_version) {
      errors.push({ file: fileName, json_pointer: "/schema_version", message: "Missing schema_version" });
    }
    if (!reg.registry_version) {
      errors.push({ file: fileName, json_pointer: "/registry_version", message: "Missing registry_version" });
    }
    if (!Array.isArray(reg.items)) {
      errors.push({ file: fileName, json_pointer: "/items", message: "Missing or non-array items" });
      continue;
    }

    const expectedId = fileName.replace(".json", "");
    if (reg.registry_id && reg.registry_id !== expectedId) {
      errors.push({ file: fileName, json_pointer: "/registry_id", message: `registry_id "${reg.registry_id}" does not match filename "${expectedId}"` });
    }

    const idField = detectIdField(reg.items);
    const seenIds = new Set<string>();

    for (let i = 0; i < reg.items.length; i++) {
      const item = reg.items[i];
      itemsChecked++;
      const itemId = item[idField] as string | undefined;
      const itemVersion = (item.version ?? "0.0.0") as string;

      if (!itemId) {
        errors.push({ file: fileName, json_pointer: `/items/${i}`, message: `Missing id field (${idField})` });
        continue;
      }

      const key = `${itemId}@${itemVersion}`;
      if (seenIds.has(key)) {
        errors.push({ file: fileName, json_pointer: `/items/${i}`, message: `Duplicate (id, version): ${key}` });
      }
      seenIds.add(key);
    }

    if (reg.active_map && typeof reg.active_map === "object") {
      for (const [mapId, mapVersion] of Object.entries(reg.active_map)) {
        const exists = reg.items.some(item => {
          const iid = item[idField] as string | undefined;
          const iver = (item.version ?? "0.0.0") as string;
          return iid === mapId && iver === mapVersion;
        });
        if (!exists) {
          errors.push({
            file: fileName,
            json_pointer: `/active_map/${mapId}`,
            message: `active_map entry "${mapId}@${mapVersion}" points to missing item version`,
          });
        }
      }
    }
  }

  const regs = loadRegistries(root);
  const crossRefErrors = checkCrossRegistryRefs(regs);
  errors.push(...crossRefErrors);

  const policiesDir = path.join(root, "policies");
  if (fs.existsSync(policiesDir)) {
    for (const pf of fs.readdirSync(policiesDir).filter(f => f.endsWith(".json"))) {
      const policy = readJson<Record<string, unknown>>(path.join(policiesDir, pf));
      if (!policy) {
        errors.push({ file: `policies/${pf}`, json_pointer: "/", message: "Failed to parse policy JSON" });
      } else if (!policy.policy_id && !policy.version) {
        if (!pf.includes("policy")) {
          errors.push({ file: `policies/${pf}`, json_pointer: "/", message: "Policy file missing policy_id" });
        }
      }
    }
  }

  appendLedger("validate", { root, pass: errors.length === 0, error_count: errors.length });

  return {
    pass: errors.length === 0,
    errors,
    registries_checked: regFiles.length,
    items_checked: itemsChecked,
    checked_at: new Date().toISOString(),
  };
}

function detectIdField(items: Array<Record<string, unknown>>): string {
  if (items.length === 0) return "id";
  const first = items[0];
  for (const key of Object.keys(first)) {
    if (key.endsWith("_id") && typeof first[key] === "string") return key;
  }
  if ("id" in first) return "id";
  return "id";
}

function checkCrossRegistryRefs(regs: Map<string, RegistryEnvelope>): MusValidationError[] {
  const errors: MusValidationError[] = [];

  const modes = regs.get("REG-MAINTENANCE-MODES");
  const detectors = regs.get("REG-DETECTOR-PACKS");
  const patchTypes = regs.get("REG-PATCH-TYPES");
  const gates = regs.get("REG-GATES-MUS");

  if (modes && detectors) {
    for (const mode of modes.items) {
      const dpRefs = (mode.allowed_detector_packs ?? []) as string[];
      for (const dpId of dpRefs) {
        const exists = detectors.items.some(d => d.detector_pack_id === dpId);
        if (!exists) {
          errors.push({
            file: "registries/REG-MAINTENANCE-MODES.json",
            json_pointer: `/items/${modes.items.indexOf(mode)}/allowed_detector_packs`,
            message: `Mode ${mode.mode_id} references detector pack "${dpId}" not found in REG-DETECTOR-PACKS`,
          });
        }
      }
    }
  }

  if (detectors && patchTypes) {
    for (const dp of detectors.items) {
      const checks = (dp.checks ?? []) as Array<Record<string, unknown>>;
      for (const check of checks) {
        const proposeRefs = (check.propose ?? []) as string[];
        for (const ptId of proposeRefs) {
          const exists = patchTypes.items.some(pt => pt.patch_type_id === ptId);
          if (!exists) {
            errors.push({
              file: "registries/REG-DETECTOR-PACKS.json",
              json_pointer: `/items/${detectors.items.indexOf(dp)}/checks`,
              message: `Detector ${dp.detector_pack_id} check "${check.check_id}" references patch type "${ptId}" not found in REG-PATCH-TYPES`,
            });
          }
        }
      }
    }
  }

  if (modes && gates) {
    for (const mode of modes.items) {
      const gateRefs = (mode.required_gates ?? []) as string[];
      for (const gateId of gateRefs) {
        const exists = gates.items.some(g => g.gate_id === gateId);
        if (!exists) {
          errors.push({
            file: "registries/REG-MAINTENANCE-MODES.json",
            json_pointer: `/items/${modes.items.indexOf(mode)}/required_gates`,
            message: `Mode ${mode.mode_id} references gate "${gateId}" not found in REG-GATES-MUS`,
          });
        }
      }
    }
  }

  return errors;
}

export interface RunResult {
  run: MusRun;
  findings: MusFinding[];
  proposals: MusProposalPack[];
  blastRadius: MusBlastRadius | null;
  proofBundle: MusProofBundle;
}

export function executeRun(
  root: string,
  store: MusStore,
  run: MusRun,
): RunResult {
  const startedAt = new Date().toISOString();
  run.status = "running";
  run.started_at = startedAt;
  store.saveRun(run);

  appendLedger("run_started", { run_id: run.run_id, mode_id: run.mode_id });

  const findings: MusFinding[] = [];
  const proposals: MusProposalPack[] = [];
  const limitReasons: string[] = [];
  const checksRun: string[] = [];
  const detectorPacksExecuted: string[] = [];

  const regs = loadRegistries(root);
  const modesReg = regs.get("REG-MAINTENANCE-MODES");
  const modeItem = modesReg?.items.find(m => m.mode_id === run.mode_id);

  if (!modeItem) {
    run.status = "failed";
    run.error = `Mode ${run.mode_id} not found in REG-MAINTENANCE-MODES`;
    run.completed_at = new Date().toISOString();
    store.saveRun(run);
    return { run, findings, proposals, blastRadius: null, proofBundle: buildProof(run, [], [], 0, 0, run.budgets, limitReasons, startedAt) };
  }

  const allowedDPs = (modeItem.allowed_detector_packs ?? []) as string[];

  if (run.mode_id === "MM-01") {
    if (allowedDPs.includes("DP-REG-01")) {
      detectorPacksExecuted.push("DP-REG-01");
      const dpFindings = runDpReg01(root, run, store, run.budgets);
      checksRun.push("reg.no_orphans", "reg.no_duplicates", "reg.active_map_valid", "reg.status_valid");
      findings.push(...dpFindings);
      if (findings.length >= run.budgets.max_findings) {
        limitReasons.push(`max_findings cap reached (${run.budgets.max_findings})`);
      }
    }
  } else if (run.mode_id === "MM-04") {
    detectorPacksExecuted.push("DP-DRIFT-01");
    const driftResult = runDpDrift01(root, run, store, run.budgets);
    checksRun.push(...driftResult.checksRun);
    findings.push(...driftResult.findings);
    proposals.push(...driftResult.proposals);
    if (findings.length >= run.budgets.max_findings) {
      limitReasons.push(`max_findings cap reached (${run.budgets.max_findings})`);
    }
    if (proposals.length >= run.budgets.max_proposals) {
      limitReasons.push(`max_proposals cap reached (${run.budgets.max_proposals})`);
    }
  }

  const pinnedFiles = listRegistryFiles(root).map(fp => ({ path: path.relative(root, fp), hash: fileHash(fp) }));
  const policyFiles = fs.existsSync(path.join(root, "policies"))
    ? fs.readdirSync(path.join(root, "policies")).filter(f => f.endsWith(".json")).map(f => ({ path: `policies/${f}`, hash: fileHash(path.join(root, "policies", f)) }))
    : [];
  pinnedFiles.push(...policyFiles);

  run.pinned_versions = {};
  for (const [regId, reg] of regs) {
    run.pinned_versions[regId] = reg.registry_version;
  }

  run.findings_count = findings.length;
  run.proposals_count = proposals.length;
  run.limit_reasons = limitReasons.length > 0 ? limitReasons : undefined;
  run.status = limitReasons.length > 0 ? "completed_with_limits" : "completed";
  run.completed_at = new Date().toISOString();
  store.saveRun(run);

  store.saveFindings(run.run_id, findings);

  if (proposals.length > 0) {
    store.saveProposals(run.run_id, proposals);
  }

  let blastRadius: MusBlastRadius | null = null;
  if (proposals.length > 0) {
    const affectedFiles = new Set<string>();
    const affectedRegs = new Set<string>();
    for (const pp of proposals) {
      for (const patch of pp.patches) {
        affectedFiles.add(patch.target_file);
        const regMatch = patch.target_file.match(/REG-[A-Z-]+/);
        if (regMatch) affectedRegs.add(regMatch[0]);
      }
    }
    blastRadius = {
      run_id: run.run_id,
      proposal_pack_ids: proposals.map(p => p.proposal_pack_id),
      affected_files: Array.from(affectedFiles),
      affected_registries: Array.from(affectedRegs),
      affected_asset_count: affectedFiles.size,
      risk_summary: `${proposals.length} proposal pack(s) affecting ${affectedFiles.size} file(s)`,
      created_at: new Date().toISOString(),
    };
    store.saveBlastRadius(run.run_id, blastRadius);
  }

  const proofBundle = buildProof(run, detectorPacksExecuted, checksRun, findings.length, proposals.length, run.budgets, limitReasons, startedAt, pinnedFiles);
  store.saveProofBundle(run.run_id, proofBundle);

  appendLedger("run_completed", {
    run_id: run.run_id,
    status: run.status,
    findings_count: findings.length,
    proposals_count: proposals.length,
  });

  return { run, findings, proposals, blastRadius, proofBundle };
}

function buildProof(
  run: MusRun,
  detectorPacks: string[],
  checksRun: string[],
  findingsCount: number,
  proposalsCount: number,
  budgets: MusBudgets,
  limitReasons: string[],
  startedAt: string,
  pinnedFiles?: Array<{ path: string; hash?: string }>,
): MusProofBundle {
  return {
    run_id: run.run_id,
    mode_id: run.mode_id,
    detector_packs_executed: detectorPacks,
    checks_run: checksRun,
    files_pinned: pinnedFiles ?? [],
    findings_count: findingsCount,
    proposals_count: proposalsCount,
    budgets_used: { max_findings: findingsCount, max_proposals: proposalsCount },
    budgets_allowed: budgets,
    limit_reasons: limitReasons,
    status: run.status,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
  };
}

function runDpReg01(root: string, run: MusRun, store: MusStore, budgets: MusBudgets): MusFinding[] {
  const findings: MusFinding[] = [];
  const regs = loadRegistries(root);

  for (const [regId, reg] of regs) {
    if (findings.length >= budgets.max_findings) break;
    const fileName = `registries/${regId}.json`;
    const idField = detectIdField(reg.items);
    const seenIds = new Set<string>();

    for (let i = 0; i < reg.items.length; i++) {
      if (findings.length >= budgets.max_findings) break;
      const item = reg.items[i];
      const itemId = item[idField] as string | undefined;
      const itemVersion = (item.version ?? "0.0.0") as string;

      if (!itemId) continue;

      const key = `${itemId}@${itemVersion}`;
      if (seenIds.has(key)) {
        findings.push(makeFinding(run, "reg.no_duplicates", "DP-REG-01", "high",
          `Duplicate (id, version): ${key}`, `Item ${key} appears more than once in ${regId}`,
          fileName, `/items/${i}`, store));
      }
      seenIds.add(key);

      if (item.status && !["active", "deprecated", "draft", "retired", "enabled", "disabled"].includes(item.status as string)) {
        findings.push(makeFinding(run, "reg.status_valid", "DP-REG-01", "medium",
          `Invalid status "${item.status}" for ${itemId}`, `Status must be one of: active, deprecated, draft, retired`,
          fileName, `/items/${i}/status`, store));
      }
    }

    if (reg.active_map) {
      for (const [mapId, mapVersion] of Object.entries(reg.active_map)) {
        if (findings.length >= budgets.max_findings) break;
        const exists = reg.items.some(item => item[idField] === mapId && (item.version ?? "0.0.0") === mapVersion);
        if (!exists) {
          findings.push(makeFinding(run, "reg.active_map_valid", "DP-REG-01", "high",
            `active_map "${mapId}@${mapVersion}" missing`, `active_map entry points to version not found in items`,
            fileName, `/active_map/${mapId}`, store));
        }
      }
    }
  }

  checkOrphanRefs(root, regs, run, store, budgets, findings);

  return findings;
}

function checkOrphanRefs(
  root: string,
  regs: Map<string, RegistryEnvelope>,
  run: MusRun,
  store: MusStore,
  budgets: MusBudgets,
  findings: MusFinding[],
): void {
  const modes = regs.get("REG-MAINTENANCE-MODES");
  const detectors = regs.get("REG-DETECTOR-PACKS");
  const patchTypes = regs.get("REG-PATCH-TYPES");
  const gates = regs.get("REG-GATES-MUS");

  if (modes && detectors) {
    for (const mode of modes.items) {
      if (findings.length >= budgets.max_findings) break;
      const dpRefs = (mode.allowed_detector_packs ?? []) as string[];
      for (const dpId of dpRefs) {
        if (!detectors.items.some(d => d.detector_pack_id === dpId)) {
          findings.push(makeFinding(run, "reg.no_orphans", "DP-REG-01", "high",
            `Orphan ref: mode ${mode.mode_id} → detector ${dpId}`,
            `Detector pack "${dpId}" referenced by mode ${mode.mode_id} does not exist`,
            "registries/REG-MAINTENANCE-MODES.json", `/items/${modes.items.indexOf(mode)}/allowed_detector_packs`, store));
        }
      }
    }
  }

  if (modes && gates) {
    for (const mode of modes.items) {
      if (findings.length >= budgets.max_findings) break;
      const gateRefs = (mode.required_gates ?? []) as string[];
      for (const gateId of gateRefs) {
        if (!gates.items.some(g => g.gate_id === gateId)) {
          findings.push(makeFinding(run, "reg.no_orphans", "DP-REG-01", "high",
            `Orphan ref: mode ${mode.mode_id} → gate ${gateId}`,
            `Gate "${gateId}" referenced by mode ${mode.mode_id} does not exist`,
            "registries/REG-MAINTENANCE-MODES.json", `/items/${modes.items.indexOf(mode)}/required_gates`, store));
        }
      }
    }
  }

  if (detectors && patchTypes) {
    for (const dp of detectors.items) {
      if (findings.length >= budgets.max_findings) break;
      const checks = (dp.checks ?? []) as Array<Record<string, unknown>>;
      for (const check of checks) {
        const proposeRefs = (check.propose ?? []) as string[];
        for (const ptId of proposeRefs) {
          if (!patchTypes.items.some(pt => pt.patch_type_id === ptId)) {
            findings.push(makeFinding(run, "reg.no_orphans", "DP-REG-01", "high",
              `Orphan ref: detector ${dp.detector_pack_id} check ${check.check_id} → patch type ${ptId}`,
              `Patch type "${ptId}" referenced in check "${check.check_id}" does not exist`,
              "registries/REG-DETECTOR-PACKS.json", `/items/${detectors.items.indexOf(dp)}/checks`, store));
          }
        }
      }
    }
  }
}

interface DriftResult {
  findings: MusFinding[];
  proposals: MusProposalPack[];
  checksRun: string[];
}

function runDpDrift01(root: string, run: MusRun, store: MusStore, budgets: MusBudgets): DriftResult {
  const findings: MusFinding[] = [];
  const proposals: MusProposalPack[] = [];
  const checksRun: string[] = [];
  const regs = loadRegistries(root);
  const patches: MusPatch[] = [];

  checksRun.push("slug.inconsistency");
  for (const [regId, reg] of regs) {
    if (findings.length >= budgets.max_findings) break;
    const idField = detectIdField(reg.items);

    for (let i = 0; i < reg.items.length; i++) {
      if (findings.length >= budgets.max_findings) break;
      const item = reg.items[i];
      const itemId = item[idField] as string | undefined;
      if (!itemId) continue;

      if (item.name && typeof item.name === "string") {
        const expectedSlug = (item.name as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (item.slug && item.slug !== expectedSlug) {
          findings.push(makeFinding(run, "slug.inconsistency", "DP-DRIFT-01", "low",
            `Slug mismatch: ${itemId}`, `Slug "${item.slug}" does not match name-derived "${expectedSlug}"`,
            `registries/${regId}.json`, `/items/${i}/slug`, store));
          if (patches.length < budgets.max_proposals * 10) {
            patches.push({
              patch_id: store.generateId("PATCH"),
              patch_type_id: "PT-REG-02",
              target_file: `registries/${regId}.json`,
              target_field: `/items/${i}/slug`,
              description: `Normalize slug for ${itemId}`,
              current_value: item.slug,
              proposed_value: expectedSlug,
            });
          }
        }
      }
    }
  }

  const modes = regs.get("REG-MAINTENANCE-MODES");
  const detectors = regs.get("REG-DETECTOR-PACKS");
  const patchTypesReg = regs.get("REG-PATCH-TYPES");

  checksRun.push("ref.mode_detector_mismatch");
  if (modes && detectors) {
    const allDpIds = new Set(detectors.items.map(d => d.detector_pack_id as string));
    for (const mode of modes.items) {
      if (findings.length >= budgets.max_findings) break;
      const dpRefs = (mode.allowed_detector_packs ?? []) as string[];
      for (const dpId of dpRefs) {
        if (!allDpIds.has(dpId)) {
          findings.push(makeFinding(run, "ref.mode_detector_mismatch", "DP-DRIFT-01", "medium",
            `Mode ${mode.mode_id} references missing detector ${dpId}`,
            `Detector pack "${dpId}" listed in allowed_detector_packs but not found in REG-DETECTOR-PACKS`,
            "registries/REG-MAINTENANCE-MODES.json",
            `/items/${modes.items.indexOf(mode)}/allowed_detector_packs`, store));
          if (patches.length < budgets.max_proposals * 10) {
            patches.push({
              patch_id: store.generateId("PATCH"),
              patch_type_id: "PT-REG-01",
              target_file: "registries/REG-MAINTENANCE-MODES.json",
              target_field: `/items/${modes.items.indexOf(mode)}/allowed_detector_packs`,
              description: `Fix broken reference to detector pack ${dpId} in mode ${mode.mode_id}`,
              current_value: dpId,
              proposed_value: null,
              diff_summary: `Remove or fix reference to non-existent detector pack "${dpId}"`,
            });
          }
        }
      }
    }
  }

  checksRun.push("ref.detector_patchtype_mismatch");
  if (detectors && patchTypesReg) {
    const allPtIds = new Set(patchTypesReg.items.map(pt => pt.patch_type_id as string));
    for (const dp of detectors.items) {
      if (findings.length >= budgets.max_findings) break;
      const checks = (dp.checks ?? []) as Array<Record<string, unknown>>;
      for (const check of checks) {
        const proposeRefs = (check.propose ?? []) as string[];
        for (const ptId of proposeRefs) {
          if (!allPtIds.has(ptId)) {
            findings.push(makeFinding(run, "ref.detector_patchtype_mismatch", "DP-DRIFT-01", "medium",
              `Detector ${dp.detector_pack_id} check ${check.check_id} references missing patch type ${ptId}`,
              `Patch type "${ptId}" not found in REG-PATCH-TYPES`,
              "registries/REG-DETECTOR-PACKS.json",
              `/items/${detectors.items.indexOf(dp)}/checks`, store));
          }
        }
      }
    }
  }

  checksRun.push("missing.required_fields");
  for (const [regId, reg] of regs) {
    if (findings.length >= budgets.max_findings) break;
    const idField = detectIdField(reg.items);
    for (let i = 0; i < reg.items.length; i++) {
      if (findings.length >= budgets.max_findings) break;
      const item = reg.items[i];
      const itemId = item[idField] as string | undefined;
      if (!itemId) continue;

      if (!item.version) {
        findings.push(makeFinding(run, "missing.required_fields", "DP-DRIFT-01", "medium",
          `Missing version field: ${itemId} in ${regId}`, `Item ${itemId} has no version field`,
          `registries/${regId}.json`, `/items/${i}/version`, store));
      }
      if (!item.status) {
        findings.push(makeFinding(run, "missing.required_fields", "DP-DRIFT-01", "low",
          `Missing status field: ${itemId} in ${regId}`, `Item ${itemId} has no status field`,
          `registries/${regId}.json`, `/items/${i}/status`, store));
      }
    }
  }

  if (patches.length > 0 && proposals.length < budgets.max_proposals) {
    proposals.push({
      proposal_pack_id: store.generateId("PP"),
      run_id: run.run_id,
      detector_pack_id: "DP-DRIFT-01",
      risk_class: "safe",
      confidence_score: 85,
      impact_score: 20,
      patches: patches.slice(0, 25),
      explain_why: `Drift detection found ${findings.length} issue(s). ${patches.length} patch(es) proposed to fix reference mismatches and slug inconsistencies. All patches use safe patch types (PT-REG-01, PT-REG-02).`,
      evidence_refs: findings.slice(0, 10).map(f => f.finding_id),
      created_at: new Date().toISOString(),
    });
  }

  return { findings, proposals, checksRun };
}

function makeFinding(
  run: MusRun, checkId: string, dpId: string,
  severity: MusFinding["severity"], title: string, description: string,
  filePath: string, jsonPointer: string, store: MusStore,
): MusFinding {
  return {
    finding_id: store.generateId("FND"),
    run_id: run.run_id,
    check_id: checkId,
    detector_pack_id: dpId,
    severity,
    status: "open",
    title,
    description,
    file_path: filePath,
    json_pointer: jsonPointer,
    evidence_refs: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function loadMusPolicy(root: string): Record<string, unknown> | null {
  return readJson(path.join(root, "policies", "mus.policy.json"));
}

export function getRegistryVersions(root: string): Record<string, string> {
  const regs = loadRegistries(root);
  const versions: Record<string, string> = {};
  for (const [regId, reg] of regs) {
    versions[regId] = reg.registry_version;
  }
  return versions;
}

export function listAgents(root: string): AgentDefinition[] {
  const reg = readJson<RegistryEnvelope>(path.join(root, "registries", "REG-AGENTS.json"));
  if (!reg?.items) return [];
  return reg.items.map(item => ({
    agent_id: item.agent_id as string,
    name: item.name as string,
    capabilities: (item.capabilities ?? []) as string[],
    status: (item.status ?? "enabled") as AgentDefinition["status"],
    allowed_scopes: (item.allowed_scopes ?? []) as string[],
    budgets: (item.budgets ?? {}) as Partial<MusBudgets>,
    run_policy: (item.run_policy ?? "manual_only") as AgentDefinition["run_policy"],
  }));
}

export function listTasks(root: string): TaskDefinition[] {
  const reg = readJson<RegistryEnvelope>(path.join(root, "registries", "REG-TASKS.json"));
  if (!reg?.items) return [];
  return reg.items.map(item => ({
    task_id: item.task_id as string,
    name: item.name as string,
    intent: (item.intent ?? "monitor") as TaskDefinition["intent"],
    required_capabilities: (item.required_capabilities ?? []) as string[],
    default_agent_id: item.default_agent_id as string | undefined,
    inputs_schema: (item.inputs_schema ?? {}) as TaskDefinition["inputs_schema"],
    outputs_enabled: (item.outputs_enabled ?? ["findings"]) as TaskDefinition["outputs_enabled"],
    schedule_allowed: (item.schedule_allowed ?? false) as boolean,
  }));
}

function resolveAgents(
  root: string,
  taskDefs: TaskDefinition[],
  requestedAgentIds?: string[],
): string[] {
  const agents = listAgents(root);
  if (requestedAgentIds && requestedAgentIds.length > 0) {
    return requestedAgentIds.filter(id => agents.some(a => a.agent_id === id && a.status === "enabled"));
  }
  const assigned = new Set<string>();
  for (const task of taskDefs) {
    if (task.default_agent_id) {
      const agent = agents.find(a => a.agent_id === task.default_agent_id && a.status === "enabled");
      if (agent) { assigned.add(agent.agent_id); continue; }
    }
    const capable = agents.find(a =>
      a.status === "enabled" &&
      task.required_capabilities.every(cap => a.capabilities.includes(cap))
    );
    if (capable) assigned.add(capable.agent_id);
  }
  return Array.from(assigned);
}

const DEFAULT_TASK_BUDGETS: MusBudgets = {
  token_cap: 50000,
  time_cap_ms: 120000,
  max_findings: 50,
  max_proposals: 10,
  max_assets_touched: 20,
};

export function createTaskRun(
  root: string,
  store: MusStore,
  params: {
    task_ids: string[];
    agent_ids?: string[];
    scope?: MusScope;
    budgets?: Partial<MusBudgets>;
    trigger?: "manual" | "scheduled";
  },
): TaskRun {
  const allTasks = listTasks(root);
  const taskDefs = allTasks.filter(t => params.task_ids.includes(t.task_id));

  const assignedAgents = resolveAgents(root, taskDefs, params.agent_ids);

  const mergedScope: MusScope = params.scope ?? {
    asset_classes: [...new Set(taskDefs.flatMap(t => t.inputs_schema.scope?.asset_classes ?? []))],
  };

  const mergedBudgets: MusBudgets = {
    ...DEFAULT_TASK_BUDGETS,
    ...params.budgets,
  };

  const taskRun: TaskRun = {
    run_id: `TRUN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    task_ids: params.task_ids,
    assigned_agents: assignedAgents,
    trigger: params.trigger ?? "manual",
    scope: mergedScope,
    budgets: mergedBudgets,
    status: "created",
    created_at: new Date().toISOString(),
    outputs_refs: {
      findings_count: 0,
      insights_count: 0,
      bottlenecks_count: 0,
      recommendations_count: 0,
      has_proof: false,
    },
  };

  store.saveTaskRun(taskRun);
  appendLedger("task_run_created", { run_id: taskRun.run_id, task_ids: taskRun.task_ids, agents: taskRun.assigned_agents });

  return taskRun;
}

export interface TaskRunResult {
  taskRun: TaskRun;
  findings: MusFinding[];
  insights: Insight[];
  bottlenecks: BottleneckReport[];
  recommendations: Recommendation[];
}

export function startTaskRun(
  root: string,
  store: MusStore,
  taskRun: TaskRun,
): TaskRunResult {
  const startedAt = new Date().toISOString();
  taskRun.status = "running";
  taskRun.started_at = startedAt;
  store.saveTaskRun(taskRun);

  appendLedger("task_run_started", { run_id: taskRun.run_id, task_ids: taskRun.task_ids });

  const allTasks = listTasks(root);
  const allFindings: MusFinding[] = [];
  const allInsights: Insight[] = [];
  const allBottlenecks: BottleneckReport[] = [];
  const allRecommendations: Recommendation[] = [];
  const limitReasons: string[] = [];

  for (const taskId of taskRun.task_ids) {
    const taskDef = allTasks.find(t => t.task_id === taskId);
    if (!taskDef) {
      limitReasons.push(`Task ${taskId} not found in catalog`);
      continue;
    }

    const result = executeTask(root, store, taskRun, taskDef);
    allFindings.push(...result.findings);
    allInsights.push(...result.insights);
    allBottlenecks.push(...result.bottlenecks);
    allRecommendations.push(...result.recommendations);

    if (allFindings.length >= taskRun.budgets.max_findings) {
      limitReasons.push(`max_findings cap reached (${taskRun.budgets.max_findings})`);
      break;
    }
  }

  if (allFindings.length > 0) store.saveTaskRunFindings(taskRun.run_id, allFindings);
  if (allInsights.length > 0) store.saveInsights(taskRun.run_id, allInsights);
  if (allBottlenecks.length > 0) store.saveBottlenecks(taskRun.run_id, allBottlenecks);
  if (allRecommendations.length > 0) store.saveRecommendations(taskRun.run_id, allRecommendations);

  const elapsed = Date.now() - new Date(startedAt).getTime();
  taskRun.telemetry_summary = { total_time_ms: elapsed, total_tokens: 0 };
  taskRun.outputs_refs = {
    findings_count: allFindings.length,
    insights_count: allInsights.length,
    bottlenecks_count: allBottlenecks.length,
    recommendations_count: allRecommendations.length,
    has_proof: false,
  };
  taskRun.limit_reasons = limitReasons.length > 0 ? limitReasons : undefined;
  taskRun.status = limitReasons.length > 0 ? "completed_with_limits" : "completed";
  taskRun.completed_at = new Date().toISOString();
  store.saveTaskRun(taskRun);

  appendLedger("task_run_completed", {
    run_id: taskRun.run_id,
    status: taskRun.status,
    findings: allFindings.length,
    insights: allInsights.length,
    bottlenecks: allBottlenecks.length,
    recommendations: allRecommendations.length,
    elapsed_ms: elapsed,
  });

  return {
    taskRun,
    findings: allFindings,
    insights: allInsights,
    bottlenecks: allBottlenecks,
    recommendations: allRecommendations,
  };
}

interface TaskExecutionResult {
  findings: MusFinding[];
  insights: Insight[];
  bottlenecks: BottleneckReport[];
  recommendations: Recommendation[];
}

function executeTask(
  root: string,
  store: MusStore,
  taskRun: TaskRun,
  taskDef: TaskDefinition,
): TaskExecutionResult {
  switch (taskDef.task_id) {
    case "TASK-OPS-01":
    case "TASK-SYS-01":
      return executeOpsTask(root, store, taskRun, taskDef);
    case "TASK-PERF-01":
      return executePerfTask(root, store, taskRun, taskDef);
    case "TASK-QUAL-01":
      return executeQualDepthTask(root, store, taskRun, taskDef);
    case "TASK-QUAL-02":
      return executeQualTemplateTask(root, store, taskRun, taskDef);
    case "TASK-COST-01":
      return executeCostTask(root, store, taskRun, taskDef);
    default:
      return {
        findings: [],
        insights: [{
          insight_id: store.generateId("INS"),
          run_id: taskRun.run_id,
          task_id: taskDef.task_id,
          category: "general",
          narrative: `Task ${taskDef.task_id} (${taskDef.name}) does not have an executor implementation yet.`,
          evidence_refs: [],
          confidence: 0,
          suggested_next_actions: ["Implement task executor"],
          created_at: new Date().toISOString(),
        }],
        bottlenecks: [],
        recommendations: [],
      };
  }
}

function executeOpsTask(
  root: string,
  store: MusStore,
  taskRun: TaskRun,
  taskDef: TaskDefinition,
): TaskExecutionResult {
  const findings: MusFinding[] = [];
  const insights: Insight[] = [];
  const recommendations: Recommendation[] = [];

  const fakeMusRun: MusRun = {
    run_id: taskRun.run_id,
    mode_id: taskDef.task_id === "TASK-SYS-01" ? "MM-04" : "MM-01",
    trigger: taskRun.trigger,
    scope: taskRun.scope,
    budgets: taskRun.budgets,
    status: "running",
    created_at: taskRun.created_at,
  };

  if (taskDef.task_id === "TASK-SYS-01") {
    const driftResult = runDpDrift01(root, fakeMusRun, store, taskRun.budgets);
    findings.push(...driftResult.findings);
  } else {
    const regFindings = runDpReg01(root, fakeMusRun, store, taskRun.budgets);
    findings.push(...regFindings);
  }

  const criticalCount = findings.filter(f => f.severity === "critical" || f.severity === "high").length;
  const totalCount = findings.length;

  insights.push({
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskDef.task_id,
    category: "reliability",
    narrative: totalCount === 0
      ? "System integrity check passed with no issues detected. All registries are consistent and cross-references are valid."
      : `Found ${totalCount} issue(s) across registries, including ${criticalCount} high/critical severity. ${
          criticalCount > 0 ? "Immediate attention recommended for critical findings." : "Issues are low-severity and can be addressed during routine maintenance."
        }`,
    evidence_refs: findings.slice(0, 5).map(f => f.finding_id),
    confidence: totalCount === 0 ? 95 : 85,
    suggested_next_actions: totalCount === 0
      ? ["Schedule next routine check"]
      : [
          criticalCount > 0 ? "Review and fix critical findings immediately" : "Review findings at next maintenance window",
          "Run TASK-SYS-01 (Drift Scan) to check for reference inconsistencies",
        ],
    created_at: new Date().toISOString(),
  });

  if (criticalCount > 0) {
    recommendations.push({
      recommendation_id: store.generateId("REC"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      title: "Fix Critical Registry Issues",
      description: `${criticalCount} high/critical findings detected. Run drift detection (TASK-SYS-01) to generate automated fix proposals.`,
      priority: "high",
      estimated_impact: `Resolve ${criticalCount} registry integrity issues`,
      suggested_task_ids: ["TASK-SYS-01"],
      convertible_to_changeset: false,
      created_at: new Date().toISOString(),
    });
  }

  return { findings, insights, bottlenecks: [], recommendations };
}

function executePerfTask(
  root: string,
  store: MusStore,
  taskRun: TaskRun,
  taskDef: TaskDefinition,
): TaskExecutionResult {
  const insights: Insight[] = [];
  const bottlenecks: BottleneckReport[] = [];
  const recommendations: Recommendation[] = [];
  const findings: MusFinding[] = [];

  const axionRoot = path.resolve(root, "..", "..");
  const pipelineRunsDir = path.join(axionRoot, ".axion", "runs");

  if (!fs.existsSync(pipelineRunsDir)) {
    insights.push({
      insight_id: store.generateId("INS"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      category: "bottleneck",
      narrative: "No pipeline runs directory found at .axion/runs/. Run the Axion pipeline at least once to generate performance telemetry.",
      evidence_refs: [],
      confidence: 50,
      suggested_next_actions: ["Execute a pipeline run to generate stage timing data"],
      created_at: new Date().toISOString(),
    });
    return { findings, insights, bottlenecks, recommendations };
  }

  const runDirs = fs.readdirSync(pipelineRunsDir)
    .filter(d => d.startsWith("RUN-") && fs.existsSync(path.join(pipelineRunsDir, d, "run_manifest.json")))
    .sort();

  interface StageSnapshot { stage_id: string; started_at: string; finished_at: string; elapsed_ms: number; status: string }
  interface RunSnapshot { run_id: string; status: string; created_at: string; stages: StageSnapshot[]; total_ms: number; template_count: number }

  const completedRuns: RunSnapshot[] = [];

  for (const dir of runDirs) {
    const manifest = readJson<any>(path.join(pipelineRunsDir, dir, "run_manifest.json"));
    if (!manifest || manifest.status !== "completed") continue;

    const stageReportsDir = path.join(pipelineRunsDir, dir, "stage_reports");
    if (!fs.existsSync(stageReportsDir)) continue;

    const stageFiles = fs.readdirSync(stageReportsDir).filter((f: string) => f.endsWith(".json"));
    const stages: StageSnapshot[] = [];
    let runTotal = 0;

    for (const sf of stageFiles) {
      const report = readJson<any>(path.join(stageReportsDir, sf));
      if (!report?.started_at || !report?.finished_at) continue;
      const elapsed = new Date(report.finished_at).getTime() - new Date(report.started_at).getTime();
      stages.push({
        stage_id: report.stage_id ?? sf.replace(".json", ""),
        started_at: report.started_at,
        finished_at: report.finished_at,
        elapsed_ms: Math.max(elapsed, 0),
        status: report.status ?? "unknown",
      });
      runTotal += Math.max(elapsed, 0);
    }

    let templateCount = 0;
    const renderReport = readJson<any>(path.join(pipelineRunsDir, dir, "templates", "render_report.json"));
    if (renderReport?.templates_rendered) templateCount = renderReport.templates_rendered;
    else if (renderReport?.files) templateCount = renderReport.files.length;

    if (stages.length > 0) {
      completedRuns.push({ run_id: dir, status: "completed", created_at: manifest.created_at ?? "", stages, total_ms: runTotal, template_count: templateCount });
    }
  }

  if (completedRuns.length === 0) {
    insights.push({
      insight_id: store.generateId("INS"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      category: "bottleneck",
      narrative: `Found ${runDirs.length} run directories but none have completed stage reports. Complete at least one pipeline run to generate performance data.`,
      evidence_refs: [pipelineRunsDir],
      confidence: 50,
      suggested_next_actions: ["Execute and complete a pipeline run", "Check for stalled runs"],
      created_at: new Date().toISOString(),
    });
    return { findings, insights, bottlenecks, recommendations };
  }

  const recentRuns = completedRuns.slice(-10);
  const allStageIds = [...new Set(recentRuns.flatMap(r => r.stages.map(s => s.stage_id)))].sort();

  const aggregated: Record<string, { total_ms: number; count: number; min_ms: number; max_ms: number; samples: number[] }> = {};
  for (const sid of allStageIds) {
    aggregated[sid] = { total_ms: 0, count: 0, min_ms: Infinity, max_ms: 0, samples: [] };
  }
  for (const run of recentRuns) {
    for (const stage of run.stages) {
      const agg = aggregated[stage.stage_id];
      if (!agg) continue;
      agg.total_ms += stage.elapsed_ms;
      agg.count += 1;
      agg.min_ms = Math.min(agg.min_ms, stage.elapsed_ms);
      agg.max_ms = Math.max(agg.max_ms, stage.elapsed_ms);
      agg.samples.push(stage.elapsed_ms);
    }
  }

  const avgTotalMs = recentRuns.reduce((s, r) => s + r.total_ms, 0) / recentRuns.length;
  const stageBreakdown: Record<string, { time_ms: number; tokens: number; percentage: number; avg_ms?: number; min_ms?: number; max_ms?: number; variance_pct?: number }> = {};
  const hotspots: Array<{ location: string; stage: string; time_ms: number; token_count: number; percentage_of_total: number; hypothesis: string }> = [];

  const sortedStages = Object.entries(aggregated)
    .filter(([, a]) => a.count > 0)
    .map(([sid, a]) => ({ stage_id: sid, avg_ms: a.total_ms / a.count, ...a }))
    .sort((a, b) => b.avg_ms - a.avg_ms);

  for (const s of sortedStages) {
    const pct = avgTotalMs > 0 ? (s.avg_ms / avgTotalMs) * 100 : 0;
    const variance = s.max_ms > 0 && s.min_ms < Infinity ? ((s.max_ms - s.min_ms) / s.avg_ms) * 100 : 0;
    stageBreakdown[s.stage_id] = {
      time_ms: Math.round(s.avg_ms),
      tokens: 0,
      percentage: Math.round(pct * 10) / 10,
      avg_ms: Math.round(s.avg_ms),
      min_ms: s.min_ms === Infinity ? 0 : Math.round(s.min_ms),
      max_ms: Math.round(s.max_ms),
      variance_pct: Math.round(variance * 10) / 10,
    };
  }

  for (const s of sortedStages.slice(0, 5)) {
    const pct = avgTotalMs > 0 ? (s.avg_ms / avgTotalMs) * 100 : 0;
    if (pct < 3) continue;
    const variance = s.max_ms > 0 && s.min_ms < Infinity ? ((s.max_ms - s.min_ms) / s.avg_ms) * 100 : 0;
    let hypothesis: string;

    if (s.stage_id.includes("S7") || s.stage_id.includes("RENDER")) {
      hypothesis = `${s.stage_id} averages ${formatDuration(s.avg_ms)} (${Math.round(pct)}% of pipeline). This is the document rendering stage with LLM calls — primary bottleneck. Optimization paths: batch fewer templates, cache rendered docs, reduce prompt sizes, or parallelize rendering.`;
    } else if (s.stage_id.includes("S3") || s.stage_id.includes("CANONICAL")) {
      hypothesis = `${s.stage_id} averages ${formatDuration(s.avg_ms)} (${Math.round(pct)}% of pipeline). Canonical spec building involves LLM calls for structuring intake data — consider caching canonical specs for similar intakes.`;
    } else if (s.stage_id.includes("S8") || s.stage_id.includes("PLAN")) {
      hypothesis = `${s.stage_id} averages ${formatDuration(s.avg_ms)} (${Math.round(pct)}% of pipeline). Build planning uses LLM calls — consider pre-computed plan templates or caching for repeat assembly types.`;
    } else if (pct > 30) {
      hypothesis = `${s.stage_id} consumes ${Math.round(pct)}% of total pipeline time — likely the primary bottleneck. Investigate whether it involves LLM calls, heavy I/O, or blocking waits.`;
    } else {
      hypothesis = `${s.stage_id} uses ${Math.round(pct)}% of time${variance > 100 ? ` with high variance (${Math.round(variance)}%)` : ""}. May benefit from optimization if it involves LLM calls or heavy I/O.`;
    }

    hotspots.push({
      location: s.stage_id,
      stage: s.stage_id,
      time_ms: Math.round(s.avg_ms),
      token_count: 0,
      percentage_of_total: Math.round(pct * 10) / 10,
      hypothesis,
    });
  }

  const hypotheses: string[] = [];
  if (hotspots.length > 0) {
    hypotheses.push(`Primary bottleneck: ${hotspots[0].location} at ${hotspots[0].percentage_of_total}% of average pipeline time (${formatDuration(hotspots[0].time_ms)})`);
  }
  if (avgTotalMs > 300000) {
    hypotheses.push(`Average pipeline time (${formatDuration(avgTotalMs)}) exceeds 5 minutes — significant optimization potential`);
  }
  if (avgTotalMs > 600000) {
    hypotheses.push(`Pipeline averaging ${formatDuration(avgTotalMs)} — parallel stage execution and aggressive caching strongly recommended`);
  }

  const highVarianceStages = sortedStages.filter(s => {
    const variance = s.max_ms > 0 && s.min_ms < Infinity ? ((s.max_ms - s.min_ms) / s.avg_ms) * 100 : 0;
    return variance > 100 && s.avg_ms > 5000;
  });
  if (highVarianceStages.length > 0) {
    hypotheses.push(`High-variance stages detected: ${highVarianceStages.map(s => s.stage_id).join(", ")} — runtime varies significantly across runs, suggesting non-deterministic factors (LLM response time, external calls)`);
  }

  const evidenceRefs = recentRuns.map(r => path.join(pipelineRunsDir, r.run_id, "stage_reports"));

  bottlenecks.push({
    report_id: store.generateId("BNR"),
    run_id: taskRun.run_id,
    task_id: taskDef.task_id,
    hotspots,
    stage_breakdown: stageBreakdown,
    total_time_ms: Math.round(avgTotalMs),
    total_tokens: 0,
    hypotheses,
    evidence_refs: evidenceRefs,
    created_at: new Date().toISOString(),
  });

  const topHotspot = hotspots[0];
  const runTimeTrend = recentRuns.length >= 3 ? computeTrend(recentRuns.map(r => r.total_ms)) : "stable";
  const avgTemplates = recentRuns.reduce((s, r) => s + r.template_count, 0) / recentRuns.length;

  insights.push({
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskDef.task_id,
    category: "bottleneck",
    narrative: `Pipeline performance analysis across ${recentRuns.length} completed run(s) (of ${completedRuns.length} total). Average pipeline time: ${formatDuration(avgTotalMs)}. ${
      topHotspot
        ? `Primary bottleneck: ${topHotspot.location} at ${topHotspot.percentage_of_total}% (avg ${formatDuration(topHotspot.time_ms)}).`
        : "No significant hotspots detected."
    }${avgTemplates > 0 ? ` Average templates rendered: ${Math.round(avgTemplates)}.` : ""}${
      runTimeTrend !== "stable" ? ` Performance trend: ${runTimeTrend}.` : ""
    }`,
    evidence_refs: evidenceRefs,
    confidence: recentRuns.length >= 5 ? 90 : recentRuns.length >= 3 ? 80 : 65,
    suggested_next_actions: topHotspot
      ? [`Investigate ${topHotspot.location} optimization`, "Consider stage-level caching for LLM-heavy stages", "Run TASK-COST-01 for token waste analysis"]
      : ["Pipeline performance is acceptable", "Schedule periodic monitoring with TASK-PERF-01"],
    created_at: new Date().toISOString(),
  });

  if (recentRuns.length >= 3) {
    const fastest = Math.min(...recentRuns.map(r => r.total_ms));
    const slowest = Math.max(...recentRuns.map(r => r.total_ms));
    if (slowest > fastest * 2) {
      insights.push({
        insight_id: store.generateId("INS"),
        run_id: taskRun.run_id,
        task_id: taskDef.task_id,
        category: "reliability",
        narrative: `Pipeline runtime variability is high: fastest run ${formatDuration(fastest)}, slowest ${formatDuration(slowest)} (${Math.round(slowest / fastest)}x difference). This suggests non-deterministic factors — likely LLM response time variance or external API latency.`,
        evidence_refs: evidenceRefs,
        confidence: 85,
        suggested_next_actions: ["Implement response caching for deterministic sections", "Add timeout guards for LLM calls", "Consider retry-with-fallback for slow stages"],
        created_at: new Date().toISOString(),
      });
    }
  }

  for (const s of sortedStages) {
    if (s.avg_ms < 100 && s.count > 0) {
      const pct = avgTotalMs > 0 ? (s.avg_ms / avgTotalMs) * 100 : 0;
      if (pct < 0.1) continue;
    }
    const pct = avgTotalMs > 0 ? (s.avg_ms / avgTotalMs) * 100 : 0;
    if (pct > 40) {
      findings.push({
        finding_id: store.generateId("FND"),
        run_id: taskRun.run_id,
        mode_id: taskDef.task_id,
        detector_id: "PERF-STAGE-TIME",
        title: `${s.stage_id} dominates pipeline time (${Math.round(pct)}%)`,
        description: `${s.stage_id} averages ${formatDuration(s.avg_ms)} per run, consuming ${Math.round(pct)}% of total pipeline time. This is the primary optimization target.`,
        severity: "high",
        file_path: path.join(pipelineRunsDir, recentRuns[recentRuns.length - 1].run_id, "stage_reports"),
        json_pointer: `/${s.stage_id}`,
        auto_fixable: false,
        status: "open",
        created_at: new Date().toISOString(),
      });
    } else if (pct > 15) {
      findings.push({
        finding_id: store.generateId("FND"),
        run_id: taskRun.run_id,
        mode_id: taskDef.task_id,
        detector_id: "PERF-STAGE-TIME",
        title: `${s.stage_id} is a secondary time consumer (${Math.round(pct)}%)`,
        description: `${s.stage_id} averages ${formatDuration(s.avg_ms)} per run (${Math.round(pct)}% of pipeline time).`,
        severity: "medium",
        file_path: path.join(pipelineRunsDir, recentRuns[recentRuns.length - 1].run_id, "stage_reports"),
        json_pointer: `/${s.stage_id}`,
        auto_fixable: false,
        status: "open",
        created_at: new Date().toISOString(),
      });
    }
  }

  if (topHotspot && topHotspot.percentage_of_total > 25) {
    recommendations.push({
      recommendation_id: store.generateId("REC"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      title: `Optimize ${topHotspot.location}`,
      description: `${topHotspot.location} accounts for ${topHotspot.percentage_of_total}% of pipeline time (avg ${formatDuration(topHotspot.time_ms)}). ${topHotspot.hypothesis}`,
      priority: topHotspot.percentage_of_total > 50 ? "critical" : topHotspot.percentage_of_total > 35 ? "high" : "medium",
      estimated_impact: `Reduce average pipeline time by up to ${formatDuration(Math.round(topHotspot.time_ms * 0.3))} (${Math.round(topHotspot.percentage_of_total * 0.3)}% reduction)`,
      convertible_to_changeset: false,
      created_at: new Date().toISOString(),
    });
  }

  if (avgTotalMs > 600000 && hotspots.length >= 2) {
    recommendations.push({
      recommendation_id: store.generateId("REC"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      title: "Implement Stage-Level Caching",
      description: `Average pipeline time is ${formatDuration(avgTotalMs)}. Implementing caching for deterministic stages (standards resolution, template selection) could skip recomputation on repeat runs with similar intakes.`,
      priority: "high",
      estimated_impact: "Skip 2-3 deterministic stages on cache hit, saving approximately 30-60 seconds per cached run",
      suggested_task_ids: ["TASK-COST-01"],
      convertible_to_changeset: false,
      created_at: new Date().toISOString(),
    });
  }

  return { findings, insights, bottlenecks, recommendations };
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function computeTrend(values: number[]): string {
  if (values.length < 3) return "stable";
  const half = Math.floor(values.length / 2);
  const firstHalfAvg = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const secondHalfAvg = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);
  const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  if (change > 20) return `worsening (+${Math.round(change)}% slower in recent runs)`;
  if (change < -20) return `improving (${Math.round(Math.abs(change))}% faster in recent runs)`;
  return "stable";
}

function executeQualDepthTask(
  root: string,
  store: MusStore,
  taskRun: TaskRun,
  taskDef: TaskDefinition,
): TaskExecutionResult {
  const insights: Insight[] = [];
  const recommendations: Recommendation[] = [];

  const templatesDir = path.join(root, "registries");
  const tplReg = readJson<RegistryEnvelope>(path.join(templatesDir, "REG-TEMPLATES.json"));
  const templateCount = tplReg?.items?.length ?? 0;

  const klDir = path.join(root, "registries");
  const klReg = readJson<RegistryEnvelope>(path.join(klDir, "REG-KIDS.json"));
  const kidCount = klReg?.items?.length ?? 0;

  insights.push({
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskDef.task_id,
    category: "quality",
    narrative: `Detail depth analysis: ${templateCount} templates and ${kidCount} knowledge items found. ${
      templateCount === 0 && kidCount === 0
        ? "No templates or knowledge items available for depth analysis."
        : `Coverage analysis available. Templates and knowledge items can be evaluated for section completeness, placeholder usage, and citation density.`
    }`,
    evidence_refs: [],
    confidence: 70,
    suggested_next_actions: [
      "Review templates for required section coverage",
      "Check knowledge items for citation completeness",
      "Run TASK-QUAL-02 for template determinism audit",
    ],
    created_at: new Date().toISOString(),
  });

  if (templateCount > 0) {
    recommendations.push({
      recommendation_id: store.generateId("REC"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      title: "Evaluate Template Section Completeness",
      description: `${templateCount} templates detected. Evaluate each for required section coverage and placeholder compliance to identify depth improvement opportunities.`,
      priority: "medium",
      estimated_impact: "Improve document generation completeness and quality",
      suggested_task_ids: ["TASK-QUAL-02"],
      convertible_to_changeset: false,
      created_at: new Date().toISOString(),
    });
  }

  return { findings: [], insights, bottlenecks: [], recommendations };
}

function executeQualTemplateTask(
  root: string,
  store: MusStore,
  taskRun: TaskRun,
  taskDef: TaskDefinition,
): TaskExecutionResult {
  const findings: MusFinding[] = [];
  const insights: Insight[] = [];
  const recommendations: Recommendation[] = [];

  const tplReg = readJson<RegistryEnvelope>(path.join(root, "registries", "REG-TEMPLATES.json"));
  if (!tplReg?.items || tplReg.items.length === 0) {
    insights.push({
      insight_id: store.generateId("INS"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      category: "quality",
      narrative: "No templates found in REG-TEMPLATES registry. Template quality audit cannot proceed without template definitions.",
      evidence_refs: [],
      confidence: 90,
      suggested_next_actions: ["Add templates to REG-TEMPLATES.json", "Check template library configuration"],
      created_at: new Date().toISOString(),
    });
    return { findings, insights, bottlenecks: [], recommendations };
  }

  let missingVersion = 0;
  let missingStatus = 0;
  const fakeMusRun: MusRun = {
    run_id: taskRun.run_id, mode_id: "TASK-QUAL-02", trigger: taskRun.trigger,
    scope: taskRun.scope, budgets: taskRun.budgets, status: "running", created_at: taskRun.created_at,
  };

  for (let i = 0; i < tplReg.items.length && findings.length < taskRun.budgets.max_findings; i++) {
    const tpl = tplReg.items[i];
    const tplId = (tpl.template_id ?? tpl.id ?? `item-${i}`) as string;
    if (!tpl.version) {
      missingVersion++;
      findings.push(makeFinding(fakeMusRun, "tpl.missing_version", taskDef.task_id, "medium",
        `Template ${tplId} missing version`, `Template is missing a version field, reducing traceability`,
        "registries/REG-TEMPLATES.json", `/items/${i}/version`, store));
    }
    if (!tpl.status) {
      missingStatus++;
      findings.push(makeFinding(fakeMusRun, "tpl.missing_status", taskDef.task_id, "low",
        `Template ${tplId} missing status`, `Template has no status field`,
        "registries/REG-TEMPLATES.json", `/items/${i}/status`, store));
    }
  }

  insights.push({
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskDef.task_id,
    category: "quality",
    narrative: `Template quality audit: ${tplReg.items.length} templates checked. ${missingVersion} missing version fields, ${missingStatus} missing status fields. ${
      findings.length === 0 ? "All templates pass basic quality checks." : `${findings.length} issues found that may affect template determinism and traceability.`
    }`,
    evidence_refs: findings.slice(0, 5).map(f => f.finding_id),
    confidence: 85,
    suggested_next_actions: findings.length > 0
      ? ["Add missing version/status fields to templates", "Run TASK-OPS-01 for broader health check"]
      : ["Templates are in good shape", "Schedule periodic quality audits"],
    created_at: new Date().toISOString(),
  });

  return { findings, insights, bottlenecks: [], recommendations };
}

function executeCostTask(
  root: string,
  store: MusStore,
  taskRun: TaskRun,
  taskDef: TaskDefinition,
): TaskExecutionResult {
  const insights: Insight[] = [];
  const bottlenecks: BottleneckReport[] = [];
  const recommendations: Recommendation[] = [];

  const buildDir = path.resolve(root, "..", "build");
  const manifestPath = path.join(buildDir, "manifest.json");
  const manifest = readJson<Record<string, unknown>>(manifestPath);

  let stageData: Record<string, { tokens: number; time_ms: number }> = {};
  let totalTokens = 0;
  let totalTime = 0;

  if (manifest && typeof manifest === "object") {
    const stages = (manifest as any).stages as Record<string, any> | undefined;
    if (stages) {
      for (const [stageId, info] of Object.entries(stages)) {
        if (info && typeof info === "object") {
          const tokens = info.tokens_used ?? 0;
          const time = info.elapsed_ms ?? info.duration_ms ?? 0;
          stageData[stageId] = { tokens, time_ms: time };
          totalTokens += tokens;
          totalTime += time;
        }
      }
    }
  }

  if (totalTokens === 0 && totalTime === 0) {
    insights.push({
      insight_id: store.generateId("INS"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      category: "cost",
      narrative: "No token/compute usage data found. Pipeline telemetry must be available to analyze cost hotspots.",
      evidence_refs: [],
      confidence: 50,
      suggested_next_actions: ["Run the pipeline to generate telemetry data", "Ensure stages record token usage"],
      created_at: new Date().toISOString(),
    });
    return { findings: [], insights, bottlenecks, recommendations };
  }

  const hotspots: Array<{ location: string; stage: string; time_ms: number; token_count: number; percentage_of_total: number; hypothesis: string }> = [];
  const stageBreakdown: Record<string, { time_ms: number; tokens: number; percentage: number }> = {};

  const sorted = Object.entries(stageData).sort((a, b) => b[1].tokens - a[1].tokens);
  for (const [stageId, data] of sorted) {
    const pct = totalTokens > 0 ? (data.tokens / totalTokens) * 100 : 0;
    stageBreakdown[stageId] = { time_ms: data.time_ms, tokens: data.tokens, percentage: Math.round(pct * 10) / 10 };
    if (pct >= 10) {
      hotspots.push({
        location: `Stage ${stageId}`,
        stage: stageId,
        time_ms: data.time_ms,
        token_count: data.tokens,
        percentage_of_total: Math.round(pct * 10) / 10,
        hypothesis: `Stage ${stageId} uses ${Math.round(pct)}% of total tokens (${data.tokens}). ${
          data.tokens > 20000 ? "Consider prompt compression or caching." : "Token usage is moderate."
        }`,
      });
    }
  }

  bottlenecks.push({
    report_id: store.generateId("BNR"),
    run_id: taskRun.run_id,
    task_id: taskDef.task_id,
    hotspots,
    stage_breakdown: stageBreakdown,
    total_time_ms: totalTime,
    total_tokens: totalTokens,
    hypotheses: hotspots.map(h => h.hypothesis),
    evidence_refs: [manifestPath],
    created_at: new Date().toISOString(),
  });

  insights.push({
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskDef.task_id,
    category: "cost",
    narrative: `Cost analysis: ${totalTokens} tokens used across ${Object.keys(stageData).length} stages (${Math.round(totalTime / 1000)}s total time). ${
      hotspots.length > 0 ? `Top cost center: ${hotspots[0].location} at ${hotspots[0].percentage_of_total}% of token budget.` : "Token usage is evenly distributed."
    }`,
    evidence_refs: [manifestPath],
    confidence: 75,
    suggested_next_actions: hotspots.length > 0
      ? [`Optimize token usage in ${hotspots[0].location}`, "Review prompt sizes for top-consuming stages"]
      : ["Token usage is well-distributed", "Monitor for drift with scheduled TASK-COST-01"],
    created_at: new Date().toISOString(),
  });

  if (hotspots.length > 0 && hotspots[0].percentage_of_total > 30) {
    recommendations.push({
      recommendation_id: store.generateId("REC"),
      run_id: taskRun.run_id,
      task_id: taskDef.task_id,
      title: `Reduce Token Usage in ${hotspots[0].location}`,
      description: `${hotspots[0].location} consumes ${hotspots[0].percentage_of_total}% of total tokens. Consider prompt compression, caching, or splitting into smaller requests.`,
      priority: hotspots[0].percentage_of_total > 50 ? "high" : "medium",
      estimated_impact: `Reduce token spend by up to ${Math.round(hotspots[0].percentage_of_total * 0.25)}%`,
      convertible_to_changeset: false,
      created_at: new Date().toISOString(),
    });
  }

  return { findings: [], insights, bottlenecks, recommendations };
}
