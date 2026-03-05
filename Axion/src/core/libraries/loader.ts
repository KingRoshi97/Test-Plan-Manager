import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type PinRef = {
  id: string;
  version: string;
  hash?: string;
  path?: string;
  notes?: string;
};

export type PinsFile = {
  version: string;
  description?: string;
  pins: Record<string, PinRef>;
};

export type LibraryIndexFile = {
  version: string;
  description?: string;
  libraries: Array<{ id: string; path: string; version: string }>;
  notes?: string[];
};

export type SchemaRegistryFile = {
  version: string;
  description?: string;
  schemas: Array<{ schema_id: string; path: string; uri: string; version: string }>;
};

export type LoadedSchema = {
  schema_id: string;
  uri: string;
  version: string;
  absPath: string;
  content: any;
  sha256: string;
};

export type LoadedLibrary = {
  id: string;
  version: string;
  absPath: string;
  content: any;
  sha256: string;
};

export type LoadedPins = {
  pins: PinsFile;
  libraryIndex: LibraryIndexFile;
  schemaRegistry: SchemaRegistryFile;
  libraries: Record<string, LoadedLibrary>;
  schemas: Record<string, LoadedSchema>;
};

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function readJson(absPath: string): { content: any; sha256: string } {
  const raw = fs.readFileSync(absPath);
  return { content: JSON.parse(raw.toString("utf8")), sha256: sha256(raw) };
}

function requireFileExists(absPath: string, label: string) {
  if (!fs.existsSync(absPath)) {
    throw new Error(`[AxionLibraries] Missing ${label}: ${absPath}`);
  }
}

function resolveAbs(rootDir: string, p: string): string {
  const normalized = p.replace(/\\/g, "/");
  const stripLeading = normalized.startsWith("/") ? normalized.slice(1) : normalized;
  return path.resolve(rootDir, stripLeading);
}

export function loadPinnedLibraries(opts: {
  repoRoot: string;
  pinsPath: string;
}): LoadedPins {
  const pinsAbs = resolveAbs(opts.repoRoot, opts.pinsPath);
  requireFileExists(pinsAbs, "pins file");

  const pinsJson = readJson(pinsAbs).content as PinsFile;
  if (!pinsJson?.pins) throw new Error("[AxionLibraries] Invalid pins file (missing pins).");

  const libIndexPin = pinsJson.pins["library_index"];
  const schemaRegPin = pinsJson.pins["schema_registry"];
  if (!libIndexPin?.path) throw new Error("[AxionLibraries] Missing pin: library_index.path");
  if (!schemaRegPin?.path) throw new Error("[AxionLibraries] Missing pin: schema_registry.path");

  const libIndexAbs = resolveAbs(opts.repoRoot, libIndexPin.path);
  const schemaRegAbs = resolveAbs(opts.repoRoot, schemaRegPin.path);

  requireFileExists(libIndexAbs, "library_index");
  requireFileExists(schemaRegAbs, "schema_registry");

  const libraryIndex = readJson(libIndexAbs).content as LibraryIndexFile;
  const schemaRegistry = readJson(schemaRegAbs).content as SchemaRegistryFile;

  const libraryIndexById = new Map(libraryIndex.libraries.map((l) => [l.id, l]));
  const schemaRegistryById = new Map(schemaRegistry.schemas.map((s) => [s.schema_id, s]));

  const libraries: Record<string, LoadedLibrary> = {};
  const schemas: Record<string, LoadedSchema> = {};

  for (const [pinKey, pin] of Object.entries(pinsJson.pins)) {
    if (pinKey === "library_index" || pinKey === "schema_registry") continue;

    if (libraryIndexById.has(pin.id)) {
      const entry = libraryIndexById.get(pin.id)!;

      if (pin.version !== entry.version) {
        throw new Error(
          `[AxionLibraries] Version mismatch for library '${pin.id}': pins=${pin.version} registry=${entry.version}`
        );
      }

      const abs = resolveAbs(opts.repoRoot, entry.path);
      requireFileExists(abs, `library '${pin.id}'`);

      const { content, sha256: hash } = readJson(abs);

      if (pin.hash && pin.hash !== hash) {
        throw new Error(`[AxionLibraries] Hash mismatch for library '${pin.id}'`);
      }

      libraries[pin.id] = { id: pin.id, version: pin.version, absPath: abs, content, sha256: hash };
      continue;
    }

    if (schemaRegistryById.has(pin.id)) {
      const s = schemaRegistryById.get(pin.id)!;

      if (pin.version !== s.version) {
        throw new Error(
          `[AxionLibraries] Version mismatch for schema '${pin.id}': pins=${pin.version} registry=${s.version}`
        );
      }

      const abs = resolveAbs(opts.repoRoot, s.path);
      requireFileExists(abs, `schema '${pin.id}'`);

      const { content, sha256: hash } = readJson(abs);

      if (pin.hash && pin.hash !== hash) {
        throw new Error(`[AxionLibraries] Hash mismatch for schema '${pin.id}'`);
      }

      schemas[pin.id] = { schema_id: s.schema_id, uri: s.uri, version: s.version, absPath: abs, content, sha256: hash };
      continue;
    }

    throw new Error(
      `[AxionLibraries] Pin '${pinKey}' references id='${pin.id}', but it is not in library_index or schema_registry.`
    );
  }

  return {
    pins: pinsJson,
    libraryIndex,
    schemaRegistry,
    libraries,
    schemas
  };
}
