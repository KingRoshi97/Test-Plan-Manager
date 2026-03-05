---
kid: "KID-LANG-REACT-REACT-0002"
title: "UI Architecture Pattern (pages/components/hooks)"
type: pattern
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript, react]
subdomains: []
tags: [react, ui, architecture, hooks]
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

# UI Architecture Pattern (pages/components/hooks)

# UI Architecture Pattern (pages/components/hooks)

## Summary
The UI Architecture Pattern using pages, components, and hooks is a modular approach to building scalable and maintainable React applications. It separates concerns by organizing code into three layers: pages (route-level containers), components (reusable UI building blocks), and hooks (logic encapsulation). This pattern improves reusability, testability, and developer productivity.

## When to Use
- When building medium to large-scale React applications requiring clear separation of concerns.
- When multiple developers are collaborating on a project, necessitating a consistent structure.
- When you need to reuse UI components and logic across different parts of the application.
- When you want to improve testability by isolating UI rendering from business logic.
- When your application has complex state management or side effects that need to be abstracted.

## Do / Don't

### Do:
1. **Do** use pages to manage route-specific logic and layout.
2. **Do** create reusable components for UI elements that appear in multiple places.
3. **Do** encapsulate reusable logic in hooks to separate it from the UI layer.

### Don't:
1. **Don't** put business logic directly in components or pages; use hooks instead.
2. **Don't** overcomplicate components by combining multiple responsibilities.
3. **Don't** use hooks for logic that is only relevant to a single component; keep it local.

## Core Content

### Problem
React applications can become difficult to maintain as they grow, especially when logic, UI, and routing are tightly coupled. Without a clear structure, code duplication, inconsistent patterns, and tightly coupled components can make the application fragile and error-prone.

### Solution
The pages/components/hooks pattern addresses this by dividing the application into three layers:
1. **Pages**: Handle route-specific logic and layout. Pages are responsible for orchestrating the application’s structure and connecting it to the router.
2. **Components**: Represent reusable UI elements. These are pure, presentational components that focus solely on rendering and receiving data via props.
3. **Hooks**: Encapsulate reusable logic, such as state management, side effects, or API calls. Hooks abstract the "how" of functionality, leaving components to focus on the "what."

### Implementation Steps

#### 1. Define Pages
Pages are route-level containers that manage layout and handle routing. For example:
```tsx
// src/pages/HomePage.tsx
import React from 'react';
import { Header } from '../components/Header';
import { useFetchData } from '../hooks/useFetchData';

export const HomePage: React.FC = () => {
  const { data, loading } = useFetchData('/api/home');

  return (
    <div>
      <Header title="Home" />
      {loading ? <p>Loading...</p> : <p>{data}</p>}
    </div>
  );
};
```

#### 2. Create Reusable Components
Components are isolated, reusable UI elements. They should be pure and rely on props for data.
```tsx
// src/components/Header.tsx
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return <h1>{title}</h1>;
};
```

#### 3. Encapsulate Logic in Hooks
Hooks encapsulate logic like state management or API calls, making it reusable across components or pages.
```tsx
// src/hooks/useFetchData.ts
import { useState, useEffect } from 'react';

export const useFetchData = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [url]);

  return { data, loading };
};
```

#### 4. Combine in the Application
Organize your project structure to reflect the pattern:
```
src/
  components/
    Header.tsx
  hooks/
    useFetchData.ts
  pages/
    HomePage.tsx
```

### Tradeoffs
- **Pros**: Improves scalability, reusability, and testability. Encourages separation of concerns and consistent architecture.
- **Cons**: Adds initial complexity and requires developers to understand the pattern. Overhead for small projects.

### When to Use Alternatives
- For very small projects or prototypes, a simpler structure without hooks or strict separation may suffice.
- If you’re using a state management library like Redux or Zustand, some logic may be better placed in global stores rather than hooks.

## Links
- **React Component Patterns**: A guide to designing reusable React components.
- **React Hooks API Reference**: Official documentation for React hooks.
- **Atomic Design**: A methodology for organizing UI components.
- **Clean Architecture in React**: Principles for structuring React applications.

## Proof / Confidence
This pattern aligns with React's core philosophy of component-based architecture and separation of concerns. It is widely adopted in the industry, as evidenced by its use in popular libraries like Next.js and Create React App. The use of hooks is supported by React's official documentation as the recommended way to manage reusable logic.
