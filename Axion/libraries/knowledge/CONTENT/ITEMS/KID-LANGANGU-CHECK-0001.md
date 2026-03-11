---
kid: "KID-LANGANGU-CHECK-0001"
title: "Angular Production Readiness Checklist"
content_type: "checklist"
primary_domain: "angular"
industry_refs: []
stack_family_refs:
  - "angular"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "angular"
  - "checklist"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/02_web_frameworks/angular/checklists/KID-LANGANGU-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Angular Production Readiness Checklist

# Angular Production Readiness Checklist

## Summary

This checklist ensures your Angular application is production-ready by verifying critical configurations, optimizing performance, and securing the application. Following this checklist reduces runtime errors, improves scalability, and enhances user experience in production environments.

## When to Use

Use this checklist:
- Before deploying an Angular application to production.
- When migrating an Angular application to a new environment.
- After major updates to Angular versions or dependencies.

## Do / Don't

### Do:
1. **Do enable production mode**: Ensure Angular runs in production mode to disable development-specific checks and optimizations.
2. **Do optimize bundles**: Minify and tree-shake your code to reduce bundle size and improve load times.
3. **Do implement lazy loading**: Split your application into feature modules and load them on demand to improve initial load performance.

### Don't:
1. **Don’t use development configurations in production**: Avoid using development settings, such as verbose logging or mock services, in production builds.
2. **Don’t hardcode sensitive data**: Avoid embedding API keys, secrets, or sensitive information directly in your code.
3. **Don’t ignore security headers**: Ensure HTTP headers like Content Security Policy (CSP) are configured to prevent attacks.

## Core Content

### 1. **Build Configuration**
- **Enable production mode**: Run `ng build --prod` to enable production optimizations like Ahead-of-Time (AOT) compilation, minification, and tree-shaking.
  - *Rationale*: Production mode disables Angular's development-specific checks, improving runtime performance.
- **Verify environment variables**: Ensure environment-specific values (e.g., API endpoints) are correctly set in `src/environments/environment.prod.ts`.

### 2. **Performance Optimization**
- **Use lazy loading**: Configure lazy loading for feature modules in the `RouterModule`. Example:
  ```typescript
  const routes: Routes = [
    { path: 'feature', loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule) }
  ];
  ```
  - *Rationale*: Lazy loading reduces the initial bundle size and improves application startup time.
- **Enable caching and compression**: Configure your server (e.g., Nginx, Apache) to cache static assets and serve compressed files (e.g., Gzip or Brotli).
- **Analyze bundle size**: Use tools like `source-map-explorer` or `webpack-bundle-analyzer` to identify and reduce large dependencies.

### 3. **Security**
- **Sanitize inputs**: Use Angular's built-in DOM sanitization to prevent cross-site scripting (XSS) attacks.
- **Use security headers**: Configure your server to include headers like CSP, X-Content-Type-Options, and X-Frame-Options.
- **Disable debug tools**: Ensure `enableProdMode()` is called to prevent access to Angular's debugging APIs.

### 4. **Testing and Monitoring**
- **Run end-to-end (E2E) tests**: Use tools like Cypress or Protractor to test critical user flows in production-like environments.
- **Set up error monitoring**: Integrate tools like Sentry or Rollbar to capture runtime errors and monitor application health.
- **Verify logging levels**: Ensure logs are concise and only include necessary information for debugging.

### 5. **Dependency Management**
- **Audit dependencies**: Run `npm audit` or `yarn audit` to identify and resolve vulnerabilities in third-party libraries.
- **Lock dependency versions**: Use a lock file (`package-lock.json` or `yarn.lock`) to ensure consistent builds across environments.

## Links

- [Angular Deployment Guide](https://angular.io/guide/deployment): Official Angular documentation on deploying applications.
- [Lazy Loading in Angular](https://angular.io/guide/lazy-loading-ngmodules): Best practices for implementing lazy loading.
- [Security Best Practices in Angular](https://angular.io/guide/security): Angular's official guide to securing applications.
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer): Tool for visualizing bundle size and dependencies.

## Proof / Confidence

- **Industry Standards**: Production mode and AOT compilation are recommended in Angular's official documentation for performance optimization.
- **Benchmarks**: Applications using lazy loading and optimized bundles show up to 50% faster initial load times.
- **Common Practice**: Security headers and error monitoring are widely adopted in production environments to prevent vulnerabilities and ensure application reliability.
