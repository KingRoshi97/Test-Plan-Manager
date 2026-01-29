import * as fs from "fs";
import * as path from "path";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";

async function ensureDir(dir: string): Promise<void> {
  await fs.promises.mkdir(dir, { recursive: true });
}

export async function writeFile(objectKey: string, content: Buffer): Promise<void> {
  const fullPath = path.join(STORAGE_ROOT, objectKey);
  await ensureDir(path.dirname(fullPath));
  await fs.promises.writeFile(fullPath, content);
}

export async function readFile(objectKey: string): Promise<Buffer> {
  const fullPath = path.join(STORAGE_ROOT, objectKey);
  return fs.promises.readFile(fullPath);
}

export async function deleteFile(objectKey: string): Promise<void> {
  const fullPath = path.join(STORAGE_ROOT, objectKey);
  try {
    await fs.promises.unlink(fullPath);
  } catch {
  }
}

export async function fileExists(objectKey: string): Promise<boolean> {
  const fullPath = path.join(STORAGE_ROOT, objectKey);
  try {
    await fs.promises.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

export function getStoragePath(objectKey: string): string {
  return path.join(STORAGE_ROOT, objectKey);
}

export async function writeText(objectKey: string, content: string): Promise<void> {
  await writeFile(objectKey, Buffer.from(content, "utf-8"));
}

export async function readText(objectKey: string): Promise<string> {
  const buffer = await readFile(objectKey);
  return buffer.toString("utf-8");
}

export function getProjectPackagePath(packageId: string, filename: string): string {
  return `project_packages/${packageId}/${filename}`;
}

export function getKitUpgradePath(kitId: string, filename: string): string {
  return `kits/${kitId}/upgrade/${filename}`;
}
