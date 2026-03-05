---
kid: "KID-LANG-RUST-CORE-0004"
title: "Common Pitfalls (lifetimes, async)"
type: pitfall
pillar: LANGUAGES_AND_LIBRARIES
domains: [rust]
subdomains: []
tags: [rust, pitfalls, lifetimes, async]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Common Pitfalls (lifetimes, async)

# Common Pitfalls: Lifetimes and Async in Rust

## Summary
Managing lifetimes and asynchronous code in Rust can be challenging due to the strict requirements of the borrow checker and the interaction between lifetimes and `async` constructs. A common pitfall is attempting to use non-`'static` references within `async` functions or tasks, leading to compile-time errors or convoluted workarounds. This issue arises because asynchronous code often requires `'static` lifetimes, creating friction for developers unfamiliar with Rust's ownership and lifetime model.

## When to Use
This pitfall applies when:
- Writing `async` functions or tasks that borrow data with non-`'static` lifetimes.
- Attempting to pass references into `async` blocks, closures, or functions.
- Using `async` in combination with complex data structures or lifetimes.
- Working with third-party libraries that require `'static` lifetimes for `async` APIs.

## Do / Don't

### Do:
1. Use `Arc` or `Rc` to share ownership of data across `async` tasks when `'static` is required.
2. Clone or copy data when necessary to avoid lifetime conflicts in `async` contexts.
3. Use explicit lifetimes in function signatures to clarify borrowing relationships.

### Don't:
1. Don’t attempt to directly use non-`'static` references in `async` functions or tasks without understanding the lifetime implications.
2. Don’t rely on unsafe code to bypass lifetime checks unless absolutely necessary and well-justified.
3. Don’t ignore compiler errors related to lifetimes; they often indicate deeper issues in your code's design.

## Core Content
### The Mistake
A common mistake is attempting to use non-`'static` references within `async` functions or tasks. For example, consider the following code:

```rust
async fn process_data(data: &str) -> usize {
    data.len()
}

fn main() {
    let result = async {
        let data = String::from("Hello, world!");
        process_data(&data).await
    };
}
```

This code fails to compile because the `data` reference inside the `async` block does not have a `'static` lifetime. Rust’s `async` functions and blocks often require `'static` lifetimes because the compiler cannot guarantee that the borrowed data will live long enough for the asynchronous operation to complete.

### Why People Make This Mistake
Developers transitioning to Rust from other languages may not fully understand the implications of Rust's ownership model and lifetimes. Additionally, the interaction between `async` and lifetimes is non-trivial, especially since `async` transforms functions into state machines, which may outlive the scope of their borrowed data.

### Consequences
- **Compile-time errors:** The borrow checker will reject code that violates lifetime rules, preventing compilation.
- **Workarounds leading to bugs:** Developers may resort to unsafe code or unnecessary clones, introducing potential runtime errors or performance issues.
- **Increased complexity:** Misunderstanding lifetimes in `async` contexts can result in convoluted code that is harder to maintain and debug.

### How to Detect It
- Look for compiler errors like `borrowed data does not live long enough` or `future cannot be sent between threads safely`.
- Review `async` function signatures and ensure they do not contain non-`'static` references unless lifetimes are explicitly managed.

### How to Fix or Avoid It
1. **Use Owned Data:** Convert borrowed data into owned data (e.g., `String` instead of `&str`) when passing it into `async` functions.
   ```rust
   async fn process_data(data: String) -> usize {
       data.len()
   }

   fn main() {
       let result = async {
           let data = String::from("Hello, world!");
           process_data(data).await
       };
   }
   ```
2. **Use `Arc` for Shared Ownership:** If the data needs to be shared across tasks, use `Arc` to provide shared ownership with a `'static` lifetime.
   ```rust
   use std::sync::Arc;

   async fn process_data(data: Arc<String>) -> usize {
       data.len()
   }

   fn main() {
       let result = async {
           let data = Arc::new(String::from("Hello, world!"));
           process_data(data.clone()).await
       };
   }
   ```
3. **Refactor Code:** Refactor your code to minimize the use of non-`'static` references in `async` contexts. For example, restructure your program so that borrowed data is processed synchronously before being passed to `async` functions.

### Real-World Scenario
Consider a web server handling HTTP requests. A naive implementation might attempt to borrow request data (`&str`) directly in an `async` handler. This would fail because the request data is tied to the lifetime of the incoming connection, which does not align with the `'static` lifetime required by the `async` runtime. By converting the request data to an owned `String` or wrapping it in an `Arc`, the handler can safely process the data asynchronously.

## Links
- Rust official documentation: Lifetimes and Borrowing
- Rust async book: Lifetime issues in async code
- Rustonomicon: Async and lifetimes
- Tokio documentation: Handling lifetimes in async code

## Proof / Confidence
This content is based on Rust's official documentation, the Rust async book, and common issues reported by developers in forums and GitHub issues. The described solutions align with industry best practices and are widely adopted in production Rust codebases.
