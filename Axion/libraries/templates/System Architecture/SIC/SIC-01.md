SIC-01
SIC-01 — External Interface Inventory
(systems, purpose, direction)
Header Block
   ●​ template_id: SIC-01​

   ●​ title: External Interface Inventory (systems, purpose, direction)​

   ●​ type: system_interfaces_integration_contracts​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/integrations/SIC-01_External_Interface_Inventory.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.INTEGRATION​

   ●​ upstream_dependencies: ["ARC-07", "RISK-03", "COMP-05"]​

   ●​ inputs_required: ["ARC-07", "RISK-03", "DGP-01", "SEC-02", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
List every external interface the system interacts with and define high-level constraints per
interface: directionality, purpose, data sensitivity, trust classification, and where detailed
contracts live. This makes integration scope deterministic and auditable.


Inputs Required
   ●​ ARC-07: {{xref:ARC-07}} | OPTIONAL​

   ●​ RISK-03: {{xref:RISK-03}} | OPTIONAL​

   ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​
  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Interface list (minimum 3 if integrations exist; otherwise mark N/A)​

  ●​ For each interface:​

         ○​ interface_id​

         ○​ external_system_name​

         ○​ purpose​

         ○​ direction (inbound/outbound/bidirectional)​

         ○​ interface_type (REST/GraphQL/webhook/file/SFTP/queue/etc.)​

         ○​ auth mechanism (API key/OAuth/mTLS/signature)​

         ○​ trust classification (trusted/partial/untrusted)​

         ○​ data categories exchanged​

         ○​ PII classification pointer (DGP)​

         ○​ expected volume/latency class (low/med/high)​

         ○​ rate limits/quotas (if known)​

         ○​ owner (internal)​

         ○​ detailed contract template pointer (SIC-02/SIC-03/etc.)​

         ○​ status (planned/active/deprecated)​



Optional Fields
     ●​ Vendor contact/SLAs | OPTIONAL​

     ●​ Notes | OPTIONAL​



Rules
     ●​ If applies == false (no integrations), include 00_NA block only.​

     ●​ Every interface must have a detailed contract pointer or be flagged as incomplete.​

     ●​ Trust classification drives validation and audit requirements (SEC/DGP rules).​

     ●​ Do not include internal APIs here; only cross-org/system boundaries.​



Output Format
1) Applicability

     ●​ applies: {{sic.applies}} (true/false)​

     ●​ 00_NA (if not applies): {{sic.na_block}} | OPTIONAL​



2) External Interface Inventory (canonical)
 i    syst    pur     dire    typ    aut     tru     dat     pii    vol    rat     own     contr     stat    not
n     em      pos     ctio     e      h       st     a_c     _cl    um     e_li     er     act_r      us     es
 t             e       n                             ate     as     e_l    mit              ef
e                                                    gor      s     ate     s
rf                                                   ies            nc
a                                                                    y
c
e
_
 i
d

i     {{int   {{int   {{inte {{int   {{int   {{int   {{int   {{in   {{in   {{int   {{int   {{inter   {{int   {{int
n     erfa    erfa    rface erfa     erfa    erfa    erfa    terf   terf   erfa    erfa    faces     erfa    erfa
tf    ces[    ces[    s[0]. ces      ces     ces[    ces     ace    ace    ces     ces[    [0].co    ces[    ces[
_     0].sy   0].p           [0].t   [0].    0].tr   [0].    s[0]   s[0]   [0].r   0].o              0].st   0].n
0     ste     urpo    direc ype        aut     ust}    dat     .pii} .vol     ate}    wne     ntract    atus    otes
1     m}}     se}}    tion}} }}        h}}     }       a}}     }     }}       }       r}}     _ref}}    }}      }}

i     {{int   {{int   {{inte   {{int   {{int   {{int   {{int   {{in    {{in   {{int   {{int   {{inter   {{int   {{int
n     erfa    erfa    rface    erfa    erfa    erfa    erfa    terf    terf   erfa    erfa    faces     erfa    erfa
tf    ces[    ces[    s[1].    ces     ces     ces[    ces     ace     ace    ces     ces[    [1].co    ces[    ces[
_     1].sy   1].p    direc    [1].t   [1].    1].tr   [1].    s[1]    s[1]   [1].r   1].o    ntract    1].st   1].n
0     ste     urpo    tion}}   ype     aut     ust}    dat     .pii}   .vol   ate}    wne     _ref}}    atus    otes
2     m}}     se}}             }}      h}}     }       a}}     }       }}     }       r}}               }}      }}


3) Coverage Checks (required if applies)

     ●​ Every interface has contract_ref: {{coverage.contract_refs_complete}}​

     ●​ Trust classification present: {{coverage.trust_complete}}​

     ●​ PII classification present: {{coverage.pii_complete}}​



Cross-References
     ●​ Upstream: {{xref:ARC-07}} | OPTIONAL, {{xref:RISK-03}} | OPTIONAL​

     ●​ Downstream: {{xref:SIC-02}}, {{xref:SIC-03}}, {{xref:SIC-04}}, {{xref:SIC-05}},
        {{xref:SIC-06}} | OPTIONAL​

     ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
        {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
        {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
     ●​ beginner: Required. Inventory table with purpose/direction/type/auth.​

     ●​ intermediate: Required. Add trust classification and PII pointers.​

     ●​ advanced: Required. Add volume/latency class and coverage checks.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: rate_limits, vendor_slas, notes​

 ●​ If applies == true and any interface lacks contract_ref → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.INTEGRATION​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_inventory_present == true​

        ○​ contract_refs_complete == true​

        ○​ trust_complete == true​

        ○​ pii_complete == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
