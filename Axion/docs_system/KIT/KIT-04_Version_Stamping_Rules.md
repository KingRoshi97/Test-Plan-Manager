KIT-04 — Version Stamping Rules (What Versions Get Recorded)
(Hardened Draft — Full)
1) Purpose
Define the mandatory version stamps recorded in every kit so:
kits are reproducible (determinism)
audits can identify exactly which rules/templates/contracts were used
compatibility can be managed across system upgrades
“silent change” drift is prevented

2) Inputs
Submission Record metadata (INT-04): form/schema versions
Standards Snapshot (STD-03): standards library version + pack versions
Template Index (TMP-01): template library version + template versions used
System version (overall Axion version)
Kit contract version (KIT-01/KIT-02/KIT-03 contracts)

3) Outputs
A required root file: 00_VERSIONS.md containing:
a machine-readable version block
a human-readable summary
The kit manifest (KIT-02) must also repeat key version fields for cross-checking.

4) Version Stamps (Locked Minimum Set)
Every kit must record these version categories:
V-01 System Version
system_version (Axion core rules/docs/contracts version)
V-02 Intake Versions
form_version_used
schema_version_used
int_ruleset_version_used (INT-03 version/hash)
V-03 Standards Versions
standards_library_version_used
standards_packs_used[] (pack_id@pack_version list)
standards_resolver_version_used (STD-02 version/hash)
V-04 Template Versions
template_library_version_used
templates_used[] (template_id@template_version list)
template_index_version_used (TMP-01 index schema version)
template_fill_rules_version_used (TMP-04 version/hash)
V-05 Canonical Model Versions
canonical_spec_model_version (CAN-01/02/03 version set or a single model version)
id_rules_version_used (CAN-02 version/hash)
unknowns_model_version_used (CAN-03 version/hash)
V-06 Planning & Verification Versions
planning_rules_version_used (PLAN-01/02/03 version/hash)
proof_rules_version_used (VER-01/02/03 version/hash)
V-07 Kit Contract Versions
kit_folder_structure_version (KIT-01 version)
manifest_format_version (KIT-02 manifest_version)
entrypoint_contract_version (KIT-03 version)

5) 00_VERSIONS.md File Contract (Locked)
00_VERSIONS.md must contain two parts:
A) Machine-readable block
A fenced JSON block named versions:
{
  "versions_format": "v1",
  "system_version": "Axion-v2.0.0",
  "intake": {
    "form_version_used": "form-vX",
    "schema_version_used": "schema-vY",
    "int_ruleset_version_used": "int03-vZ"
  },
  "standards": {
    "standards_library_version_used": "std-lib-vA",
    "standards_resolver_version_used": "std02-vB",
    "standards_packs_used": ["pack1@1.2.0", "pack2@3.0.1"]
  },
  "templates": {
    "template_library_version_used": "tmp-lib-vC",
    "template_index_version_used": "tmp-index-vD",
    "template_fill_rules_version_used": "tmp04-vE",
    "templates_used": ["PRD-01@1.0", "DES-04@1.1"]
  },
  "canonical_model": {
    "canonical_spec_model_version": "can-model-vF",
    "id_rules_version_used": "can02-vG",
    "unknowns_model_version_used": "can03-vH"
  },
  "planning_verification": {
    "planning_rules_version_used": "plan-vI",
    "proof_rules_version_used": "ver-vJ"
  },
  "kit_contracts": {
    "kit_folder_structure_version": "kit01-vK",
    "manifest_format_version": "v1",
    "entrypoint_contract_version": "kit03-vL"
  }
}

B) Human-readable summary
A short summary of the above:
“This kit was generated with…”
list of key versions

6) Consistency Rules (must always be true)
KIT4-CON-01 Manifest match
Key versions in 00_KIT_MANIFEST.md must match 00_VERSIONS.md (system/schema/standards/template versions).
KIT4-CON-02 Snapshot match
standards_library_version_used must match the one inside the standards snapshot.
templates_used must match what exists in the kit doc folders.
KIT4-CON-03 No missing stamps
If any required version stamp is missing → Packaging Gate fail.

7) Failure Modes
kits can’t be reproduced (“why did output change?”)
older kits become uninterpretable without knowing contracts
silent template/standards changes break determinism
manifest and versions disagree (two truths)

8) Definition of Done (KIT-04)
KIT-04 is complete when:
the minimum version set is locked
00_VERSIONS.md machine-readable format is defined
consistency rules are explicit and gateable
required cross-checks with manifest and snapshot are defined

