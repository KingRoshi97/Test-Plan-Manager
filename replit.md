# AXION Documentation System

## Overview

AXION is a documentation-first development system that generates comprehensive "Agent Kits" for AI-guided software development. It follows a strict pipeline: init → generate → seed → draft → review → verify → lock → package.

## Project Structure

```
axion/
├── config/           # Configuration files (stage-plans, presets)
├── scripts/          # AXION TypeScript CLI scripts
├── templates/        # Document templates for each module
└── README.md         # AXION system documentation
```

## AXION Pipeline Stages

1. **kit-create** - Initialize a new Agent Kit workspace
2. **docs:scaffold** - Generate module documentation structure from templates
3. **docs:content** - Fill documentation sections with AI-generated content
4. **docs:full** - Run scaffold + content in sequence
5. **app:bootstrap** - Generate application boilerplate from locked documentation

## Module System

19 domain modules with defined dependencies:
- **Foundation**: architecture, systems, contracts
- **Data**: database, data
- **Security**: auth
- **Application**: backend, integrations, state, frontend, fullstack
- **Quality**: testing, quality, security, devops, cloud, devex
- **Clients**: mobile, desktop

## Usage

Run AXION scripts via npx ts-node from the axion directory:

```bash
# Create a new kit
npx ts-node scripts/axion-kit-create.ts <kit-name>

# Run pipeline stages
npx ts-node scripts/axion-run.ts --kit <kit-path> --stage docs:scaffold
npx ts-node scripts/axion-run.ts --kit <kit-path> --stage docs:content
npx ts-node scripts/axion-run.ts --kit <kit-path> --stage app:bootstrap
```
