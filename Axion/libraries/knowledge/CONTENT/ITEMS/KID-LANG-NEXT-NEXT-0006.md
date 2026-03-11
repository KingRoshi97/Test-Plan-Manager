---
kid: "KID-LANG-NEXT-NEXT-0006"
title: "Performance Checklist (Next)"
content_type: "checklist"
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
  - "p"
  - "e"
  - "r"
  - "f"
  - "o"
  - "r"
  - "m"
  - "a"
  - "n"
  - "c"
  - "e"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/nextjs/frameworks/nextjs/KID-LANG-NEXT-NEXT-0006.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Performance Checklist (Next)

# Performance Checklist (Next)

## Summary
This checklist provides actionable steps to optimize the performance of applications built with Next.js, focusing on JavaScript and TypeScript best practices. It covers server-side rendering (SSR), static site generation (SSG), API routes, and client-side rendering techniques to ensure fast load times, efficient resource usage, and scalability.

## When to Use
Use this checklist when:
- Building or maintaining a Next.js application.
- Preparing for production deployment.
- Diagnosing performance bottlenecks in your Next.js application.
- Optimizing for SEO, user experience, or scalability.

## Do / Don't

### Do
1. **Do enable automatic static optimization**: Use static site generation (SSG) for pages that don’t require dynamic data. This improves load times and reduces server workload.
2. **Do use `getStaticProps` and `getServerSideProps` appropriately**: Choose the right data-fetching method based on whether the data is static or dynamic.
3. **Do optimize images with Next.js `next/image`**: Use built-in image optimization to reduce bandwidth usage and improve page load speed.
4. **Do leverage caching headers**: Set proper caching headers for static assets and API responses to minimize repeated network requests.
5. **Do analyze bundle size**: Use tools like `next build` and `webpack-bundle-analyzer` to identify and reduce large dependencies.

### Don't
1. **Don't overuse `getServerSideProps`**: Avoid SSR for pages that don’t need dynamic data on every request, as it increases server load and response time.
2. **Don't block rendering with large client-side libraries**: Avoid importing heavy libraries directly in components; use dynamic imports or code splitting instead.
3. **Don't forget to clean up unused code**: Remove unused dependencies, components, and styles to reduce bundle size.
4. **Don't skip preloading critical resources**: Ensure key assets like fonts and scripts are preloaded to avoid render-blocking.
5. **Don't ignore performance monitoring**: Use tools like Lighthouse or Web Vitals to continuously track and improve performance metrics.

## Core Content

### Optimize Data Fetching
- Use **`getStaticProps`** for static content that doesn’t change often (e.g., blog posts, product pages). This ensures the page is generated at build time and served as static HTML.
- Use **`getServerSideProps`** for pages requiring dynamic data on every request (e.g., dashboards with real-time data). Be mindful of the server load this can create.
- Avoid fetching data directly in React components unless necessary; prefer server-side methods for better SEO and performance.

### Optimize Images and Assets
- Use the **`next/image`** component for automatic image optimization, including lazy loading, resizing, and format conversion (e.g., WebP).
- Compress and optimize static assets (e.g., fonts, icons) using tools like ImageMagick or SVGO before adding them to your project.
- Preload critical assets (e.g., fonts) using `<link rel="preload">` in the `<Head>` component.

### Reduce JavaScript and Bundle Size
- Analyze your bundle using **Webpack Bundle Analyzer** to identify large dependencies and unused code.
- Use **dynamic imports** (`import()` syntax) to split code and load components only when needed.
- Avoid including heavy libraries (e.g., lodash, moment.js) unless absolutely necessary. Use lightweight alternatives like `date-fns` or tree-shakable versions of libraries.

### Optimize Rendering
- Implement **React.memo** and **useMemo** to avoid unnecessary re-renders of components.
- Use **dynamic imports** for components that are not immediately visible (e.g., modals, charts).
- Minimize the use of global state unless necessary; prefer context or local state for components.

### API Optimization
- Use **API routes** in Next.js for serverless functions. Ensure API responses are cached using HTTP headers like `Cache-Control`.
- Minimize the payload size of API responses by only sending necessary data.
- Use pagination or infinite scrolling for large datasets to reduce the amount of data fetched at once.

### Monitoring and Testing
- Regularly test performance using tools like **Google Lighthouse**, **Web Vitals**, or **PageSpeed Insights**.
- Monitor server-side performance using APM tools like **New Relic** or **Datadog**.
- Set up error tracking and logging with tools like **Sentry** to quickly identify and resolve performance issues.

## Links
- **Next.js Documentation**: Official guidelines for optimizing Next.js applications.
- **Web Vitals**: Key metrics for measuring user experience and performance.
- **Webpack Bundle Analyzer**: Tool for analyzing and optimizing JavaScript bundle size.
- **Google Lighthouse**: Performance auditing tool for web applications.

## Proof / Confidence
This checklist is based on industry standards and best practices for optimizing Next.js applications. Techniques like static site generation (SSG) and image optimization are recommended by the Next.js documentation and widely adopted by developers. Performance monitoring tools like Lighthouse and Web Vitals are endorsed by Google and provide measurable benchmarks for web application performance.
