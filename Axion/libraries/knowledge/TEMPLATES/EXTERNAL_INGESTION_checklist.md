# External Ingestion Checklist
Source:
- source_id: <SRC-...>
- license: <...>
- allowed_reuse_level: <...>
- attribution_required: <true|false>

## Before writing
- [ ] Source exists in SOURCES_INDEX
- [ ] Reuse constraints understood (max excerpt words/lines)
- [ ] Decide derivation_mode (summary_only recommended)

## Writing the KID
- [ ] Use your own words (summary-first)
- [ ] No large verbatim blocks
- [ ] If excerpts included, ensure allowed_excerpt is set and policy is allowlisted
- [ ] Add attribution in Links if required

## Indexing
- [ ] Add/verify KNOWLEDGE_INDEX entry
- [ ] Ensure tags/domains are canonical (TAXONOMY)

## Export safety
- [ ] Confirm executor_access + use_policy are correct
