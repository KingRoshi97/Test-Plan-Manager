---
kid: "KID-LANGANKO-CHECK-0001"
title: "Android Kotlin Production Readiness Checklist"
type: "checklist"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "android_kotlin"
subdomains: []
tags:
  - "android_kotlin"
  - "checklist"
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

# Android Kotlin Production Readiness Checklist

# Android Kotlin Production Readiness Checklist

## Summary

This checklist ensures your Android application written in Kotlin is production-ready by focusing on code quality, performance, security, and maintainability. By following these actionable steps, you can reduce runtime errors, improve user experience, and ensure your app meets industry standards for reliability and scalability.

## When to Use

- Before releasing an Android app to production.
- During code reviews for critical features.
- When migrating legacy Java code to Kotlin.
- After significant refactoring or dependency updates.

## Do / Don't

### Do
- **Do** use `CoroutineScope` and structured concurrency for managing background tasks.
- **Do** enable ProGuard or R8 for code shrinking, obfuscation, and optimization.
- **Do** write unit tests for ViewModels, UseCases, and utility classes.

### Don't
- **Don't** use `GlobalScope` for coroutines as it can lead to memory leaks.
- **Don't** hardcode strings or dimensions; use resource files instead.
- **Don't** ignore lint warnings, especially those related to security or performance.

## Core Content

### Code Quality
- **Use Kotlin idioms**: Prefer `val` over `var` for immutability, use `data` classes for simple models, and leverage higher-order functions for cleaner code.
- **Enforce null safety**: Use nullable types (`?`) judiciously and avoid unsafe calls (`!!`). Use `let`, `run`, `apply`, or `also` to handle nullable values safely.
- **Follow naming conventions**: Use camelCase for variables and functions, PascalCase for classes, and snake_case for resource files.

### Performance
- **Optimize coroutines**: Use `Dispatchers.IO` for I/O tasks and `Dispatchers.Main` for UI updates. Avoid blocking the main thread.
- **Lazy loading**: Use `lazy` or `by lazy` for expensive object initialization to reduce memory usage.
- **Avoid overdraw**: Use the `Debug GPU Overdraw` tool to identify and fix excessive UI rendering.

### Security
- **Secure sensitive data**: Store API keys and secrets in the Android Keystore or a secure backend, not in the app code.
- **Use HTTPS**: Enforce secure network communication by using HTTPS and enabling `Network Security Config`.
- **Validate inputs**: Sanitize user inputs to prevent injection attacks and crashes.

### Testing
- **Unit tests**: Write tests for business logic using JUnit and MockK. Aim for at least 80% code coverage.
- **UI tests**: Use Espresso or Jetpack Compose testing for critical user flows.
- **Crash monitoring**: Integrate tools like Firebase Crashlytics to track and analyze crashes in production.

### Build and Release
- **Enable ProGuard/R8**: Minify and obfuscate your code to reduce APK size and protect intellectual property.
- **Versioning**: Follow semantic versioning for your app's version code and name.
- **Automate builds**: Use CI/CD pipelines (e.g., GitHub Actions, Jenkins) to automate builds, tests, and deployments.

## Links

- [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html) - Official Kotlin style guide.
- [Android App Performance Optimization](https://developer.android.com/topic/performance) - Best practices for improving app performance.
- [Jetpack Compose Testing](https://developer.android.com/jetpack/compose/testing) - Guide to testing Jetpack Compose UIs.
- [ProGuard and R8](https://developer.android.com/studio/build/shrink-code) - Documentation on code shrinking and obfuscation.

## Proof / Confidence

This checklist aligns with industry best practices outlined in the [Android Developer Documentation](https://developer.android.com/) and Kotlin's official guidelines. Techniques like structured concurrency and ProGuard are widely adopted in production apps, as evidenced by their usage in apps like Google Maps and Instagram. Following these steps reduces crash rates and improves user retention, as confirmed by benchmarks from Firebase Crashlytics and Play Console reports.
