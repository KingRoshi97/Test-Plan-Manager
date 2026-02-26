INT-04 — Submission Record Format (Traceability)
(Hardened Draft — Full)
1) Purpose
Define the immutable Intake Submission Record so the system can preserve exactly what the user provided, with enough metadata to:
reproduce validation behavior (form/schema versions)
trace every downstream artifact back to the original input
audit changes across re-submissions without ambiguity
This record is the raw truth of intake. It is never “normalized” or rewritten.

2) Inputs
Raw submission payload (from INT-01 form)
Upload references (zip/logo/etc.)
Runtime metadata captured at submit time:
timestamp
submitter identity (if available)
source channel

3) Outputs
A single immutable record:
submission_id (stable)
raw payload (as provided)
version stamps (form/schema)
upload pointers
routing snapshot (at submit time)
This record becomes the authoritative input for INT-05 validation.

4) Record Contract (Canonical Structure)
4.1 Required Metadata (always present)
submission_id (string, unique)
created_at (timestamp)
created_by (string; user id/email/anonymous id)
source (enum/string; e.g., web/app/api)
form_version (string)
schema_version (string)
4.2 Routing Snapshot (required)
routing_snapshot (object)
skill_level
category
type_preset
build_target
audience_context
autofill
(This snapshot is required even if routing also exists inside raw payload. This prevents ambiguity if payload changes later.)
4.3 Raw Submission Payload (required)
raw_submission (object)
The full submission object exactly as provided by the user.
No normalization, no enum coercion, no trimming, no reformatting.
4.4 Upload References (optional but canonicalized)
uploads[] (array)
upload_id or storage_ref
file_name
file_type
file_size
field_path (where it came from, e.g. inputs.zip_upload, design.logo_file)
uploaded_at
4.5 Integrity Fields (recommended)
payload_hash (hash of raw_submission + uploads list)
record_version (version of the submission record format)
4.6 Status (optional, but if present must be controlled)
status (enum/string): received | validated | rejected
status_updated_at
Rule: status can change; raw_submission cannot.

5) Invariants (must always be true)
INT4-INV-01 Immutability of raw payload
raw_submission is immutable after record creation.
Any correction requires a new submission record with a new submission_id.
INT4-INV-02 Version pinning
form_version and schema_version must reflect what was in effect at submit time.
Validator must use schema_version from the record.
INT4-INV-03 Upload traceability
Every upload entry must include field_path.
Upload references in raw submission must resolve to a recorded upload entry (or be invalid).
INT4-INV-04 Hash integrity (if used)
payload_hash must match the stored payload and uploads references.
Any mismatch is a corruption/alteration signal.

6) Failure Modes
missing version stamps → cannot reproduce validation behavior
raw payload mutated → breaks audit chain
uploads not linked to field_path → cannot trace source
hash mismatch → indicates record tampering or storage error

7) Definition of Done (INT-04)
INT-04 is complete when:
all required metadata fields are defined
immutability is explicit and non-negotiable
version stamps are required and enforced
upload reference structure is explicit
integrity handling (hash policy) is specified clearly

