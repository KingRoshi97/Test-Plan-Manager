import { storage } from "../storage";
import { generateSignedUrl, generateWebhookSignature, computeSha256 } from "../signing";
import { 
  type Handoff, type HandoffAttempt, 
  type PullConfig, type WebhookConfig, type GitConfig, type DirectConfig,
  type PullResult, type WebhookResult, type GitResult
} from "@shared/schema";
import fs from "fs";
import path from "path";

export interface AdapterContext {
  handoff: Handoff;
  bundlePath: string;
  manifestPath: string;
  promptPath: string;
  baseUrl: string;
}

export interface AdapterResult {
  success: boolean;
  result?: PullResult | WebhookResult | GitResult;
  error?: string;
}

export async function executeHandoff(ctx: AdapterContext): Promise<AdapterResult> {
  const { handoff } = ctx;
  
  switch (handoff.type) {
    case "pull":
      return executePullHandoff(ctx);
    case "webhook":
      return executeWebhookHandoff(ctx);
    case "git":
      return executeGitHandoff(ctx);
    case "direct":
      return executeDirectHandoff(ctx);
    default:
      return { success: false, error: `Unknown handoff type: ${handoff.type}` };
  }
}

async function executePullHandoff(ctx: AdapterContext): Promise<AdapterResult> {
  const { handoff, bundlePath, manifestPath, promptPath, baseUrl } = ctx;
  const config = handoff.config as PullConfig;
  
  try {
    if (!fs.existsSync(bundlePath)) {
      return { success: false, error: "Bundle zip not found" };
    }
    
    const zipBuffer = fs.readFileSync(bundlePath);
    const zipSha256 = computeSha256(zipBuffer);
    const zipBytes = zipBuffer.length;
    
    const runId = handoff.runId;
    const signed = generateSignedUrl(
      `${baseUrl}/v1/runs/${runId}/bundle.zip`,
      { runId, expiresInSeconds: config.expiresInSeconds || 3600 }
    );
    
    const result: PullResult = {
      zipUrl: signed.url,
      expiresAt: signed.expiresAt,
      zipSha256,
      zipBytes,
    };
    
    if (config.includeInlineManifest && fs.existsSync(manifestPath)) {
      result.manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    }
    
    if (config.includeInlinePrompt && fs.existsSync(promptPath)) {
      result.agentPrompt = fs.readFileSync(promptPath, "utf-8");
    }
    
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function executeWebhookHandoff(ctx: AdapterContext): Promise<AdapterResult> {
  const { handoff, bundlePath, manifestPath, promptPath, baseUrl } = ctx;
  const config = handoff.config as WebhookConfig;
  
  try {
    if (!config.url) {
      return { success: false, error: "Webhook URL is required" };
    }
    
    if (!config.secret) {
      return { success: false, error: "Webhook secret is required" };
    }
    
    const zipBuffer = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath) : null;
    const zipSha256 = zipBuffer ? computeSha256(zipBuffer) : null;
    const zipBytes = zipBuffer ? zipBuffer.length : 0;
    
    const runId = handoff.runId;
    const signed = generateSignedUrl(
      `${baseUrl}/v1/runs/${runId}/bundle.zip`,
      { runId, expiresInSeconds: 3600 }
    );
    
    const payload: Record<string, unknown> = {
      event: "roshi.bundle.ready",
      handoffId: handoff.id,
      runId: handoff.runId,
      bundle: {
        zipUrl: signed.url,
        expiresAt: signed.expiresAt,
        zipSha256,
        zipBytes,
      },
    };
    
    const include = config.include || ["zipUrl", "manifest", "agentPrompt"];
    
    if (include.includes("manifest") && fs.existsSync(manifestPath)) {
      payload.manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    }
    
    if (include.includes("agentPrompt") && fs.existsSync(promptPath)) {
      payload.agentPrompt = fs.readFileSync(promptPath, "utf-8");
    }
    
    const payloadStr = JSON.stringify(payload);
    const sig = generateWebhookSignature(payloadStr, config.secret);
    
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Roshi-Timestamp": sig.timestamp,
        "X-Roshi-Nonce": sig.nonce,
        "X-Roshi-Signature": sig.signature,
      },
      body: payloadStr,
    });
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Webhook returned ${response.status}: ${await response.text()}` 
      };
    }
    
    const result: WebhookResult = {
      deliveredAt: new Date().toISOString(),
      httpStatus: response.status,
    };
    
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function executeGitHandoff(ctx: AdapterContext): Promise<AdapterResult> {
  const { handoff } = ctx;
  const config = handoff.config as GitConfig;
  
  return { 
    success: false, 
    error: `Git handoff to ${config.provider}/${config.repo} not yet implemented. Use pull or webhook instead.` 
  };
}

async function executeDirectHandoff(ctx: AdapterContext): Promise<AdapterResult> {
  const { handoff } = ctx;
  const config = handoff.config as DirectConfig;
  
  return { 
    success: false, 
    error: `Direct adapter "${config.adapter}" not yet implemented. Use pull or webhook instead.` 
  };
}

export async function processHandoff(
  handoffId: string, 
  baseUrl: string
): Promise<{ success: boolean; handoff?: Handoff; error?: string }> {
  const handoff = await storage.getHandoff(handoffId);
  if (!handoff) {
    return { success: false, error: "Handoff not found" };
  }
  
  const run = await storage.getRun(handoff.runId);
  if (!run) {
    return { success: false, error: "Run not found" };
  }
  
  if (run.state !== "completed") {
    return { success: false, error: "Run not completed yet" };
  }
  
  const bundlePath = run.bundlePath || "dist/roshi_bundle.zip";
  const bundleDir = path.dirname(bundlePath).replace(".zip", "").replace("dist/", "dist/roshi_bundle/");
  const manifestPath = "dist/roshi_bundle/manifest.json";
  const promptPath = "dist/roshi_bundle/agent_prompt.md";
  
  await storage.updateHandoff(handoffId, { 
    state: "delivering",
    lastAttemptAt: new Date(),
  });
  
  const ctx: AdapterContext = {
    handoff,
    bundlePath,
    manifestPath,
    promptPath,
    baseUrl,
  };
  
  const result = await executeHandoff(ctx);
  
  const newAttempt: HandoffAttempt = {
    attempt: (handoff.attempts || 0) + 1,
    at: new Date().toISOString(),
    ok: result.success,
    error: result.error,
  };
  
  const attemptHistory = [...(handoff.attemptHistory || []), newAttempt];
  
  if (result.success) {
    const updated = await storage.updateHandoff(handoffId, {
      state: "completed",
      attempts: newAttempt.attempt,
      result: result.result,
      attemptHistory,
    });
    return { success: true, handoff: updated };
  } else {
    const newState = newAttempt.attempt >= handoff.maxAttempts ? "failed" : "queued";
    const updated = await storage.updateHandoff(handoffId, {
      state: newState,
      attempts: newAttempt.attempt,
      lastError: result.error,
      attemptHistory,
    });
    return { success: false, handoff: updated, error: result.error };
  }
}
