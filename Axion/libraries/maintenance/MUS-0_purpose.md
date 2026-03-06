---
doc_id: MUS-0
title: "Maintenance & Update System — Purpose & Boundary"
library: maintenance
version: "0.1.0"
status: active
---

# MUS-0: Purpose & Boundary

## Purpose

The Maintenance and Update System (MUS) provides a governed, consent-gated framework for maintaining and updating Axion's internal assets — templates, knowledge library entries, standards, registries, gates, and verification commands.

## Scope

- **21 maintenance modes** (MM-01 through MM-21) governing execution class, allowed triggers, detector packs, budgets, and apply/publish permissions
- **6 gate rules** (G-MUS-01 through G-MUS-06) enforcing consent, actor authorization, budget compliance, and registry integrity
- **2 detector packs** for registry integrity and drift detection
- **7 patch types** covering registry fixes, template updates, KL corrections, and deprecation management
- **2 schedules** (disabled by default) for nightly registry integrity and weekly drift detection
- **4 policies** governing MUS operations, KL rules, template rules, and security/locking

## Boundary Checklist

| Rule | Enforced |
|------|----------|
| Apply requires consent gate (G-MUS-01) | Yes |
| Publish requires consent gate (G-MUS-02) | Yes |
| Scheduled publish blocked | Yes |
| Automation cannot apply/publish without policy override | Yes |
| Budget caps enforced per mode | Yes |
| Patch types must be declared | Yes |
| Blast radius required for Class B/C changes | Yes |

## ID Conventions

| Entity | Pattern |
|--------|---------|
| Modes | MM-01 through MM-21 |
| Gates | G-MUS-## |
| Detector Packs | DP-\<GROUP\>-## |
| Patch Types | PT-\<GROUP\>-## |
| Runs | RUN-YYYYMMDD-XXXX |
| Proposals | PPK-YYYYMMDD-XXXX |
| Changesets | CS-YYYYMMDD-XXXX |
| Releases | REL-\<semver\> |
| Snapshots | SNP-YYYYMMDD-XXXX |
