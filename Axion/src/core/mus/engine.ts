import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import type {
  RegistryEnvelope, MusValidationResult, MusValidationError,
  MusFinding, MusProposalPack, MusPatch, MusBlastRadius, MusProofBundle,
  MusBudgets, MusScope, MusRun,
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

      if (item.status && !["active", "deprecated", "draft", "retired"].includes(item.status as string)) {
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
