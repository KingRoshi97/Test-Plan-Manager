# Technology Stack Best Practices

## Web Application Stacks

### Modern Full-Stack (Recommended Default)
- **Frontend**: React + TypeScript + Tailwind CSS
- **State**: TanStack Query (server state) + Zustand (client state)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Session-based with bcrypt password hashing, JWT for API tokens
- **When to use**: Most web applications, SaaS products, dashboards, CRUD apps
- **When to avoid**: Real-time heavy apps (consider WebSocket-native stacks), static sites

### Serverless
- **Frontend**: React / Next.js + TypeScript
- **Backend**: AWS Lambda / Vercel Edge Functions
- **Database**: PostgreSQL (Neon/Supabase) or DynamoDB
- **When to use**: Variable traffic, cost-sensitive, event-driven workloads
- **When to avoid**: Long-running processes, WebSocket-heavy, low-latency requirements

### Static / JAMstack
- **Framework**: Astro / Next.js (static export) / Vite
- **CMS**: Headless CMS (Strapi, Sanity, Contentful)
- **Hosting**: Vercel / Netlify / Cloudflare Pages
- **When to use**: Marketing sites, blogs, documentation, portfolios
- **When to avoid**: Dynamic user-generated content, real-time features

## API-Only Stacks

### REST API
- **Runtime**: Node.js + Express or Fastify
- **Validation**: Zod for request/response schemas
- **Documentation**: OpenAPI 3.1 auto-generated from Zod schemas
- **When to use**: Standard CRUD, mobile app backends, third-party integrations
- **Conventions**: Plural resource nouns, HTTP verbs for actions, consistent error envelope

### GraphQL API
- **Runtime**: Node.js + Apollo Server or Yoga
- **Schema**: Code-first with TypeGraphQL or Pothos
- **When to use**: Complex data relationships, multiple frontend consumers, flexible querying
- **When to avoid**: Simple CRUD, public APIs (REST is more widely understood)

## Mobile Stacks

### Cross-Platform
- **Framework**: React Native + Expo
- **State**: TanStack Query + Zustand
- **Navigation**: React Navigation v7
- **When to use**: iOS + Android from single codebase, teams with React experience

### Native
- **iOS**: Swift + SwiftUI
- **Android**: Kotlin + Jetpack Compose
- **When to use**: Performance-critical apps, platform-specific features, AR/VR

## Key Principles

### TypeScript Everywhere
- Always prefer TypeScript over JavaScript for any project beyond a prototype
- Share types between frontend and backend via a shared schema package
- Use Zod for runtime validation that generates TypeScript types

### Database Selection
- **PostgreSQL**: Default choice for relational data, JSONB for semi-structured data
- **SQLite**: Embedded apps, local-first, edge computing
- **Redis**: Caching, sessions, rate limiting, pub/sub
- **MongoDB**: Only when data is truly document-oriented with no relations

### ORM Selection
- **Drizzle**: Lightweight, type-safe, SQL-like API (recommended default)
- **Prisma**: Richer ecosystem, better migration tooling, slightly heavier
- **Raw SQL**: Only for complex queries that ORMs can't express cleanly

### Package Manager
- **npm**: Default, widest compatibility
- **pnpm**: Monorepos, disk-space-constrained environments
- **bun**: Performance-sensitive, modern projects (verify ecosystem compatibility)
