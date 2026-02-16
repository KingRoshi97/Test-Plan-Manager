# Axiom Assembler Documentation Workspace

This directory contains the Axiom Assembler documentation system for the project.

## Directory Structure

```
docs/assembler_v1/
├── 00_product/          # Product-level specifications
├── 00_registry/         # Cross-cutting registries
├── 01_templates/        # Document templates
├── 02_domains/          # Per-domain documentation
└── 03_workflows/        # Workflow documentation
```

## Pipeline Commands

```bash
npm run assembler:init    # Initialize workspace
npm run assembler:gen     # Generate domain doc packs
npm run assembler:seed    # Seed starter scaffolding
npm run assembler:draft   # Draft truth candidates
npm run assembler:review  # Review packet
npm run assembler:verify  # Verify system
npm run assembler:lock    # Lock a domain
```
