ORD-01 — Build Order Graph (Doc Dependency Graph)
(Hardened Draft — Full)
1) Purpose
Define the authoritative document dependency graph and a valid topological build order for the Axion internal documentation and artifact system.
ORD-01 exists to enforce:
“no forward progress without compliance” at the documentation and artifact level
deterministic build sequencing (docs and artifacts are produced in the correct order)
explicit upstream/downstream dependencies (no hidden coupling)

2) Inputs
Locked doc sets (SYS, INT, CAN, STD, TMP, KIT, VER, STATE, GOV, EXEC, PLAN)
Stage architecture (SYS-03)
Gate model (SYS-07)

3) Outputs
doc_dependency_graph (nodes + edges)
canonical_build_order[] (topological order)
critical_path[] (minimum backbone order)
Rule: graph must be acyclic

4) Graph Model (Locked)
4.1 Node
A node represents a doc (or contract artifact) identified by:
doc_id (e.g., SYS-01, INT-03)
category (SYS/INT/CAN/STD/TMP/ORD/etc.)
lock_level (LOCKED/CONFIGURABLE/ADVISORY) (declared in each doc)
4.2 Edge
An edge A -> B means:
B depends on A
B cannot be authored/locked until A is complete and compliant (gate pass)

5) Dependency Graph (High-Level Edges)
5.1 Foundations
SYS-01 → SYS-02, SYS-03, SYS-04, SYS-05, SYS-06, SYS-07, SYS-08, SYS-09, SYS-10
SYS-03 ↔ SYS-04 (must align; resolve by authoring SYS-03 then SYS-04)
SYS-06 depends on SYS-03 + SYS-04
SYS-07 depends on SYS-03
SYS-10 depends on SYS-07 (enforcement references)
5.2 Intake
INT-01 → INT-02 → INT-03 → INT-05
INT-01 + INT-02 → INT-04
INT-03 → INT-05
5.3 Canonical Model
CAN-01 → CAN-02, CAN-03
INT-02 → CAN-01 (schema alignment)
INT-03 influences CAN-03 blocking policy thresholds
5.4 Standards
STD-01 → STD-02 → STD-03
CAN-01 influences what standards must be representable (constraints binding)
5.5 Templates
TMP-01 → TMP-02 → TMP-04 → TMP-05
TMP-01 → TMP-03 (selection uses index metadata)
CAN-01/02/03 + STD-03 → TMP-04 (fill rules depend on truth + snapshot)
TMP-05 aligns with SYS-07 template gate concept
5.6 Build Order & Gates
ORD-01 depends on locked doc sets (it references them)
ORD-02 depends on SYS-07 (gate model) + INT-05 (issue format patterns) + TMP-05 (template gate patterns)
ORD-03 depends on ORD-02
5.7 Kit System (contracts)
KIT docs depend on:
TMP (template outputs and placement)
CAN/STD (truth artifacts included)
SYS-06 traceability requirements
ORD gate enforcement (packaging gate)
(KIT-01..KIT-04 are included as active nodes (not reserved). Packaging gates must validate against KIT contracts.)
5.8 Verification/State/Governance/Exec
VER docs depend on SYS-07 + Acceptance Map rules (PLAN)
STATE docs depend on PLAN + VER proof model
GOV docs depend on SYS-08 + SYS-10
EXEC docs depend on ORD + all core contracts

6) Canonical Build Order (Topological Order)
This is the authoritative order for authoring/locking docs (matches what we already used, formalized here):
Foundations
SYS-01
SYS-03
SYS-04
SYS-07
SYS-10
SYS-02
SYS-05
SYS-06
SYS-08
SYS-09 (provisional; final compliance pass later)
Intake
INT-01
INT-02
INT-03
INT-04
INT-05
Canonical Model
CAN-01
CAN-02
CAN-03
Standards
STD-01
STD-02
STD-03
Templates
TMP-01
TMP-02
TMP-03
TMP-04
TMP-05
Order & Gates
ORD-01
ORD-02
ORD-03
PLAN, VER, KIT, STATE, GOV, EXEC follow in the build order after ORD.

7) Critical Path (Minimum Backbone)
If only the minimal backbone must be locked to run the system:
SYS-01, SYS-03, SYS-07, SYS-10
INT-01..INT-05
CAN-01..CAN-03
STD-01..STD-03
TMP-01..TMP-05
KIT-01..KIT-04
EXEC-01..EXEC-03

8) Failure Modes
cyclic dependencies (graph invalid)
hidden dependencies not represented as edges (causes drift)
docs authored out of order (downstream contradictions)
“provisional” docs treated as locked without compliance pass (especially SYS-09)

9) Definition of Done (ORD-01)
ORD-01 is complete when:
node/edge model is defined
dependency edges cover all authored doc sets so far
canonical build order is a valid topological sort
critical path is defined
cycles are explicitly disallowed and detectable
