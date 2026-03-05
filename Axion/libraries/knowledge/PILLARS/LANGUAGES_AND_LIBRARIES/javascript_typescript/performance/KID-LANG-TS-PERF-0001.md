---
kid: "KID-LANG-TS-PERF-0001"
title: "Node Performance Basics (event loop)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript]
subdomains: []
tags: [performance, event-loop, node]
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

# Node Performance Basics (event loop)

# Node Performance Basics (Event Loop)

## Summary

The Node.js event loop is a core mechanism that enables non-blocking I/O operations, allowing Node.js to handle concurrent tasks efficiently on a single thread. Understanding the event loop is critical for optimizing application performance, avoiding bottlenecks, and ensuring smooth execution of asynchronous code.

## When to Use

- When building high-performance, I/O-heavy applications such as APIs, web servers, or real-time systems.
- When debugging performance issues like slow response times or blocked event loop cycles.
- When implementing asynchronous patterns (e.g., Promises, async/await) in JavaScript or TypeScript.
- When optimizing CPU-intensive tasks to avoid blocking the event loop.

## Do / Don't

### Do:
1. **Use asynchronous APIs**: Leverage non-blocking methods like `fs.promises` or `setImmediate` to avoid blocking the event loop.
2. **Monitor event loop delays**: Use tools like `PerformanceObserver` or libraries like `diagnostics_channel` to detect and analyze delays.
3. **Offload CPU-intensive tasks**: Use worker threads or external services to handle heavy computations outside the main thread.

### Don't:
1. **Block the event loop**: Avoid synchronous methods like `fs.readFileSync()` or `JSON.parse()` on large data sets, as they can freeze the application.
2. **Overuse setTimeout for timing**: Use `setImmediate` or `process.nextTick` for microtask scheduling when immediate execution is required.
3. **Ignore backpressure**: Failing to handle backpressure in streams can overwhelm the event loop and degrade performance.

## Core Content

The event loop is a fundamental concept in Node.js, enabling it to handle multiple tasks concurrently despite being single-threaded. It operates in phases, each responsible for managing specific types of operations. These phases include:

1. **Timers**: Executes callbacks scheduled by `setTimeout` and `setInterval`.
2. **I/O Callbacks**: Handles I/O operations like reading files or network requests.
3. **Idle, Prepare**: Internal use only.
4. **Poll**: Retrieves new I/O events and executes their callbacks.
5. **Check**: Executes callbacks scheduled by `setImmediate`.
6. **Close Callbacks**: Handles cleanup for closed connections.

### Why It Matters

The event loop is central to Node.js's non-blocking architecture. By offloading I/O operations to the operating system and using callbacks to handle their completion, Node.js can efficiently manage thousands of concurrent connections. However, this design also introduces challenges, such as avoiding blocking operations and managing asynchronous code effectively.

### Example: Blocking the Event Loop

```javascript
const fs = require('fs');

// Blocking example
fs.readFileSync('largeFile.txt'); // This blocks the event loop until the file is read

// Non-blocking example
fs.readFile('largeFile.txt', (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
```

In the blocking example, the event loop is halted until the file is read, preventing other tasks from executing. The non-blocking example uses a callback to handle the file once it's read, allowing the event loop to continue processing other tasks.

### Monitoring Event Loop Performance

You can measure event loop delays to identify performance bottlenecks:

```javascript
const { performance, PerformanceObserver } = require('perf_hooks');

const obs = new PerformanceObserver((list) => {
  console.log(list.getEntries());
});
obs.observe({ entryTypes: ['measure'] });

performance.mark('start');

// Simulate a blocking operation
for (let i = 0; i < 1e9; i++) {}

performance.mark('end');
performance.measure('Blocking operation', 'start', 'end');
```

This script measures the time taken by a blocking operation, helping you identify areas for optimization.

### Offloading CPU-Intensive Tasks

For tasks like image processing or data compression, consider using worker threads:

```javascript
const { Worker } = require('worker_threads');

const worker = new Worker('./heavyTask.js');
worker.on('message', (result) => {
  console.log('Result:', result);
});
```

This approach prevents CPU-intensive tasks from blocking the event loop.

## Links

- **Node.js Documentation on the Event Loop**: Comprehensive explanation of the event loop phases and behavior.
- **Worker Threads in Node.js**: Guide to using worker threads for CPU-intensive tasks.
- **Asynchronous Programming in JavaScript**: Overview of Promises, async/await, and callbacks.
- **Performance Hooks in Node.js**: Tools for measuring and diagnosing performance issues.

## Proof / Confidence

The content is based on the official Node.js documentation, industry best practices, and established performance benchmarks. The examples and recommendations align with common patterns used in high-performance Node.js applications, as validated by tools like `clinic.js` and performance monitoring libraries.
