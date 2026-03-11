---
kid: "KID-LANGEXPO-CHECK-0001"
title: "Expo Production Readiness Checklist"
content_type: "checklist"
primary_domain: "expo"
industry_refs: []
stack_family_refs:
  - "expo"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "expo"
  - "checklist"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/03_mobile_frameworks/expo/checklists/KID-LANGEXPO-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Expo Production Readiness Checklist

```markdown
## Summary
Ensuring production readiness for an Expo application is critical to delivering a stable, performant, and secure experience for end users. This checklist provides actionable steps to verify that your Expo project meets production standards, covering areas such as performance optimization, error handling, security, and deployment.

## When to Use
Use this checklist:
- Before deploying an Expo application to production environments (e.g., App Store or Google Play).
- When preparing major updates or releases for an existing Expo app.
- During pre-launch quality assurance (QA) phases to ensure readiness.

## Do / Don't
### Do:
- **Do** test your app thoroughly on physical devices across multiple platforms (iOS and Android).
- **Do** enable production optimizations like minification and tree-shaking in your build process.
- **Do** configure environment variables securely using tools like `expo-secure-store` or `.env` files.
- **Do** check for unused dependencies and remove them to reduce bundle size.
- **Do** verify that all third-party libraries are up-to-date and compatible with your Expo SDK version.

### Don't:
- **Don't** use development builds or debug configurations in production.
- **Don't** hardcode sensitive data like API keys or secrets in your codebase.
- **Don't** ignore crash reports or analytics data during testing.
- **Don't** deploy without testing deep links, push notifications, or other critical app features.
- **Don't** neglect accessibility testing for compliance with WCAG standards.

## Core Content
### 1. **Update Expo SDK**
   - Ensure your project is using the latest stable Expo SDK version. Run `expo upgrade` to update.
   - Rationale: Each SDK update includes critical bug fixes, performance improvements, and compatibility updates for new OS versions.

### 2. **Test on Physical Devices**
   - Test your app on both iOS and Android physical devices, including older models.
   - Rationale: Emulators may not accurately reflect real-world performance or hardware-specific issues.

### 3. **Enable Production Optimizations**
   - Verify that `expo build` or `eas build` is configured for production mode.
   - Enable minification and tree-shaking in your build settings to reduce bundle size.
   - Rationale: Production optimizations improve app performance and loading speed.

### 4. **Secure Environment Variables**
   - Use `expo-secure-store` or `.env` files to manage sensitive data securely.
   - Rationale: Hardcoding secrets exposes them to potential leaks and security vulnerabilities.

### 5. **Audit Dependencies**
   - Run `npm prune` or `yarn remove` to eliminate unused dependencies.
   - Use tools like `bundlephobia` to identify large dependencies and consider alternatives.
   - Rationale: Reducing bundle size improves app performance and download speed.

### 6. **Test Critical Features**
   - Verify functionality for push notifications, deep links, in-app purchases, and authentication flows.
   - Rationale: These features are often critical to user experience and app functionality.

### 7. **Run Performance Profiling**
   - Use tools like React Native Debugger or Expo's performance monitoring APIs to identify bottlenecks.
   - Rationale: Profiling ensures your app performs smoothly under production conditions.

### 8. **Accessibility Testing**
   - Test your app for accessibility compliance using tools like `react-native-accessibility` or manual checks.
   - Rationale: Accessibility compliance ensures inclusivity and avoids legal risks.

### 9. **Crash Reporting and Analytics**
   - Integrate tools like Sentry or Firebase Crashlytics for monitoring errors and crashes.
   - Rationale: Proactive error tracking helps maintain app stability in production.

### 10. **Final QA Checklist**
   - Test app behavior under poor network conditions.
   - Verify UI responsiveness across multiple screen sizes and orientations.
   - Confirm app metadata (e.g., version number, permissions) is correctly configured for submission.

## Links
- [Expo Documentation: Production Mode](https://docs.expo.dev/workflow/production-mode/) - Official guide for configuring production builds in Expo.
- [React Native Accessibility Guide](https://reactnative.dev/docs/accessibility) - Best practices for building accessible apps.
- [Sentry for React Native](https://docs.sentry.io/platforms/react-native/) - Crash reporting and error monitoring tool.
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/) - Secure storage for sensitive data.

## Proof / Confidence
This checklist aligns with industry standards for mobile app development and Expo best practices. Production optimizations, secure environment variable management, and crash reporting are widely recognized as critical steps for app readiness. Tools like Sentry and Firebase Crashlytics are benchmarks for error monitoring, while accessibility compliance is mandated by WCAG guidelines. Following these steps ensures your app meets performance, security, and usability expectations in production environments.
```
