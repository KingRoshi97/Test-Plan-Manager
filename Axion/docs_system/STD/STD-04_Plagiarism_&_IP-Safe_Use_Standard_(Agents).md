STD-04 — Plagiarism & IP-Safe Use Standard (Agents)
1) Purpose
Prevent agents (internal and external) from reproducing copyrighted text, proprietary content, or code they are not authorized to copy—especially from AXION’s Knowledge/Standards Library—while still allowing legitimate reuse of approved internal assets and properly licensed material.
2) Scope
Applies to:
Any Agent that reads AXION artifacts, Knowledge Library, Standards Library, previous project repos, or external sources.


All outputs: code, documentation, copywriting, diagrams, prompts, tests, schemas, UI text.


3) Definitions
Knowledge Library (KSL): internal repository of reference material, notes, examples, prior code, standards, and guidance.


Standards Library (STD): AXION rules/constraints documents (may include examples).


Approved Internal Asset: a file/module/template explicitly marked reusable for the current build (see “Allowed Sources”).


Restricted Content: any content not explicitly authorized for reuse in this build.


Verbatim Copy: exact or near-exact reproduction of text/code beyond allowed limits.


Derived Work: output that substantially mirrors a restricted source’s structure or expression even if renamed.


4) Policy Summary
Agents must generate original work by default. Reuse is allowed only when:
the source is explicitly approved for reuse for this build, and


licensing/ownership permits it, and


attribution requirements are met.



5) Allowed Sources (what agents MAY reuse)
Agents may reuse content only from these categories:
A) Project-Owned Code in the Current Repo
Reuse allowed if it already exists in the target repo.


Must preserve internal attribution headers if present.


B) “Reusable” Internal Assets (explicitly whitelisted)
Only assets listed in the build’s REUSE_ALLOWLIST are reusable.
 Allowlist entries must include:
path


license/ownership (e.g., “Company owned”, “MIT”, “Apache-2.0”)


reuse_scope (exact copy allowed vs pattern-only)


required_attribution (if any)


C) Open-Source Code with Compatible Licenses
Allowed only if:
the license is compatible with the project’s distribution model, and


the required notice/attribution is included, and


the reused portion is tracked in a reuse log.


D) Standards / Knowledge Library Content as “Rules”, Not “Copy”
Agents may use KSL/STD content for concepts, constraints, checklists, and patterns.


Agents must not copy long passages of text or whole code blocks from KSL/STD unless the exact excerpt is whitelisted.



6) Prohibited Behavior (hard rules)
Agents MUST NOT:
Copy code from KSL/STD examples into the build output unless that specific example is in the allowlist.


Reproduce large verbatim sections of text from KSL/STD or external sources.


Use external sources as a “code donor” (copy/paste) without verifying license + logging reuse.


Produce output that is a thin rewrite of restricted content (rename variables, reorder lines, minimal edits).


Include proprietary vendor code, SDK internals, or leaked source content.



7) Safe Generation Rules (how agents should work)
Agents MUST follow this workflow:
7.1 Pattern extraction, not copying
When referencing KSL/STD:
extract requirements (bullets, constraints, acceptance criteria)


re-express in new words


implement code from scratch using the requirements


7.2 “Small excerpt” rule (docs)
Unless whitelisted:
no more than 25 words verbatim from any single non-licensed text source


excerpts must be quoted and attributed


7.3 “No large blocks” rule (code)
Unless whitelisted:
do not reproduce a function/class/module copied from elsewhere


re-implement using the spec, not the source code’s structure


7.4 Attribution and reuse logging
If any reuse occurs, the agent must add a record to axion/reuse_log.json (or equivalent) including:
source (repo URL/file path)


license


what was reused (file, function names, line ranges)


attribution included (yes/no, where)



8) Required Artifacts
8.1 REUSE_ALLOWLIST (required for every build)
Location: axion/reuse_allowlist.json
Minimum fields:
schema_version


items[]: { path, owner, license, reuse_scope, allowed_excerpt_max_lines, required_attribution }


8.2 REUSE_LOG (required if any reuse occurs)
Location: axion/reuse_log.json
Minimum fields:
schema_version


entries[]: { timestamp, source, license, reused_parts, attribution_path }



9) Enforcement Gates (AXION)
Add these gates to your gate set (names are placeholders; keep your naming convention):
GATE-PLAG-01 — Allowlist exists
fail if axion/reuse_allowlist.json missing


GATE-PLAG-02 — Reuse requires logging
if reuse_allowlist has any items OR agent declares reuse, require axion/reuse_log.json


GATE-PLAG-03 — Knowledge Library copy ban (default)
fail if build outputs contain verbatim blocks matching KSL/STD example snippets unless the snippet is listed in allowlist


(Implementation: hash-based snippet registry or simple “known example” detection)


GATE-PLAG-04 — License notice enforcement
if reuse_log includes OSS sources requiring NOTICE, fail if NOTICE file not updated


Proof required
PROOF: reuse_allowlist_present


PROOF: reuse_log_present_if_reuse


PROOF: license_notice_updated_if_required


PROOF: plagiarism_scan_pass (if you add a scanner)



10) Agent Instructions (drop-in prompt block)
Use this verbatim in your agent role prompt:
Do not copy code or text from AXION Knowledge Library or Standards Library into outputs unless the exact source path is listed in axion/reuse_allowlist.json.


Use KSL/STD for requirements and patterns only; implement from scratch.


If you reuse anything (internal reusable assets or OSS), you must add an entry to axion/reuse_log.json and include required attribution/NOTICE changes.


If unsure about license/permission, do not reuse; re-implement.



11) Human Review Checklist (fast)
reuse_allowlist exists and is intentional


reuse_log exists if any reuse happened


NOTICE/attribution updated where needed


outputs do not contain pasted KSL/STD example code


any excerpts are short + attributed

