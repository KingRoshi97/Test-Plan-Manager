DGL-05
DGL-06 — Data Catalog / Dictionary
(datasets, meaning, sensitivity)
Header Block
   ●​ template_id: DGL-06​

   ●​ title: Data Catalog / Dictionary (datasets, meaning, sensitivity)​

   ●​ type: data_governance_lineage​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_governance/DGL-06_Data_Catalog_Dictionary.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DGL​

   ●​ upstream_dependencies: ["DATA-01", "DMG-01", "DGP-01"]​

   ●​ inputs_required: ["DATA-01", "DMG-01", "DGP-01", "DGL-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Create a human- and machine-friendly dictionary of datasets/entities: what they mean, what
they contain, how sensitive they are, who owns them, and what their retention and access rules
are. This is the “catalog layer” for data governance.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DMG-01: {{xref:DMG-01}} | OPTIONAL​

   ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​
  ●​ DGL-01: {{xref:DGL-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Catalog entries (minimum: all DATA-01 entities + key derived/read models + reporting
     datasets)​

  ●​ For each entry:​

         ○​ id (entity_id/dataset_id/read_model_id)​

         ○​ name​

         ○​ description (plain language)​

         ○​ owner (DGL-01 pointer)​

         ○​ sensitivity class (PII level)​

         ○​ key fields (top 10)​

         ○​ retention pointer (DLR-02)​

         ○​ access pointer (DGL-04)​

         ○​ lineage pointer (DGL-02) | OPTIONAL​

         ○​ typical use cases (API/search/reporting)​

         ○​ common pitfalls (gotchas)​

  ●​ Verification checklist​



Optional Fields
  ●​ Data quality score pointer (DQV) | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ Must align terms with DMG glossary.​

   ●​ Sensitivity must be explicit and consistent with DGP classification.​

   ●​ Catalog must include derived/read models and reporting datasets to prevent “shadow
      data.”​

   ●​ Catalog entries must remain stable and versioned.​



Output Format
Data Catalog Entries (canonical)
 id     nam     desc owne        sen     key_fi    retent    acce     linea     use_c     pitfal     note
         e      ripti  r         sitiv    elds     ion_r     ss_r     ge_re     ases        ls        s
                 on               ity                ef       ef         f

{{ca    {{cat   {{cat   {{cata   {{cat   {{catal   {{catal   {{cata   {{cata    {{catal   {{cata     {{cat
talo    alog[   alog[   log[0]   alog[   og[0].k   og[0].r   log[0]   log[0].   og[0].u   log[0]     alog[
g[0]    0].na   0].de   .own     0].se   ey_fiel   etenti    .acce    lineag    se_ca     .pitfall   0].no
.id}}   me}}    sc}}    er}}     ns}}    ds}}      on}}      ss}}     e}}       ses}}     s}}        tes}}

{{ca    {{cat   {{cat   {{cata   {{cat   {{catal   {{catal   {{cata   {{cata    {{catal   {{cata     {{cat
talo    alog[   alog[   log[1]   alog[   og[1].k   og[1].r   log[1]   log[1].   og[1].u   log[1]     alog[
g[1]    1].na   1].de   .own     1].se   ey_fiel   etenti    .acce    lineag    se_ca     .pitfall   1].no
.id}}   me}}    sc}}    er}}     ns}}    ds}}      on}}      ss}}     e}}       ses}}     s}}        tes}}


Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:DGL-01}} | OPTIONAL, {{xref:DGP-01}} |
     OPTIONAL​

  ●​ Downstream: {{xref:DQV-02}} | OPTIONAL, {{xref:RPT-01}} | OPTIONAL,
     {{xref:SRCH-01}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Entries with name/description/sensitivity/owner.​

  ●​ intermediate: Required. Add retention/access pointers and key fields.​

  ●​ advanced: Required. Add lineage pointers and pitfalls/use-cases rigor.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: dq_score_pointer, notes, lineage_ref (if no lineage
     tracking yet)​

  ●​ If any entity lacks sensitivity classification → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DGL​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ catalog_complete_for_entities == true​

         ○​ sensitivity_present == true​

         ○​ retention_and_access_refs_present == true​
○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
