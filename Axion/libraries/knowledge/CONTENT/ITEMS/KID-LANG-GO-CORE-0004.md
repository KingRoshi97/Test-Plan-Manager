---
kid: "KID-LANG-GO-CORE-0004"
title: "Common Pitfalls (context, goroutines)"
content_type: "reference"
primary_domain: "["
secondary_domains:
  - "g"
  - "o"
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
  - "g"
  - "o"
  - ","
  - " "
  - "p"
  - "i"
  - "t"
  - "f"
  - "a"
  - "l"
  - "l"
  - "s"
  - ","
  - " "
  - "c"
  - "o"
  - "n"
  - "t"
  - "e"
  - "x"
  - "t"
  - ","
  - " "
  - "g"
  - "o"
  - "r"
  - "o"
  - "u"
  - "t"
  - "i"
  - "n"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/go/language_core/KID-LANG-GO-CORE-0004.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Common Pitfalls (context, goroutines)

# Common Pitfalls: Improper Use of `context` with Goroutines in Go

## Summary

Improper use of `context` with goroutines in Go can lead to resource leaks, unpredictable behavior, and difficulty in managing application state. Developers often fail to propagate or cancel contexts correctly, resulting in goroutines that continue running unnecessarily or fail to clean up resources. Understanding how to properly use `context` with goroutines is critical for building efficient, maintainable, and robust Go applications.

---

## When to Use

This pitfall applies in scenarios where:

- Goroutines are spawned to perform concurrent tasks, especially in long-running processes like servers or workers.
- Contexts are used to manage deadlines, timeouts, or cancellation signals for these goroutines.
- Applications rely on external resources (e.g., databases, APIs) that need to be cleaned up or released when a task is canceled.

---

## Do / Don't

### Do:
1. **Propagate context explicitly**: Pass `context.Context` as the first parameter to functions that spawn goroutines or perform long-running tasks.
2. **Check context cancellation**: Regularly check `ctx.Done()` in goroutines to detect when the context has been canceled.
3. **Use `defer` to clean up resources**: Ensure all resources (e.g., open files, database connections) are properly closed when the context is canceled.

### Don't:
1. **Don’t ignore context propagation**: Avoid creating goroutines that don’t receive or respect the parent context.
2. **Don’t block on `ctx.Done()` without a fallback**: Ensure that goroutines don’t hang indefinitely by improperly handling context cancellation.
3. **Don’t forget to cancel child contexts**: Always call `cancel()` on contexts you create with `context.WithCancel` or `context.WithTimeout`.

---

## Core Content

### The Mistake

A common mistake is failing to propagate the `context.Context` object to all goroutines or not properly handling its cancellation signal. For example, developers may spawn a goroutine without passing the parent context, causing the goroutine to continue running even after the parent operation has been canceled or timed out. This results in resource leaks, such as open network connections or memory consumption.

Here’s an example of improper usage:

```go
func fetchData(ctx context.Context, url string) {
    go func() {
        // Missing context propagation
        resp, err := http.Get(url)
        if err != nil {
            log.Println("Error fetching data:", err)
            return
        }
        defer resp.Body.Close()
        // Process response...
    }()
}
```

In this example, the goroutine does not respect the parent context. If the parent context is canceled, the HTTP request will still proceed, wasting resources.

### Why It Happens

This pitfall occurs because developers may:

- Overlook the importance of context propagation in concurrent programming.
- Assume that goroutines will automatically terminate when the parent function exits.
- Misunderstand how `context` works or fail to check for cancellation signals.

### Consequences

Failing to use `context` properly can lead to:

1. **Resource Leaks**: Goroutines that don’t terminate can hold onto memory, file descriptors, or network connections indefinitely.
2. **Unpredictable Behavior**: Long-running tasks may continue executing even when they are no longer needed, leading to inconsistent application state.
3. **Difficulty in Debugging**: Identifying and terminating runaway goroutines can be challenging, especially in complex systems.

### How to Detect It

1. **Static Analysis**: Use tools like `golangci-lint` to detect missing context propagation or unused cancellation functions.
2. **Runtime Profiling**: Use Go’s built-in `pprof` package to identify goroutines that are running longer than expected.
3. **Logging**: Add logs to monitor when contexts are canceled and ensure that goroutines respect these cancellations.

### How to Fix It

1. **Always Pass Context**: Make `context.Context` the first parameter of any function that spawns goroutines. For example:

    ```go
    func fetchData(ctx context.Context, url string) {
        go func(ctx context.Context) {
            req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
            if err != nil {
                log.Println("Error creating request:", err)
                return
            }
            resp, err := http.DefaultClient.Do(req)
            if err != nil {
                log.Println("Error fetching data:", err)
                return
            }
            defer resp.Body.Close()
            // Process response...
        }(ctx)
    }
    ```

2. **Check `ctx.Done()` Regularly**: Inside long-running goroutines, periodically check `ctx.Done()` to detect cancellation:

    ```go
    for {
        select {
        case <-ctx.Done():
            log.Println("Context canceled, exiting goroutine")
            return
        default:
            // Perform work...
        }
    }
    ```

3. **Cancel Child Contexts**: When creating child contexts, ensure that you call the `cancel()` function when the work is complete or no longer needed:

    ```go
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    ```

---

## Links

1. **Go Blog: Context Package** - Official documentation and examples of using the `context` package in Go.
2. **Effective Go** - Best practices for writing idiomatic Go code, including concurrency patterns.
3. **Go Concurrency Patterns** - A guide to understanding and applying concurrency patterns in Go.
4. **pprof Documentation** - Learn how to use Go’s profiling tools to detect resource leaks and runaway goroutines.

---

## Proof / Confidence

This guidance is based on Go’s official documentation, widely accepted best practices in the Go community, and real-world experience with production systems. The Go standard library and tools like `golangci-lint` enforce these principles, and common issues with `context` misuse are frequently discussed in forums like the Go subreddit and GitHub issues. Following these practices ensures efficient resource management and predictable application behavior.
