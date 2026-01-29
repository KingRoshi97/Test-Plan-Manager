import multer from "multer";
import path from "path";
import fs from "fs";
import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";
import type { UploadedFile } from "@shared/schema";

const UPLOAD_DIR = "uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, Word, or text files.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
});

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  
  try {
    if (mimeType === "application/pdf") {
      const parsePdf = (pdfParse as any).default || pdfParse;
      const data = await parsePdf(buffer);
      return data.text.trim();
    }
    
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }
    
    if (mimeType === "text/plain" || mimeType === "text/markdown") {
      return buffer.toString("utf-8").trim();
    }
    
    return "";
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    return `[Error extracting text: ${error instanceof Error ? error.message : "Unknown error"}]`;
  }
}

export async function processUploadedFiles(files: Express.Multer.File[]): Promise<UploadedFile[]> {
  const results: UploadedFile[] = [];
  
  for (const file of files) {
    const extractedText = await extractTextFromFile(file.path, file.mimetype);
    
    results.push({
      id: path.basename(file.filename, path.extname(file.filename)),
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      extractedText,
      uploadedAt: new Date().toISOString(),
    });
  }
  
  return results;
}

export function cleanupUploadedFile(fileId: string): void {
  const files = fs.readdirSync(UPLOAD_DIR);
  const matchingFile = files.find(f => f.startsWith(fileId));
  if (matchingFile) {
    fs.unlinkSync(path.join(UPLOAD_DIR, matchingFile));
  }
}

export function combineExtractedText(files: UploadedFile[]): string {
  if (files.length === 0) return "";
  
  return files
    .map(f => `--- ${f.filename} ---\n${f.extractedText}`)
    .join("\n\n");
}
