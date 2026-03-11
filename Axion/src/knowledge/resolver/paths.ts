import path from "node:path";

export const KNOWLEDGE_ROOT = path.resolve("Axion/libraries/knowledge");

export const CONTENT_ITEMS_DIR = path.join(KNOWLEDGE_ROOT, "CONTENT", "ITEMS");
export const COLLECTIONS_DIR = path.join(KNOWLEDGE_ROOT, "CONTENT", "META", "collections");

export const REGISTRIES_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "registries");

export const KNOWLEDGE_INDEX_PATH = path.join(REGISTRIES_DIR, "knowledge.index.json");
export const ALIASES_INDEX_PATH = path.join(REGISTRIES_DIR, "aliases.index.json");
export const RELATIONSHIPS_INDEX_PATH = path.join(REGISTRIES_DIR, "relationships.index.json");
export const BUNDLES_INDEX_PATH = path.join(REGISTRIES_DIR, "bundles.index.json");

export const LEGACY_PILLARS_DIR = path.join(KNOWLEDGE_ROOT, "PILLARS");

export const DOCTRINE_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "doctrine");
export const TAXONOMY_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "taxonomy");
export const CONTRACTS_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "contracts");
export const POLICIES_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "policies");
export const TEMPLATES_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "templates");
