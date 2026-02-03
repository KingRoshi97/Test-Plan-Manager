import * as fs from "fs";
import * as path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { ObjectStorageService } from "./replit_integrations/object_storage";

const objectStorageService = new ObjectStorageService();

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const MAX_TOTAL_SIZE = 4 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".md"];

export interface DocIngestionResult {
  compiledMarkdownPath: string;
  perFileTextPaths: string[];
  stats: {
    files: number;
    chars: number;
    truncated: boolean;
    errors: string[];
  };
  compiledContent: string;
}

interface ExtractedDoc {
  id: string;
  filename: string;
  text: string;
  truncated: boolean;
  error?: string;
}

function normalizeText(text: string): string {
  return text
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function truncateWithNote(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }
  const truncationNote = "\n\n---\n[TRUNCATED: Document exceeded size limit. Only first portion included.]\n";
  return {
    text: text.slice(0, maxChars - truncationNote.length) + truncationNote,
    truncated: true,
  };
}

async function downloadFileFromObjectStorage(objectPath: string): Promise<Buffer | null> {
  try {
    const file = await objectStorageService.getObjectEntityFile(objectPath);
    const [buffer] = await file.download();
    return buffer;
  } catch (error) {
    console.error(`[DocIngestion] Failed to download ${objectPath}:`, error);
    return null;
  }
}

async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case ".pdf": {
      try {
        const pdfParser = new PDFParse({ data: buffer });
        const textResult = await pdfParser.getText();
        await pdfParser.destroy();
        return textResult.text || "";
      } catch (error) {
        console.error(`[DocIngestion] PDF parse error for ${filename}:`, error);
        throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    case ".docx":
    case ".doc": {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || "";
      } catch (error) {
        console.error(`[DocIngestion] DOCX parse error for ${filename}:`, error);
        throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    case ".txt":
    case ".md": {
      return buffer.toString("utf-8");
    }

    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

function isAllowedExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export interface DocUploadMetadata {
  id: string;
  name: string;
  objectPath: string;
  size: number;
  mimeType: string;
}

export async function ingestUploadedDocs(
  docUploads: DocUploadMetadata[],
  workspacePath: string
): Promise<DocIngestionResult> {
  const inputsDir = path.join(workspacePath, "docs/assembler_v1/inputs");
  const uploadsDir = path.join(inputsDir, "uploads");

  fs.mkdirSync(inputsDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });

  const extractedDocs: ExtractedDoc[] = [];
  const perFileTextPaths: string[] = [];
  const errors: string[] = [];
  let totalChars = 0;
  let truncatedOverall = false;

  console.log(`[DocIngestion] Processing ${docUploads.length} uploaded documents...`);

  for (const doc of docUploads) {
    console.log(`[DocIngestion] Processing doc: ${doc.id} (name: ${doc.name}, path: ${doc.objectPath})`);

    if (!isAllowedExtension(doc.name)) {
      errors.push(`${doc.id}: Unsupported file type for "${doc.name}"`);
      continue;
    }

    try {
      const buffer = await downloadFileFromObjectStorage(doc.objectPath);
      if (!buffer) {
        errors.push(`${doc.id}: Failed to download file`);
        continue;
      }

      if (buffer.length > MAX_FILE_SIZE) {
        errors.push(`${doc.id}: File exceeds 1MB limit, skipping`);
        continue;
      }

      let text = await extractTextFromBuffer(buffer, doc.name);
      text = normalizeText(text);

      const remaining = MAX_TOTAL_SIZE - totalChars;
      let thisFileTruncated = false;
      if (text.length > remaining || text.length > MAX_FILE_SIZE) {
        const { text: truncatedText, truncated } = truncateWithNote(
          text,
          Math.min(remaining, MAX_FILE_SIZE)
        );
        text = truncatedText;
        thisFileTruncated = truncated;
        truncatedOverall = truncatedOverall || truncated;
      }

      totalChars += text.length;

      extractedDocs.push({
        id: doc.id,
        filename: doc.name,
        text,
        truncated: thisFileTruncated,
      });

      const perFilePath = path.join(uploadsDir, `${doc.id}.txt`);
      fs.writeFileSync(perFilePath, text);
      perFileTextPaths.push(`docs/assembler_v1/inputs/uploads/${doc.id}.txt`);

      console.log(`[DocIngestion] Extracted ${text.length} chars from ${doc.name} (${doc.id})`);

      if (totalChars >= MAX_TOTAL_SIZE) {
        console.log(`[DocIngestion] Reached total size limit, stopping extraction`);
        truncatedOverall = true;
        break;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${doc.id}: ${errorMsg}`);
      console.error(`[DocIngestion] Error processing ${doc.id}:`, error);
    }
  }

  let compiledContent = `# Uploaded Documents Snapshot

This file contains extracted text from user-uploaded documents.

---

## Summary
- **Files processed:** ${extractedDocs.length}
- **Total characters:** ${totalChars.toLocaleString()}
- **Truncation applied:** ${truncatedOverall ? "Yes" : "No"}
${errors.length > 0 ? `- **Processing errors:** ${errors.length}` : ""}

---

`;

  for (const doc of extractedDocs) {
    compiledContent += `## ${doc.filename}
*Source: ${doc.id}*${doc.truncated ? " *(truncated)*" : ""}

${doc.text}

---

`;
  }

  if (errors.length > 0) {
    compiledContent += `## Processing Errors

${errors.map((e) => `- ${e}`).join("\n")}

`;
  }

  const compiledPath = path.join(inputsDir, "USER_UPLOADS_COMPILED.md");
  fs.writeFileSync(compiledPath, compiledContent);

  console.log(
    `[DocIngestion] Completed: ${extractedDocs.length} files, ${totalChars} chars, ${errors.length} errors`
  );

  return {
    compiledMarkdownPath: "docs/assembler_v1/inputs/USER_UPLOADS_COMPILED.md",
    perFileTextPaths,
    stats: {
      files: extractedDocs.length,
      chars: totalChars,
      truncated: truncatedOverall,
      errors,
    },
    compiledContent,
  };
}

export function generateUploadedDocsSection(result: DocIngestionResult): string {
  if (result.stats.files === 0) {
    return "";
  }

  return `
## Uploaded Documents Snapshot

The user provided ${result.stats.files} supplemental document${result.stats.files > 1 ? "s" : ""} (${result.stats.chars.toLocaleString()} characters extracted).

**Extracted Files:**
${result.perFileTextPaths.map((p) => `- \`${p}\``).join("\n")}

**Compiled Reference:** \`${result.compiledMarkdownPath}\`

${result.stats.truncated ? "_Note: Some documents were truncated due to size limits._\n" : ""}
${result.stats.errors.length > 0 ? `_${result.stats.errors.length} document(s) could not be fully processed._\n` : ""}
`;
}
