export type KnowledgeFrontmatter = {
  kid: string;
  title: string;
  content_type: string;
  primary_domain: string;
  secondary_domains?: string[];
  industry_refs: string[];
  stack_family_refs: string[];
  pillar_refs: string[];
  status: string;
  authority_tier: string;
  freshness_class?: string;
  bundle_refs: string[];
  tags: string[];
  depends_on?: string[];
  related_kids?: string[];
  supersedes?: string[];
  source_refs?: string[];
  legacy_path?: string;
};

export type KnowledgeItem = {
  kid: string;
  path: string;
  body: string;
  frontmatter: KnowledgeFrontmatter;
};

export type AliasIndex = Record<string, string>;

export type RelationshipEntry = {
  legacy_path?: string;
  current_path: string;
  depends_on?: string[];
  related_kids?: string[];
  supersedes?: string[];
  replaced_by?: string[];
  collection_keys?: string[];
};

export type RelationshipIndex = Record<string, RelationshipEntry>;

export type KnowledgeIndexEntry = {
  kid: string;
  title: string;
  path: string;
  content_type: string;
  primary_domain: string;
  secondary_domains?: string[];
  industry_refs: string[];
  stack_family_refs: string[];
  pillar_refs: string[];
  status: string;
  authority_tier: string;
  freshness_class?: string;
  bundle_refs?: string[];
  tags?: string[];
};

export type KnowledgeIndex = KnowledgeIndexEntry[];

export type CollectionDescriptor = {
  collection_key: string;
  collection_type: string;
  title: string;
  status: string;
  legacy_path?: string;
  scope: {
    industry_refs?: string[];
    stack_family_refs?: string[];
    pillar_refs?: string[];
    primary_domain?: string | null;
  };
  related_views?: string[];
  related_kids?: string[];
  notes?: string[];
  body?: string;
};

export type ResolveSource =
  | "kid"
  | "alias"
  | "legacy_path"
  | "legacy_filename"
  | "search_match";

export type ResolveResult = {
  kid: string;
  resolved_from: ResolveSource;
  matched_input: string;
  current_path: string;
  legacy_path?: string;
};

export type SearchFilters = {
  text?: string;
  content_type?: string;
  primary_domain?: string;
  industry_refs?: string[];
  stack_family_refs?: string[];
  pillar_refs?: string[];
  status?: string;
  authority_tier?: string;
  bundle_refs?: string[];
  tags?: string[];
  limit?: number;
};

export type SearchResult = {
  item: KnowledgeIndexEntry;
  score: number;
  matched_fields: string[];
};
