import { createHash, randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { AuditLogAction } from "@shared/schema";

export interface ApiKeyPayload {
  keyId: string;
  scopes: string[];
}

export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = `axm_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.substring(0, 8);
  return { rawKey, keyHash, keyPrefix };
}

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export async function validateApiKey(req: Request): Promise<ApiKeyPayload | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const rawKey = authHeader.substring(7);
  const keyPrefix = rawKey.substring(0, 8);

  const apiKey = await storage.getApiKeyByPrefix(keyPrefix);
  if (!apiKey) {
    return null;
  }

  const keyHash = hashApiKey(rawKey);
  if (keyHash !== apiKey.keyHash) {
    return null;
  }

  if (apiKey.revokedAt) {
    return null;
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    return null;
  }

  await storage.updateApiKey(apiKey.id, { lastUsedAt: new Date() });

  return {
    keyId: apiKey.id,
    scopes: apiKey.scopes || [],
  };
}

export function requireApiKey(requiredScopes?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const payload = await validateApiKey(req);
    
    if (!payload) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or missing API key",
          correlationId: (req as any).correlationId,
        },
        correlationId: (req as any).correlationId,
      });
    }

    if (requiredScopes && requiredScopes.length > 0) {
      const hasScope = requiredScopes.some(s => 
        payload.scopes.includes(s) || payload.scopes.includes("*")
      );
      
      if (!hasScope) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: `Insufficient permissions. Required scopes: ${requiredScopes.join(", ")}`,
            correlationId: (req as any).correlationId,
          },
          correlationId: (req as any).correlationId,
        });
      }
    }

    (req as any).apiKey = payload;
    next();
  };
}

export async function logAudit(
  action: AuditLogAction,
  resourceType: string,
  resourceId: string | null,
  req: Request,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await storage.createAuditLog({
      action,
      resourceType,
      resourceId: resourceId || undefined,
      apiKeyId: (req as any).apiKey?.keyId,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.headers["user-agent"] || undefined,
      requestMethod: req.method,
      requestPath: req.path,
      statusCode: undefined,
      correlationId: (req as any).correlationId,
      metadata,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export function getClientIp(req: Request): string {
  return req.ip || 
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
}

export function optionalApiKey() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const payload = await validateApiKey(req);
    if (payload) {
      (req as any).apiKey = payload;
    }
    next();
  };
}
