knowledge/
  README.md
  INDEX/
    knowledge.index.json          # master registry of all knowledge items (KID → metadata → path)
    taxonomy.json                 # canonical taxonomy (pillars/domains/subdomains/industries/stacks)
    tags.json                     # controlled vocab (allowed tags + synonyms/aliases)
    bundles.index.json            # reusable “knowledge bundles” (curated sets of KIDs)
    sources.index.json            # source provenance + licensing (internal/external)
    changelog.md                  # library-level change log
    deprecations.json             # deprecated KIDs → replacements + dates
    quality_tiers.json            # draft/reviewed/verified/golden rules
  POLICIES/
    use_policy.md                 # pattern-only vs reusable_with_allowlist vs restricted
    external_agent_policy.md      # what external agents may access
    citation_policy.md            # how knowledge citations must be recorded
    plagiarism_ip_rules.md        # your STD-PLAG-01 (or reference to it)
    secrets_pii_handling.md       # redaction/retention guidance
  BUNDLES/
    by_run_profile/
      API_SERVICE_BASIC.bundle.json
      WEB_APP_BASIC.bundle.json
      MOBILE_APP_BASIC.bundle.json
      FULLSTACK_SAAS.bundle.json
      REALTIME_CHAT.bundle.json
    by_risk_class/
      PROTOTYPE.bundle.json
      PRODUCTION.bundle.json
      COMPLIANCE.bundle.json
    by_executor/
      INTERNAL_AGENT.bundle.json
      EXTERNAL_AGENT.bundle.json
  PILLARS/
    IT_END_TO_END/
      _meta/
        pillar.md                 # what this pillar covers + selection notes
        domain_map.json           # domain → subdomain map for this pillar
      01_foundations/
        networking/
          _meta.md
          concepts/
            KID-NET-CONCEPT-0001.md
            KID-NET-CONCEPT-0002.md
          patterns/
            KID-NET-PATTERN-0001.md
          checklists/
            KID-NET-CHECK-0001.md
          pitfalls/
            KID-NET-PITFALL-0001.md
        security/
          _meta.md
          concepts/
          patterns/
          checklists/
          pitfalls/
        operating_systems/
          _meta.md
          concepts/
          procedures/
          checklists/
      02_software_delivery/
        architecture/
          _meta.md
          concepts/
          patterns/
          checklists/
        devops_ci_cd/
          _meta.md
          concepts/
          procedures/
          checklists/
        sre_observability/
          _meta.md
          concepts/
          procedures/
          checklists/
          references/
      03_data_systems/
        databases/
          _meta.md
          concepts/
          patterns/
          checklists/
          references/
        distributed_systems/
          _meta.md
          concepts/
          patterns/
          pitfalls/
      04_product_and_ops/
        qa_testing/
          _meta.md
          concepts/
          procedures/
          checklists/
        release_management/
          _meta.md
          procedures/
          checklists/
        governance_compliance/
          _meta.md
          concepts/
          checklists/

    INDUSTRY_PLAYBOOKS/
      _meta/
        pillar.md
        industry_index.json        # list of industries + required sections
      healthcare/
        _meta.md                   # typical systems, compliance, workflows
        workflows/
          claims_billing.md
          patient_portal.md
        data_models/
          patient.md
          provider.md
        integrations/
          hl7_fhir.md
        compliance/
          hipaa.md
        kpis_metrics/
          ops_kpis.md
      finance/
        _meta.md
        workflows/
        data_models/
        integrations/
        compliance/
        kpis_metrics/
      logistics_supply_chain/
        _meta.md
        workflows/
        data_models/
        integrations/
        compliance/
        kpis_metrics/
      retail_ecommerce/
        _meta.md
        workflows/
        data_models/
        integrations/
        compliance/
        kpis_metrics/
      government_public_sector/
        _meta.md
        workflows/
        data_models/
        integrations/
        compliance/
        kpis_metrics/

    LANGUAGES_AND_LIBRARIES/
      _meta/
        pillar.md
        stack_index.json           # stacks/languages/framework families
      javascript_typescript/
        _meta.md
        language_core/
          concepts/
          patterns/
          pitfalls/
          references/
        nodejs/
          _meta.md
          project_templates/
            KID-NODE-TPL-0001.md   # structure guidance (not copy-donor)
          patterns/
          security/
          testing/
          performance/
        react/
          _meta.md
          patterns/
          accessibility/
          testing/
          performance/
        nextjs/
          _meta.md
          patterns/
          routing/
          server_actions/
          deployment/
      python/
        _meta.md
        language_core/
        fastapi/
        django/
      go/
        _meta.md
        language_core/
        web/
        concurrency/
      rust/
        _meta.md
        language_core/
        web/
      solidity_evm/
        _meta.md
        language_core/
        security/
        testing/
        patterns/
        pitfalls/
        references/
      databases/
        postgres/
          _meta.md
          patterns/
          migrations/
          performance/
        redis/
          _meta.md
          patterns/
          pitfalls/
      cloud_platforms/
        aws/
          _meta.md
          references/
          security/
          patterns/
        gcp/
        azure/
  REUSE/
    allowlist.json                # reusable_with_allowlist items (paths/KIDs allowed for copy)
    reuse_log.json                # records reuse events (what/where/license/attribution)
    licenses/
      apache-2.0.txt
      mit.txt
      lgpl-3.0.txt
      gpl-3.0.txt
  TEMPLATES/
    knowledge_item.md             # template for writing a knowledge item (sections required)
    industry_playbook.md          # template for industry _meta.md
    stack_playbook.md             # template for stack _meta.md
  OUTPUTS/
    selections/
      knowledge_selection.schema.json
    exports/
      knowledge_bundle_export.schema.json