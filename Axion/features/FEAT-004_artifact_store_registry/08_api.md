# FEAT-004 — Artifact Store & Registry: API Surface

## 1. Module Exports

- `src/core/artifactStore/cas.ts`
- `src/core/artifactStore/refs.ts`
- `src/core/artifactStore/gc.ts`

## 2. Public Functions

### `computeContentHash(content, algorithm?)`

- **Module**: `cas.ts`
- **Parameters**: `content: Buffer | string`, `algorithm: string = "sha256"`
- **Returns**: `string` — hex-encoded hash digest
- **Throws**: Never (delegates to Node.js `crypto.createHash`)

### `createCAS(options)`

- **Module**: `cas.ts`
- **Parameters**: `options: CASOptions` — `{ storePath: string, algorithm?: "sha256" | "sha512" }`
- **Returns**: `ContentAddressableStore` — object with methods:
  - `put(content: Buffer | string): string` — stores content, returns hash
  - `get(hash: string): Buffer | null` — retrieves content by hash
  - `has(hash: string): boolean` — checks if hash exists in store
  - `delete(hash: string): boolean` — removes object, returns success
  - `list(): string[]` — returns all stored hashes
- **Side Effects**: Creates `{storePath}/objects/` directory structure

### `parseRef(refString)`

- **Module**: `refs.ts`
- **Parameters**: `refString: string` — format `scheme:value` (e.g., `cas:abc123`, `file:./path`)
- **Returns**: `StorageRef` — `{ scheme, hash?, path?, size?, media_type? }`
- **Throws**: `ERR-ART-002` if missing separator or unknown scheme

### `formatRef(ref)`

- **Module**: `refs.ts`
- **Parameters**: `ref: StorageRef`
- **Returns**: `string` — formatted ref string
- **Throws**: `ERR-ART-002` if required fields missing for scheme

### `resolveRef(ref, basePath)`

- **Module**: `refs.ts`
- **Parameters**: `ref: StorageRef`, `basePath: string`
- **Returns**: `string` — absolute filesystem path
- **Throws**: `ERR-ART-002` if required fields missing; `ERR-ART-003` for inline scheme

### `createRefStore(storePath)`

- **Module**: `refs.ts`
- **Parameters**: `storePath: string`
- **Returns**: `RefStore` — object with methods:
  - `set(name: string, ref: StorageRef): void`
  - `get(name: string): StorageRef | null`
  - `delete(name: string): boolean`
  - `list(): string[]`
  - `resolve(name: string): StorageRef | null`
  - `allRefs(): Map<string, StorageRef>`
- **Side Effects**: Creates `{storePath}/refs/` directory

### `findUnreferencedObjects(storePath, referencedHashes)`

- **Module**: `gc.ts`
- **Parameters**: `storePath: string`, `referencedHashes: Set<string>`
- **Returns**: `string[]` — hashes of unreferenced objects

### `garbageCollect(storePath, referencedHashes, options?)`

- **Module**: `gc.ts`
- **Parameters**: `storePath: string`, `referencedHashes: Set<string>`, `options?: GCOptions`
  - `GCOptions`: `{ dryRun?: boolean, maxAge?: number, keepPinned?: boolean }`
- **Returns**: `GCResult` — `{ scanned: number, removed: number, freed_bytes: number, errors: string[] }`
- **Side Effects**: Deletes unreferenced object files (unless `dryRun: true`)

## 3. Types

### `ContentAddressableStore` (interface)

```typescript
interface ContentAddressableStore {
  put(content: Buffer | string): string;
  get(hash: string): Buffer | null;
  has(hash: string): boolean;
  delete(hash: string): boolean;
  list(): string[];
}
```

### `CASOptions` (interface)

```typescript
interface CASOptions {
  storePath: string;
  algorithm?: "sha256" | "sha512";
}
```

### `StorageRef` (interface)

```typescript
interface StorageRef {
  scheme: "cas" | "file" | "inline";
  hash?: string;
  path?: string;
  size?: number;
  media_type?: string;
}
```

### `RefStore` (interface)

```typescript
interface RefStore {
  set(name: string, ref: StorageRef): void;
  get(name: string): StorageRef | null;
  delete(name: string): boolean;
  list(): string[];
  resolve(name: string): StorageRef | null;
  allRefs(): Map<string, StorageRef>;
}
```

### `GCResult` (interface)

```typescript
interface GCResult {
  scanned: number;
  removed: number;
  freed_bytes: number;
  errors: string[];
}
```

### `GCOptions` (interface)

```typescript
interface GCOptions {
  dryRun?: boolean;
  maxAge?: number;
  keepPinned?: boolean;
}
```

## 4. Error Codes

See 02_errors.md for the complete error code table.

## 5. Integration Points

- FEAT-001 (Control Plane) — run context
- FEAT-009 (Export Bundles) — artifact packaging
- FEAT-008 (Proof Ledger) — proof artifact storage

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
- SYS-04 (Artifact Taxonomy)
