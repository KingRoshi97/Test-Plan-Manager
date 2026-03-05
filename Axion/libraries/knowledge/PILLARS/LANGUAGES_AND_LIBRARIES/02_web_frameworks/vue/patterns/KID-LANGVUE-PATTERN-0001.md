---
kid: "KID-LANGVUE-PATTERN-0001"
title: "Vue Common Implementation Patterns"
type: "pattern"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "vue"
subdomains: []
tags:
  - "vue"
  - "pattern"
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

# Vue Common Implementation Patterns

# Vue Common Implementation Patterns

## Summary
Vue.js is a versatile JavaScript framework for building user interfaces. This guide focuses on common implementation patterns that simplify state management, component communication, and reusable logic. By following these patterns, developers can write maintainable, scalable, and efficient Vue applications.

---

## When to Use
- **State Management**: When managing shared state between components without introducing unnecessary complexity.
- **Reusable Logic**: When multiple components share similar behavior or functionality.
- **Component Communication**: When parent-child or sibling components need to exchange data efficiently.
- **Performance Optimization**: When you need to minimize unnecessary re-renders or improve app responsiveness.

---

## Do / Don't

### Do:
1. **Use Vuex or Pinia for complex state management**: Centralize shared state for predictable behavior.
2. **Leverage computed properties**: Use computed properties for derived state to avoid redundant logic in templates.
3. **Utilize mixins or composables for reusable logic**: Encapsulate shared functionality in a reusable way.
4. **Use props and events for parent-child communication**: Keep component boundaries clear and declarative.
5. **Apply dynamic components**: Use `<component :is="...">` for conditional rendering of components.

### Don't:
1. **Don't use `$emit` for sibling communication**: Use a centralized store or event bus instead.
2. **Don't overuse mixins**: Prefer Composition API composables for better readability and encapsulation.
3. **Don't mutate props directly**: Always use Vue's reactive state or emit events to update data.
4. **Don't store non-reactive data in Vuex or Pinia**: Keep the store reactive for consistent updates.
5. **Don't ignore performance implications of watchers**: Use watchers sparingly and prefer computed properties when possible.

---

## Core Content

### Problem: Managing State Across Components
In large applications, managing shared state can become complex and error-prone. Direct prop drilling or sibling communication often leads to tightly coupled components.

#### Solution:
Use Vuex or Pinia to centralize state management. For example, using Pinia:

```javascript
// Store definition
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

```javascript
// Component usage
<template>
  <div>
    <p>{{ counterStore.count }}</p>
    <button @click="counterStore.increment">Increment</button>
  </div>
</template>

<script>
import { useCounterStore } from '@/stores/counter';

export default {
  setup() {
    const counterStore = useCounterStore();
    return { counterStore };
  },
};
</script>
```

---

### Problem: Reusing Logic Across Components
Components often share similar behavior, such as form validation or API calls. Duplicating logic leads to maintenance challenges.

#### Solution:
Use Composition API composables to encapsulate reusable logic.

```javascript
// Composable definition
import { ref } from 'vue';

export function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;

  return { count, increment };
}
```

```javascript
// Component usage
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import { useCounter } from '@/composables/useCounter';

export default {
  setup() {
    const { count, increment } = useCounter();
    return { count, increment };
  },
};
</script>
```

---

### Problem: Component Communication
Parent-child communication is straightforward with props and events, but sibling communication can be challenging.

#### Solution:
Use an event bus or centralized store for sibling communication.

```javascript
// Event bus example
import { reactive } from 'vue';

export const eventBus = reactive({
  events: {},
  emit(event, data) {
    this.events[event] = data;
  },
  on(event, callback) {
    callback(this.events[event]);
  },
});
```

```javascript
// Component usage
<template>
  <button @click="sendMessage">Send Message</button>
</template>

<script>
import { eventBus } from '@/eventBus';

export default {
  methods: {
    sendMessage() {
      eventBus.emit('message', 'Hello from Component A');
    },
  },
};
</script>
```

---

## Links
- [Vue Documentation: State Management](https://vuejs.org/guide/scaling-up/state-management.html) - Official guide to managing state in Vue.
- [Pinia Documentation](https://pinia.vuejs.org/) - Documentation for Pinia, Vue's modern state management library.
- [Vue Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) - Guide to using the Composition API for reusable logic.
- [Dynamic Components in Vue](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components) - Learn about conditional rendering with dynamic components.

---

## Proof / Confidence
These patterns are widely adopted in the Vue ecosystem and recommended in the official Vue documentation. Pinia is the default state management library for Vue 3, replacing Vuex for its simplicity and performance. The Composition API, introduced in Vue 3, is now considered the standard for writing reusable logic and has been embraced by the community for its modularity and clarity.
