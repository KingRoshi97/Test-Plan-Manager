# Performance Best Practices

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## Frontend Performance

### Bundle Size
- Target: < 200KB initial JavaScript (gzipped)
- Use code splitting for routes (React.lazy + Suspense)
- Tree-shake unused imports (Vite/webpack handle this automatically)
- Analyze bundle with `vite-plugin-visualizer` or `webpack-bundle-analyzer`
- Avoid importing entire utility libraries (import specific functions from lodash-es, not lodash)

### Image Optimization
- Use modern formats: WebP (90%+ browser support), AVIF (growing support)
- Responsive images: `srcset` with appropriate size breakpoints
- Lazy load below-the-fold images: `loading="lazy"`
- Set explicit `width` and `height` to prevent CLS
- Serve images from CDN with appropriate cache headers
- Compress: 80% quality for photos, lossless for graphics/icons

### CSS Performance
- Avoid CSS-in-JS in production builds (runtime overhead)
- Use Tailwind CSS or CSS Modules (build-time optimization)
- Minimize use of expensive selectors (deeply nested, universal, attribute)
- Use `contain: layout` on independent components to limit layout recalculation

### Rendering
- Use `React.memo` for expensive components that receive stable props
- Use `useMemo` and `useCallback` only when measurably needed (not by default)
- Virtualize long lists (TanStack Virtual, react-window): render only visible items
- Debounce search inputs (300ms) and resize handlers
- Use `requestAnimationFrame` for visual updates, not `setTimeout`

### Caching
- Set appropriate Cache-Control headers for static assets (`max-age=31536000, immutable`)
- Use content hashing in filenames for cache busting (Vite does this by default)
- Implement stale-while-revalidate for API responses where appropriate
- Cache API responses client-side with TanStack Query (default staleTime, gcTime)

## Backend Performance

### Database
- Index columns used in WHERE, JOIN, and ORDER BY clauses
- Use `EXPLAIN ANALYZE` to verify query plans
- Paginate all list endpoints (default 20-50 items per page, max 100)
- Use database connection pooling (PgBouncer or built-in pool, 10-20 connections)
- Avoid N+1 queries: use JOINs or batch loading (DataLoader pattern)
- Cache expensive query results with Redis (TTL based on data freshness needs)

### API Response
- Response time target: p95 < 200ms for reads, p95 < 500ms for writes
- Compress responses with gzip/brotli (Express: `compression` middleware)
- Return only needed fields (select specific columns, not `SELECT *`)
- Use pagination cursors over offset for large datasets
- Implement request coalescing for identical concurrent requests

### Concurrency
- Use worker threads for CPU-intensive operations (image processing, PDF generation)
- Queue long-running jobs (bull/bullmq with Redis) instead of blocking request handlers
- Set request timeouts (30s default, longer for uploads/downloads)
- Implement circuit breakers for external service calls

## Network

### HTTP/2 and Beyond
- Enable HTTP/2 (multiplexing eliminates need for domain sharding/sprite sheets)
- Use `preconnect` for third-party origins: `<link rel="preconnect" href="...">`
- Use `preload` for critical resources: `<link rel="preload" as="font" href="...">`
- DNS prefetch for likely-needed domains: `<link rel="dns-prefetch" href="...">`

### API Design for Performance
- Batch related requests into single endpoints where practical
- Support partial responses (field selection: `?fields=id,name,email`)
- Use ETags for conditional requests (304 Not Modified saves bandwidth)
- Implement request deduplication on the client

## Monitoring

### Key Metrics to Track
- Core Web Vitals (LCP, INP, CLS) via web-vitals library
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query duration
- Memory usage and event loop lag (Node.js)

### Performance Budgets
- Set and enforce budgets in CI/CD
- JavaScript bundle: < 200KB gzipped
- Total page weight: < 1MB for initial load
- Time to Interactive: < 3.5s on 3G connection
- API response: < 200ms p95 for reads
