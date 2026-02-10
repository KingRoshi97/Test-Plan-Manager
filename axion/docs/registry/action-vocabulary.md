# Action Vocabulary

## Overview
This document defines the standard action prefixes and verbs used across domains.

## Action Prefixes by Domain

| Domain | Prefix | Example Actions |
|--------|--------|-----------------|
| platform | platform: | platform:createUser, platform:getProject |
| api | api: | api:createRun, api:generateBundle |
| web | web: | web:renderView, web:handleClick |
| infra | infra: | infra:storeFile, infra:deploy |
| security | security: | security:authenticate, security:authorize |

## Standard Verbs

| Verb | Description | Example |
|------|-------------|---------|
| create | Create a new resource | platform:createUser |
| get | Retrieve a resource | platform:getProject |
| update | Modify a resource | api:updateRun |
| delete | Remove a resource | platform:deleteProject |
| list | List resources | api:listRuns |
| verify | Verify/validate | api:verifyDomain |
| lock | Lock a resource | api:lockDomain |
| generate | Generate output | api:generateBundle |

## Open Questions
- UNKNOWN
