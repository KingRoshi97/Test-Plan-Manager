---
kid: "KID-LANGCSDO-PATTERN-0001"
title: "Csharp Dotnet Common Implementation Patterns"
type: "pattern"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "csharp_dotnet"
subdomains: []
tags:
  - "csharp_dotnet"
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

# Csharp Dotnet Common Implementation Patterns

# Csharp Dotnet Common Implementation Patterns

## Summary

This guide covers common implementation patterns in C# and .NET, focusing on practical solutions for recurring problems in software development. It includes examples of dependency injection, repository patterns, and asynchronous programming. These patterns improve code maintainability, scalability, and readability while adhering to industry best practices.

---

## When to Use

- **Dependency Injection**: Use when building loosely coupled applications that require flexible dependency management and easy testing.
- **Repository Pattern**: Use when interacting with a database or external storage to abstract data access logic and maintain separation of concerns.
- **Asynchronous Programming**: Use when performing I/O-bound or CPU-bound operations to improve application responsiveness and scalability.

---

## Do / Don't

### Do:
1. **Use Dependency Injection frameworks** like Microsoft.Extensions.DependencyInjection for consistent and scalable dependency management.
2. **Implement Repository Pattern** to encapsulate database logic and avoid direct queries in business logic.
3. **Use async/await** for asynchronous methods to improve readability and avoid blocking threads.

### Don't:
1. **Hardcode dependencies** directly into classes; this creates tight coupling and reduces testability.
2. **Mix business logic with data access logic**; this violates separation of concerns and makes code harder to maintain.
3. **Use Task.Result or Task.Wait** in asynchronous code; this can lead to deadlocks and poor performance.

---

## Core Content

### 1. Dependency Injection
**Problem**: Hardcoded dependencies make testing and scaling difficult.  
**Solution**: Use dependency injection to provide dependencies at runtime.  
**Implementation Steps**:
1. Install `Microsoft.Extensions.DependencyInjection` via NuGet.
2. Register services in the `IServiceCollection`:
   ```csharp
   services.AddScoped<IMyService, MyService>();
   ```
3. Inject dependencies into constructors:
   ```csharp
   public class MyController {
       private readonly IMyService _myService;
       public MyController(IMyService myService) {
           _myService = myService;
       }
   }
   ```
**Tradeoffs**: Adds complexity but improves testability and flexibility.

---

### 2. Repository Pattern
**Problem**: Mixing database logic with business logic leads to tightly coupled code.  
**Solution**: Abstract data access logic using repositories.  
**Implementation Steps**:
1. Define an interface for the repository:
   ```csharp
   public interface IProductRepository {
       Task<Product> GetByIdAsync(int id);
       Task<IEnumerable<Product>> GetAllAsync();
   }
   ```
2. Implement the interface:
   ```csharp
   public class ProductRepository : IProductRepository {
       private readonly DbContext _context;
       public ProductRepository(DbContext context) {
           _context = context;
       }
       public async Task<Product> GetByIdAsync(int id) {
           return await _context.Products.FindAsync(id);
       }
       public async Task<IEnumerable<Product>> GetAllAsync() {
           return await _context.Products.ToListAsync();
       }
   }
   ```
3. Inject the repository into services or controllers.

**Tradeoffs**: Adds an abstraction layer but increases code complexity.

---

### 3. Asynchronous Programming
**Problem**: Blocking threads during I/O operations reduces scalability.  
**Solution**: Use async/await for non-blocking operations.  
**Implementation Steps**:
1. Define asynchronous methods:
   ```csharp
   public async Task<string> FetchDataAsync(string url) {
       using (var client = new HttpClient()) {
           return await client.GetStringAsync(url);
       }
   }
   ```
2. Call asynchronous methods using `await`:
   ```csharp
   var data = await FetchDataAsync("https://example.com");
   ```
**Tradeoffs**: Requires careful exception handling and proper use of async APIs.

---

## Links

- [Microsoft Dependency Injection Documentation](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) - Comprehensive guide to DI in .NET.
- [Repository Pattern in C#](https://learn.microsoft.com/en-us/ef/core/modeling/) - Best practices for implementing repository pattern with Entity Framework.
- [Asynchronous Programming in C#](https://learn.microsoft.com/en-us/dotnet/csharp/async) - Official documentation on async/await.
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) - Foundational principles for designing maintainable software.

---

## Proof / Confidence

These patterns are widely adopted in the .NET ecosystem and recommended by Microsoft. Dependency injection is built into ASP.NET Core, demonstrating its importance for modern applications. Repository pattern aligns with SOLID principles, promoting separation of concerns. Asynchronous programming is a cornerstone of scalable applications, as evidenced by its integration into .NET libraries like `HttpClient` and `Entity Framework`.
