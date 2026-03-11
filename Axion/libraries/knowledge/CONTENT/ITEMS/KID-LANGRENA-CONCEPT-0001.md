---
kid: "KID-LANGRENA-CONCEPT-0001"
title: "React Native Fundamentals and Mental Model"
content_type: "concept"
primary_domain: "react_native"
industry_refs: []
stack_family_refs:
  - "react_native"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "react_native"
  - "concept"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/03_mobile_frameworks/react_native/concepts/KID-LANGRENA-CONCEPT-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# React Native Fundamentals and Mental Model

# React Native Fundamentals and Mental Model

## Summary

React Native is a popular framework for building cross-platform mobile applications using JavaScript and React. It enables developers to write code that runs on both iOS and Android while maintaining a native look and feel. Understanding React Native's mental model—how it bridges React concepts with native mobile development—is crucial for building performant and maintainable applications.

## When to Use

- **Cross-platform development**: When you want to share most of your codebase between iOS and Android without sacrificing native performance.
- **Existing React expertise**: If your team is already skilled in React, transitioning to React Native leverages existing knowledge.
- **Rapid prototyping**: React Native allows for faster iteration cycles due to features like hot reloading and shared code.
- **Apps with moderate native complexity**: Ideal for projects that require access to some native APIs but don’t rely heavily on platform-specific features.

## Do / Don't

### Do
1. **Leverage reusable components**: Use React Native's built-in components like `View`, `Text`, and `Image` to maintain consistency across platforms.
2. **Optimize performance**: Use tools like the `FlatList` for rendering large lists efficiently, and minimize unnecessary re-renders by using `React.memo` or `PureComponent`.
3. **Use third-party libraries wisely**: Libraries like `react-navigation` simplify navigation, but ensure they are actively maintained.

### Don't
1. **Overuse platform-specific code**: Avoid excessive use of `Platform.OS` checks unless absolutely necessary; aim for shared code.
2. **Ignore native performance bottlenecks**: React Native apps can suffer from bridge communication overhead—profile and optimize where needed.
3. **Rely solely on JavaScript for complex native features**: For tasks like heavy animations or hardware access, consider writing native modules in Swift/Objective-C (iOS) or Java/Kotlin (Android).

## Core Content

React Native combines the declarative UI paradigm of React with native platform capabilities. At its core, React Native uses JavaScript to define components and application logic, which are then translated into native views via a bridge. This allows developers to write code once and deploy it across multiple platforms.

### Key Concepts

1. **Components**: React Native provides a set of core components (`View`, `Text`, `Image`, `ScrollView`, etc.) that map directly to native UI elements. These components are the building blocks of your app.
   
   ```jsx
   import React from 'react';
   import { View, Text } from 'react-native';

   const App = () => (
     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
       <Text>Hello, React Native!</Text>
     </View>
   );
   export default App;
   ```

2. **The Bridge**: React Native uses a JavaScript-to-native bridge to communicate between the JavaScript thread and the native thread. While this enables flexibility, excessive communication across the bridge can lead to performance issues.

3. **Styling**: Styles in React Native are written using JavaScript objects, mimicking CSS but with slight differences (e.g., `camelCase` property names). Styles are applied directly to components using the `style` prop.

   ```jsx
   const styles = {
     container: {
       flex: 1,
       backgroundColor: '#fff',
       justifyContent: 'center',
       alignItems: 'center',
     },
     text: {
       fontSize: 20,
       color: '#333',
     },
   };
   ```

4. **Navigation**: Navigation is not built into React Native by default. Libraries like `react-navigation` or `react-native-navigation` provide robust solutions for managing screens and transitions.

5. **Native Modules**: For features not supported out-of-the-box, developers can write native modules in Swift, Objective-C, Java, or Kotlin and integrate them with React Native.

### Why It Matters

React Native enables faster development cycles and reduces costs by allowing developers to share code across platforms. It is widely adopted by companies like Facebook, Airbnb, and Shopify due to its ability to deliver near-native performance while maintaining developer productivity.

### Broader Domain Fit

React Native fits into the broader domain of cross-platform development frameworks, alongside Flutter and Xamarin. It is particularly well-suited for teams with React experience or projects that require frequent updates and iterative development.

## Links

- [React Native Documentation](https://reactnative.dev/docs/getting-started): Official guide to getting started with React Native.
- [React Navigation](https://reactnavigation.org/): A popular library for implementing navigation in React Native apps.
- [Performance Optimization in React Native](https://reactnative.dev/docs/performance): Best practices for improving app performance.
- [Building Native Modules](https://reactnative.dev/docs/native-modules-ios): Guide to creating custom native modules.

## Proof / Confidence

React Native is an industry-standard framework used by major companies like Facebook, Instagram, and Tesla. It has an active community, robust third-party libraries, and frequent updates. Benchmarks show React Native can achieve near-native performance for most applications, provided developers follow best practices for optimization.
