---
kid: "KID-LANGDOCK-PATTERN-0001"
title: "Docker Common Implementation Patterns"
type: "pattern"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "docker"
subdomains: []
tags:
  - "docker"
  - "pattern"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Docker Common Implementation Patterns

# Docker Common Implementation Patterns

## Summary
Docker provides a powerful way to package, distribute, and run applications in isolated environments. This guide outlines common implementation patterns for using Docker effectively, including multi-stage builds, service composition with Docker Compose, and immutable infrastructure practices. These patterns help optimize performance, simplify development workflows, and ensure maintainability in containerized applications.

---

## When to Use
- **Multi-stage Builds**: When you need to optimize image size and separate build dependencies from runtime dependencies.
- **Service Composition with Docker Compose**: When managing multi-container applications locally or in development environments.
- **Immutable Infrastructure**: When deploying containers in production environments to ensure consistency and reproducibility.
- **CI/CD Pipelines**: When automating the build, test, and deployment processes for containerized applications.

---

## Do / Don't

### Do:
1. **Use Multi-Stage Builds**: Reduce image size by separating build and runtime stages.
2. **Leverage Docker Compose for Local Development**: Simplify multi-container setups with declarative configuration.
3. **Tag Images Properly**: Use semantic versioning or meaningful tags (e.g., `v1.0.0`, `latest`) for clarity.
4. **Minimize Privileges**: Run containers with non-root users whenever possible to enhance security.
5. **Use `.dockerignore`**: Exclude unnecessary files from the build context to speed up builds.

### Don't:
1. **Store Secrets in Images**: Avoid hardcoding sensitive information like API keys or passwords in Dockerfiles.
2. **Use `latest` Tag in Production**: Avoid relying on `latest` tags for production deployments; they can lead to unexpected behavior.
3. **Install Unnecessary Dependencies**: Keep images lean by only installing required packages.
4. **Ignore Resource Limits**: Always set CPU and memory limits to prevent containers from consuming excessive host resources.
5. **Skip Regular Image Updates**: Ensure images are regularly updated to patch vulnerabilities and maintain compatibility.

---

## Core Content

### Pattern 1: Multi-Stage Builds
**Problem**: Docker images can become bloated when build tools and dependencies are included in the final image.  
**Solution**: Use multi-stage builds to separate the build environment from the runtime environment.  
**Implementation Steps**:  
1. Define multiple `FROM` statements in your Dockerfile.  
2. Use the first stage for building the application (e.g., compiling code).  
3. Use the final stage for runtime dependencies only, copying artifacts from the build stage.  
```Dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Pattern 2: Service Composition with Docker Compose
**Problem**: Managing multiple containers manually can be cumbersome.  
**Solution**: Use Docker Compose to define and run multi-container applications declaratively.  
**Implementation Steps**:  
1. Create a `docker-compose.yml` file to define services.  
2. Specify container dependencies, networks, and volumes.  
3. Use `docker-compose up` to start all services.  
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
```

### Pattern 3: Immutable Infrastructure
**Problem**: Configuration drift and manual changes can lead to unpredictable environments.  
**Solution**: Treat containers as immutable artifacts; rebuild and redeploy containers for every change.  
**Implementation Steps**:  
1. Use CI/CD pipelines to automate image builds and deployments.  
2. Tag images with unique identifiers (e.g., commit hash).  
3. Avoid manual changes to running containers; use infrastructure-as-code tools like Terraform or Kubernetes.  

---

## Links
- [Docker Multi-Stage Builds Documentation](https://docs.docker.com/develop/develop-images/multistage-build/) - Official guide to multi-stage builds.  
- [Docker Compose Documentation](https://docs.docker.com/compose/) - Comprehensive guide to Docker Compose.  
- [Best Practices for Docker](https://docs.docker.com/develop/dev-best-practices/) - Docker's official best practices.  
- [Immutable Infrastructure Patterns](https://martinfowler.com/bliki/ImmutableServer.html) - Overview of immutable infrastructure concepts.

---

## Proof / Confidence
- **Industry Standards**: Multi-stage builds and Docker Compose are widely adopted and documented as best practices by Docker.  
- **Benchmarks**: Multi-stage builds reduce image size significantly, improving deployment speed and resource usage.  
- **Common Practice**: Immutable infrastructure is a core principle in modern DevOps workflows, ensuring consistency and reliability in production environments.  

