---
kid: "KID-LANG-TS-CORE-0001"
title: "TypeScript Mental Model (types vs runtime)"
content_type: "concept"
primary_domain: "["
secondary_domains:
  - "j"
  - "a"
  - "v"
  - "a"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - "_"
  - "t"
  - "y"
  - "p"
  - "e"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
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
  - "t"
  - "y"
  - "p"
  - "e"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - ","
  - " "
  - "t"
  - "y"
  - "p"
  - "e"
  - "s"
  - ","
  - " "
  - "r"
  - "u"
  - "n"
  - "t"
  - "i"
  - "m"
  - "e"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/language_core/KID-LANG-TS-CORE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# TypeScript Mental Model (types vs runtime)

# TypeScript Mental Model (types vs runtime)

## Summary
TypeScript is a superset of JavaScript that introduces a static type system to help developers catch errors during development. Understanding the distinction between TypeScript's type system (which exists only at compile time) and JavaScript's runtime behavior is crucial for writing reliable, maintainable code. This mental model helps developers avoid common pitfalls and leverage TypeScript effectively.

## When to Use
- **Developing complex applications**: When working on large-scale or team-based projects where code maintainability and readability are critical.
- **Refactoring legacy JavaScript**: When transitioning JavaScript codebases to TypeScript for improved type safety.
- **Preventing runtime errors**: When you want to catch errors early in development rather than at runtime.
- **API design**: When defining clear contracts for functions, classes, or external APIs.

## Do / Don't

### Do:
1. **Use TypeScript for type safety**: Define types explicitly to catch errors before runtime.
2. **Leverage type inference**: Let TypeScript infer types where possible to reduce verbosity.
3. **Understand runtime behavior**: Write code that works at runtime, not just type-checks correctly.

### Don't:
1. **Assume TypeScript types exist at runtime**: Types are erased during compilation and do not affect runtime behavior.
2. **Ignore type errors**: Avoid using `any` or suppressing errors with type assertions unless absolutely necessary.
3. **Overuse complex types**: Avoid overly intricate type definitions that make code harder to understand and maintain.

## Core Content

### Understanding the Mental Model: Types vs Runtime
TypeScript introduces a type system that exists solely at compile time. This means the type information is used to validate your code during development but is entirely removed when the code is transpiled to JavaScript. At runtime, the code behaves as plain JavaScript, and TypeScript types have no effect.

#### Compile-Time Type Checking
TypeScript analyzes your code statically, ensuring that variables, function arguments, and return values conform to their declared types. For example:

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(2, 3); // ✅ Valid
add("2", 3); // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Here, TypeScript catches the type mismatch during compilation, preventing a potential runtime error.

#### Runtime Behavior
At runtime, TypeScript types are not present. The following code:

```typescript
const user: { name: string; age: number } = { name: "Alice", age: 25 };
console.log(user.name);
```

Compiles to:

```javascript
const user = { name: "Alice", age: 25 };
console.log(user.name);
```

Notice that the type annotation `{ name: string; age: number }` is removed. This is why runtime checks (e.g., `typeof` or `instanceof`) must be implemented manually if needed.

#### Why This Matters
Misunderstanding this distinction can lead to bugs. For example, developers might assume TypeScript types enforce runtime constraints, but this is not the case. Consider:

```typescript
function printLength(input: string | string[]) {
  console.log(input.length); // TypeScript ensures `input` has a `length` property
}

printLength(["hello", "world"]); // ✅ Works
printLength("hello"); // ✅ Works
printLength(123); // ❌ Runtime error: `123` has no `length` property
```

Though TypeScript would flag `123` as invalid during compilation, if type-checking is bypassed (e.g., using `any`), runtime errors can occur.

### Practical Applications
- **Type Guards**: Use runtime checks to enforce constraints when dealing with dynamic inputs.
  ```typescript
  function isString(input: unknown): input is string {
    return typeof input === "string";
  }

  function process(input: string | number) {
    if (isString(input)) {
      console.log(input.toUpperCase());
    } else {
      console.log(input.toFixed(2));
    }
  }
  ```

- **Avoiding `any`**: Use strict typing to prevent bypassing TypeScript's safety mechanisms.
  ```typescript
  let data: any = "hello";
  console.log(data.toUpperCase()); // ✅ Works, but bypasses type checking
  ```

- **Runtime Validation Libraries**: Combine TypeScript with libraries like `zod` or `io-ts` for runtime validation.
  ```typescript
  import { z } from "zod";

  const UserSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  const user = UserSchema.parse({ name: "Alice", age: 25 }); // ✅ Runtime validation
  ```

## Links
- **TypeScript Handbook**: Comprehensive documentation on TypeScript features and best practices.
- **Static vs Dynamic Typing**: Overview of type systems in programming languages.
- **Runtime Validation Libraries**: Tools like `zod` and `io-ts` for runtime schema validation in TypeScript.
- **JavaScript vs TypeScript**: Comparison of features and use cases.

## Proof / Confidence
TypeScript is widely adopted in the industry due to its ability to catch errors early and improve code quality. Tools like `eslint` and `prettier` integrate seamlessly with TypeScript, further enhancing developer productivity. Major projects like Angular and VS Code are built using TypeScript, demonstrating its robustness and scalability. Industry benchmarks consistently show reduced bug rates and improved developer experience in TypeScript-based projects.
