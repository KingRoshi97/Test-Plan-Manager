---
kid: "KID-LANGREAC-CONCEPT-0001"
title: "React Fundamentals and Mental Model"
type: "concept"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "react"
subdomains: []
tags:
  - "react"
  - "concept"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# React Fundamentals and Mental Model

# React Fundamentals and Mental Model

## Summary

React is a JavaScript library for building user interfaces, primarily using a declarative and component-based approach. It allows developers to create reusable UI components that efficiently update and render based on changes in application state. Understanding React's mental model — how components, state, props, and rendering work — is essential for building scalable and maintainable applications.

## When to Use

React is ideal for scenarios where:

- You need dynamic, interactive user interfaces that respond to user input or data changes.
- The application requires modular, reusable components for scalability.
- You want to leverage a declarative approach to UI development, focusing on "what" the UI should look like rather than "how" to build it.
- The project benefits from a virtual DOM for performance optimization in rendering.

## Do / Don't

### Do:
1. **Use functional components**: Prefer functional components with hooks over class components for simplicity and modern React practices.
2. **Break UI into small components**: Follow the "Single Responsibility Principle" to ensure components are reusable and easier to test.
3. **Leverage React's declarative nature**: Use JSX to describe the UI and let React handle the rendering logic.

### Don't:
1. **Directly manipulate the DOM**: Avoid using `document.getElementById` or similar methods; rely on React's virtual DOM for updates.
2. **Overuse state**: Don't store unnecessary data in state; only keep information that affects rendering.
3. **Skip key props in lists**: When rendering lists, always provide a unique `key` prop to avoid rendering bugs and performance issues.

## Core Content

React's mental model revolves around components, state, props, and the virtual DOM. Here’s how these concepts work:

### Components
React applications are built from components, which are reusable, self-contained units of UI. Components can be functional (using hooks) or class-based, though functional components are preferred in modern React. A component receives `props` (data passed from a parent) and can manage its own `state`.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

### State and Props
State is internal to a component and represents data that can change over time. Props are external inputs passed from parent components. Together, they determine how a component renders.

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Virtual DOM
React uses a virtual DOM to optimize rendering. Instead of directly updating the DOM, React creates a lightweight copy of it. When state or props change, React calculates the minimal set of updates required and applies them efficiently.

### Declarative UI
React’s declarative approach means you describe *what* the UI should look like, not *how* to manipulate the DOM. For example, instead of manually updating elements, you update the state, and React automatically re-renders the affected parts of the UI.

### Example: Parent-Child Communication
React components often communicate via props. For example, a parent component can pass data or functions to a child:

```jsx
function Parent() {
  const [message, setMessage] = React.useState("Hello!");

  return <Child message={message} onUpdate={() => setMessage("Updated!")} />;
}

function Child({ message, onUpdate }) {
  return (
    <div>
      <p>{message}</p>
      <button onClick={onUpdate}>Update Message</button>
    </div>
  );
}
```

## Links

- [React Official Documentation](https://reactjs.org/docs/getting-started.html): Comprehensive guide to React concepts and APIs.
- [Thinking in React](https://reactjs.org/docs/thinking-in-react.html): A step-by-step approach to building React applications.
- [React Hooks](https://reactjs.org/docs/hooks-intro.html): Introduction to hooks for managing state and side effects in functional components.
- [Virtual DOM Explained](https://reactjs.org/docs/faq-internals.html): How React's virtual DOM works and why it improves performance.

## Proof / Confidence

React is widely adopted across the industry, powering applications for companies like Facebook, Netflix, and Airbnb. Its declarative component-based model is considered a best practice for building modern web applications. React's virtual DOM and efficient rendering are benchmarks for performance optimization, and its ecosystem (e.g., Redux, React Router) provides robust tools for scaling applications.
