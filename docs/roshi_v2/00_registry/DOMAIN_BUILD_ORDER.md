# Domain Build Order

> Defines which domains are foundation-critical and prerequisite rules.

**Generated:** UNKNOWN  
**Last Updated:** UNKNOWN

---

## Rules

1. **Foundation domains MUST be built first** - These establish core patterns and dependencies
2. **No lock/build of a domain before its prerequisites are drafted and verified**
3. **Reordering is allowed only if prerequisites are already satisfied**

---

## Foundation Domains

These domains are onboarding-critical and must be completed before any dependent domains.

1. UNKNOWN

---

## Build Order

| Order | Domain | Prerequisites | Status | Notes |
|-------|--------|---------------|--------|-------|
| 1 | UNKNOWN | none | pending | Foundation domain |

---

## Dependency Graph

```
UNKNOWN
└── (no dependencies defined)
```

---

## Verification Checklist

- [ ] All domains from roshi/domains.json are listed
- [ ] Prerequisites only reference valid domains
- [ ] No circular dependencies
- [ ] Foundation domains are first in order

---

## Open Questions

- Identify foundation domains from Project Overview
- Define domain dependency relationships
- Determine build order based on dependencies
