---
kid: "KID-LANG-REACT-REACT-0003"
title: "Data Fetching Pattern (query caching)"
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
  - "a"
  - "t"
  - "a"
  - "-"
  - "f"
  - "e"
  - "t"
  - "c"
  - "h"
  - "i"
  - "n"
  - "g"
  - ","
  - " "
  - "q"
  - "u"
  - "e"
  - "r"
  - "y"
  - "-"
  - "c"
  - "a"
  - "c"
  - "h"
  - "e"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/react/frameworks/react/KID-LANG-REACT-REACT-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Data Fetching Pattern (query caching)

# Data Fetching Pattern (Query Caching)

## Summary
The Data Fetching Pattern, specifically query caching, is a strategy to optimize data retrieval in JavaScript/TypeScript applications, particularly in React. It minimizes redundant network requests by caching fetched data and serving it from the cache when possible. This pattern improves performance, reduces latency, and enhances the user experience in data-driven applications.

## When to Use
- When your application fetches the same data multiple times (e.g., paginated lists, user profiles, or configuration settings).
- When reducing network requests is critical for performance or cost.
- In scenarios where data does not change frequently or where stale data is acceptable for a short time.
- When implementing client-side state management libraries like React Query, Apollo Client, or SWR.
- For improving offline support or reducing latency in slow network conditions.

## Do / Don't

### Do
- **Do** use query caching for frequently accessed, read-heavy data.
- **Do** set cache expiration times to balance freshness and performance.
- **Do** use cache invalidation techniques when data updates are expected.
- **Do** leverage libraries like React Query or SWR to simplify implementation.
- **Do** provide fallback UI for cache misses or stale data.

### Don't
- **Don't** use query caching for highly dynamic or real-time data (e.g., live stock prices).
- **Don't** overcomplicate caching logic for simple, one-off data fetches.
- **Don't** store sensitive or user-specific data in shared caches without proper security measures.
- **Don't** assume cached data is always valid; implement proper error handling for stale or invalid data.
- **Don't** ignore the memory overhead of caching large datasets.

## Core Content

### Problem
Fetching data from APIs repeatedly can lead to unnecessary network requests, increased latency, and degraded performance. This is especially problematic in React applications where components re-render frequently, triggering redundant fetch calls.

### Solution
Query caching solves this by storing fetched data in a cache. When a component requests data, the cache is checked first. If the data exists and is valid, it is served from the cache. Otherwise, a network request is made, and the response is cached for future use.

### Implementation Steps

#### 1. Choose a Library
Use a library like React Query, SWR, or Apollo Client. These libraries provide built-in support for query caching with minimal configuration.

#### 2. Install the Library
For React Query:
```bash
npm install @tanstack/react-query
```

#### 3. Set Up a Query Client
Initialize a query client and wrap your application with a `QueryClientProvider`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourComponent />
    </QueryClientProvider>
  );
}
```

#### 4. Fetch Data with Caching
Use the `useQuery` hook to fetch and cache data:
```typescript
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useQuery(['user', userId], () =>
    fetch(`/api/users/${userId}`).then(res => res.json())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return <div>{data.name}</div>;
}
```

#### 5. Configure Cache Behavior
Customize caching behavior, such as stale time and cache time:
```typescript
const { data } = useQuery(
  ['user', userId],
  () => fetch(`/api/users/${userId}`).then(res => res.json()),
  {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  }
);
```

#### 6. Handle Cache Invalidation
Invalidate the cache when data changes:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function UpdateUser({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (newData) => fetch(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(newData) }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', userId]);
      },
    }
  );

  return <button onClick={() => mutation.mutate({ name: 'New Name' })}>Update</button>;
}
```

### Tradeoffs
- **Pros**: Reduces redundant network requests, improves performance, and provides offline support.
- **Cons**: Adds complexity, requires memory for caching, and may serve stale data if not managed properly.

### Alternatives
- Use server-side caching for shared data across users.
- Implement WebSockets or Server-Sent Events for real-time data updates.
- Rely on local storage or IndexedDB for persistent client-side storage.

## Links
- **React Query Documentation**: Comprehensive guide to using React Query for data fetching and caching.
- **SWR Documentation**: Lightweight library for data fetching with caching and revalidation.
- **Caching Strategies**: Overview of caching techniques and best practices.
- **Client-Side State Management**: Comparison of state management libraries like Redux, MobX, and React Query.

## Proof / Confidence
This pattern is widely adopted in the industry, with libraries like React Query and SWR being used in production by companies like Netflix, Github, and Vercel. Benchmarks show significant performance improvements when query caching is implemented. The approach aligns with best practices for optimizing client-side applications.
