---
kid: "KID-LANGRENA-CHECK-0001"
title: "React Native Production Readiness Checklist"
content_type: "checklist"
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
  - "checklist"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/03_mobile_frameworks/react_native/checklists/KID-LANGRENA-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# React Native Production Readiness Checklist

# React Native Production Readiness Checklist

## Summary

This checklist ensures your React Native application is prepared for production deployment. It covers critical areas such as performance optimization, security, stability, and platform-specific considerations. Following this checklist helps minimize runtime issues, improve user experience, and maintain scalability.

---

## When to Use

Use this checklist before deploying a React Native application to production environments. It applies to mobile apps targeting iOS and Android platforms, especially for apps requiring high performance, scalability, and reliability.

---

## Do / Don't

### Do
1. **Do optimize JavaScript bundle size**: Use tools like Metro bundler and tree-shaking to reduce bundle size.
2. **Do test on real devices**: Validate app performance and behavior on various physical devices, not just emulators.
3. **Do enable crash reporting**: Integrate tools like Sentry or Firebase Crashlytics for real-time error monitoring.
4. **Do implement offline support**: Use libraries like Redux Persist or AsyncStorage to handle offline data.
5. **Do secure sensitive data**: Encrypt API keys, tokens, and other sensitive information using libraries like react-native-keychain.

### Don't
1. **Don't ignore platform-specific optimizations**: Avoid assuming the same configuration works equally well for iOS and Android.
2. **Don't hardcode sensitive values**: Avoid storing secrets directly in the codebase; use environment variables instead.
3. **Don't skip performance profiling**: Neglecting tools like Flipper or React DevTools can lead to unoptimized code.
4. **Don't forget to update dependencies**: Outdated libraries can introduce vulnerabilities or compatibility issues.
5. **Don't rely solely on emulators**: Emulators cannot fully replicate real-world device performance or behavior.

---

## Core Content

### 1. **Performance Optimization**
- **Minify and bundle JavaScript**: Use Metro bundler to minify and optimize the JavaScript code. Enable tree-shaking to remove unused code.
- **Optimize images**: Compress and resize images using tools like ImageMagick or TinyPNG. Use `react-native-fast-image` for efficient image loading.
- **Use FlatList for large datasets**: Replace ScrollView with FlatList for better memory management when rendering large lists.

### 2. **Testing and Debugging**
- **Run tests on physical devices**: Test your app on a variety of devices, including older models, to identify hardware-specific issues.
- **Automate testing**: Implement end-to-end tests using tools like Detox or Appium to ensure consistent behavior across scenarios.
- **Enable performance profiling**: Use Flipper or React DevTools to identify bottlenecks in rendering or state updates.

### 3. **Security**
- **Secure API communication**: Use HTTPS for all network requests and validate SSL certificates. Implement token-based authentication (e.g., OAuth2).
- **Protect sensitive data**: Store sensitive data securely using libraries like `react-native-keychain` or `SecureStore`.
- **Obfuscate code**: Use tools like ProGuard (Android) or Bitcode (iOS) to obfuscate the app's code and reduce the risk of reverse engineering.

### 4. **Error Handling**
- **Integrate crash reporting**: Use Sentry or Firebase Crashlytics to capture and analyze runtime errors.
- **Implement fallback UI**: Provide meaningful error messages or fallback screens when the app encounters issues.

### 5. **Platform-Specific Considerations**
- **iOS**: Ensure compliance with App Store guidelines, including proper usage of permissions and privacy policies.
- **Android**: Test for compatibility across different API levels and screen sizes. Use Android's native tools like Android Studio for debugging.

### 6. **Build and Deployment**
- **Use CI/CD pipelines**: Automate builds, tests, and deployments using tools like GitHub Actions, CircleCI, or Bitrise.
- **Sign and version your app**: Use proper signing keys and follow semantic versioning for releases.
- **Monitor app performance post-deployment**: Use tools like Firebase Performance Monitoring to track app performance in production.

---

## Links

- [React Native Documentation](https://reactnative.dev/docs/getting-started): Official guide to React Native development.
- [Sentry for React Native](https://docs.sentry.io/platforms/react-native/): Crash reporting and error monitoring tool for React Native apps.
- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics): Real-time crash reporting for mobile apps.
- [Detox Testing Framework](https://wix.github.io/Detox/): End-to-end testing for React Native apps.

---

## Proof / Confidence

React Native production readiness practices align with industry standards and are widely adopted by high-performing apps like Facebook and Instagram. Tools like Sentry and Firebase are trusted by developers for error monitoring, while CI/CD pipelines are a common practice for modern software development. Following this checklist ensures compliance with platform guidelines and improves app stability, performance, and security.
