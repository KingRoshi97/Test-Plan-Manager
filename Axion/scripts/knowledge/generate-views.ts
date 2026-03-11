import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_ROOT = path.resolve("Axion/libraries/knowledge");
const REGISTRIES_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "registries");
const VIEWS_DIR = path.join(KNOWLEDGE_ROOT, "VIEWS");
const INDEX_PATH = path.join(REGISTRIES_DIR, "knowledge.index.json");

interface IndexEntry {
  kid: string;
  title: string;
  content_type: string;
  primary_domain: string;
  industry_refs: string[];
  stack_family_refs: string[];
  pillar_refs: string[];
  status: string;
  authority_tier: string;
}

interface ViewEntry {
  kid: string;
  title: string;
  content_type: string;
  status: string;
  authority_tier: string;
}

function toViewEntry(e: IndexEntry): ViewEntry {
  return {
    kid: e.kid,
    title: e.title,
    content_type: e.content_type,
    status: e.status,
    authority_tier: e.authority_tier,
  };
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

function writeView(dir: string, name: string, entries: ViewEntry[]): void {
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slugify(name)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
}

function main() {
  const raw = fs.readFileSync(INDEX_PATH, "utf8");
  const index: IndexEntry[] = JSON.parse(raw);

  console.log(`Loaded ${index.length} items from knowledge index`);

  const byPillar = new Map<string, ViewEntry[]>();
  const byDomain = new Map<string, ViewEntry[]>();
  const byContentType = new Map<string, ViewEntry[]>();
  const byIndustry = new Map<string, ViewEntry[]>();
  const byStackFamily = new Map<string, ViewEntry[]>();
  const byStatus = new Map<string, ViewEntry[]>();
  const byAuthority = new Map<string, ViewEntry[]>();

  for (const entry of index) {
    const ve = toViewEntry(entry);

    for (const p of entry.pillar_refs) {
      if (!byPillar.has(p)) byPillar.set(p, []);
      byPillar.get(p)!.push(ve);
    }

    if (!byDomain.has(entry.primary_domain)) byDomain.set(entry.primary_domain, []);
    byDomain.get(entry.primary_domain)!.push(ve);

    if (!byContentType.has(entry.content_type)) byContentType.set(entry.content_type, []);
    byContentType.get(entry.content_type)!.push(ve);

    for (const i of entry.industry_refs) {
      if (!byIndustry.has(i)) byIndustry.set(i, []);
      byIndustry.get(i)!.push(ve);
    }

    for (const s of entry.stack_family_refs) {
      if (!byStackFamily.has(s)) byStackFamily.set(s, []);
      byStackFamily.get(s)!.push(ve);
    }

    if (!byStatus.has(entry.status)) byStatus.set(entry.status, []);
    byStatus.get(entry.status)!.push(ve);

    if (!byAuthority.has(entry.authority_tier)) byAuthority.set(entry.authority_tier, []);
    byAuthority.get(entry.authority_tier)!.push(ve);
  }

  let totalFiles = 0;

  for (const [key, entries] of byPillar) {
    writeView(path.join(VIEWS_DIR, "by_pillar"), key, entries);
    totalFiles++;
  }
  for (const [key, entries] of byDomain) {
    writeView(path.join(VIEWS_DIR, "by_domain"), key, entries);
    totalFiles++;
  }
  for (const [key, entries] of byContentType) {
    writeView(path.join(VIEWS_DIR, "by_content_type"), key, entries);
    totalFiles++;
  }
  for (const [key, entries] of byIndustry) {
    writeView(path.join(VIEWS_DIR, "by_industry"), key, entries);
    totalFiles++;
  }
  for (const [key, entries] of byStackFamily) {
    writeView(path.join(VIEWS_DIR, "by_stack_family"), key, entries);
    totalFiles++;
  }
  for (const [key, entries] of byStatus) {
    writeView(path.join(VIEWS_DIR, "by_status"), key, entries);
    totalFiles++;
  }
  for (const [key, entries] of byAuthority) {
    writeView(path.join(VIEWS_DIR, "by_authority"), key, entries);
    totalFiles++;
  }

  console.log(`Generated ${totalFiles} view files`);
  console.log(`  by_pillar: ${byPillar.size}`);
  console.log(`  by_domain: ${byDomain.size}`);
  console.log(`  by_content_type: ${byContentType.size}`);
  console.log(`  by_industry: ${byIndustry.size}`);
  console.log(`  by_stack_family: ${byStackFamily.size}`);
  console.log(`  by_status: ${byStatus.size}`);
  console.log(`  by_authority: ${byAuthority.size}`);
}

main();
