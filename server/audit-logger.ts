import { storage } from "./storage";
import type { AuditLogAction, InsertAuditLog } from "@shared/schema";
import type { Request } from "express";

export interface AuditContext {
  request?: Request;
  apiKeyId?: string;
  correlationId?: string;
}

function extractRequestInfo(req?: Request): {
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
} {
  if (!req) return {};
  
  return {
    ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString()?.split(",")[0] || req.socket?.remoteAddress,
    userAgent: req.headers["user-agent"]?.substring(0, 500),
    requestMethod: req.method,
    requestPath: req.path,
  };
}

export async function logAuditEvent(
  action: AuditLogAction,
  resourceType: string,
  resourceId: string | null,
  context: AuditContext = {},
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const requestInfo = extractRequestInfo(context.request);
    
    const auditLog: InsertAuditLog = {
      action,
      resourceType,
      resourceId: resourceId || undefined,
      apiKeyId: context.apiKeyId,
      correlationId: context.correlationId || generateCorrelationId(),
      ...requestInfo,
      metadata,
    };
    
    await storage.createAuditLog(auditLog);
  } catch (error) {
    console.error("[Audit] Failed to log event:", error);
  }
}

function generateCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function logAssemblyCreate(
  assemblyId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("assembly.create", "assembly", assemblyId, context, metadata);
}

export async function logAssemblyExecute(
  assemblyId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("assembly.execute", "assembly", assemblyId, context, metadata);
}

export async function logAssemblyDelete(
  assemblyId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("assembly.delete", "assembly", assemblyId, context, metadata);
}

export async function logDeliveryCreate(
  deliveryId: string,
  assemblyId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("delivery.create", "delivery", deliveryId, context, {
    ...metadata,
    assemblyId,
  });
}

export async function logDeliveryRetry(
  deliveryId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("delivery.retry", "delivery", deliveryId, context, metadata);
}

export async function logPackageUpload(
  packageId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("package.upload", "project_package", packageId, context, metadata);
}

export async function logUploadCreate(
  uploadId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("upload.create", "upload", uploadId, context, metadata);
}

export async function logSafetyWarning(
  resourceType: string,
  resourceId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("safety.warning", resourceType, resourceId, context, metadata);
}

export async function logSafetyBlock(
  resourceType: string,
  resourceId: string,
  context: AuditContext,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await logAuditEvent("safety.block", resourceType, resourceId, context, metadata);
}
