import { storage } from "../storage";
import { generateSignedUrl, generateWebhookSignature, computeSha256 } from "../signing";
import { 
  type Delivery, type DeliveryAttempt, 
  type PullConfig, type WebhookConfig, type GitConfig, type DirectConfig,
  type PullResult, type WebhookResult, type GitResult
} from "@shared/schema";
import fs from "fs";
import path from "path";

export interface AdapterContext {
  delivery: Delivery;
  kitPath: string;
  manifestPath: string;
  promptPath: string;
  baseUrl: string;
}

export interface AdapterResult {
  success: boolean;
  result?: PullResult | WebhookResult | GitResult;
  error?: string;
}

export async function executeDelivery(ctx: AdapterContext): Promise<AdapterResult> {
  const { delivery } = ctx;
  
  switch (delivery.type) {
    case "pull":
      return executePullDelivery(ctx);
    case "webhook":
      return executeWebhookDelivery(ctx);
    case "git":
      return executeGitDelivery(ctx);
    case "direct":
      return executeDirectDelivery(ctx);
    default:
      return { success: false, error: `Unknown delivery type: ${delivery.type}` };
  }
}

async function executePullDelivery(ctx: AdapterContext): Promise<AdapterResult> {
  const { delivery, kitPath, manifestPath, promptPath, baseUrl } = ctx;
  const config = delivery.config as PullConfig;
  
  try {
    if (!fs.existsSync(kitPath)) {
      return { success: false, error: "Kit zip not found" };
    }
    
    const zipBuffer = fs.readFileSync(kitPath);
    const zipSha256 = computeSha256(zipBuffer);
    const zipBytes = zipBuffer.length;
    
    const assemblyId = delivery.assemblyId;
    const signed = generateSignedUrl(
      `${baseUrl}/v1/assemblies/${assemblyId}/kit.zip`,
      { assemblyId, expiresInSeconds: config.expiresInSeconds || 3600 }
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

async function executeWebhookDelivery(ctx: AdapterContext): Promise<AdapterResult> {
  const { delivery, kitPath, manifestPath, promptPath, baseUrl } = ctx;
  const config = delivery.config as WebhookConfig;
  
  try {
    if (!config.url) {
      return { success: false, error: "Webhook URL is required" };
    }
    
    if (!config.secret) {
      return { success: false, error: "Webhook secret is required" };
    }
    
    const zipBuffer = fs.existsSync(kitPath) ? fs.readFileSync(kitPath) : null;
    const zipSha256 = zipBuffer ? computeSha256(zipBuffer) : null;
    const zipBytes = zipBuffer ? zipBuffer.length : 0;
    
    const assemblyId = delivery.assemblyId;
    const signed = generateSignedUrl(
      `${baseUrl}/v1/assemblies/${assemblyId}/kit.zip`,
      { assemblyId, expiresInSeconds: 3600 }
    );
    
    const payload: Record<string, unknown> = {
      event: "assembler.kit.ready",
      deliveryId: delivery.id,
      assemblyId: delivery.assemblyId,
      kit: {
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
        "X-Assembler-Timestamp": sig.timestamp,
        "X-Assembler-Nonce": sig.nonce,
        "X-Assembler-Signature": sig.signature,
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

async function executeGitDelivery(ctx: AdapterContext): Promise<AdapterResult> {
  const { delivery } = ctx;
  const config = delivery.config as GitConfig;
  
  return { 
    success: false, 
    error: `Git delivery to ${config.provider}/${config.repo} not yet implemented. Use pull or webhook instead.` 
  };
}

async function executeDirectDelivery(ctx: AdapterContext): Promise<AdapterResult> {
  const { delivery } = ctx;
  const config = delivery.config as DirectConfig;
  
  return { 
    success: false, 
    error: `Direct adapter "${config.adapter}" not yet implemented. Use pull or webhook instead.` 
  };
}

export async function processDelivery(
  deliveryId: string, 
  baseUrl: string
): Promise<{ success: boolean; delivery?: Delivery; error?: string }> {
  const delivery = await storage.getDelivery(deliveryId);
  if (!delivery) {
    return { success: false, error: "Delivery not found" };
  }
  
  const assembly = await storage.getAssembly(delivery.assemblyId);
  if (!assembly) {
    return { success: false, error: "Assembly not found" };
  }
  
  if (assembly.state !== "completed") {
    return { success: false, error: "Assembly not completed yet" };
  }
  
  const kitPath = assembly.kitPath || "dist/axiom_kit.zip";
  const manifestPath = kitPath.replace(".zip", "/assembly_manifest.json");
  const promptPath = kitPath.replace(".zip", "/agent_prompt.md");
  
  await storage.updateDelivery(deliveryId, { 
    state: "delivering",
    lastAttemptAt: new Date(),
  });
  
  const ctx: AdapterContext = {
    delivery,
    kitPath,
    manifestPath,
    promptPath,
    baseUrl,
  };
  
  const result = await executeDelivery(ctx);
  
  const newAttempt: DeliveryAttempt = {
    attempt: (delivery.attempts || 0) + 1,
    at: new Date().toISOString(),
    ok: result.success,
    error: result.error,
  };
  
  const attemptHistory = [...(delivery.attemptHistory || []), newAttempt];
  
  if (result.success) {
    const updated = await storage.updateDelivery(deliveryId, {
      state: "completed",
      attempts: newAttempt.attempt,
      result: result.result,
      attemptHistory,
    });
    return { success: true, delivery: updated };
  } else {
    const newState = newAttempt.attempt >= delivery.maxAttempts ? "failed" : "queued";
    const updated = await storage.updateDelivery(deliveryId, {
      state: newState,
      attempts: newAttempt.attempt,
      lastError: result.error,
      attemptHistory,
    });
    return { success: false, delivery: updated, error: result.error };
  }
}

// Backward compatibility alias
export const processHandoff = processDelivery;
export const executeHandoff = executeDelivery;
