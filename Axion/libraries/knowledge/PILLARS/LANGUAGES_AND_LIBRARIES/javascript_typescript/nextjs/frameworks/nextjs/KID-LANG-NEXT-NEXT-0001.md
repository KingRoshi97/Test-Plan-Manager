---
kid: "KID-LANG-NEXT-NEXT-0001"
title: "Next.js Overview (routing + rendering modes)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript, nextjs]
subdomains: []
tags: [nextjs, routing, rendering, ssr, ssg]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Next.js Overview (routing + rendering modes)

# Next.js Overview (Routing + Rendering Modes)

## Summary

Next.js is a React-based framework for building modern web applications, offering powerful features such as file-based routing and multiple rendering modes (Static Site Generation, Server-Side Rendering, and Client-Side Rendering). These capabilities enable developers to create performant, scalable, and SEO-friendly applications with minimal configuration. By understanding its routing and rendering paradigms, developers can optimize their applications for different use cases.

---

## When to Use

- **SEO-critical applications**: Use Next.js when you need server-rendered or statically generated pages to improve search engine visibility.
- **Dynamic, data-driven apps**: Ideal for applications requiring server-side data fetching or dynamic routing, such as e-commerce platforms.
- **Hybrid rendering needs**: When your app requires a mix of static and dynamic content, Next.js allows combining different rendering modes.
- **Performance-focused projects**: Use Next.js to leverage features like automatic code-splitting, image optimization, and prefetching for faster load times.

---

## Do / Don't

### Do:
1. **Use file-based routing**: Organize your pages in the `pages/` directory to take advantage of Next.js's automatic route generation.
2. **Leverage hybrid rendering**: Combine Static Site Generation (SSG) and Server-Side Rendering (SSR) for optimal performance and flexibility.
3. **Optimize for performance**: Use Next.js features like Image Optimization (`next/image`) and built-in analytics to improve user experience.

### Don't:
1. **Overuse SSR**: Avoid server-side rendering for pages that don't need dynamic, per-request data to reduce server load and latency.
2. **Ignore static generation**: Don't skip SSG for static content; it provides faster load times and better scalability.
3. **Modify the `node_modules` folder**: Avoid directly editing dependencies; use Next.js's configuration files (`next.config.js`) for customizations.

---

## Core Content

### File-Based Routing

Next.js uses a file-based routing system that maps files in the `pages/` directory to application routes. For example:
- `pages/index.js` maps to `/`
- `pages/about.js` maps to `/about`
- Nested folders create nested routes, e.g., `pages/blog/post.js` maps to `/blog/post`.

Dynamic routes are defined using square brackets (`[param]`). For instance:
- `pages/product/[id].js` maps to `/product/:id`, where `id` is a dynamic parameter. You can access this parameter via the `useRouter` hook or `getServerSideProps`/`getStaticProps`.

### Rendering Modes

Next.js supports three primary rendering modes, each suited for specific use cases:

1. **Static Site Generation (SSG)**:
   - Pages are generated at build time and served as static files.
   - Use `getStaticProps` to fetch data at build time.
   - Example:
     ```javascript
     export async function getStaticProps() {
       const data = await fetch('https://api.example.com/data');
       return { props: { data } };
     }
     ```
   - Best for content that doesn’t change frequently, like blogs or marketing pages.

2. **Server-Side Rendering (SSR)**:
   - Pages are rendered on the server for every request.
   - Use `getServerSideProps` to fetch data during the request lifecycle.
   - Example:
     ```javascript
     export async function getServerSideProps(context) {
       const data = await fetch(`https://api.example.com/data/${context.params.id}`);
       return { props: { data } };
     }
     ```
   - Ideal for dynamic pages requiring up-to-date data, like dashboards or user-specific content.

3. **Client-Side Rendering (CSR)**:
   - Pages are rendered on the client after fetching data via APIs.
   - Example:
     ```javascript
     import { useEffect, useState } from 'react';

     function Page() {
       const [data, setData] = useState(null);

       useEffect(() => {
         fetch('/api/data')
           .then((res) => res.json())
           .then((data) => setData(data));
       }, []);

       return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
     }
     ```
   - Best for highly interactive pages or single-page applications (SPAs).

### Combining Rendering Modes

Next.js allows hybrid rendering, enabling you to use different modes for different pages within the same application. For example, you can use SSG for blog posts, SSR for a user dashboard, and CSR for a chat feature.

### Why It Matters

- **Performance**: Static pages load faster and can be served via a CDN, reducing latency.
- **SEO**: Pre-rendered pages improve search engine indexing.
- **Developer Experience**: Next.js simplifies complex tasks like routing and rendering, allowing developers to focus on building features.

---

## Links

- **Next.js Documentation**: Comprehensive guide to Next.js features and APIs.
- **React Official Docs**: Learn the fundamentals of React, which Next.js builds upon.
- **Static vs. Server Rendering**: Detailed comparison of rendering strategies in modern web development.
- **Next.js Routing**: Deep dive into file-based routing and dynamic routes.

---

## Proof / Confidence

Next.js is widely adopted by industry leaders, including Vercel (its creator), Netflix, GitHub, and Hulu, due to its performance and developer-friendly features. The framework adheres to modern web standards, such as server-side rendering and static generation, which are recommended by Google for SEO. Benchmarks consistently show Next.js applications outperform traditional server-rendered or client-rendered React apps in terms of load time and scalability.
