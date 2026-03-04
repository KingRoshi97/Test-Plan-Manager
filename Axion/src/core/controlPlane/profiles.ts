import { existsSync } from "node:fs";
import { join } from "node:path";
import { readJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { canonicalJsonString } from "../../utils/canonicalJson.js";
import type { RiskClass, Platform, RunContext } from "../../types/controlPlane.js";
import type { StageId } from "../../types/run.js";
import { STAGE_ORDER, STAGE_GATES, GATES_REQUIRED } from "../../types/run.js";

export interface RunProfileMatchRules {
  platforms: Platform[];
  risk_classes: RiskClass[];
  domains: string[];
}

export interface RunProfile {
  profile_id: string;
  name: string;
  description: string;
  match_rules: RunProfileMatchRules;
  stage_activation: Record<string, boolean>;
  gate_activation: Record<string, boolean>;
  required_proof_types: string[];
  kit_variant: string;
  knowledge_bundle: string | null;
  priority: number;
}

export interface ModeOverlay {
  mode_id: string;
  description: string;
  gate_overrides: Record<string, boolean>;
  stage_overrides: Record<string, boolean>;
  proof_overrides: {
    add?: string[];
    remove?: string[];
  };
}

export interface RunProfileRegistry {
  $schema: string;
  version: string;
  description: string;
  profiles: RunProfile[];
  mode_overlays: ModeOverlay[];
}

export interface ProfileResolutionResult {
  resolved_profile_id: string;
  resolved_profile_name: string;
  mode_id: string | null;
  match_score: number;
  match_reasons: string[];
  candidates_evaluated: Array<{
    profile_id: string;
    score: number;
    matched: boolean;
    reasons: string[];
  }>;
  resolved_at: string;
}

export interface EffectiveRunConfig {
  run_id: string;
  profile_id: string;
  mode_id: string | null;
  active_stages: StageId[];
  skipped_stages: StageId[];
  active_gates: string[];
  skipped_gates: string[];
  required_proof_types: string[];
  kit_variant: string;
  knowledge_bundle: string | null;
  stage_gate_map: Record<string, string>;
  gates_required: string[];
  config_hash: string;
  resolved_at: string;
}

export function loadRunProfileRegistry(registryPath: string): RunProfileRegistry {
  if (!existsSync(registryPath)) {
    throw new Error(`Run profile registry not found: ${registryPath}`);
  }
  return readJson<RunProfileRegistry>(registryPath);
}

function scoreProfile(profile: RunProfile, context: RunContext): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = profile.priority;

  const contextPlatforms = context.targets.platforms ?? [];
  const contextDomains = context.targets.domains ?? [];
  const contextRiskClass = context.risk_class;

  if (profile.match_rules.platforms.length > 0) {
    const platformOverlap = contextPlatforms.filter((p) =>
      profile.match_rules.platforms.includes(p),
    );
    if (platformOverlap.length > 0) {
      score += platformOverlap.length * 10;
      reasons.push(`platform match: ${platformOverlap.join(", ")}`);
    } else {
      return { score: -1, reasons: ["no platform match"] };
    }
  }

  if (profile.match_rules.risk_classes.length > 0) {
    if (profile.match_rules.risk_classes.includes(contextRiskClass)) {
      score += 5;
      reasons.push(`risk_class match: ${contextRiskClass}`);
    } else {
      return { score: -1, reasons: [`risk_class mismatch: ${contextRiskClass} not in [${profile.match_rules.risk_classes.join(", ")}]`] };
    }
  }

  if (profile.match_rules.domains.length > 0) {
    const domainOverlap = contextDomains.filter((d) =>
      profile.match_rules.domains.includes(d),
    );
    if (domainOverlap.length > 0) {
      score += domainOverlap.length * 8;
      reasons.push(`domain match: ${domainOverlap.join(", ")}`);
    }
  }

  if (reasons.length === 0) {
    reasons.push("fallback match (no specific rules)");
  }

  return { score, reasons };
}

export function resolveProfile(
  registry: RunProfileRegistry,
  context: RunContext,
): ProfileResolutionResult {
  const candidates: ProfileResolutionResult["candidates_evaluated"] = [];
  let bestProfile: RunProfile | null = null;
  let bestScore = -1;
  let bestReasons: string[] = [];

  if (context.run_profile_id) {
    const explicit = registry.profiles.find((p) => p.profile_id === context.run_profile_id);
    if (explicit) {
      candidates.push({
        profile_id: explicit.profile_id,
        score: 1000,
        matched: true,
        reasons: ["explicitly requested via run_profile_id"],
      });
      return {
        resolved_profile_id: explicit.profile_id,
        resolved_profile_name: explicit.name,
        mode_id: context.mode_id ?? null,
        match_score: 1000,
        match_reasons: ["explicitly requested via run_profile_id"],
        candidates_evaluated: candidates,
        resolved_at: new Date().toISOString(),
      };
    }
  }

  for (const profile of registry.profiles) {
    const { score, reasons } = scoreProfile(profile, context);
    const matched = score >= 0;
    candidates.push({
      profile_id: profile.profile_id,
      score,
      matched,
      reasons,
    });
    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
      bestReasons = reasons;
    }
  }

  if (!bestProfile) {
    const fallback = registry.profiles.find((p) => p.profile_id === "DEFAULT");
    bestProfile = fallback ?? registry.profiles[0];
    bestScore = 0;
    bestReasons = ["no matching profile found, using fallback"];
  }

  return {
    resolved_profile_id: bestProfile.profile_id,
    resolved_profile_name: bestProfile.name,
    mode_id: context.mode_id ?? null,
    match_score: bestScore,
    match_reasons: bestReasons,
    candidates_evaluated: candidates,
    resolved_at: new Date().toISOString(),
  };
}

export function buildEffectiveConfig(
  registry: RunProfileRegistry,
  resolution: ProfileResolutionResult,
  runId: string,
): EffectiveRunConfig {
  const profile = registry.profiles.find((p) => p.profile_id === resolution.resolved_profile_id);
  if (!profile) {
    throw new Error(`Profile ${resolution.resolved_profile_id} not found in registry`);
  }

  let stageActivation = { ...profile.stage_activation };
  let gateActivation = { ...profile.gate_activation };
  let proofTypes = [...profile.required_proof_types];

  if (resolution.mode_id) {
    const overlay = registry.mode_overlays.find((m) => m.mode_id === resolution.mode_id);
    if (overlay) {
      for (const [stageId, active] of Object.entries(overlay.stage_overrides)) {
        stageActivation[stageId] = active;
      }
      for (const [gateId, active] of Object.entries(overlay.gate_overrides)) {
        gateActivation[gateId] = active;
      }
      if (overlay.proof_overrides.add) {
        for (const pt of overlay.proof_overrides.add) {
          if (!proofTypes.includes(pt)) {
            proofTypes.push(pt);
          }
        }
      }
      if (overlay.proof_overrides.remove) {
        proofTypes = proofTypes.filter((pt) => !overlay.proof_overrides.remove!.includes(pt));
      }
    }
  }

  const activeStages: StageId[] = [];
  const skippedStages: StageId[] = [];
  for (const sid of STAGE_ORDER) {
    if (stageActivation[sid] !== false) {
      activeStages.push(sid);
    } else {
      skippedStages.push(sid);
    }
  }

  const allGateIds = Object.values(STAGE_GATES);
  const activeGates: string[] = [];
  const skippedGates: string[] = [];
  for (const gid of allGateIds) {
    if (gateActivation[gid] !== false) {
      activeGates.push(gid);
    } else {
      skippedGates.push(gid);
    }
  }

  const stageGateMap: Record<string, string> = {};
  for (const [sid, gid] of Object.entries(STAGE_GATES)) {
    if (activeStages.includes(sid as StageId) && activeGates.includes(gid)) {
      stageGateMap[sid] = gid;
    }
  }

  const gatesRequired = GATES_REQUIRED.filter((g) => activeGates.includes(g));

  const configData = {
    run_id: runId,
    profile_id: resolution.resolved_profile_id,
    mode_id: resolution.mode_id,
    active_stages: activeStages,
    skipped_stages: skippedStages,
    active_gates: activeGates,
    skipped_gates: skippedGates,
    required_proof_types: proofTypes.sort(),
    kit_variant: profile.kit_variant,
    knowledge_bundle: profile.knowledge_bundle,
    stage_gate_map: stageGateMap,
    gates_required: gatesRequired,
    resolved_at: new Date().toISOString(),
  };

  const configHash = sha256(canonicalJsonString(configData));

  return {
    ...configData,
    config_hash: configHash,
  };
}

export function resolveRunProfile(
  registryPath: string,
  context: RunContext,
  runId: string,
): { resolution: ProfileResolutionResult; effectiveConfig: EffectiveRunConfig } {
  const registry = loadRunProfileRegistry(registryPath);
  const resolution = resolveProfile(registry, context);
  const effectiveConfig = buildEffectiveConfig(registry, resolution, runId);
  return { resolution, effectiveConfig };
}
