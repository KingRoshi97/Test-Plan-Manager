---
kid: "KID-LANG-NEXT-NEXT-0002"
title: "App Structure Pattern (app router)"
content_type: "pattern"
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
  - "a"
  - "p"
  - "p"
  - "-"
  - "r"
  - "o"
  - "u"
  - "t"
  - "e"
  - "r"
  - ","
  - " "
  - "s"
  - "t"
  - "r"
  - "u"
  - "c"
  - "t"
  - "u"
  - "r"
  - "e"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/nextjs/frameworks/nextjs/KID-LANG-NEXT-NEXT-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# App Structure Pattern (app router)

# App Structure Pattern (App Router)

## Summary

The App Structure Pattern, commonly referred to as the "App Router" pattern, is a design approach for organizing the routing and structure of modern web applications built with frameworks like Next.js. It leverages file-based routing to create a clean, scalable, and maintainable architecture for handling navigation and dynamic content. This pattern solves the challenge of managing complex application routing while ensuring clear separation of concerns and optimized performance.

---

## When to Use

- When building a Next.js application that requires dynamic, nested, or static routes.
- When the application has a modular structure with reusable components and clear separation of UI and logic.
- When server-side rendering (SSR), static site generation (SSG), or client-side rendering (CSR) is required for different parts of the app.
- When you need to handle dynamic parameters (e.g., `/product/[id]`) or API routes efficiently.
- When building a project that demands scalability and maintainability as it grows in complexity.

---

## Do / Don't

### Do
1. **Use the `/app` directory** in Next.js 13+ for implementing the App Router pattern, as it provides built-in support for server components and layouts.
2. **Organize files by route segments** to maintain a clear and logical folder structure (e.g., `/app/dashboard/settings` for nested routes).
3. **Leverage layouts and nested layouts** to share UI components (e.g., headers or sidebars) across multiple pages.
4. **Use `loading.js` and `error.js`** files for handling loading states and errors at the route level.
5. **Utilize dynamic routes** (e.g., `[id]`) and catch-all routes (`[...slug]`) for flexible routing.

### Don't
1. **Don't mix `/pages` and `/app` directories** in the same project, as this can lead to conflicts and confusion.
2. **Don't hard-code navigation paths**; instead, use the `next/link` component or `useRouter` hook for dynamic navigation.
3. **Don't overuse client-side components** in the App Router; prefer server components for better performance and reduced client-side JavaScript.
4. **Don't ignore route-specific data fetching**; use `getServerSideProps` or `generateStaticParams` for optimized data fetching.
5. **Don't create deeply nested folders without a clear purpose**, as this can make the structure harder to navigate.

---

## Core Content

The App Router pattern in Next.js 13+ introduces a new way to organize routes and manage application structure. It replaces the traditional `/pages` directory with an `/app` directory, enabling file-based routing with additional features like layouts, server components, and route-level configurations.

### Key Concepts

1. **File-Based Routing**  
   - Each folder in the `/app` directory corresponds to a route. For example:
     ```
     /app
       /dashboard
         /settings
           page.js    // Renders the /dashboard/settings route
     ```
   - Dynamic routes are created using square brackets, e.g., `[id]` for `/product/[id]`.

2. **Layouts**  
   - Layouts allow you to share UI components across multiple routes. For example:
     ```
     /app
       layout.js       // Shared layout for all routes
       /dashboard
         layout.js     // Nested layout for dashboard routes
         page.js       // Renders the /dashboard route
     ```
   - Layouts are persistent, meaning they don’t re-render when navigating between child routes.

3. **Server and Client Components**  
   - By default, components in the App Router are server components, which are rendered on the server for better performance.
   - Use the `use client` directive at the top of a file to mark it as a client component when interactivity is needed.

4. **Route-Level Loading and Error Handling**  
   - Add `loading.js` to show a loading state while the route is being fetched.
   - Add `error.js` to handle errors specific to a route.

5. **Data Fetching**  
   - Use `generateStaticParams` for static site generation (SSG).
   - Use server-side functions like `fetch` directly in server components for SSR.

### Implementation Steps

1. **Set Up the `/app` Directory**  
   Create an `/app` directory in the root of your project. Organize routes as folders and include `page.js` files for each route.

2. **Add Layouts**  
   Add a `layout.js` file in the `/app` directory for a global layout. For nested layouts, add `layout.js` files in subdirectories.

3. **Handle Dynamic Routes**  
   Create dynamic routes using square brackets. For example, `/app/product/[id]/page.js` handles routes like `/product/123`.

4. **Implement Data Fetching**  
   Use server-side functions directly in server components or define `generateStaticParams` for static routes.

5. **Optimize Performance**  
   Use server components wherever possible and minimize client-side JavaScript.

---

## Links

- **Next.js Routing Documentation**: Learn about file-based routing and the App Router in Next.js.
- **Layouts in Next.js**: Understand how to use layouts for shared UI across routes.
- **Dynamic Routes**: Explore how to create dynamic and nested routes in Next.js.
- **Server and Client Components**: Learn the difference between server and client components and when to use each.

---

## Proof / Confidence

The App Router pattern is officially supported and recommended by the Next.js team as of version 13. It aligns with modern web development practices, including server-side rendering, static site generation, and modular architecture. This pattern is widely adopted in production applications for its scalability, maintainability, and performance benefits.
