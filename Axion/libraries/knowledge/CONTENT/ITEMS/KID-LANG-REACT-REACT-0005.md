---
kid: "KID-LANG-REACT-REACT-0005"
title: "Performance Checklist (React)"
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
  - ","
  - " "
  - "r"
  - "e"
  - "n"
  - "d"
  - "e"
  - "r"
  - "i"
  - "n"
  - "g"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/react/frameworks/react/KID-LANG-REACT-REACT-0005.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Performance Checklist (React)

```markdown
# Performance Checklist (React)

## Summary
Optimizing React applications ensures smooth user experiences and efficient resource usage. This checklist provides actionable steps to identify and address performance bottlenecks in React applications, focusing on rendering efficiency, state management, and code practices.

## When to Use
- When building or maintaining React applications with noticeable performance issues.
- During code reviews to enforce best practices for performance.
- Before deploying applications to production to ensure optimal performance.
- When scaling an application to handle increased user traffic or data.

## Do / Don't

### Do:
- **Do memoize expensive computations** using `React.memo`, `useMemo`, or `useCallback` where appropriate.
- **Do use lazy loading** for components, images, and routes to reduce initial load time.
- **Do minimize re-renders** by managing state and props effectively.

### Don't:
- **Don't pass unnecessary props** to child components, as it can trigger unnecessary re-renders.
- **Don't overuse context** for frequently changing state; use libraries like Zustand or Redux for better performance.
- **Don't forget to profile your app** using React DevTools or browser performance tools.

## Core Content

### 1. Optimize Rendering
- **Use `React.memo` for Functional Components**: Wrap components with `React.memo` to prevent unnecessary re-renders when props do not change.  
  **Rationale**: Reduces the number of renders for components that receive the same props repeatedly.
  
- **Use `useCallback` and `useMemo`**: Memoize functions and expensive computations in functional components.  
  **Rationale**: Prevents re-creation of functions or recalculations on every render.

- **Avoid Anonymous Functions in JSX**: Define event handlers outside of JSX to prevent creating new functions on every render.  
  **Rationale**: Anonymous functions cause child components to re-render unnecessarily.

### 2. Optimize State Management
- **Lift State Only When Necessary**: Keep state as close to the component that uses it as possible.  
  **Rationale**: Reduces the number of components that re-render when state changes.

- **Batch State Updates**: React automatically batches state updates in event handlers. Avoid multiple consecutive `setState` calls.  
  **Rationale**: Reduces the number of renders and improves performance.

- **Use Immutable Patterns**: Avoid mutating state directly; always return a new object or array.  
  **Rationale**: Ensures React can detect changes and update the UI efficiently.

### 3. Optimize Component Structure
- **Split Large Components**: Break down large components into smaller, reusable ones.  
  **Rationale**: Improves readability and allows React to optimize updates.

- **Use Code Splitting**: Use React’s `React.lazy` and `Suspense` to load components only when needed.  
  **Rationale**: Reduces the initial bundle size and improves load time.

- **Avoid Over-Nesting Components**: Keep the component tree shallow where possible.  
  **Rationale**: Reduces the complexity of reconciliation and improves rendering performance.

### 4. Optimize Asset Loading
- **Use Lazy Loading for Images**: Use libraries like `react-lazyload` or the native `loading="lazy"` attribute.  
  **Rationale**: Improves initial page load time by deferring off-screen images.

- **Preload Critical Assets**: Use `<link rel="preload">` for fonts and critical assets.  
  **Rationale**: Ensures critical resources are available sooner.

### 5. Measure and Profile
- **Use React DevTools**: Use the "Profiler" tab to identify slow components and unnecessary renders.  
  **Rationale**: Provides insights into component performance and helps pinpoint bottlenecks.

- **Analyze Bundle Size**: Use tools like `webpack-bundle-analyzer` or `Source Map Explorer` to identify large dependencies.  
  **Rationale**: Reduces the overall size of the application, improving load times.

- **Monitor Runtime Performance**: Use browser performance tools to measure JavaScript execution, rendering, and network activity.  
  **Rationale**: Identifies runtime issues beyond React’s scope.

## Links
- **React Official Documentation**: Comprehensive guide to React’s performance features and best practices.
- **React DevTools Profiler**: Tool for profiling React applications and identifying performance bottlenecks.
- **Webpack Bundle Analyzer**: Tool for visualizing the size of webpack output files.
- **MDN Web Docs on Lazy Loading**: Guide to native lazy loading for images and iframes.

## Proof / Confidence
- **React Documentation**: The React team recommends practices like memoization, lazy loading, and state management optimizations.
- **Industry Benchmarks**: Profiling tools like React DevTools and browser developer tools are widely used by developers to measure performance.
- **Case Studies**: Many companies (e.g., Netflix, Airbnb) have published performance optimization case studies highlighting the effectiveness of these techniques.
```
