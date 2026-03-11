---
kid: "KID-LANG-REACT-REACT-0007"
title: "Deployment Notes (React SPA)"
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
  - "r"
  - "e"
  - "a"
  - "c"
  - "t"
  - "]"
industry_refs: []
stack_family_refs:
  - "react"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "r"
  - "e"
  - "a"
  - "c"
  - "t"
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
  - "s"
  - "p"
  - "a"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/react/frameworks/react/KID-LANG-REACT-REACT-0007.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Deployment Notes (React SPA)

```markdown
# Deployment Notes (React SPA)

## Summary
This document provides a reference for deploying a React Single Page Application (SPA) to production. It covers key configurations, best practices, and common pitfalls to ensure a seamless deployment process. The focus is on static hosting environments and integration with modern CI/CD pipelines.

## When to Use
- Deploying a React SPA to production on static hosting platforms like Netlify, Vercel, or AWS S3.
- Configuring deployment pipelines for React SPAs in CI/CD tools like GitHub Actions, CircleCI, or Jenkins.
- Troubleshooting issues with routing, caching, or environment variables in production.

## Do / Don't

### Do:
1. **Use a CDN**: Deploy your React SPA on a Content Delivery Network (CDN) for better performance and scalability.
2. **Enable gzip or Brotli compression**: Ensure assets are compressed to reduce payload size.
3. **Set proper cache headers**: Use `Cache-Control` headers to manage browser caching effectively.
4. **Use environment variables**: Configure environment-specific settings using `.env` files or build-time variables.
5. **Test the production build locally**: Use `serve` or similar tools to verify the production build before deployment.

### Don’t:
1. **Hardcode API URLs**: Use environment variables instead of hardcoding backend endpoints.
2. **Ignore routing configurations**: Ensure the web server is configured to handle client-side routing (e.g., fallback to `index.html` for React Router).
3. **Expose sensitive data**: Avoid exposing secrets or sensitive information in the build artifacts.
4. **Skip source map generation**: Always generate source maps for debugging production issues.
5. **Rely solely on manual deployments**: Automate deployments with CI/CD pipelines to reduce human error.

## Core Content

### Key Definitions
- **React SPA**: A single-page application built using the React library, where routing is handled client-side.
- **Static Hosting**: A hosting environment that serves prebuilt static files (HTML, CSS, JS) without server-side rendering.
- **Build Process**: The process of converting React source code into optimized static assets for production.

### Build Configuration
1. **Build Command**: Use `npm run build` or `yarn build` to generate the production-ready assets in the `build/` directory.
2. **Environment Variables**: Define environment-specific variables in `.env` files (e.g., `.env.production`) and prefix them with `REACT_APP_` for React to recognize them.
   - Example:
     ```
     REACT_APP_API_URL=https://api.example.com
     REACT_APP_ENV=production
     ```
3. **Source Maps**: Ensure `GENERATE_SOURCEMAP=true` is set in `.env` files to generate source maps for debugging.

### Routing Configuration
- For React Router, configure the web server to redirect all requests to `index.html`. Example configurations:
  - **Apache**: Add a `.htaccess` file with:
    ```
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.html [QSA,L]
    ```
  - **Nginx**: Add the following to the server block:
    ```
    location / {
        try_files $uri /index.html;
    }
    ```

### Caching and Compression
1. **Caching**: Use `Cache-Control` headers for static assets:
   - Long-term caching for hashed files (e.g., `main.[hash].js`): `Cache-Control: max-age=31536000, immutable`
   - No caching for `index.html`: `Cache-Control: no-cache`
2. **Compression**: Enable gzip or Brotli compression on the web server to reduce asset size.

### Deployment Platforms
- **Netlify**: Drag and drop the `build/` folder or configure the deployment settings with:
  - Build command: `npm run build`
  - Publish directory: `build/`
- **Vercel**: Use the Vercel CLI or Git integration. Vercel automatically detects React applications.
- **AWS S3 + CloudFront**:
  - Upload the `build/` folder to an S3 bucket.
  - Configure CloudFront to serve assets and handle routing.

### CI/CD Integration
- Example GitHub Actions workflow:
  ```yaml
  name: Deploy React App
  on:
    push:
      branches:
        - main
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout code
          uses: actions/checkout@v3
        - name: Install dependencies
          run: npm install
        - name: Build React app
          run: npm run build
        - name: Deploy to Netlify
          uses: nwtgck/actions-netlify@v2
          with:
            publish-dir: './build'
            production-deploy: true
  ```

## Links
- **React Documentation**: Official React deployment guide.
- **Netlify Deployment Guide**: Best practices for deploying React apps on Netlify.
- **Nginx Configuration for SPAs**: Example configurations for hosting SPAs with Nginx.
- **GitHub Actions Documentation**: Automating workflows with GitHub Actions.

## Proof / Confidence
This content is based on industry best practices and official documentation from React, Netlify, and Nginx. The configurations and recommendations are widely adopted in production environments and align with modern deployment standards for SPAs.
```
