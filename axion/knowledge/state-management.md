# State Management Best Practices

## State Types and Classification

### Local Component State
- UI-only state scoped to a single component (open/closed, hover, input value)
- Use `useState` for simple values, `useReducer` for complex state transitions
- Keep local unless genuinely needed elsewhere (avoid premature lifting)
- Reset on unmount by default (no persistence needed)

### Global Application State
- Shared across multiple components or pages (user session, theme, sidebar state)
- Use a dedicated store (Zustand, Redux Toolkit, Jotai, Valtio)
- Keep global store minimal — only state that truly needs global access
- Organize by domain slice (auth, ui, notifications) not by component

### Server State (Cache)
- Data fetched from APIs that the server owns (users, orders, products)
- Use TanStack Query, SWR, or Apollo Client for cache management
- Never manually store API data in global state — let the cache layer handle it
- Configure staleTime, gcTime, and refetchOnWindowFocus per query type

### Derived State
- Computed from other state values (filtered list, totals, formatted dates)
- Use `useMemo` for expensive computations, simple inline expressions for cheap ones
- Never store derived state — compute it on demand
- Use selectors in stores (Zustand selectors, Redux selectors) for derived global state

### URL State
- State encoded in the URL (query params, path segments, hash)
- Use for shareable/bookmarkable state (filters, pagination, search terms, active tab)
- Sync URL ↔ component state bidirectionally
- Treat URL as source of truth for navigation-relevant state

## State Normalization

### Entity Normalization
- Store entities by ID in flat maps: `{ [id]: entity }` rather than nested arrays
- Reference related entities by ID, not by nesting full objects
- Reduces duplication and ensures consistent updates across the app
- Use a normalization utility or hand-roll for simple cases

### Domain Modeling in State
- Model state to reflect business domain, not UI structure
- Separate domain entities (User, Order) from UI state (isModalOpen, selectedTab)
- Define clear ownership: each piece of state has exactly one source of truth
- Use TypeScript interfaces for all state shapes

### Relationship Handling
- One-to-many: parent stores array of child IDs, children stored separately
- Many-to-many: junction map `{ [parentId]: childId[] }` or normalized join table
- Avoid deep nesting beyond 2 levels — flatten and reference by ID

## State Persistence and Hydration

### Persistence Strategies
- **Memory only**: Default for session-scoped state (resets on refresh)
- **localStorage/sessionStorage**: User preferences, theme, draft form data
- **IndexedDB**: Large datasets, offline-first data, binary blobs
- **Cookies**: Auth tokens (httpOnly, secure), consent flags
- **Server**: Source of truth for business data (always re-fetch or sync)

### Hydration Patterns
- App bootstrap: restore persisted state before first render
- Auth/session hydration: validate stored tokens, restore user profile
- Feature flag hydration: fetch remote config early in app lifecycle
- Handle version mismatches (stored state shape differs from current app version)
- Implement migration logic for breaking state shape changes

### State Serialization
- Only persist serializable data (no functions, DOM refs, class instances)
- Handle date serialization (store as ISO string, parse on hydrate)
- Encrypt sensitive persisted data where meaningful
- Set TTL/expiry for cached data to prevent serving stale state

## State Lifecycle and Ownership

### Initialization
- Define clear initial state for every store/slice
- Distinguish between "not loaded" (undefined/null) and "loaded but empty" (empty array)
- Use loading/error/data pattern for async state initialization
- Gate app rendering until critical state is initialized (auth, feature flags)

### Reset and Cleanup
- Reset relevant state on logout (auth, user-specific data, caches)
- Clean up subscriptions and timers on unmount
- Provide explicit reset actions for stores (e.g., reset filters to defaults)
- Handle account switching (clear all user-scoped state)

### Ownership Rules
- Each piece of state has exactly one owner (one source of truth)
- Owner is responsible for creating, updating, and deleting
- Consumers read via selectors/queries, never mutate directly
- Cross-cutting state (notifications, modals) has a dedicated owner module

## Update Mechanics

### Events, Actions, and Reducers
- Use actions/events to describe intent: `addToCart`, `setFilter`, `dismissNotification`
- Name actions with domain verbs, not setter names (not `setItems` but `loadItems`)
- Reducers/updaters handle state transitions as pure functions
- Keep reducers simple — extract complex logic into service functions

### Immutable Updates
- Always produce new references for updated state (spread, map, filter)
- Never mutate state directly (even in Zustand, use the set function)
- Use Immer for complex nested updates if needed
- Structural sharing: only create new references for changed branches

### Batching and Coalescing
- React 18+ automatically batches state updates in event handlers
- For non-React contexts (setTimeout, async), use `flushSync` or `unstable_batchedUpdates` if needed
- Avoid cascading renders: update multiple related values in a single action
- Debounce high-frequency updates (search input, slider, resize)

## Side Effects and Async Orchestration

### Effect Patterns
- Fetch data on mount or when dependencies change (TanStack Query, useEffect)
- Handle cancellation for abandoned requests (AbortController)
- Distinguish between fire-and-forget effects and effects that update state
- Avoid effects for synchronous derived state (use useMemo instead)

### Async State Modeling
- Model async operations with explicit states: idle → loading → success/error
- Never use boolean pairs (`isLoading` + `isError`) — use a status enum or union type
- Track multiple in-flight operations independently (per-item loading states)
- Support retry with exponential backoff for transient failures

### Cancellation and Race Conditions
- Cancel pending requests when a new request supersedes (search-as-you-type)
- Use AbortController for fetch cancellation
- TanStack Query handles this automatically with `queryKey` changes
- Ignore stale responses (check request ID or use a generation counter)

## Cache Invalidation and Consistency

### Invalidation Strategies
- **Time-based**: staleTime in TanStack Query, TTL in cache layers
- **Event-based**: invalidate on mutation success (invalidateQueries by key)
- **Manual**: explicit refetch button or pull-to-refresh gesture
- **Realtime**: WebSocket/SSE push invalidation for collaborative features

### Optimistic Updates
- Apply mutation result to cache immediately, before server confirms
- Roll back on server error with clear user feedback
- Only for low-risk, frequent actions (like, bookmark, toggle)
- Avoid for critical operations (payments, deletes, permission changes)

### Consistency Patterns
- **Stale-while-revalidate**: serve cached data immediately, refetch in background
- **Cache-and-network**: show cached data, update when fresh data arrives
- **Network-only**: always fetch fresh (for real-time critical data)
- **Cache-first**: use cache if available, fetch only on miss

### Realtime State Sync
- WebSocket/SSE for live updates (chat, notifications, collaborative editing)
- Reconcile server pushes with local cache (merge, not replace)
- Handle reconnection (re-subscribe, fetch missed events)
- Implement presence indicators (who's online, who's editing)

## Status and Error State Modeling

### Loading States
- Distinguish initial load from subsequent refreshes (show skeleton vs. stale data + spinner)
- Per-entity loading states for list items (don't block entire list for one item's mutation)
- Global loading coordination: page-level vs. component-level indicators
- Avoid loading flicker: set minimum display time or use `startTransition`

### Error States
- Model errors with actionable information: type, message, recovery action
- Distinguish recoverable errors (retry, re-auth) from terminal errors (permission denied)
- Clear errors when the user takes corrective action (not on timer)
- Surface errors at the appropriate level: field, form, component, or page

### Empty States
- Distinguish "not loaded" from "loaded but empty"
- Provide helpful empty state messaging with a call to action
- Don't show empty state during initial load (show skeleton instead)

## Performance and Subscriptions

### Selective Subscriptions
- Subscribe to specific slices of state, not entire stores
- Use selectors to narrow rerenders: `useStore(state => state.count)`
- Avoid object/array selectors that create new references every render
- Use shallow equality comparison for object/array selectors

### Memoization
- Memoize expensive derived state computations with `useMemo` or selector libraries
- Memoize callbacks passed to child components with `useCallback`
- Only memoize when profiling shows actual performance benefit
- Don't memoize trivial computations (simple string concatenation, boolean checks)

### Render Optimization
- Split large components to isolate state-dependent sections
- Use React.memo for pure display components receiving stable props
- Lift state updates out of render path (event handlers, effects, not inline)
- Profile with React DevTools Profiler to identify unnecessary rerenders

## State Machines and Workflow Orchestration

### When to Use State Machines
- Multi-step forms/wizards with complex navigation rules
- Workflows with guarded transitions (can't proceed until conditions met)
- Features with many possible states and transitions (media player, checkout flow)
- Processes that need to be recoverable after crash/refresh

### State Machine Patterns
- Define explicit states and valid transitions between them
- Guard transitions with conditions (form valid, payment authorized)
- Use actions on transitions (send email on state change, update DB)
- Libraries: XState for complex machines, simple switch/case for basic flows

### Recoverable Workflows
- Persist workflow state to localStorage or server between steps
- On resume, validate persisted state is still valid
- Allow skipping completed steps and resuming from last incomplete step
- Handle expired workflows (timeout, stale data)

## Feature Delivery Controls

### Feature Flags
- Use feature flags for gradual rollout (on/off, percentage, user segment)
- Evaluate flags at render time, not at build time
- Provide defaults for flag-fetch failures (fail closed for risky features)
- Clean up old flags after full rollout (tech debt)

### Kill Switches
- Remote capability to disable broken features without redeploying
- Check kill switch state early in feature code path
- Show graceful fallback when feature is killed (not a blank area)

## Client Storage Strategy

### Storage Decision Matrix
| Data Type | Storage | Example |
|-----------|---------|---------|
| Session tokens | httpOnly cookie | JWT refresh token |
| User preferences | localStorage | Theme, language, density |
| Form drafts | localStorage / IndexedDB | Unsaved form data |
| Large datasets | IndexedDB | Offline-first cached data |
| Sensitive data | Secure cookie or memory only | API tokens, PII |
| Ephemeral UI state | Memory (useState) | Modal open, hover state |

### Cache Invalidation for Storage
- Set TTL on stored data (check on read, evict if expired)
- Version stored data shape (migrate or discard on version mismatch)
- Clear on logout, account switch, or app version upgrade
- Limit storage size (cap entries, evict oldest)

## Debugging and Observability

### DevTools
- Use React DevTools for component state inspection
- Use Redux DevTools (works with Zustand, Redux) for action history and time-travel
- Use TanStack Query DevTools for cache inspection
- Add named actions for debuggability (not anonymous updaters)

### State Logging
- Log state transitions in development for debugging
- Include action name, previous state snapshot, next state snapshot
- Never log state in production (PII risk, performance cost)
- Use middleware for automatic logging (Zustand middleware, Redux middleware)

### Testing State
- Test reducers/updaters as pure functions (input → output)
- Test selectors with known state shapes
- Test async effects with mocked services
- Integration test: verify state changes result in correct UI updates
