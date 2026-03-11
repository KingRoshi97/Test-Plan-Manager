---
kid: "KID-LANG-NEXT-NEXT-0007"
title: "Deployment Notes (Next)"
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
  - "e"
  - "x"
  - "t"
  - "j"
  - "s"
  - "]"
industry_refs: []
stack_family_refs:
  - "nextjs"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "n"
  - "e"
  - "x"
  - "t"
  - "j"
  - "s"
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
  - "v"
  - "e"
  - "r"
  - "c"
  - "e"
  - "l"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/nextjs/frameworks/nextjs/KID-LANG-NEXT-NEXT-0007.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Deployment Notes (Next)

# Deployment Notes (Next)

## Summary
This document provides reference notes for deploying Next.js applications, focusing on configuration, best practices, and troubleshooting. It covers deployment scenarios for both server-side rendering (SSR) and static site generation (SSG), with emphasis on optimizing performance and ensuring compatibility with hosting environments.

## When to Use
- Deploying Next.js applications to production environments such as Vercel, AWS, or custom servers.
- Configuring SSR or SSG workflows for scalable web applications.
- Optimizing build and runtime performance for Next.js applications.
- Debugging deployment issues related to environment variables, routing, or build processes.

## Do / Don't

### Do:
1. **Use `next build`** to generate an optimized production build before deployment.
2. **Define environment variables** in `.env.local` or through hosting platform-specific configuration tools.
3. **Enable caching** for static assets by configuring headers in your hosting environment.

### Don't:
1. **Don't expose sensitive environment variables** in the client-side code (`NEXT_PUBLIC_*` variables are safe for client use; others are not).
2. **Don't skip testing locally** with `next start` to verify the production build before deploying.
3. **Don't hardcode absolute URLs**; use dynamic routing and the `next.config.js` `basePath` option for flexibility.

## Core Content

### Key Definitions
- **SSR (Server-Side Rendering):** Pages are rendered on the server at request time, enabling dynamic content.
- **SSG (Static Site Generation):** Pages are pre-rendered at build time, offering faster load times for static content.
- **Incremental Static Regeneration (ISR):** Allows Next.js to update static content after deployment without rebuilding the entire application.

### Deployment Parameters
| Parameter                  | Description                                                                 | Example Value                   |
|----------------------------|-----------------------------------------------------------------------------|---------------------------------|
| `NODE_ENV`                 | Sets the environment mode (`development` or `production`).                 | `production`                   |
| `NEXT_PUBLIC_API_URL`      | Public-facing API endpoint for client-side requests.                       | `https://api.example.com`      |
| `ASSET_PREFIX`             | Specifies a prefix for serving static assets.                             | `/static`                      |
| `basePath` (next.config.js)| Configures a base URL path for the application.                            | `/my-app`                      |

### Configuration Options
1. **`next.config.js`:**  
   - Use the `output` property to configure build outputs (`standalone` for containerized deployment).  
     ```javascript
     module.exports = {
       output: 'standalone',
     };
     ```
   - Define redirects and rewrites for custom routing.  
     ```javascript
     module.exports = {
       async redirects() {
         return [
           { source: '/old-route', destination: '/new-route', permanent: true },
         ];
       },
     };
     ```

2. **Environment Variables:**  
   - Store sensitive variables in `.env.local` and public variables prefixed with `NEXT_PUBLIC_`.  
     ```
     DATABASE_URL=postgres://user:password@host:5432/db
     NEXT_PUBLIC_API_URL=https://api.example.com
     ```

3. **Static Assets:**  
   - Place static files in the `/public` directory for direct access.  
   - Configure caching headers in your hosting platform for optimal performance.

### Hosting Considerations
- **Vercel:** Native support for Next.js, including automatic builds and deployment.  
- **AWS Lambda:** Use the `output: 'standalone'` configuration for deploying Next.js as serverless functions.  
- **Custom Servers:** Use `next start` for serving production builds. Ensure proper routing and middleware setup.

### Common Issues
1. **Build Errors:** Ensure all dependencies are installed and compatible with the current Next.js version.  
2. **Routing Failures:** Verify `next.config.js` configurations for redirects, rewrites, or base paths.  
3. **Environment Mismatch:** Confirm that production environment variables are correctly set in the hosting platform.

## Links
- **Next.js Documentation:** Official guide for deployment configurations and hosting.  
- **Vercel Deployment Guide:** Best practices for deploying Next.js applications to Vercel.  
- **Incremental Static Regeneration:** Explanation and examples for using ISR in Next.js.  
- **Environment Variables in Next.js:** Detailed documentation on managing environment variables securely.

## Proof / Confidence
This reference is based on the official Next.js documentation, industry best practices for JavaScript/TypeScript development, and widely adopted deployment workflows. Next.js is a mature framework with extensive community support and benchmarks demonstrating its suitability for modern web applications.
