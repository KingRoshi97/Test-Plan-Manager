---
kid: "KID-LANG-NODE-NODE-0007"
title: "Deployment Notes (Node)"
content_type: "reference"
primary_domain: "["
secondary_domains:
  - "j"
  - "a"
  - "v"
  - "a"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - "_"
  - "t"
  - "y"
  - "p"
  - "e"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - ","
  - " "
  - "n"
  - "o"
  - "d"
  - "e"
  - "j"
  - "s"
  - "]"
industry_refs: []
stack_family_refs:
  - "nodejs"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "n"
  - "o"
  - "d"
  - "e"
  - ","
  - " "
  - "d"
  - "e"
  - "p"
  - "l"
  - "o"
  - "y"
  - "m"
  - "e"
  - "n"
  - "t"
  - ","
  - " "
  - "d"
  - "o"
  - "c"
  - "k"
  - "e"
  - "r"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/nodejs/frameworks/node/KID-LANG-NODE-NODE-0007.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Deployment Notes (Node)

```markdown
# Deployment Notes (Node)

## Summary
This document outlines best practices, configuration options, and considerations for deploying Node.js applications. It covers key aspects such as environment variables, process management, and performance optimization to ensure reliable and scalable deployments.

## When to Use
- Deploying Node.js applications to production environments.
- Setting up staging or testing environments for Node.js applications.
- Configuring CI/CD pipelines for automated deployments.
- Optimizing performance and reliability for high-traffic applications.

## Do / Don't

### Do
- **Do** use environment variables to manage sensitive data and configuration settings.
- **Do** use a process manager like PM2 or systemd to ensure application uptime.
- **Do** implement logging and monitoring for debugging and performance tracking.
- **Do** set up health checks for your application to monitor availability.

### Don't
- **Don't** hardcode sensitive information like API keys or database credentials in your codebase.
- **Don't** use the default `NODE_ENV` value (`undefined`) in production; always set it explicitly to `production`.
- **Don't** block the event loop with synchronous code in production environments.
- **Don't** deploy without testing for memory leaks or performance bottlenecks.

## Core Content

### 1. Environment Variables
- Use `.env` files for local development and tools like `dotenv` to load them.
- Always set `NODE_ENV` to `production` in production environments. This enables optimizations like disabling development-specific warnings.
- Examples:
  ```bash
  NODE_ENV=production
  PORT=3000
  DATABASE_URL=postgres://user:password@host:port/dbname
  ```

### 2. Process Management
- Use a process manager to handle application lifecycle and ensure uptime:
  - **PM2**: Offers process monitoring, clustering, and log management.
    ```bash
    pm2 start app.js --name my-app --watch
    ```
  - **systemd**: Use for system-level process management.
    Example `my-app.service` file:
    ```ini
    [Unit]
    Description=My Node.js App
    After=network.target

    [Service]
    ExecStart=/usr/bin/node /path/to/app.js
    Restart=always
    User=nodeuser
    Environment=NODE_ENV=production

    [Install]
    WantedBy=multi-user.target
    ```

### 3. Performance Optimization
- Use clustering to utilize multiple CPU cores:
  ```javascript
  const cluster = require('cluster');
  const os = require('os');

  if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork(); // Restart worker
    });
  } else {
    require('./app'); // Start the app
  }
  ```
- Enable gzip compression for HTTP responses using middleware like `compression` in Express.js:
  ```javascript
  const compression = require('compression');
  const express = require('express');
  const app = express();

  app.use(compression());
  ```

### 4. Logging and Monitoring
- Use a logging library like `winston` or `pino` for structured logs.
- Integrate monitoring tools such as New Relic, Datadog, or Prometheus to track application metrics.
- Example using `winston`:
  ```javascript
  const winston = require('winston');

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'app.log' }),
    ],
  });

  logger.info('Application started');
  ```

### 5. Security Best Practices
- Use `helmet` middleware in Express.js to set secure HTTP headers:
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```
- Regularly update dependencies to patch known vulnerabilities. Use `npm audit` to identify issues.

## Links
- **Node.js Documentation**: Official Node.js runtime documentation for deployment and process management.
- **PM2 Documentation**: Comprehensive guide to process management with PM2.
- **12-Factor App**: Industry-standard methodology for building scalable and maintainable applications.
- **OWASP Node.js Security Cheat Sheet**: Best practices for securing Node.js applications.

## Proof / Confidence
This content is based on industry standards such as the 12-Factor App methodology, best practices outlined in the Node.js documentation, and widely adopted tools like PM2 and `dotenv`. These practices are validated by their use in production by major organizations and supported by performance benchmarks and security guidelines from OWASP.
```
