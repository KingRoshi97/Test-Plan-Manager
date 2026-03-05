---
kid: "KID-LANG-REACT-REACT-0001"
title: "React App Model (components, state, effects)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript, react]
subdomains: []
tags: [react, components, state, effects]
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

# React App Model (components, state, effects)

# React App Model (components, state, effects)

## Summary

The React App Model is a foundational concept in React, a popular JavaScript library for building user interfaces. It revolves around the use of **components**, **state**, and **effects** to create dynamic, reusable, and maintainable UI elements. This model enables developers to build complex applications by breaking them into smaller, self-contained units that manage their own behavior and lifecycle.

---

## When to Use

- When building **dynamic, interactive user interfaces** that require frequent updates based on user actions or external data.
- For applications that benefit from **component reusability** and **modular architecture**.
- When managing **stateful logic** (e.g., form inputs, API data, or UI toggles) within specific parts of the UI.
- To handle **side effects** like fetching data, subscribing to events, or manipulating the DOM in a declarative way.

---

## Do / Don't

### Do:
1. **Use functional components** with hooks (`useState`, `useEffect`) for cleaner and modern React code.
2. **Lift state up** to the nearest common ancestor component when multiple components need to share the same state.
3. **Use effects sparingly** and only for side effects (e.g., fetching data or subscribing to events).

### Don't:
1. **Don't overuse state**; avoid storing derived or redundant data in state when it can be computed from props or other state.
2. **Don't mutate state directly**; always use state setters provided by `useState` or `useReducer`.
3. **Don't use effects for rendering logic**; effects should only handle side effects, not UI rendering.

---

## Core Content

### Components
React applications are built using **components**, which are reusable, self-contained pieces of UI. Components can be either **functional** or **class-based** (though functional components with hooks are now preferred). Each component accepts **props** (short for "properties") as input and returns React elements describing what should appear on the screen.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

Components can be composed together to create complex UIs while maintaining a clear separation of concerns.

---

### State
**State** is a mechanism for managing dynamic data within a component. It allows components to "remember" information between renders. React provides the `useState` hook for managing state in functional components.

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

In this example, the `count` variable is part of the component's state and is updated using the `setCount` function. React automatically re-renders the component whenever the state changes.

---

### Effects
**Effects** handle side effects in React components, such as fetching data, subscribing to events, or manually interacting with the DOM. The `useEffect` hook is used for this purpose.

```jsx
import React, { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []); // The empty dependency array ensures this runs only once.

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
```

The second argument to `useEffect` is a **dependency array**, which tells React when to re-run the effect. In this case, the effect runs only once when the component mounts.

---

### How It Fits Together
The React App Model combines **components**, **state**, and **effects** to create a predictable and declarative UI architecture:
- **Components** define the structure and behavior of the UI.
- **State** manages dynamic data and ensures the UI updates in response to user actions or external changes.
- **Effects** handle interactions with the outside world, such as fetching data or performing cleanup tasks.

This model promotes a clear separation of concerns, making React applications easier to develop, test, and maintain.

---

## Links

- **React Documentation: Components and Props** - Learn more about creating and using components.
- **React Documentation: State and Lifecycle** - Understand how state works in React.
- **React Documentation: Hooks API Reference** - Detailed reference for `useState`, `useEffect`, and other hooks.
- **React Patterns** - Explore common design patterns and best practices for React development.

---

## Proof / Confidence

The React App Model is widely adopted in the industry and is the foundation of React, one of the most popular front-end libraries. React's declarative approach and component-based architecture have been validated by its use in large-scale applications at companies like Facebook, Instagram, and Netflix. The concepts of state and effects are supported by React's official documentation and are considered best practices in modern React development.
