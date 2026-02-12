# Fullstack Coverage Map

> **Registry Guardrail.** Maps which domain modules cover which categories of a fullstack application. Used by the verify step to ensure no critical category is left undocumented, and by presets to determine which modules to include for a given build target.

---

## Coverage Matrix

Each cell indicates how a domain module contributes to a fullstack development category.

| Category | Primary Module(s) | Supporting Module(s) | Template Focus | RPBS Section |
|----------|-------------------|---------------------|----------------|-------------|
| **Architecture & Patterns** | Architecture | Systems | DDES, DIM | §7 (Tech Stack) |
| **System Design** | Systems | Architecture | DDES, DIM, SCREENMAP | §7 |
| **API Contracts & Schemas** | Contracts | Backend, Integrations | DDES, DIM, BELS | §4 (Core Objects) |
| **Database Schema** | Database | Contracts | DDES, BELS | §4, §8 (Data Classification) |
| **Data Flows & Pipelines** | Data | Database, Contracts | DDES, DIM, BELS | §4, §12 (Search) |
| **Authentication** | Auth | Backend, Database | BELS, DDES, DIM | §3 (Actors), §15 (Compliance) |
| **Authorization & Permissions** | Auth | Backend, Security | BELS, DIM | §3 |
| **Server-Side Logic** | Backend | Contracts, Auth | BELS, DDES, DIM | §5 (Journeys) |
| **API Routes & Middleware** | Backend | Contracts | DDES, DIM, TESTPLAN | §4 |
| **Third-Party Integrations** | Integrations | Backend, Contracts | DDES, DIM, TIES | §11 (Notifications), §14 (Billing) |
| **Client State Management** | State | Contracts, Frontend | BELS, DDES | §5 |
| **UI Components** | Frontend | State | COMPONENT_LIBRARY, UI_Constraints | §6 (Navigation) |
| **Pages & Navigation** | Frontend | State | SCREENMAP, UX_Foundations | §5, §6 |
| **Forms & Validation** | Frontend | Contracts, Backend | COMPONENT_LIBRARY, COPY_GUIDE | §5 |
| **End-to-End Flows** | Fullstack | Frontend, Backend | TESTPLAN, DIM | §5 |
| **Unit Testing** | Testing | Backend, Frontend | TESTPLAN | §5 |
| **Integration Testing** | Testing | Fullstack | TESTPLAN | §5 |
| **E2E Testing** | Testing | Fullstack | TESTPLAN | §5 |
| **Code Quality & Linting** | Quality | DevEx | TESTPLAN, COPY_GUIDE | — |
| **Security Policies** | Security | Auth, Backend | BELS, DDES | §15 (Compliance) |
| **Threat Modeling** | Security | Auth | DDES, TIES | §15 |
| **CI/CD Pipelines** | DevOps | Testing, Backend | DDES, TESTPLAN | — |
| **Deployment & Environments** | DevOps | Cloud | DDES, DIM | §7 |
| **Cloud Infrastructure** | Cloud | DevOps | DDES, DIM | §7 |
| **Developer Tooling** | DevEx | Quality | COPY_GUIDE, DIM | — |
| **Mobile Screens** | Mobile | Frontend, State | SCREENMAP, COMPONENT_LIBRARY | §6 |
| **Desktop Windows** | Desktop | Frontend, State | SCREENMAP, COMPONENT_LIBRARY | §6 |

---

## Category Groups

Categories are organized into groups that align with development phases.

### 1. Foundation (What are we building?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Architecture & Patterns | All projects | Architecture |
| System Design | All projects | Systems |
| API Contracts & Schemas | All projects with a backend | Contracts |

### 2. Data (What do we store?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Database Schema | Projects with persistence | Database |
| Data Flows & Pipelines | Projects with data processing | Data |

### 3. Identity (Who can do what?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Authentication | Projects with user accounts | Auth |
| Authorization & Permissions | Projects with role-based access | Auth |

### 4. Backend (How does the server work?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Server-Side Logic | All projects with a backend | Backend |
| API Routes & Middleware | All projects with a backend | Backend |
| Third-Party Integrations | Projects using external services | Integrations |

### 5. Frontend (What does the user see?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Client State Management | All frontend projects | State |
| UI Components | All frontend projects | Frontend |
| Pages & Navigation | All frontend projects | Frontend |
| Forms & Validation | Projects with user input | Frontend |

### 6. Integration (Does it all work together?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| End-to-End Flows | All fullstack projects | Fullstack |

### 7. Quality (Is it reliable?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Unit Testing | All projects | Testing |
| Integration Testing | All fullstack projects | Testing |
| E2E Testing | All fullstack projects | Testing |
| Code Quality & Linting | All projects | Quality |

### 8. Security (Is it safe?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Security Policies | All projects | Security |
| Threat Modeling | Projects handling sensitive data | Security |

### 9. Operations (How do we ship it?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| CI/CD Pipelines | All deployed projects | DevOps |
| Deployment & Environments | All deployed projects | DevOps |
| Cloud Infrastructure | Cloud-hosted projects | Cloud |
| Developer Tooling | All projects | DevEx |

### 10. Platform (Where does it run?)

| Category | Required For | Covered By |
|----------|-------------|------------|
| Mobile Screens | Mobile app targets | Mobile |
| Desktop Windows | Desktop app targets | Desktop |

---

## Preset-to-Coverage Mapping

Shows which categories each preset covers:

| Preset | Categories Covered | Coverage |
|--------|-------------------|----------|
| `foundation` | Architecture, System Design, API Contracts | Foundation only |
| `core-spec` | Foundation + Database, Auth | Foundation + Data + Identity |
| `web` | Foundation + State, UI, Pages, Forms | Foundation + Frontend |
| `backend-api` | Foundation + Data + Identity + Backend | No frontend |
| `fullstack-web` | Foundation + Data + Identity + Backend + Frontend + E2E | Full web stack |
| `security-layer` | Foundation + Data + Identity + Backend + Security | Security focus |
| `ops` | Foundation + Data + Identity + Backend + Frontend + Testing + Quality + DevOps + Cloud + DevEx | Everything except platform |
| `system` | All categories | Complete coverage |

---

## Verification Rules

The verify step uses this map to check coverage:

1. **Every RPBS §5 journey** must map to at least one category with a primary module
2. **Every primary module** must have at least BELS and DDES completed
3. **Supporting modules** must have DIM completed if the primary module references them
4. **Platform categories** (Mobile, Desktop) are only required if RPBS lists them as target platforms

---

## Cross-References

- **Module details:** See `module-index.md`
- **Domain responsibilities:** See `domain-map.md`
- **Build order:** See `domain-build-order.md`
- **Stage plans:** See `run-sequences.md`
