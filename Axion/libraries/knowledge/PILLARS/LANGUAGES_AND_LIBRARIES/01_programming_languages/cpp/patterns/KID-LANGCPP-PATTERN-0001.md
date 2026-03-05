---
kid: "KID-LANGCPP-PATTERN-0001"
title: "Cpp Common Implementation Patterns"
type: "pattern"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "cpp"
subdomains: []
tags:
  - "cpp"
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

# Cpp Common Implementation Patterns

# Cpp Common Implementation Patterns

## Summary
Cpp common implementation patterns are reusable techniques that address recurring problems in software development using C++. These patterns help improve code readability, maintainability, and efficiency. This guide focuses on practical implementation steps for commonly used patterns such as RAII (Resource Acquisition Is Initialization), PImpl (Pointer to Implementation), and CRTP (Curiously Recurring Template Pattern).

## When to Use
- **RAII**: Use when managing resources such as memory, file handles, or sockets to ensure proper cleanup and avoid leaks.
- **PImpl**: Use when you need to hide implementation details to reduce compilation dependencies and improve encapsulation.
- **CRTP**: Use when implementing compile-time polymorphism or enforcing specific behaviors in derived classes.

## Do / Don't
### Do:
1. **Use RAII** for resource management to ensure deterministic cleanup and exception safety.
2. **Apply PImpl** to reduce header file dependencies and improve compile-time performance.
3. **Leverage CRTP** for compile-time polymorphism to avoid runtime overhead.

### Don't:
1. **Don't bypass RAII** by manually managing resources unless absolutely necessary.
2. **Don't use PImpl** for trivial classes where encapsulation adds unnecessary complexity.
3. **Don't misuse CRTP** by overcomplicating inheritance hierarchies or introducing unreadable code.

## Core Content

### Pattern 1: RAII (Resource Acquisition Is Initialization)
**Problem**: Managing resources manually often leads to leaks or undefined behavior in the presence of exceptions.  
**Solution**: Encapsulate resource management within objects whose lifetimes are tied to scope. Use destructors to release resources automatically.

**Steps**:
1. Define a class that acquires resources (e.g., file handle, memory) in its constructor.
2. Implement a destructor to release the resources.
3. Use smart pointers (`std::unique_ptr`, `std::shared_ptr`) for dynamic memory.

**Example**:
```cpp
class FileHandler {
    std::fstream file;
public:
    FileHandler(const std::string& filename) {
        file.open(filename, std::ios::in | std::ios::out);
        if (!file.is_open()) {
            throw std::runtime_error("Failed to open file");
        }
    }
    ~FileHandler() {
        file.close();
    }
};
```

### Pattern 2: PImpl (Pointer to Implementation)
**Problem**: Exposing implementation details in headers increases compile-time dependencies and breaks encapsulation.  
**Solution**: Use a private pointer to an implementation class to hide details from the public interface.

**Steps**:
1. Create a public-facing class with a private pointer to the implementation.
2. Define the implementation class in the `.cpp` file.
3. Use `std::unique_ptr` to manage the implementation pointer.

**Example**:
```cpp
class Widget {
    struct Impl;
    std::unique_ptr<Impl> pImpl;
public:
    Widget();
    ~Widget();
    void doSomething();
};
```

### Pattern 3: CRTP (Curiously Recurring Template Pattern)
**Problem**: Runtime polymorphism introduces overhead and limits compile-time optimizations.  
**Solution**: Use CRTP to implement compile-time polymorphism by inheriting from a template parameter.

**Steps**:
1. Create a base template class that takes the derived class as a template parameter.
2. Use static methods or member functions in the base class to enforce behavior.

**Example**:
```cpp
template <typename Derived>
class Base {
public:
    void interface() {
        static_cast<Derived*>(this)->implementation();
    }
};

class Derived : public Base<Derived> {
public:
    void implementation() {
        std::cout << "Derived implementation" << std::endl;
    }
};
```

## Links
1. [RAII in C++](https://en.cppreference.com/w/cpp/language/raii) - Explanation and examples of RAII in C++.
2. [PImpl Idiom](https://en.cppreference.com/w/cpp/language/pimpl) - Detailed overview of the PImpl idiom.
3. [CRTP](https://www.fluentcpp.com/2017/05/12/curiously-recurring-template-pattern/) - Comprehensive guide to CRTP with examples.
4. [Smart Pointers](https://en.cppreference.com/w/cpp/memory) - Reference for `std::unique_ptr` and `std::shared_ptr`.

## Proof / Confidence
These patterns are widely recognized in the C++ community and are part of industry standards. RAII is foundational for exception-safe code, PImpl is recommended for reducing compilation dependencies, and CRTP is frequently used in libraries like Boost and Eigen for efficient compile-time polymorphism. These patterns are documented in authoritative sources such as cppreference.com and widely used in production-grade software.
