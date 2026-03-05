---
kid: "KID-LANGFLUT-PATTERN-0001"
title: "Flutter Common Implementation Patterns"
type: "pattern"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "flutter"
subdomains: []
tags:
  - "flutter"
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

# Flutter Common Implementation Patterns

# Flutter Common Implementation Patterns

## Summary

This guide covers common implementation patterns in Flutter that solve recurring challenges in app development, such as state management, widget composition, and navigation. By adopting these patterns, developers can build scalable, maintainable, and performant applications while adhering to Flutter's best practices.

---

## When to Use

- **State Management**: When managing complex UI states across multiple widgets or screens.
- **Widget Composition**: When designing reusable and modular UI components.
- **Navigation**: When implementing multi-screen applications with dynamic routing.
- **Performance Optimization**: When addressing UI lag or unnecessary widget rebuilds.

---

## Do / Don't

### Do:
1. **Use Provider or Riverpod for State Management**: Simplify dependency injection and state updates.
2. **Leverage Composition Over Inheritance**: Create reusable widgets by combining smaller ones rather than extending classes.
3. **Use Navigator 2.0 for Complex Navigation**: Handle deep linking and dynamic routing effectively.

### Don't:
1. **Rebuild Entire Widget Trees**: Avoid unnecessary rebuilds by using `const` widgets or caching.
2. **Use Global Variables for State**: This leads to unmanageable and error-prone code.
3. **Hardcode Navigation Logic**: Avoid coupling navigation logic directly into widgets; use centralized routing.

---

## Core Content

### 1. **State Management**
Flutter provides several approaches to state management, including Provider, Riverpod, Bloc, and Redux. For most applications, **Provider** or **Riverpod** are recommended due to their simplicity and integration with Flutter's widget tree.

#### Implementation Steps:
1. Add `provider` or `riverpod` to your `pubspec.yaml`.
2. Wrap your app with a `ChangeNotifierProvider` or `ProviderScope`.
3. Create a `ChangeNotifier` or `StateNotifier` class to manage your state.
4. Use `Consumer` or `context.watch()` to listen for state changes in widgets.

#### Example:
```dart
class CounterNotifier extends ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void increment() {
    _count++;
    notifyListeners();
  }
}

// In main.dart
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CounterNotifier(),
      child: MyApp(),
    ),
  );
}
```

---

### 2. **Widget Composition**
Flutter encourages building UI using small, reusable widgets. This pattern improves maintainability and reduces code duplication.

#### Implementation Steps:
1. Identify common UI elements in your app.
2. Create custom widgets that encapsulate these elements.
3. Pass parameters to widgets for customization.

#### Example:
```dart
class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const CustomButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(label),
    );
  }
}
```

---

### 3. **Navigation**
Flutter's Navigator API allows you to manage screen transitions. Use Navigator 1.0 for simple navigation and Navigator 2.0 for complex routing.

#### Implementation Steps:
1. For simple apps, use `Navigator.push()` and `Navigator.pop()`.
2. For apps requiring deep linking, implement a `RouterDelegate` and `RouteInformationParser`.
3. Use named routes for cleaner navigation logic.

#### Example:
```dart
Navigator.pushNamed(context, '/details', arguments: {'id': 42});
```

---

### Tradeoffs:
- **State Management**: Provider is lightweight but may require boilerplate. Riverpod simplifies syntax but introduces a new learning curve.
- **Widget Composition**: Improves modularity but can increase widget nesting complexity.
- **Navigation**: Navigator 2.0 is powerful but requires more setup than Navigator 1.0.

---

## Links

- [Flutter State Management Options](https://docs.flutter.dev/development/data-and-backend/state-mgmt): Official documentation on state management approaches.
- [Flutter Widget Catalog](https://docs.flutter.dev/development/ui/widgets): Comprehensive list of Flutter widgets.
- [Navigator 2.0 Guide](https://docs.flutter.dev/development/ui/navigation): Detailed guide on using Navigator 2.0 for advanced routing.
- [Riverpod Documentation](https://riverpod.dev/docs/getting_started/): Official Riverpod documentation.

---

## Proof / Confidence

These patterns are widely adopted in the Flutter community and recommended in official documentation. Provider and Riverpod are among the most popular state management libraries, with benchmarks showing their efficiency in reducing boilerplate code. Navigator 2.0 is an industry-standard for handling advanced routing scenarios, and widget composition aligns with Flutter's declarative UI principles.
