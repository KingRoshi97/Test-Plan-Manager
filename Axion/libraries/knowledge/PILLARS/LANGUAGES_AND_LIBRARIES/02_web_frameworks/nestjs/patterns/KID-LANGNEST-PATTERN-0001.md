---
kid: "KID-LANGNEST-PATTERN-0001"
title: "Nestjs Common Implementation Patterns"
type: "pattern"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "nestjs"
subdomains: []
tags:
  - "nestjs"
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

# Nestjs Common Implementation Patterns

# NestJS Common Implementation Patterns: Dependency Injection in Custom Providers

## Summary

Dependency Injection (DI) is a core concept in NestJS, enabling clean architecture and testable, maintainable code. This guide focuses on implementing custom providers, a common pattern for injecting dependencies that are not directly tied to a class. Custom providers allow you to inject values, factories, or dynamic configurations into your application.

---

## When to Use

- When you need to inject non-class-based dependencies (e.g., configuration objects, third-party libraries).
- When the dependency requires dynamic initialization or configuration based on runtime data.
- When you need to wrap third-party libraries or services to conform to your application's DI structure.
- When you want to centralize and manage shared resources, such as database connections or API clients.

---

## Do / Don't

### Do:
1. **Use `useValue` for static, immutable values** like configuration constants or environment variables.
2. **Use `useFactory` for dynamic initialization** when the dependency requires runtime logic or parameters.
3. **Leverage `@Inject` for custom token injection** to avoid tight coupling between modules.

### Don't:
1. **Don’t hardcode dependencies** in your services or modules; always use DI for flexibility and testability.
2. **Don’t use `useClass` unnecessarily** when the dependency is not a class or when simpler options like `useValue` suffice.
3. **Don’t skip providing meaningful tokens** for custom providers; ambiguous tokens can lead to debugging difficulties.

---

## Core Content

### Problem

By default, NestJS DI works seamlessly with class-based providers. However, there are scenarios where you need to inject non-class dependencies, such as configuration values, dynamically created objects, or third-party services. Without custom providers, managing these dependencies can lead to tightly coupled, less maintainable code.

### Solution

Custom providers in NestJS allow you to inject non-class dependencies using `useValue`, `useFactory`, or `useExisting`. These options give you flexibility in how dependencies are resolved and injected.

### Implementation Steps

#### 1. Using `useValue` for Static Dependencies
Use this approach for injecting constants or simple objects.

```typescript
// app.module.ts
const CONFIG = {
  apiEndpoint: 'https://api.example.com',
  timeout: 5000,
};

@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: CONFIG,
    },
  ],
  exports: ['CONFIG'],
})
export class AppModule {}

// example.service.ts
@Injectable()
export class ExampleService {
  constructor(@Inject('CONFIG') private config: Record<string, any>) {}

  getApiEndpoint() {
    return this.config.apiEndpoint;
  }
}
```

#### 2. Using `useFactory` for Dynamic Dependencies
Use this approach when the dependency requires runtime logic or external data.

```typescript
// app.module.ts
@Module({
  providers: [
    {
      provide: 'DYNAMIC_CONFIG',
      useFactory: async () => {
        const config = await fetchConfigFromRemoteService();
        return config;
      },
    },
  ],
  exports: ['DYNAMIC_CONFIG'],
})
export class AppModule {}

// example.service.ts
@Injectable()
export class ExampleService {
  constructor(@Inject('DYNAMIC_CONFIG') private config: any) {}

  getConfig() {
    return this.config;
  }
}
```

#### 3. Using `useExisting` for Alias Providers
Use this approach to alias one provider to another.

```typescript
// app.module.ts
@Module({
  providers: [
    {
      provide: 'MAIN_SERVICE',
      useClass: MainService,
    },
    {
      provide: 'ALIAS_SERVICE',
      useExisting: 'MAIN_SERVICE',
    },
  ],
})
export class AppModule {}

// example.service.ts
@Injectable()
export class ExampleService {
  constructor(@Inject('ALIAS_SERVICE') private service: MainService) {}

  execute() {
    return this.service.performTask();
  }
}
```

### Tradeoffs

- **Pros**:
  - Decouples implementation details from the consumer.
  - Enables dynamic and flexible dependency management.
  - Improves testability by allowing mock injections.

- **Cons**:
  - Overuse of custom providers can make the DI configuration harder to understand.
  - Requires careful token naming to avoid conflicts.

---

## Links

1. [NestJS Providers Documentation](https://docs.nestjs.com/fundamentals/custom-providers) - Official guide to custom providers.
2. [Dependency Injection in NestJS](https://docs.nestjs.com/fundamentals/dependency-injection) - Overview of DI in NestJS.
3. [Testing with Custom Providers](https://docs.nestjs.com/fundamentals/testing#testing-with-custom-providers) - How to test services with custom providers.
4. [Dynamic Modules in NestJS](https://docs.nestjs.com/techniques/dynamic-modules) - For advanced use cases requiring runtime module configuration.

---

## Proof / Confidence

Custom providers are a standard feature of NestJS and are widely used in the community for managing non-class-based dependencies. The official NestJS documentation and examples consistently recommend this approach for scenarios involving dynamic or non-class dependencies. This pattern aligns with industry best practices for dependency injection in modern frameworks, ensuring clean, maintainable, and testable code.
