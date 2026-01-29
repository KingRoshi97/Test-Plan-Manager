import { storage } from "../storage";
import { generateSignedUrl, generateWebhookSignature, computeSha256 } from "../signing";
import { 
  type Delivery, type DeliveryAttempt, type DeliveryEventType,
  type PullConfig, type WebhookConfig, type GitConfig, type DirectConfig,
  type PullResult, type WebhookResult, type GitResult
} from "@shared/schema";
import fs from "fs";
import path from "path";

// Helper to log delivery events
async function logDeliveryEvent(
  deliveryId: string, 
  eventType: DeliveryEventType, 
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await storage.createDeliveryEvent({
      deliveryId,
      eventType,
      detailsJson: details,
    });
  } catch (error) {
    console.error(`Failed to log delivery event: ${eventType}`, error);
  }
}

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
  
  const attemptNumber = (delivery.attempts || 0) + 1;
  
  // Log attempt event
  await logDeliveryEvent(deliveryId, "attempted", {
    attempt: attemptNumber,
    deliveryType: delivery.type,
    assemblyId: delivery.assemblyId,
  });
  
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
  
  // Log response event for webhook deliveries
  if (delivery.type === "webhook" && result.result) {
    const webhookResult = result.result as WebhookResult;
    await logDeliveryEvent(deliveryId, "response", {
      attempt: attemptNumber,
      httpStatus: webhookResult.httpStatus,
      deliveredAt: webhookResult.deliveredAt,
    });
  }
  
  const newAttempt: DeliveryAttempt = {
    attempt: attemptNumber,
    at: new Date().toISOString(),
    ok: result.success,
    error: result.error,
  };
  
  const attemptHistory = [...(delivery.attemptHistory || []), newAttempt];
  
  if (result.success) {
    // Log success event
    await logDeliveryEvent(deliveryId, "succeeded", {
      attempt: attemptNumber,
      deliveryType: delivery.type,
    });
    
    const updated = await storage.updateDelivery(deliveryId, {
      state: "completed",
      attempts: newAttempt.attempt,
      result: result.result,
      attemptHistory,
      nextAttemptAt: null, // Clear any scheduled retry
    });
    return { success: true, delivery: updated };
  } else {
    const isMaxAttempts = attemptNumber >= delivery.maxAttempts;
    const newState = isMaxAttempts ? "failed" : "queued";
    
    // Log failure or dead event
    if (isMaxAttempts) {
      await logDeliveryEvent(deliveryId, "dead", {
        attempt: attemptNumber,
        error: result.error,
        reason: "max_attempts_exceeded",
      });
    } else {
      await logDeliveryEvent(deliveryId, "failed", {
        attempt: attemptNumber,
        error: result.error,
        willRetry: true,
      });
      
      // Calculate next retry time with exponential backoff
      const nextAttemptAt = calculateNextAttemptTime(attemptNumber);
      
      await logDeliveryEvent(deliveryId, "scheduled_retry", {
        attempt: attemptNumber + 1,
        scheduledFor: nextAttemptAt.toISOString(),
      });
      
      const updated = await storage.updateDelivery(deliveryId, {
        state: newState,
        attempts: newAttempt.attempt,
        lastError: result.error,
        attemptHistory,
        nextAttemptAt,
      });
      return { success: false, delivery: updated, error: result.error };
    }
    
    const updated = await storage.updateDelivery(deliveryId, {
      state: newState,
      attempts: newAttempt.attempt,
      lastError: result.error,
      attemptHistory,
      nextAttemptAt: null, // No more retries
    });
    return { success: false, delivery: updated, error: result.error };
  }
}

// Calculate next attempt time with exponential backoff
// Base delay: 30s, max delay: 6 hours
function calculateNextAttemptTime(currentAttempt: number): Date {
  const baseDelayMs = 30 * 1000; // 30 seconds
  const maxDelayMs = 6 * 60 * 60 * 1000; // 6 hours
  
  // Exponential backoff: 30s, 60s, 120s, 240s, etc.
  const delayMs = Math.min(
    baseDelayMs * Math.pow(2, currentAttempt - 1),
    maxDelayMs
  );
  
  return new Date(Date.now() + delayMs);
}

// Backward compatibility alias
export const processHandoff = processDelivery;
export const executeHandoff = executeDelivery;
