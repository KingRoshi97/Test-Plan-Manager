---
kid: "KID-LANG-RUST-CORE-0001"
title: "Rust Mental Model (ownership/borrowing)"
content_type: "concept"
primary_domain: "["
secondary_domains:
  - "r"
  - "u"
  - "s"
  - "t"
  - "]"
industry_refs: []
stack_family_refs:
  - "language_core"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "r"
  - "u"
  - "s"
  - "t"
  - ","
  - " "
  - "o"
  - "w"
  - "n"
  - "e"
  - "r"
  - "s"
  - "h"
  - "i"
  - "p"
  - ","
  - " "
  - "b"
  - "o"
  - "r"
  - "r"
  - "o"
  - "w"
  - "i"
  - "n"
  - "g"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/rust/language_core/KID-LANG-RUST-CORE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Rust Mental Model (ownership/borrowing)

# Rust Mental Model (Ownership/Borrowing)

## Summary

Rust's ownership and borrowing system is a core part of the language's design, enabling memory safety without requiring a garbage collector. Ownership defines how memory is managed, while borrowing allows temporary access to data without transferring ownership. This model helps prevent common bugs like null pointer dereferencing, use-after-free, and data races at compile time.

## When to Use

- When writing performance-critical applications that require fine-grained control over memory, such as systems programming, game engines, or embedded systems.
- When working in multi-threaded environments where avoiding data races is essential.
- When you want compile-time guarantees for memory safety without runtime overhead like garbage collection.
- When building APIs or libraries that need to enforce safe and predictable usage patterns.

## Do / Don't

### Do:
1. **Do use ownership to manage memory lifetimes explicitly.** For example, use `String` instead of `&str` when you need to own the data.
2. **Do use borrowing (`&` and `&mut`) to access data temporarily without taking ownership.** This allows safe shared or mutable access.
3. **Do follow the borrowing rules: only one mutable reference or multiple immutable references at a time.** This prevents data races and ensures safety.

### Don't:
1. **Don't attempt to access data after it has been moved.** Once ownership is transferred, the original variable is invalidated.
2. **Don't create multiple mutable references to the same data.** This is disallowed by Rust's borrowing rules to prevent undefined behavior.
3. **Don't ignore the lifetime annotations when working with references in complex scenarios.** Lifetimes help the compiler enforce valid borrowing across scopes.

## Core Content

Rust's ownership and borrowing system is a compile-time memory management model that ensures safety and efficiency. It is built on three key principles:

1. **Ownership**: Every value in Rust has a single owner, which is responsible for its memory. When the owner goes out of scope, the value is dropped, and its memory is freed. Ownership can be transferred (moved) to another variable, but the original owner loses access to the value.

   ```rust
   fn main() {
       let s1 = String::from("hello");
       let s2 = s1; // Ownership of the String is moved to s2
       // println!("{}", s1); // Error: s1 is no longer valid
   }
   ```

2. **Borrowing**: Borrowing allows temporary access to a value without transferring ownership. Borrowing can be immutable (`&T`) or mutable (`&mut T`). Immutable references allow read-only access, while mutable references allow modification. Rust enforces strict borrowing rules:
   - You can have multiple immutable references or one mutable reference, but not both at the same time.
   - References must always be valid, meaning the value they point to cannot be dropped while they are in use.

   ```rust
   fn main() {
       let mut s = String::from("hello");
       let r1 = &s; // Immutable borrow
       let r2 = &s; // Another immutable borrow
       // let r3 = &mut s; // Error: Cannot borrow as mutable while immutable borrows exist
       println!("{}, {}", r1, r2);
   }
   ```

3. **Lifetimes**: Lifetimes are annotations that tell the compiler how long references are valid. While simple cases are inferred automatically, explicit lifetimes are needed in complex scenarios, such as struct definitions or function signatures with multiple references.

   ```rust
   fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
       if x.len() > y.len() {
           x
       } else {
           y
       }
   }

   fn main() {
       let s1 = String::from("long string");
       let s2 = "short";
       let result = longest(&s1, &s2);
       println!("The longest string is {}", result);
   }
   ```

This model ensures that memory safety is guaranteed at compile time, eliminating entire classes of bugs. By enforcing ownership and borrowing rules, Rust provides fine-grained control over memory without runtime overhead.

## Links

- **Rust Ownership**: Official Rust documentation on ownership and how it works.
- **Rust Borrowing**: Explanation of borrowing and the rules enforced by the compiler.
- **Rust Lifetimes**: A guide to understanding and using lifetimes in Rust.
- **Rust Book**: The official Rust programming book, which covers these topics in depth.

## Proof / Confidence

The ownership and borrowing model is a foundational feature of Rust, supported by the language's design and enforced by the borrow checker at compile time. Rust is widely used in performance-critical domains like operating systems (e.g., Redox OS), browser engines (e.g., Mozilla's Servo), and blockchain systems. Its memory safety guarantees have been validated by industry adoption and benchmarks, demonstrating its effectiveness in preventing memory-related bugs.
