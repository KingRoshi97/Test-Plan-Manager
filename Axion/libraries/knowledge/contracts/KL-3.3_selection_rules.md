---
  contract_id: KL-3.3
  schema_version: 1.0.0
  applies_to: "Knowledge selection engine"
  enforcement_level: "hard"
  ---

  # KL-3.3 — Selection Rules (Minimum)

  Selection MUST run in three phases, in this exact order:
  1) Filter (hard exclusions)
  2) Rank (relevance scoring)
  3) Cap (limit and finalize ordering)

  ---

  ## 1) FILTER (hard exclusions)

  ### F1 — executor access
  - If executor_type == external:
    - exclude any KID where executor_access == internal_only

  ### F2 — maturity threshold
  - Exclude any KID where maturity < min_maturity
    - ordering: draft < reviewed < verified < golden

  ### F3 — deprecations
  - If mode == normal:
    - exclude any deprecated KID (DEPRECATIONS.kind=kid where id == kid)
  - If mode == reproducibility:
    - allow deprecated KID only if allow_for_repro == true

  ### F4 — applicability (minimum)
  A KID is applicable if it matches at least ONE of:
  - domain match: any selection input domain appears in KID domains
  - tag match: any selection input tag appears in KID tags
  - bundle inclusion: KID is explicitly included via bundles_used
  If none match → exclude.

  ---

  ## 2) RANK (relevance scoring)

  Compute a numeric score per remaining KID as:

  score =
    (domain_hit * 5) +
    (subdomain_hit * 3) +
    (tag_hit_count * 2) +
    (profile_hit * 1) +
    (stack_family_hit * 1) +
    (maturity_bonus)

  Where:
  - domain_hit is 1 if any domain matches else 0
  - subdomain_hit is 1 if any subdomain matches else 0
  - tag_hit_count is the number of matched tags (cap at 5)
  - profile_hit is 1 if the KID tags/domains indicate run_profile relevance (optional mapping)
  - stack_family_hit is 1 if KID tags match target_stack families (optional mapping)
  - maturity_bonus:
    - draft: 0
    - reviewed: 0.5
    - verified: 1.0
    - golden: 1.5

  ---

  ## 3) CAP (limit and finalize)

  ### C1 — selection cap
  - selected.length MUST be <= selection_cap

  ### C2 — final ordering
  Primary ordering:
  - higher score first

  Tie-breakers (deterministic):
  1) pillar (lexicographic)
  2) primary domain (domains[0])
  3) type (lexicographic)
  4) kid (lexicographic)

  ### C3 — bundle precedence
  If bundles_used is non-empty:
  - Apply bundles in order.
  - Any KIDs contributed by bundles must appear first (preserve bundle order),
    then fill remaining slots by ranked candidates not already included.
  