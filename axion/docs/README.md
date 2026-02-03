# AXION Documentation

This folder centralizes all README documentation for the AXION system.

## Files

| File | Describes |
|------|-----------|
| `README_system.md` | The AXION system itself — pipeline stages, modules, how it works |
| `README_product.md` | The `source_docs/product/` folder — RPBS, REBS, specs |
| `README_registry.md` | The `source_docs/registry/` folder — glossary, reason codes, vocabularies |

## Legacy Folder

The `legacy/` subfolder maintains version history for each README:

```
legacy/
├── README_system/     # Previous versions of README_system.md
├── README_product/    # Previous versions of README_product.md
└── README_registry/   # Previous versions of README_registry.md
```

### How Legacy Works

Before any README is updated, a timestamped copy is placed in its legacy folder:
```
README_system_20260203_041600.md
```

This preserves the history of documentation changes and allows rollback if needed.

### Naming Convention

Legacy files use the format:
```
{README_name}_{YYYYMMDD}_{HHMMSS}.md
```
