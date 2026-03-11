---
kid: "KID-LANG-RUST-CORE-0002"
title: "Project Structure Norms (cargo, crates)"
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
  - "c"
  - "a"
  - "r"
  - "g"
  - "o"
  - ","
  - " "
  - "c"
  - "r"
  - "a"
  - "t"
  - "e"
  - "s"
  - ","
  - " "
  - "p"
  - "r"
  - "o"
  - "j"
  - "e"
  - "c"
  - "t"
  - "-"
  - "s"
  - "t"
  - "r"
  - "u"
  - "c"
  - "t"
  - "u"
  - "r"
  - "e"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/rust/language_core/KID-LANG-RUST-CORE-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Project Structure Norms (cargo, crates)

# Project Structure Norms (cargo, crates)

## Summary
In the Rust programming ecosystem, project structure norms revolve around the use of `cargo` and `crates`. `cargo` is Rust's package manager and build system, while crates are the fundamental unit of Rust code distribution. Adopting consistent project structure norms ensures maintainability, scalability, and adherence to community best practices, making codebases easier to navigate and collaborate on.

## When to Use
- **Developing new Rust projects**: Use the standard `cargo` project structure for consistency and compatibility with Rust tooling.
- **Publishing reusable libraries**: Organize your code as crates to facilitate distribution and dependency management.
- **Collaborative projects**: Follow established norms to ensure that contributors can quickly onboard and understand the codebase.
- **Integrating third-party libraries**: Leverage `cargo` and crates to manage dependencies and ensure compatibility.

## Do / Don't

### Do
1. **Use `cargo init` or `cargo new`**: Always initialize your project using `cargo` to ensure the correct directory structure is set up.
2. **Organize code into modules**: Use the `src` directory and submodules for logical separation of code.
3. **Define dependencies in `Cargo.toml`**: Declare all external crates and their versions explicitly to manage dependencies effectively.
4. **Write unit tests in `src/tests.rs`**: Keep tests close to the code they validate, following Rust's convention.

### Don't
1. **Avoid hardcoding paths**: Use relative imports and `cargo` conventions to manage dependencies and modules.
2. **Don't ignore `Cargo.lock` for applications**: Commit the `Cargo.lock` file to ensure consistent builds across environments.
3. **Avoid mixing library and binary code**: Separate library code (`lib.rs`) and binary entry points (`main.rs`) to maintain clarity.
4. **Don't skip documentation**: Always document your crate and modules using Rust's `///` doc comments for better usability.

## Core Content
Rust's project structure norms are designed to simplify development, enforce consistency, and streamline collaboration. At the heart of these norms are `cargo` and crates.

### `cargo` Basics
`cargo` is the tool that manages Rust projects. When you create a new project using `cargo new` or `cargo init`, it generates a standard directory structure:
```
my_project/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── main.rs
│   └── lib.rs
```
- **`Cargo.toml`**: The manifest file where you define metadata (name, version, authors), dependencies, and build configurations.
- **`Cargo.lock`**: A lock file that ensures consistent dependency versions across environments.
- **`src/`**: The source directory containing your code. `main.rs` is the entry point for binaries, while `lib.rs` is the entry point for libraries.

### Crates and Modules
A crate is the smallest unit of code distribution in Rust. Crates can be libraries or binaries:
- **Library crates**: Used for reusable functionality. Defined in `lib.rs` and published to a registry like [crates.io](https://crates.io).
- **Binary crates**: Executable programs. Defined in `main.rs`.

Modules allow you to organize code within a crate. For example:
```rust
// src/lib.rs
pub mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }
}

// src/main.rs
use my_project::math::add;

fn main() {
    println!("{}", add(2, 3));
}
```

### Dependency Management
Dependencies are declared in `Cargo.toml`. For example:
```toml
[dependencies]
serde = "1.0"
```
This ensures that `serde` is downloaded and integrated into the project. `cargo` also handles version resolution and updates.

### Testing and Documentation
Rust encourages writing tests and documentation as part of the development process:
- **Tests**: Place unit tests in the same file as the code or in `src/tests.rs`. Use `cargo test` to run them.
- **Documentation**: Use doc comments (`///`) to describe functions, modules, and crates. Generate documentation with `cargo doc`.

### Publishing Crates
To share a library, publish it to [crates.io](https://crates.io). Ensure your `Cargo.toml` includes metadata like `description`, `license`, and `repository`.

## Links
- **Rust Book: Cargo and Crates**: Comprehensive guide on using `cargo` and organizing crates.
- **Crates.io Documentation**: Official documentation for publishing and managing crates.
- **Rust API Guidelines**: Best practices for designing and documenting Rust libraries.
- **Cargo Reference**: Detailed reference for `cargo` commands and configuration.

## Proof / Confidence
Rust's project structure norms are well-documented in the official Rust Book and widely adopted by the Rust community. Tools like `cargo` enforce these standards, and popular libraries on [crates.io](https://crates.io) follow these conventions. Adhering to these norms ensures compatibility with Rust's ecosystem and tooling, as well as alignment with industry practices.
