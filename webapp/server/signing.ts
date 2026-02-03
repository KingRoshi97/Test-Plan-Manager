import crypto from "crypto";

const SERVER_SECRET = process.env.SESSION_SECRET || "assembler-default-secret-change-in-production";

export interface SignedUrlParams {
  assemblyId?: string;
  runId?: string;  // backward compatibility
  expiresInSeconds?: number;
}

export interface SignedUrl {
  url: string;
  expiresAt: string;
  exp: number;
  sig: string;
}

export function generateSignedUrl(baseUrl: string, params: SignedUrlParams): SignedUrl {
  const expiresInSeconds = params.expiresInSeconds || 3600;
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const expiresAt = new Date(exp * 1000).toISOString();
  
  const id = params.assemblyId || params.runId || "";
  const signed = `${id}.${exp}`;
  const sig = crypto.createHmac("sha256", SERVER_SECRET).update(signed).digest("hex");
  
  const url = `${baseUrl}?exp=${exp}&sig=${sig}`;
  
  return { url, expiresAt, exp, sig };
}

export function validateSignature(id: string, exp: string | number, sig: string): { valid: boolean; error?: string } {
  const expNum = typeof exp === "string" ? parseInt(exp, 10) : exp;
  
  if (isNaN(expNum)) {
    return { valid: false, error: "Invalid expiration timestamp" };
  }
  
  const now = Math.floor(Date.now() / 1000);
  if (now > expNum) {
    return { valid: false, error: "URL has expired" };
  }
  
  const signed = `${id}.${expNum}`;
  const expectedSig = crypto.createHmac("sha256", SERVER_SECRET).update(signed).digest("hex");
  
  if (sig.length !== expectedSig.length) {
    return { valid: false, error: "Invalid signature" };
  }
  
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { valid: false, error: "Invalid signature" };
  }
  
  return { valid: true };
}

export interface WebhookSignature {
  timestamp: string;
  nonce: string;
  signature: string;
}

export function generateWebhookSignature(payload: string, secret: string): WebhookSignature {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  
  const signed = `${timestamp}.${nonce}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  
  return {
    timestamp,
    nonce,
    signature: `sha256=${signature}`,
  };
}

export function verifyWebhookSignature(
  payload: string, 
  secret: string, 
  timestamp: string, 
  nonce: string, 
  signature: string
): { valid: boolean; error?: string } {
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  
  if (isNaN(ts) || now - ts > 300) {
    return { valid: false, error: "Timestamp too old (>5 minutes)" };
  }
  
  const signed = `${timestamp}.${nonce}.${payload}`;
  const expectedSig = `sha256=${crypto.createHmac("sha256", secret).update(signed).digest("hex")}`;
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return { valid: false, error: "Invalid signature" };
  }
  
  return { valid: true };
}

export function computeSha256(content: Buffer | string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}
