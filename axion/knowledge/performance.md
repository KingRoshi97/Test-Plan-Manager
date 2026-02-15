# Performance Best Practices

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## Loading Performance

### Bundle Size and Code Delivery
- Target: < 200KB initial JavaScript (gzipped)
- Use code splitting for routes (React.lazy + Suspense)
- Tree-shake unused imports (Vite/webpack handle this automatically)
- Analyze bundle with `vite-plugin-visualizer` or `webpack-bundle-analyzer`
- Avoid importing entire utility libraries (import specific functions from lodash-es, not lodash)

### Tree Shaking and Dead Code Elimination
- Use ES module imports (`import { x } from`) not CommonJS (`require`)
- Mark packages as side-effect-free in `package.json` (`"sideEffects": false`)
- Avoid barrel files (`index.ts` re-exports) that defeat tree shaking
- Audit bundle output to verify unused code is excluded

### Minification and Source Maps
- Minify all production JavaScript and CSS (Vite handles this by default)
- Use terser or esbuild for JS minification with sensible defaults
- Generate source maps for production error tracking but do not serve them publicly
- Use `hidden-source-map` for Sentry integration without exposing source

### Third-Party Script Impact
- Audit third-party scripts: analytics, chat widgets, tracking pixels
- Load non-critical third-party scripts with `async` or `defer`
- Self-host critical third-party resources where possible (fonts, analytics)
- Set a performance budget for third-party JS (< 50KB total)
- Use `rel="preconnect"` for critical third-party origins

### Font Loading Strategy
- Preload critical fonts: `<link rel="preload" as="font" crossorigin>`
- Subset fonts to include only needed character ranges (Latin, etc.)
- Use `font-display: swap` to prevent invisible text during load
- Limit font families to 2-3 maximum; limit weights/styles to what's used
- Prefer variable fonts for multiple weight needs (one file vs many)

### Image Strategy
- Use modern formats: WebP (90%+ browser support), AVIF (growing support)
- Responsive images: `srcset` with appropriate size breakpoints
- Lazy load below-the-fold images: `loading="lazy"`
- Set explicit `width` and `height` to prevent CLS
- Serve images from CDN with appropriate cache headers
- Compress: 80% quality for photos, lossless for graphics/icons
- Use `<picture>` element for art direction and format fallbacks

### Cache Busting and Versioning
- Use content hashing in filenames for cache busting (Vite does this by default)
- Set appropriate Cache-Control headers for static assets (`max-age=31536000, immutable`)
- Use short cache TTL for HTML (`no-cache` or `max-age=300`)
- Implement stale-while-revalidate for API responses where appropriate

### App Shell Optimization
- Inline critical CSS for above-the-fold content
- Prerender the app shell (header, sidebar, layout) for instant first paint
- Defer non-critical resources until after initial render
- Use service workers to cache the app shell for repeat visits

## Runtime Performance

### Render Path Optimization
- Avoid expensive computations in the render path — move to `useMemo` or worker
- Do not create objects or arrays inline in JSX props (breaks referential equality)
- Extract static data outside component bodies

### Stabilize Props and Callbacks
- Use `useCallback` for event handlers passed to memoized children
- Use `useMemo` for derived/computed values used in child props
- Only apply when measurably needed — profile before optimizing

### Component Render Isolation
- Split large components into smaller ones to limit re-render scope
- Use `React.memo` for expensive components that receive stable props
- Consider component boundary placement around expensive subtrees
- Move frequently-changing state as close to where it's used as possible

### Transitions and Deferred Rendering
- Use `useTransition` for non-urgent state updates (filtering, tab switching)
- Use `useDeferredValue` for values that can lag behind input
- Keep urgent updates (typing, clicking) fast; defer secondary UI updates

### Batch State Updates
- React 18+ batches state updates automatically in event handlers and effects
- Avoid forcing synchronous re-renders with `flushSync` unless absolutely necessary
- Combine related state into single state objects to reduce update frequency

### Optimize Selectors and Derived State
- Memoize selectors in global state (Zustand, Redux) to prevent recomputation
- Derive state at read time, not write time, to keep stores simple
- Avoid storing computed values in state — compute from source of truth

### Throttle High-Frequency Events
- Debounce search inputs (300ms) and resize handlers
- Throttle scroll handlers, mousemove, and pointer events
- Use `requestAnimationFrame` for visual updates, not `setTimeout`
- Virtualize long lists (TanStack Virtual, react-window): render only visible items

## Network Performance

### HTTP Connection Reuse
- Enable HTTP/2 (multiplexing eliminates need for domain sharding/sprite sheets)
- Use persistent connections (keep-alive) for API requests
- Minimize the number of distinct origins the page connects to

### Resource Hints
- Use `preconnect` for third-party origins: `<link rel="preconnect" href="...">`
- Use `preload` for critical resources: `<link rel="preload" as="font" href="...">`
- DNS prefetch for likely-needed domains: `<link rel="dns-prefetch" href="...">`
- Prefetch next-page resources for predictable navigation paths

### Request Priority and Fetching
- Prioritize above-the-fold content requests over below-fold
- Use `fetchpriority="high"` on LCP images
- Batch related requests into single endpoints where practical
- Support partial responses (field selection: `?fields=id,name,email`)
- Use ETags for conditional requests (304 Not Modified saves bandwidth)
- Implement request deduplication on the client

### Reduce Over-Fetching
- Fetch only needed fields (select specific columns, not `SELECT *`)
- Use pagination — never fetch unbounded lists
- Implement GraphQL or field selection for flexible client queries
- Cache API responses client-side with TanStack Query (default staleTime, gcTime)

### Compression
- Compress all responses with brotli (preferred) or gzip
- Verify compression is applied to JSON, HTML, CSS, JS responses
- Do not compress already-compressed formats (images, video, zip)

### Real-time Update Optimization
- Send diffs/patches instead of full state refreshes over WebSocket
- Use delta encoding for frequently updated data
- Throttle real-time updates to match UI refresh rate (60fps max)
- Batch WebSocket messages to reduce per-message overhead

### Background Sync and Offline
- Schedule non-urgent sync operations during idle time
- Queue failed requests for retry when connection is restored
- Implement offline-aware fetching with service worker cache fallback
- Show stale cached data with "last updated" timestamp

## Rendering Performance

### Avoid Forced Synchronous Layout
- Do not read layout properties (offsetHeight, getBoundingClientRect) then write styles in the same frame
- Batch DOM reads, then batch DOM writes
- Use `requestAnimationFrame` to separate read and write phases

### Reduce DOM Complexity
- Keep DOM depth shallow (< 32 levels recommended)
- Minimize total DOM nodes (< 1500 for optimal performance)
- Avoid deeply nested CSS selectors that force expensive style recalculation
- Remove off-screen DOM elements or use `content-visibility: auto`

### Content Visibility and Containment
- Use `contain: layout` on independent components to limit layout recalculation
- Use `content-visibility: auto` for below-fold sections (skip rendering until visible)
- Set `contain-intrinsic-size` to prevent layout shift when sections become visible

### Defer Non-Critical Rendering
- Lazy-render below-fold content on scroll or intersection observer
- Use placeholder/skeleton UI for deferred content areas
- Prioritize interactive elements above the fold

### Layout Stability (CLS)
- Set explicit dimensions on images, videos, embeds, and ads
- Reserve space for dynamic content (banners, injected elements)
- Avoid inserting content above existing content after initial render
- Use `transform` animations instead of `top`/`left`/`width`/`height`

## CSS Performance
- Avoid CSS-in-JS in production builds (runtime overhead)
- Use Tailwind CSS or CSS Modules (build-time optimization)
- Minimize use of expensive selectors (deeply nested, universal, attribute)
- Avoid `@import` in CSS — use bundler imports instead
- Purge unused CSS in production builds

## Memory and Stability

### Data Retention
- Avoid retaining large cached datasets indefinitely — set TTL or max size
- Revoke object URLs (`URL.revokeObjectURL`) after use for blobs
- Limit in-memory media blobs — stream instead of buffering entire files
- Use `WeakRef` or `WeakMap` for caches that should not prevent garbage collection

### Subscription and Timer Cleanup
- Dispose all subscriptions (event listeners, WebSocket, observables) in cleanup
- Clear intervals and timeouts in component unmount or effect cleanup
- Avoid creating new timers on every render — guard with refs or state

### Unbounded Growth Prevention
- Cap array/map sizes in caches and state stores
- Implement LRU or FIFO eviction for in-memory caches
- Monitor memory usage in long-running sessions (dashboards, chat apps)
- Periodically flush stale entries from client-side stores

### Timer Storm Prevention
- Avoid setting multiple intervals that overlap or compound
- Use a single shared timer for periodic updates (one interval, multiple subscribers)
- Detect and cancel orphaned timers during error recovery

## Build and Tooling Performance

### Development Build Speed
- Use incremental/hot-module-replacement builds (Vite HMR)
- Leverage build caching (Vite, esbuild, SWC)
- Exclude large dependencies from dev bundle where possible
- Use TypeScript `--incremental` for faster type checking

### Production Build Optimization
- Configure chunk splitting: vendor chunk, per-route chunks, shared chunk
- Set chunk size limits (warn at 500KB, error at 1MB)
- Remove unused dependencies and polyfills before production build
- Use `import()` for lazy loading optional features

### Bundle Analysis
- Run bundle analyzer after each production build
- Track bundle size trends in CI — fail build if budget exceeded
- Identify duplicate dependencies in the bundle
- Verify tree shaking is working for major libraries

### Source Map Strategy
- Hidden source maps for error tracking services (Sentry)
- No source maps served to end users in production
- Full source maps in development for debugging

### CI Performance Checks
- Run Lighthouse CI on every PR for performance regression detection
- Set performance budgets that fail the build: JS size, total size, LCP
- Track build time trends — investigate slowdowns

## Perceived Performance (UX)

### Optimistic UI
- Apply changes optimistically for low-risk actions (likes, toggles, bookmarks)
- Show immediate feedback, revert on server error with clear message
- Use placeholder/skeleton content while data loads

### Progressive Loading
- Show the page shell immediately, fill in data as it arrives
- Load critical content first, defer supplementary content
- Use progressive image loading (blur-up, LQIP)

### Instant Feedback
- Respond to taps/clicks within 100ms (button state change, spinner)
- Show loading indicators for operations taking > 300ms
- Progress bars for operations with known duration (uploads, multi-step)

### Responsiveness Under Load
- Keep UI responsive during heavy computation (use web workers)
- Avoid blocking the main thread for > 50ms (Long Tasks)
- Yield to the browser between chunks of expensive work

### Low-End Device Considerations
- Test on mid-range Android devices (representative of most users)
- Reduce animation complexity on low-end devices
- Consider `Save-Data` header and low data mode preferences
- Provide lighter experiences when device capabilities are limited

## Monitoring and Metrics

### Key Metrics to Track
- Core Web Vitals (LCP, INP, CLS) via web-vitals library
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query duration
- Memory usage and event loop lag (Node.js)
- Slow interactions (INP) — track which interactions are slow
- Frontend-visible API latency (from request initiation to UI update)
- Client-side crash rates and unhandled errors

### Performance Budgets
- Set and enforce budgets in CI/CD
- JavaScript bundle: < 200KB gzipped
- Total page weight: < 1MB for initial load
- Time to Interactive: < 3.5s on 3G connection
- API response: < 200ms p95 for reads
- Define budgets per route for granular control

### Synthetic Monitoring
- Run automated Lighthouse/WebPageTest checks on production URLs
- Test from multiple geographic regions
- Test on simulated slow connections (3G, slow 4G)
- Alert on performance regressions detected by synthetic tests

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
