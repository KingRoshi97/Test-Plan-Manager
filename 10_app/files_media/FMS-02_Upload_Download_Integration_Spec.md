# FMS-02 — Upload/Download Integration Spec (signed URLs, auth, limits)

## Header Block

| Field | Value |
|---|---|
| template_id | FMS-02 |
| title | Upload/Download Integration Spec (signed URLs, auth, limits) |
| type | files_media_upload_download_integration_spec |
| template_version | 1.0.0 |
| output_path | 10_app/files_media/FMS-02_Upload_Download_Integration_Spec.md |
| compliance_gate_id | TMP-05.PRIMARY.FMS |
| upstream_dependencies | ["FMS-01", "FPMP-01", "API-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "FMS-01", "FPMP-01", "FPMP-02", "API-01", "API-02", "CSec-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical integration spec for uploading and downloading files/media: signed URL
issuance, auth requirements, size/type limits, storage paths, and download access controls.
This template must be consistent with upload contract and storage strategy and must not invent
API endpoints or access modes beyond upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Provider Inventory: {{fms.storage_inventory}}
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- CSec-01 Token Storage Policy (client): {{csec.token_storage}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Upload flow model (direct-to-storage vs proxy)
- Signed URL supported (yes/no/UNKNOWN)
- Signed URL issuance endpoint (endpoint_id/path)
- Signed URL TTL rule
- Auth required to request upload/download
- Upload constraints (max size, allowed types)
- Path/key construction rule (bucket + prefix)
- Download access model (public/private/signed/UNKNOWN)
- Authorization checks for download (API-04 ref)
- Virus/malware scanning binding (FPMP-06/FPMP-03)
- Telemetry requirements (upload success/fail, bytes)

## Optional Fields

- Multipart upload rules | OPTIONAL
- Resume/retry guidance | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- If signed URLs are used, TTL must be bounded and least-privilege (method/path).
- Download access must enforce AuthZ for private objects.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Upload Flow
model: {{upload.model}} (direct_to_storage/proxy/UNKNOWN)
signed_url_supported: {{upload.signed_url_supported}}
issuance_endpoint: {{upload.issuance_endpoint}}
signed_url_ttl_seconds: {{upload.signed_url_ttl_seconds}}
2. Auth
auth_required: {{auth.required}}
authz_ref: {{auth.authz_ref}} (expected: {{xref:API-04}}) | OPTIONAL
3. Constraints
max_size_bytes: {{constraints.max_size_bytes}}
allowed_types: {{constraints.allowed_types}}
rate_limit_ref: {{constraints.rate_limit_ref}} | OPTIONAL
4. Storage Paths
bucket_id: {{paths.bucket_id}}
key_prefix_rule: {{paths.key_prefix_rule}}
naming_rule: {{paths.naming_rule}} | OPTIONAL
5. Download
access_model: {{download.access_model}} (public/private/signed/UNKNOWN)
download_endpoint: {{download.endpoint}} | OPTIONAL
download_auth_rule: {{download.auth_rule}} | OPTIONAL
6. Scanning
scan_required: {{scan.required}}
scan_ref: {{scan.ref}} (expected: {{xref:FPMP-06}}) | OPTIONAL
7. Telemetry
upload_success_metric: {{telemetry.upload_success_metric}}
upload_fail_metric: {{telemetry.upload_fail_metric}} | OPTIONAL
bytes_uploaded_metric: {{telemetry.bytes_uploaded_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
8. References
Storage inventory: {{xref:FMS-01}}
Upload contract: {{xref:FPMP-01}}
Storage strategy: {{xref:FPMP-02}} | OPTIONAL

File security: {{xref:FPMP-06}} | OPTIONAL
CDN rules: {{xref:FMS-04}} | OPTIONAL

## Cross-References

Upstream: {{xref:FMS-01}}, {{xref:FPMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-03}}, {{xref:FMS-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define upload model, constraints, and download access model.
intermediate: Required. Define signed URL TTL and auth/authz ref and path rules.
advanced: Required. Add multipart/resume rules and strict telemetry fields and scanning rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, authz ref, rate limit ref, naming rule,
download endpoint/auth rule, scan ref, optional telemetry metrics/fields, multipart/resume,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If upload.model is UNKNOWN → block Completeness Gate.
If constraints.max_size_bytes is UNKNOWN → block Completeness Gate.
If download.access_model is UNKNOWN → block Completeness Gate.
If telemetry.upload_success_metric is UNKNOWN → block Completeness Gate.
If scan.required is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
upload_and_download_models_defined == true
constraints_defined == true
path_rules_defined == true
scanning_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
