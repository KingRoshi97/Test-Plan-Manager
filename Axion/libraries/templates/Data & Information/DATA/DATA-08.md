DATA-08
DATA-08 — Data Access Patterns
(transactions, isolation, query boundaries)
Header Block
   ●​ template_id: DATA-08​

   ●​ title: Data Access Patterns (transactions, isolation, query boundaries)​

   ●​ type: data_model_schema​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data/DATA-08_Data_Access_Patterns.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DATA​

   ●​ upstream_dependencies: ["DATA-03", "BPLAT-04", "CACHE-03"]​

   ●​ inputs_required: ["DATA-03", "BPLAT-04", "CACHE-03", "WFO-03",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the allowed data access patterns: transaction boundaries, isolation levels, query shape
rules, read/write separation, and how services should access data consistently and safely
(especially under concurrency and caching).


Inputs Required
   ●​ DATA-03: {{xref:DATA-03}} | OPTIONAL​

   ●​ BPLAT-04: {{xref:BPLAT-04}} | OPTIONAL​

   ●​ CACHE-03: {{xref:CACHE-03}} | OPTIONAL​
  ●​ WFO-03: {{xref:WFO-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Transaction policy:​

         ○​ when to open transactions​

         ○​ max duration rule​

         ○​ nesting policy​

  ●​ Isolation policy:​

         ○​ default isolation level​

         ○​ when to elevate isolation​

         ○​ phantom/read anomalies stance​

  ●​ Query boundary rules:​

         ○​ service owns its DB access (no cross-service DB access)​

         ○​ allowed join depth​

         ○​ N+1 avoidance policy​

  ●​ Write patterns:​

         ○​ insert/update/delete patterns​

         ○​ soft delete rules pointer (DLR)​

         ○​ audit stamping policy​

  ●​ Read patterns:​

         ○​ use of read models (DATA-07)​
           ○​ caching interactions (CACHE)​

   ●​ Error handling and retries alignment (ERR-05)​

   ●​ Verification checklist​



Optional Fields
   ●​ ORM-specific conventions | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Transaction boundaries must align with idempotency/concurrency rules (WFO-03).​

   ●​ No cross-service DB reads unless explicitly approved and documented.​

   ●​ Retry within transactions must be careful; define safe retry policy.​

   ●​ Isolation elevation must be justified and limited.​



Output Format
1) Transaction Policy (required)

   ●​ When to use transactions: {{tx.when}}​

   ●​ Max duration: {{tx.max_duration}}​

   ●​ Nesting policy: {{tx.nesting}} | OPTIONAL​



2) Isolation Policy (required)

   ●​ Default level: {{isolation.default}}​

   ●​ Elevated level cases: {{isolation.elevate_cases}}​
   ●​ Anomaly stance: {{isolation.anomalies}} | OPTIONAL​



3) Query Boundary Rules (required)

   ●​ Ownership rule: {{query.ownership}}​

   ●​ Join depth rule: {{query.join_depth}}​

   ●​ N+1 avoidance: {{query.n_plus_one}}​



4) Write Patterns (required)

   ●​ Write method patterns: {{writes.patterns}}​

   ●​ Soft delete pointer: {{xref:DLR-03}} | OPTIONAL​

   ●​ Audit stamping: {{writes.audit_stamping}} | OPTIONAL​



5) Read Patterns (required)

   ●​ Read model usage: {{reads.read_models}}​

   ●​ Cache interaction pointer: {{xref:CACHE-03}} | OPTIONAL​

   ●​ Read replica usage (if any): {{reads.replicas}} | OPTIONAL​



6) Error/Retry Alignment (required)

   ●​ Retry policy pointer: {{xref:ERR-05}} | OPTIONAL​

   ●​ Safe retry rule in DB operations: {{retries.safe_rule}}​



7) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​
  ●​ {{verify[2]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:WFO-03}} | OPTIONAL, {{xref:CACHE-03}} | OPTIONAL​

  ●​ Downstream: {{xref:API-02}} | OPTIONAL, {{xref:BPLAT-01}} | OPTIONAL, {{xref:QA-03}}
     | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Transaction + query boundary basics.​

  ●​ intermediate: Required. Add isolation and read/write patterns.​

  ●​ advanced: Required. Add retry alignment and verification checklist.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: orm_conventions, notes, read_replica_usage​

  ●​ If default isolation or ownership rule is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DATA​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ transaction_policy_present == true​
○​ isolation_policy_present == true​

○​ query_boundary_rules_present == true​

○​ retry_alignment_present == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
Data Lifecycle & Retention (DLR)
Data Lifecycle & Retention (DLR)​
DLR-01 Data Lifecycle States (active/archived/deleted)​
DLR-02 Retention Policy Matrix (by data class/entity)​
DLR-03 Deletion & Erasure Procedures (soft/hard delete)​
DLR-04 Legal Holds & Exceptions Policy​
DLR-05 Archival & Cold Storage Strategy​
DLR-06 Data Minimization Rules (collect/store only what’s needed)
