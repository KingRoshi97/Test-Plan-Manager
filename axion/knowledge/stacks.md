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

### Cross-Platform (React Native)
- **Framework**: React Native + Expo
- **State**: TanStack Query + Zustand
- **Navigation**: React Navigation v7
- **When to use**: iOS + Android from single codebase, teams with React experience
- **When to avoid**: Heavy native API usage, games, AR/VR

### Cross-Platform (Flutter)
- **Framework**: Flutter + Dart
- **State**: Riverpod or BLoC
- **Navigation**: go_router
- **When to use**: Pixel-perfect custom UI on both platforms, high-performance animations
- **When to avoid**: Teams without Dart experience, heavy platform-specific integrations
- **Strengths**: Hot reload, custom rendering engine, rich widget library

### Native iOS
- **Language**: Swift
- **UI**: SwiftUI (preferred for new projects) or UIKit (for legacy/complex)
- **State**: Combine + @Observable (Swift 5.9+) or TCA (The Composable Architecture)
- **Networking**: URLSession or Alamofire
- **Persistence**: SwiftData (new) or Core Data
- **When to use**: iOS-only apps, deep Apple ecosystem integration (HealthKit, ARKit, widgets)

### Native Android
- **Language**: Kotlin
- **UI**: Jetpack Compose (preferred for new projects) or XML Views (legacy)
- **State**: ViewModel + StateFlow / Compose State
- **Networking**: Retrofit + OkHttp or Ktor
- **Persistence**: Room
- **When to use**: Android-only apps, deep Google ecosystem integration (Wear OS, Auto, TV)

## Desktop and Client Stacks

### Electron
- **Runtime**: Node.js + Chromium
- **UI**: React, Vue, or any web framework
- **When to use**: Cross-platform desktop from web codebase, rich editor-style apps
- **When to avoid**: Resource-constrained environments (high memory usage), small utilities
- **Considerations**: Large bundle size (~100MB+), update via electron-updater

### Tauri
- **Runtime**: Rust backend + system webview (no bundled Chromium)
- **UI**: React, Vue, Svelte, or any web framework
- **When to use**: Lightweight cross-platform desktop, when bundle size matters
- **When to avoid**: Apps needing full Chromium API surface, teams without Rust experience
- **Strengths**: Small bundle (~5-10MB), low memory footprint, strong security model

### .NET MAUI
- **Runtime**: .NET / C#
- **UI**: XAML-based cross-platform UI
- **When to use**: Cross-platform (Windows, macOS, iOS, Android) in .NET ecosystem
- **When to avoid**: Teams without C# experience, web-first teams
- **Strengths**: Single codebase for desktop + mobile, strong enterprise tooling

### Qt
- **Runtime**: C++ (or Python via PyQt/PySide)
- **UI**: Qt Widgets or Qt Quick (QML)
- **When to use**: High-performance native desktop, embedded systems, industrial applications
- **When to avoid**: Simple CRUD apps, teams without C++ experience
- **Strengths**: True native performance, extensive widget library, cross-platform

## Real-Time Stacks

### WebSocket-Native
- **Server**: Node.js + Socket.io or ws library
- **Client**: Socket.io-client or native WebSocket API
- **When to use**: Chat, live collaboration, gaming, real-time dashboards
- **Patterns**: Room-based broadcasting, presence tracking, reconnection handling
- **Scaling**: Redis adapter for multi-server broadcasting (Socket.io Redis adapter)

### tRPC Subscriptions
- **Server**: tRPC with WebSocket transport
- **Client**: tRPC client with subscription support
- **When to use**: Type-safe real-time with existing tRPC setup
- **Strengths**: End-to-end type safety, integrated with existing RPC patterns

### Event-Driven Architectures
- **Message broker**: Redis Pub/Sub, RabbitMQ, Apache Kafka
- **Patterns**: Event sourcing, CQRS, pub/sub
- **When to use**: Decoupled services, audit trails, complex event processing
- **When to avoid**: Simple applications (adds significant complexity)
- **Considerations**: Message ordering, exactly-once delivery, dead letter queues

### Server-Sent Events (SSE)
- **When to use**: One-way server-to-client updates (notifications, feeds, progress)
- **Advantages**: Simpler than WebSocket, works through HTTP proxies, auto-reconnect
- **When to avoid**: Bidirectional communication, high-frequency updates

## Data and ML Stacks

### Data Pipeline Tooling
- **ETL/ELT**: dbt (transformation), Airbyte (ingestion), Apache Airflow (orchestration)
- **Stream processing**: Apache Kafka + Kafka Streams, Apache Flink
- **Storage**: Data warehouse (BigQuery, Snowflake, Redshift) or data lake (S3 + Parquet)
- **When to use**: Analytics, reporting, data-driven features, ML training data

### Analytics Layers
- **Product analytics**: PostHog, Amplitude, Mixpanel
- **Business intelligence**: Metabase, Superset, Looker
- **Data modeling**: dbt for SQL-based transformations
- **Considerations**: Self-hosted vs SaaS, data privacy, query performance

### ML Serving
- **Model serving**: TensorFlow Serving, TorchServe, ONNX Runtime, Triton
- **MLOps**: MLflow, Weights & Biases, DVC for experiment tracking
- **API integration**: REST/gRPC endpoints wrapping model inference
- **When to use**: Recommendation systems, NLP, computer vision, fraud detection
- **Considerations**: GPU requirements, model versioning, A/B testing models, latency budgets

## Infrastructure Stacks

### Infrastructure as Code (IaC)
- **Terraform**: Cloud-agnostic, declarative, large ecosystem of providers
- **Pulumi**: IaC in general-purpose languages (TypeScript, Python, Go)
- **AWS CDK**: AWS-specific, TypeScript/Python, synthesizes to CloudFormation
- **When to use**: Any production infrastructure beyond single-server deployments
- **Best practices**: Version control, plan before apply, state management, module reuse

### Container Orchestration
- **Kubernetes**: Industry standard for container orchestration at scale
- **Docker Compose**: Local development and simple multi-container deployments
- **ECS/Fargate**: AWS-managed container orchestration (simpler than k8s)
- **Cloud Run / App Runner**: Serverless containers (no orchestration needed)
- **When to use Kubernetes**: Multi-service architectures, need for auto-scaling, self-healing

### Serverless Platforms
- **AWS Lambda**: Event-driven functions, pay-per-invocation
- **Vercel / Netlify Functions**: Frontend-optimized serverless
- **Cloudflare Workers**: Edge computing, low latency globally
- **Supabase Edge Functions**: Deno-based, integrated with Supabase ecosystem
- **When to use**: Variable traffic, cost-sensitive, event-driven workloads
- **When to avoid**: Long-running processes, stateful workloads, cold start sensitivity

## Monorepo Tooling

### Turborepo
- **Type**: Build system and task runner for JavaScript/TypeScript monorepos
- **Strengths**: Fast (remote caching, parallel execution), simple configuration
- **When to use**: Multi-package JS/TS projects sharing code (frontend + backend + shared)
- **Configuration**: `turbo.json` for pipeline definition, incremental builds

### Nx
- **Type**: Full-featured monorepo build system with dependency graph
- **Strengths**: Rich plugin ecosystem, computation caching, affected commands
- **When to use**: Large monorepos, multi-framework projects, enterprise teams
- **Features**: Code generation, dependency visualization, CI optimization

### Workspace Strategies
- **npm/pnpm/yarn workspaces**: Package-level dependency management and linking
- **Shared packages**: Put shared types, utilities, and configs in `packages/` directory
- **Independent versioning**: Each package has its own version (for libraries)
- **Unified versioning**: All packages share a version (for applications)
- **Considerations**: Build order, circular dependencies, publish workflow

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

### Testing Stack
- **Unit/Integration**: Vitest (Vite-native, fast) or Jest (mature, wide ecosystem)
- **E2E**: Playwright (recommended, multi-browser) or Cypress (developer-friendly)
- **API testing**: Supertest for Express, or HTTP client-based test suites
- **Visual regression**: Chromatic (Storybook), Percy, or Playwright screenshots
- **Load testing**: k6 (JavaScript-based), Artillery, or JMeter

### Hosting and Deployment
- **Replit**: Full-stack apps with integrated deployment and database
- **Vercel**: Frontend-optimized, serverless functions, edge network
- **Railway**: Full-stack with managed PostgreSQL, Redis, and workers
- **Fly.io**: Global edge deployment with persistent volumes
- **AWS/GCP/Azure**: Full cloud infrastructure for enterprise-scale applications
- **Cloudflare**: Edge-first with Workers, R2 storage, D1 database

### Observability Stack
- **Error tracking**: Sentry (recommended), Bugsnag, or Rollbar
- **Logging**: Pino (Node.js), centralized with Datadog, CloudWatch, or Grafana Loki
- **Metrics**: Prometheus + Grafana, or Datadog APM
- **Uptime monitoring**: Better Uptime, Checkly, or Pingdom
- **Real User Monitoring**: web-vitals library + custom dashboards or Datadog RUM

### Authentication Solutions
- **Replit Auth**: Built-in for Replit-hosted applications
- **Auth0 / Clerk**: Managed auth with social login, MFA, and user management
- **NextAuth.js**: Self-hosted auth for Next.js applications
- **Supabase Auth**: Integrated with Supabase ecosystem
- **Custom**: bcrypt/Argon2 + sessions for full control (more implementation work)
- **Passport.js**: Middleware-based auth strategies for Express (flexible, many strategies)
