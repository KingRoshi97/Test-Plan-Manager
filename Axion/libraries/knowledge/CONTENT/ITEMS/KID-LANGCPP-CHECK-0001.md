---
kid: "KID-LANGCPP-CHECK-0001"
title: "Cpp Production Readiness Checklist"
content_type: "checklist"
primary_domain: "cpp"
industry_refs: []
stack_family_refs:
  - "cpp"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "cpp"
  - "checklist"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/01_programming_languages/cpp/checklists/KID-LANGCPP-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Cpp Production Readiness Checklist

```markdown
# Cpp Production Readiness Checklist

## Summary
This checklist ensures that your C++ codebase is production-ready by addressing critical aspects such as performance, safety, maintainability, and compliance with best practices. Following this checklist minimizes runtime issues, simplifies debugging, and ensures your application meets industry standards for reliability and scalability.

## When to Use
- Before deploying a C++ application to production.
- During code reviews for critical systems or libraries.
- When onboarding legacy C++ code into a production environment.
- Before releasing a new version of your software.

## Do / Don't
### Do
- **Do** use modern C++ standards (C++17 or C++20) to leverage improved language features and safety.
- **Do** enable and treat compiler warnings as errors (`-Wall -Wextra -Werror`) to catch potential issues early.
- **Do** use static analysis tools (e.g., clang-tidy, cppcheck) to identify bugs and enforce coding standards.

### Don't
- **Don't** use raw pointers unless absolutely necessary; prefer smart pointers (`std::unique_ptr`, `std::shared_ptr`).
- **Don't** ignore undefined behavior; always validate inputs, bounds, and assumptions.
- **Don't** use global variables or non-const singletons, as they increase coupling and make testing harder.

## Core Content
### 1. **Code Quality and Standards**
- **Use Modern C++ Standards**: Ensure the codebase adheres to the latest stable C++ standard (e.g., C++17 or C++20). This ensures access to safer and more efficient language features.
- **Enable Compiler Warnings**: Use `-Wall -Wextra -Werror` (GCC/Clang) or `/W4` (MSVC) to catch potential issues during compilation.
- **Static Analysis**: Run tools like `clang-tidy`, `cppcheck`, or SonarQube to enforce coding standards and detect common issues.

### 2. **Memory Management**
- **Avoid Memory Leaks**: Use RAII (Resource Acquisition Is Initialization) principles and smart pointers (`std::unique_ptr`, `std::shared_ptr`) to manage resources.
- **Check for Dangling Pointers**: Use tools like AddressSanitizer or Valgrind to detect memory leaks and invalid memory access.
- **Minimize Dynamic Allocation**: Where possible, prefer stack allocation or `std::vector` over raw `new`/`delete`.

### 3. **Error Handling**
- **Use Exceptions Appropriately**: Ensure exceptions are used for exceptional cases only. Avoid throwing exceptions in performance-critical code paths.
- **Validate Inputs**: Check all user inputs, function arguments, and external data for validity.
- **Graceful Degradation**: Implement fallback mechanisms for critical failures to maintain system stability.

### 4. **Concurrency and Thread Safety**
- **Avoid Data Races**: Use proper synchronization primitives (`std::mutex`, `std::lock_guard`) to protect shared data.
- **Thread-Safe Containers**: Use thread-safe containers or ensure proper synchronization when accessing standard containers.
- **Test Multithreaded Code**: Use tools like ThreadSanitizer to detect race conditions and threading issues.

### 5. **Performance**
- **Profile Before Optimizing**: Use profiling tools like gprof, perf, or Visual Studio Profiler to identify bottlenecks.
- **Minimize Copying**: Use move semantics (`std::move`) and `std::string_view` to avoid unnecessary copies.
- **Optimize Critical Paths**: Focus optimizations on hot paths identified during profiling.

### 6. **Testing**
- **Unit Tests**: Write unit tests for all critical components using frameworks like Google Test or Catch2.
- **Integration Tests**: Ensure components work together as expected.
- **Fuzz Testing**: Use fuzz testing tools like libFuzzer to uncover edge cases and vulnerabilities.

### 7. **Deployment Readiness**
- **Build Reproducibility**: Use a consistent build system (e.g., CMake) and document build steps.
- **Binary Size**: Optimize binary size by stripping symbols (`strip` on Linux) and using compiler optimizations (`-O2` or `-O3`).
- **Dependency Audit**: Audit third-party dependencies for licensing and security issues.

## Links
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines): Industry best practices for writing modern C++.
- [clang-tidy Documentation](https://clang.llvm.org/extra/clang-tidy/): A static analysis tool for C++.
- [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html): A tool to detect memory issues in C++ programs.
- [Google Test Framework](https://github.com/google/googletest): A popular framework for writing unit tests in C++.

## Proof / Confidence
This checklist is based on industry standards and best practices, including the C++ Core Guidelines and recommendations from leading tools like clang-tidy and AddressSanitizer. Static analysis and sanitization tools are widely adopted in production environments to catch bugs early. Profiling and testing methodologies are standard practices in high-performance and safety-critical software domains.
```
